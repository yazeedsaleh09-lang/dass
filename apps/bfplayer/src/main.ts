import { Client, type Room } from 'colyseus.js';
import {
  isRoomCode,
  normalizeRoomCode,
  validateNickname,
  type BfClientView,
  type BfDecision,
  type BfPhase,
  type SideChoice,
} from '@backfire/domain';
import {
  COPY,
  ECHO_TEXT,
  WORLD_TEXT,
  addStyle,
  arNum,
  escapeHtml,
  haptic,
  injectBase,
  press,
  qs,
  qsa,
  seatGlyph,
  settle,
  sfx,
  strike,
} from '@backfire/ui';
import { playerCss } from './player-css.js';

declare const BF_SERVER_URL: string;

injectBase();
addStyle(playerCss());
const app = document.getElementById('app')!;
app.innerHTML = `<div id="root"></div>`;
const root = qs('#root')!;

const params = new URLSearchParams(location.search);
const serverUrl = BF_SERVER_URL || `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;
const client = new Client(serverUrl);

let room: Room | null = null;
let view: BfClientView | null = null;
let joined = false;
let busy = false;
let intentionalLeave = false;
let recoveryEnded = false;
let standDown = false; // a newer tab took this seat over; this one must stop talking
let acked = false;
let lastSignature = '';
let forceRender = false;

/** Draft selections for the current decision, cleared the moment the server accepts a lock. */
let pick: string | null = null;
let pickSource: string | null = null;
let pickSide: SideChoice | null = null;

// DURABLE IDENTITY: a room-scoped token the server maps to a permanent seat. Reconnecting with
// it rebinds a fresh socket to the SAME seat mid-match, with private intel and lock intact.
const tokenKey = (roomId: string): string => `bf_pt:${normalizeRoomCode(roomId)}`;
function playerTokenFor(roomId: string): string {
  const key = tokenKey(roomId);
  let token = localStorage.getItem(key);
  if (!token) {
    const bytes = new Uint8Array(18);
    crypto.getRandomValues(bytes);
    token = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
    localStorage.setItem(key, token);
  }
  return token;
}
const hasIdentity = (roomId: string): boolean => !!localStorage.getItem(tokenKey(roomId));

const urlCode = params.get('code');
const urlName = params.get('name');
if (urlCode && (urlName || hasIdentity(urlCode))) void join(urlName ?? '', urlCode);
else renderJoin(urlCode ?? '');

// ---------------------------------------------------------------- connection

async function join(name: string, code: string): Promise<void> {
  if (busy) return;
  sfx.unlock();
  const nickname = validateNickname(name);
  const roomId = normalizeRoomCode(code);
  if (!roomId || !isRoomCode(roomId)) {
    shake('#code');
    renderJoin(code, COPY.invalidCode);
    return;
  }
  if (!hasIdentity(roomId) && !nickname.ok) {
    shake('#name');
    renderJoin(
      code,
      nickname.reason === 'EMPTY_NAME' ? COPY.emptyName : nickname.reason === 'NAME_TOO_LONG' ? COPY.nameTooLong : COPY.unsupportedName,
    );
    return;
  }
  busy = true;
  setJoinBusy(true);
  try {
    room = await client.joinById(roomId, {
      nickname: nickname.ok ? nickname.value : '',
      playerToken: playerTokenFor(roomId),
    });
    joined = true;
    busy = false;
    recoveryEnded = false;
    wire(room);
    sfx.join();
    haptic(12);
  } catch (e) {
    busy = false;
    setJoinBusy(false);
    renderJoin(code, joinError(String((e as { message?: string })?.message ?? e)));
    sfx.error();
  }
}

function joinError(message: string): string {
  if (/ROOM_FULL|full/i.test(message)) return COPY.roomFull;
  if (/ROOM_CLOSED|locked/i.test(message)) return COPY.roomClosed;
  if (/EMPTY_NAME/i.test(message)) return COPY.emptyName;
  if (/NAME_TOO_LONG/i.test(message)) return COPY.nameTooLong;
  if (/UNSUPPORTED_NAME/i.test(message)) return COPY.unsupportedName;
  return COPY.roomNotFound;
}

function wire(r: Room): void {
  r.onMessage('state', (v: BfClientView) => {
    const phaseChanged = view?.phase !== v.phase;
    view = v;
    if (phaseChanged) {
      pick = null;
      pickSource = null;
      pickSide = null;
      acked = false;
      if (v.phase.endsWith('_INTEL')) {
        sfx.intel();
        haptic(10);
      }
    }
    render();
  });
  r.onMessage('restored', () => {
    recoveryEnded = false;
    banner(COPY.restored, 'ok');
    window.setTimeout(() => banner('', 'clear'), 2000);
  });
  r.onMessage('recoveryExpired', () => {
    recoveryEnded = true;
    forceRender = true;
    render();
  });
  r.onMessage('newCrew', () => {
    intentionalLeave = true;
    void r.leave(true);
    joined = false;
    view = null;
    renderJoin('');
  });
  r.onMessage('telemetry', () => {});
  const roomId = r.roomId;
  r.onLeave((code: number) => {
    if (intentionalLeave) return;
    // 4002 = the server handed this seat to a newer connection. Stand down quietly rather than
    // racing the new tab for it, and never write to the closed socket again.
    if (code === 4002) {
      standDown = true;
      return;
    }
    banner(COPY.reconnecting, 'warn');
    void reconnect(roomId);
  });
  send('sync', {});
}

async function reconnect(roomId: string): Promise<void> {
  for (let i = 0; i < 8; i++) {
    try {
      room = await client.joinById(roomId, { playerToken: playerTokenFor(roomId) });
      wire(room);
      banner('', 'clear');
      forceRender = true;
      render();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 1200));
    }
  }
  banner(COPY.disconnected, 'err');
}

// ---------------------------------------------------------------- render

function render(): void {
  const v = view;
  if (!v || !joined) return;
  if (recoveryEnded) return expiredScreen();

  const signature = [
    v.phase,
    decisionKey(v.you.decision),
    v.you.tool,
    acked,
    pick,
    pickSource,
    pickSide,
    v.lockedCount,
    v.players.map((p) => `${p.connected ? 1 : 0}${p.ready ? 'r' : ''}`).join(''),
    v.hostId === v.you.id,
  ].join('|');
  if (signature === lastSignature && !forceRender) return;
  lastSignature = signature;
  forceRender = false;

  if (v.phase === 'LOBBY') return lobbyScreen(v);
  if (v.phase === 'RESULTS') return resultsScreen(v);
  if (v.phase.endsWith('_INTEL')) return intelScreen(v);
  if (v.phase.endsWith('_DECISION') || v.phase === 'R2_TIEBREAK') {
    return v.you.decision ? lockedScreen(v) : decisionScreen(v);
  }
  if (v.phase.endsWith('_DISCUSSION')) return discussionScreen(v);
  return watchScreen(v);
}

function shell(inner: string, opts: { world?: boolean } = {}): void {
  const v = view;
  root.innerHTML = `
    <header class="p-top">
      <span class="bf-word p-brand">${COPY.brand}</span>
      ${opts.world && v ? worldStrip(v) : ''}
      <button id="mute" class="icon-btn sm" aria-label="الصوت">${sfx.isMuted() ? '🔇' : '🔊'}</button>
    </header>
    <main class="p-body">${inner}</main>
    <div id="banner" role="status" aria-live="polite"></div>`;
  qs('#mute')?.addEventListener('click', () => {
    sfx.toggle();
    const button = qs('#mute');
    if (button) button.textContent = sfx.isMuted() ? '🔇' : '🔊';
  });
}

function worldStrip(v: BfClientView): string {
  const holder = v.players.find((p) => p.id === v.world.echoHolderId);
  return `<span class="p-world">
    <span class="pw-item">${COPY.threat} <b>${arNum(v.world.threat)}</b> <i>${WORLD_TEXT[v.world.worldStatus] ?? ''}</i></span>
    ${holder ? `<span class="pw-item">${COPY.echo} <b>${escapeHtml(holder.nickname)}</b> <i>${ECHO_TEXT[v.world.echoStatus] ?? ''}</i></span>` : ''}
  </span>`;
}

// ---- join / lobby -------------------------------------------------------------

function renderJoin(code: string, error?: string): void {
  const hasCode = !!params.get('code');
  root.innerHTML = `
    <header class="p-top"><span class="bf-word p-brand">${COPY.brand}</span></header>
    <main class="p-body join">
      <div class="join-card">
        <div class="eyebrow">${COPY.scenario}</div>
        <h1 class="join-title">${COPY.tagline}</h1>
        <div class="join-form">
          ${
            hasCode
              ? `<div class="join-code mono">${escapeHtml(code)}</div>`
              : `<input id="code" class="input mono" placeholder="${COPY.codePlaceholder}" value="${escapeHtml(code)}" maxlength="12" autocapitalize="characters" autocorrect="off" autocomplete="off" aria-label="${COPY.codePlaceholder}" />`
          }
          <input id="name" class="input" placeholder="${COPY.namePlaceholder}" maxlength="20" autocomplete="off" aria-label="${COPY.namePlaceholder}" enterkeyhint="go" />
          <button id="go" class="btn primary wide lg">${COPY.join}</button>
          <div class="join-err" role="alert">${error ? escapeHtml(error) : ''}</div>
        </div>
      </div>
    </main>`;
  const nameEl = qs<HTMLInputElement>('#name');
  const codeEl = qs<HTMLInputElement>('#code');
  (codeEl ?? nameEl)?.focus();
  const submit = (): void => void join(nameEl?.value ?? '', codeEl?.value ?? params.get('code') ?? '');
  qs('#go')?.addEventListener('click', submit);
  for (const input of [nameEl, codeEl]) {
    input?.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') submit();
    });
  }
}

function lobbyScreen(v: BfClientView): void {
  const me = v.players.find((p) => p.id === v.you.id);
  const connected = v.players.filter((p) => p.connected);
  shell(`
    <section class="lobby">
      <div class="lob-count eyebrow">${COPY.seats} ${arNum(connected.length)}/${arNum(5)}</div>
      <ul class="lob-list">
        ${v.players
          .map(
            (p) => `<li class="lob-row ${p.ready ? 'is-ready' : ''} ${p.id === v.you.id ? 'is-you' : ''}">
              <span class="seat sm">${seatGlyph(p.seat)}</span>
              <span class="lob-name">${escapeHtml(p.nickname)}</span>
              <span class="lob-state">${p.ready ? COPY.ready : COPY.notReady}</span>
            </li>`,
          )
          .join('')}
      </ul>
      <div class="lob-actions">
        <button id="ready" class="btn ${me?.ready ? 'ghost' : 'primary'} wide lg">${me?.ready ? COPY.notReady : COPY.ready}</button>
        <p class="lob-hint muted">${connected.length === 5 ? COPY.hostStarts : COPY.needFive}</p>
      </div>
    </section>`);
  qs('#ready')?.addEventListener('click', (e) => {
    press(e.currentTarget as HTMLElement);
    sfx.ready();
    haptic(10);
    send('ready', { ready: !me?.ready });
  });
}

// ---- intel (§27) --------------------------------------------------------------

function intelScreen(v: BfClientView): void {
  shell(
    `
    <section class="intel">
      <div class="eyebrow">${COPY.yourIntel}</div>
      <p class="intel-card">${escapeHtml(v.you.intel ?? '—')}</p>
      <div class="eyebrow obj-eyebrow">${COPY.yourObjective}</div>
      <p class="obj-card">${escapeHtml(v.you.objective ?? '—')}</p>
      <p class="privacy muted">${COPY.keepPrivate}</p>
      <button id="ack" class="btn ${acked ? 'ghost' : 'primary'} wide lg" ${acked ? 'disabled' : ''}>
        ${acked ? COPY.waitingOthers : COPY.continueRead}
      </button>
    </section>`,
    { world: true },
  );
  settle(qs('.intel-card')!);
  settle(qs('.obj-card')!, 120);
  qs('#ack')?.addEventListener('click', () => {
    acked = true;
    sfx.press();
    haptic(8);
    send('ack', {});
    forceRender = true;
    render();
  });
}

function discussionScreen(v: BfClientView): void {
  // Compact only: nothing to press, so heads come up and the argument happens in the room.
  shell(
    `
    <section class="discuss">
      <div class="discuss-head">${COPY.discussNow}</div>
      <div class="mini">
        <div class="mini-label">${COPY.yourIntel}</div>
        <p class="mini-text">${escapeHtml(v.you.intel ?? '—')}</p>
      </div>
      <div class="mini">
        <div class="mini-label">${COPY.yourObjective}</div>
        <p class="mini-text">${escapeHtml(v.you.objective ?? '—')}</p>
      </div>
    </section>`,
    { world: true },
  );
}

// ---- decision (§27) -----------------------------------------------------------

function decisionScreen(v: BfClientView): void {
  const tool = v.you.tool;
  const phase = v.phase;
  if (phase === 'R3_DECISION' && tool === 'side') return sideScreen(v);
  if (phase === 'R2_DECISION' && tool === 'redirect') return redirectScreen(v);

  const { title, hint } = actionCopy(v);
  const targets = v.you.targets;
  if (targets.length === 0) return watchScreen(v);

  shell(
    `
    <section class="decide">
      <div class="decide-head">
        <div class="eyebrow">${escapeHtml(title)}</div>
        ${hint ? `<p class="decide-hint">${escapeHtml(hint)}</p>` : ''}
      </div>
      <div class="targets" role="radiogroup" aria-label="${escapeHtml(title)}">
        ${targets.map((id) => targetButton(v, id, pick === id)).join('')}
      </div>
      <button id="confirm" class="btn primary wide lg" ${pick ? '' : 'disabled'}>${COPY.confirm}</button>
    </section>`,
    { world: true },
  );
  bindTargets((id) => {
    pick = id;
    forceRender = true;
    render();
  });
  qs('#confirm')?.addEventListener('click', () => {
    if (!pick) return;
    sendDecision(primaryDecision(v, pick));
  });
}

function redirectScreen(v: BfClientView): void {
  const step = pickSource ? 'dest' : 'source';
  const targets = v.you.targets.filter((id) => (step === 'dest' ? id !== pickSource : true));
  shell(
    `
    <section class="decide">
      <div class="decide-head">
        <div class="eyebrow">${COPY.toolRedirect}</div>
        <p class="decide-hint">${step === 'source' ? COPY.chooseSource : COPY.chooseDest}</p>
        <p class="decide-note muted">${COPY.redirectHint}</p>
        ${pickSource ? `<p class="decide-chosen">${COPY.chooseSource} ${escapeHtml(nameOf(v, pickSource))}</p>` : ''}
      </div>
      <div class="targets" role="radiogroup">
        ${targets.map((id) => targetButton(v, id, pick === id)).join('')}
      </div>
      <div class="decide-actions">
        ${pickSource ? `<button id="back" class="btn ghost wide">${COPY.change}</button>` : ''}
        <button id="confirm" class="btn primary wide lg" ${pick ? '' : 'disabled'}>${COPY.confirm}</button>
      </div>
    </section>`,
    { world: true },
  );
  bindTargets((id) => {
    pick = id;
    forceRender = true;
    render();
  });
  qs('#back')?.addEventListener('click', () => {
    pick = pickSource;
    pickSource = null;
    forceRender = true;
    render();
  });
  qs('#confirm')?.addEventListener('click', () => {
    if (!pick) return;
    if (step === 'source') {
      pickSource = pick;
      pick = null;
      sfx.press();
      haptic(8);
      forceRender = true;
      render();
      return;
    }
    sendDecision({ kind: 'redirect', source: pickSource!, target: pick });
  });
}

function sideScreen(v: BfClientView): void {
  const options: { side: SideChoice; label: string }[] = [
    { side: 'redirect', label: COPY.redirectSide },
    { side: 'shield', label: COPY.shieldSide },
    { side: 'abstain', label: COPY.abstain },
  ];
  shell(
    `
    <section class="decide">
      <div class="decide-head">
        <div class="eyebrow">${COPY.r3Decision}</div>
        <p class="decide-hint">${COPY.chooseOne}</p>
      </div>
      <div class="sides" role="radiogroup">
        ${options
          .map(
            (o) => `<button class="side-btn ${pickSide === o.side ? 'sel' : ''}" data-side="${o.side}" role="radio" aria-checked="${pickSide === o.side}">
              <span class="side-label">${o.label}</span>
              <span class="side-sub">${o.side === 'redirect' ? escapeHtml(nameOf(v, v.publicRoles.redirectorId)) : o.side === 'shield' ? escapeHtml(nameOf(v, v.publicRoles.guardianId)) : ''}</span>
            </button>`,
          )
          .join('')}
      </div>
      <button id="confirm" class="btn primary wide lg" ${pickSide ? '' : 'disabled'}>${COPY.confirm}</button>
    </section>`,
    { world: true },
  );
  for (const button of qsa('.side-btn')) {
    button.addEventListener('click', () => {
      pickSide = button.dataset.side as SideChoice;
      press(button);
      sfx.press();
      haptic(8);
      forceRender = true;
      render();
    });
  }
  qs('#confirm')?.addEventListener('click', () => {
    if (!pickSide) return;
    sendDecision({ kind: 'side', side: pickSide });
  });
}

function targetButton(v: BfClientView, id: string, selected: boolean): string {
  const p = v.players.find((x) => x.id === id);
  if (!p) return '';
  const echo = v.world.echoHolderId === id;
  // In Round 3 the two special positions are public (§22), so the target list says which player
  // is which. Aiming the Echo at the Guardian is exactly the decision the bounce rule is about,
  // and the phone should never make that fact something you have to remember.
  const role = id === v.publicRoles.redirectorId ? 'redirect' : id === v.publicRoles.guardianId ? 'shield' : '';
  const roleLabel = role === 'redirect' ? COPY.redirector : role === 'shield' ? COPY.guardian : '';
  const tags = [echo ? COPY.echo : '', roleLabel].filter(Boolean);
  return `<button class="target ${selected ? 'sel' : ''}" data-id="${escapeHtml(id)}"${role ? ` data-role="${role}"` : ''} role="radio" aria-checked="${selected}">
    <span class="seat sm" ${echo ? 'data-echo="1"' : ''}>${seatGlyph(p.seat)}</span>
    <span class="target-name">${escapeHtml(p.nickname)}${id === v.you.id ? ' ·' : ''}</span>
    ${tags.map((t) => `<span class="target-tag">${t}</span>`).join('')}
  </button>`;
}

function bindTargets(onPick: (id: string) => void): void {
  for (const button of qsa('.target')) {
    button.addEventListener('click', () => {
      press(button);
      sfx.press();
      haptic(8);
      onPick(button.dataset.id ?? '');
    });
  }
}

function actionCopy(v: BfClientView): { title: string; hint: string } {
  if (v.phase === 'R1_DECISION') return { title: COPY.r1Discussion, hint: COPY.toolVote };
  if (v.phase === 'R2_TIEBREAK') return { title: COPY.tiebreak, hint: COPY.chooseOne };
  if (v.phase === 'R3_DECISION') {
    // Each special position is told who the other one is — public this round, and the whole
    // point of the tension is what they intend to do with it.
    if (v.you.tool === 'redirect') return { title: COPY.toolEchoTarget, hint: `${COPY.guardian}: ${nameOf(v, v.publicRoles.guardianId)}` };
    if (v.you.tool === 'shield') return { title: COPY.toolEchoShield, hint: `${COPY.redirector}: ${nameOf(v, v.publicRoles.redirectorId)}` };
  }
  switch (v.you.tool) {
    case 'support':
      return { title: COPY.toolSupport, hint: COPY.supportHint };
    case 'disrupt':
      return { title: COPY.toolDisrupt, hint: COPY.disruptHint };
    case 'shield':
      return { title: COPY.toolShield, hint: COPY.shieldHint };
    default:
      return { title: COPY.chooseOne, hint: '' };
  }
}

function primaryDecision(v: BfClientView, target: string): BfDecision {
  if (v.phase === 'R1_DECISION') return { kind: 'vote', target };
  if (v.phase === 'R2_TIEBREAK') return { kind: 'tiebreak', target };
  if (v.phase === 'R3_DECISION') {
    return v.you.tool === 'redirect' ? { kind: 'echo_target', target } : { kind: 'echo_shield', target };
  }
  if (v.you.tool === 'support') return { kind: 'support', target };
  if (v.you.tool === 'disrupt') return { kind: 'disrupt', target };
  return { kind: 'shield', target };
}

function sendDecision(decision: BfDecision): void {
  send('decide', decision);
  sfx.lock();
  haptic([8, 30]);
  pick = null;
  pickSource = null;
  pickSide = null;
  forceRender = true;
}

// ---- passive screens ----------------------------------------------------------

function lockedScreen(v: BfClientView): void {
  shell(
    `
    <section class="wait">
      <div class="wait-mark locked">▣</div>
      <h1 class="wait-title">${COPY.locked}</h1>
      <p class="wait-sub muted">${COPY.lockedSub}</p>
      <p class="wait-count mono">${arNum(v.lockedCount)}/${arNum(v.expectedCount)}</p>
    </section>`,
    { world: true },
  );
  settle(qs('.wait')!);
}

/** During a reveal the phone deliberately holds nothing to read — the result is on the TV. */
function watchScreen(v: BfClientView): void {
  shell(
    `
    <section class="wait">
      <div class="wait-mark">↑</div>
      <h1 class="wait-title">${COPY.lookUp}</h1>
      <p class="wait-sub muted">${phaseNote(v.phase)}</p>
    </section>`,
    { world: true },
  );
  settle(qs('.wait')!);
}

function phaseNote(phase: BfPhase): string {
  if (phase === 'INTRO') return COPY.scenario;
  if (phase.endsWith('_EVENT')) return '';
  if (phase.endsWith('_RESOLUTION')) return '';
  if (phase.endsWith('_AFTERSHOCK')) return COPY.discussNow;
  if (phase === 'FINAL_REVEAL') return COPY.finalTitle;
  return '';
}

function expiredScreen(): void {
  shell(`
    <section class="wait">
      <div class="wait-mark">◌</div>
      <h1 class="wait-title">${COPY.recoveryExpired}</h1>
      <p class="wait-sub muted">${COPY.lookUp}</p>
    </section>`);
}

function resultsScreen(v: BfClientView): void {
  const isHost = v.hostId === v.you.id;
  const me = v.results?.find((r) => r.id === v.you.id);
  const won = v.winnerIds.includes(v.you.id);
  shell(`
    <section class="results">
      <div class="eyebrow">${COPY.resultsTitle}</div>
      <h1 class="rs-me">${v.sharedFailure ? COPY.collapseTitle : won ? COPY.winner : `${arNum(me?.influence ?? 0)} ${COPY.influence}`}</h1>
      <p class="rs-line">${escapeHtml(v.finalReveal?.summary ?? '')}</p>
      <div class="rs-objs">
        ${(me?.objectivesWon ?? [])
          .map((ok, i) => `<span class="rs-obj ${ok ? 'won' : ''}">${COPY.round} ${arNum(i + 1)}</span>`)
          .join('')}
      </div>
      ${
        isHost
          ? `<div class="rs-actions">
              <button id="again" class="btn primary wide lg">${COPY.playAgain}</button>
              <button id="newcrew" class="btn ghost wide">${COPY.newCrew}</button>
            </div>`
          : `<p class="muted">${COPY.lookUp}</p>`
      }
    </section>`);
  if (won) haptic([15, 40, 15]);
  qs('#again')?.addEventListener('click', () => send('restart', {}));
  qs('#newcrew')?.addEventListener('click', () => send('newCrew', {}));
}

// ---------------------------------------------------------------- helpers

/** Every outbound message goes through here: a dropped or superseded socket must not throw. */
function send(type: string, payload: Record<string, unknown> = {}): void {
  if (!room || standDown) return;
  try {
    room.send(type, payload);
  } catch {
    /* the socket closed under us; the reconnect path owns recovery from here */
  }
}

function nameOf(v: BfClientView, id: string | null | undefined): string {
  return v.players.find((p) => p.id === id)?.nickname ?? '—';
}
function decisionKey(d: BfDecision | null): string {
  if (!d) return '';
  if (d.kind === 'side') return `side:${d.side}`;
  if (d.kind === 'redirect') return `redirect:${d.source}>${d.target}`;
  return `${d.kind}:${d.target}`;
}
function banner(text: string, kind: 'warn' | 'err' | 'ok' | 'clear'): void {
  const node = qs('#banner');
  if (!node) return;
  node.innerHTML = kind === 'clear' || !text ? '' : `<div class="p-banner ${kind}">${escapeHtml(text)}</div>`;
}
function shake(selector: string): void {
  const node = qs(selector);
  if (!node) return;
  strike(node);
  node.classList.add('err');
  sfx.error();
  haptic(25);
  window.setTimeout(() => node.classList.remove('err'), 600);
}
function setJoinBusy(value: boolean): void {
  const go = qs<HTMLButtonElement>('#go');
  if (!go) return;
  go.disabled = value;
  go.textContent = value ? '…' : COPY.join;
}
