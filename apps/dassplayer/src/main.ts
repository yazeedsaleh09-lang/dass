import { Client, type Room } from 'colyseus.js';
import type { ActionKind, ClientView } from '@dass/domain';
import {
  COPY,
  actionColor,
  actionIcon,
  addStyle,
  copyText,
  dassIn,
  escapeHtml,
  haptic,
  injectBase,
  mark,
  mountBackground,
  press,
  qs,
  qsa,
  sfx,
  strike,
  uiIcon,
} from '@dass/ui';

declare const DASS_SERVER_URL: string;

injectBase();
addStyle(playerCss());
const bg = mountBackground();
const app = document.getElementById('app')!;
const params = new URLSearchParams(location.search);
const serverUrl = DASS_SERVER_URL || `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;
const client = new Client(serverUrl);

let room: Room | null = null;
let view: ClientView | null = null;
let joined = false;
let busy = false; // reentrancy guard: blocks double-submit (Enter+click, double-click)
let intentionalLeave = false;
let changing = false;

// DURABLE IDENTITY: playerToken (pt) is a stable, room-scoped id the SERVER maps to a
// permanent seat (pid). It is the single source of identity — reconnecting with it rebinds
// a fresh socket to the SAME active seat (score/actions/state intact), in the lobby OR
// mid-game, regardless of how the sessionId changes. Room-scoped so a different room never
// reuses the wrong seat.
const ptKey = (roomId: string): string => `dass_pt:${roomId}`;
function playerTokenFor(roomId: string): string {
  const k = ptKey(roomId);
  let t = localStorage.getItem(k);
  if (!t) {
    const a = new Uint8Array(18);
    crypto.getRandomValues(a);
    t = btoa(String.fromCharCode(...a)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
    localStorage.setItem(k, t);
  }
  return t;
}
const hasIdentity = (roomId: string): boolean => !!localStorage.getItem(ptKey(roomId));
let recoveryEnded = false; // server refused restore (recovery window lapsed) — watch only
let selKind: ActionKind | null = null;
let selTarget: string | null = null;
let lastSig = '';
let forceRender = false;

app.innerHTML = `<div id="root"></div><div id="toast-host"></div>`;
const root = qs('#root')!;
const urlCode = params.get('code');
const urlName = params.get('name');
// Auto-resume when we already own a seat in this room (refresh), or auto-join with name+code.
if (urlCode && (urlName || hasIdentity(urlCode))) void join(urlName ?? '', urlCode);
else renderJoin(urlCode ?? '');

// ---------------- connection ----------------
async function join(name: string, code: string): Promise<void> {
  if (busy) return; // hard block against a second submit landing before the first resolves
  sfx.unlock();
  const nickname = name.trim().slice(0, 20);
  const roomId = code.trim();
  if (!roomId) {
    shake('#code');
    return;
  }
  // A brand-new seat needs a name; a resume (we already hold this room's token) does not.
  if (!nickname && !hasIdentity(roomId)) {
    shake('#name');
    return;
  }
  busy = true;
  setBusy(true);
  try {
    room = await client.joinById(roomId, { nickname, playerToken: playerTokenFor(roomId) });
    onJoined();
  } catch (e) {
    busy = false;
    setBusy(false);
    const msg = String((e as { message?: string })?.message ?? e);
    renderJoin(code, /full/i.test(msg) ? COPY.roomFull : COPY.roomNotFound);
    sfx.inputErr();
  }
}

/** Shared success path for a join or a token-based resume. */
function onJoined(): void {
  if (!room) return;
  joined = true;
  busy = false;
  recoveryEnded = false;
  wire(room);
  sfx.join();
  haptic(15);
}

function wire(r: Room): void {
  r.onMessage('state', (v: ClientView) => {
    view = v;
    if (v.phase !== 'REACTION_WINDOW') changing = false;
    render();
  });
  // Server confirmed our seat was restored after a disconnect.
  r.onMessage('restored', () => {
    recoveryEnded = false;
    banner(COPY.sessionRestored, 'ok');
    setTimeout(() => banner('', 'clear'), 2200);
  });
  // The recovery window lapsed — we are a spectator now, not the active player.
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
  r.onMessage('sessionlog', () => {});
  const roomId = r.roomId;
  r.onLeave((code: number) => {
    if (intentionalLeave) return;
    // 4002 = server evicted this socket because a newer connection took over this seat.
    // Stand down quietly; the newer tab/socket owns it.
    if (code === 4002) return;
    banner(COPY.reconnecting, 'warn');
    void reconnect(roomId);
  });
  r.send('sync', {});
}

/** Durable reconnect: re-join by the stable token, which rebinds us to the same seat. */
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

// ---------------- render ----------------
function render(): void {
  const v = view;
  if (!v || !joined) return;
  if (recoveryEnded) return expiredScreen();
  const sig = `${v.phase}|${act(v.you.declared)}|${act(v.you.locked)}|${v.you.reactionMoved}|${changing}|${v.ended}|${v.players.length}|${v.players.map((p) => (p.connected ? 1 : 0) + (p.ready ? 'r' : '')).join('')}|${v.hostId}`;
  if (sig === lastSig && !forceRender) return;
  lastSig = sig;
  forceRender = false;

  if (v.phase === 'LOBBY') return lobby(v);
  if (v.ended) return end(v);
  bgForPhase(v.phase);
  switch (v.phase) {
    case 'DECLARE':
      return v.you.declared ? waitScene(COPY.declared, COPY.waitOthers, 'ok') : picker(v, 'declare');
    case 'REACTION_WINDOW':
      return changing ? picker(v, 'declare') : reaction(v);
    case 'LOCK':
      return v.you.locked ? waitScene(COPY.locked, COPY.lookUp, 'lock') : picker(v, 'lock');
    case 'REVEAL':
    case 'VAULT_UPDATE':
      return waitScene(COPY.watchScreen, yourResult(v), 'watch');
    default:
      return waitScene('…', '', 'watch');
  }
}

// ---------------- screens ----------------
function shell(inner: string, opts: { pad?: boolean } = {}): void {
  root.innerHTML = `
    <div class="p-top">
      <span class="p-brand">${mark(22)}<span class="wordmark g">${COPY.brand}</span></span>
      <button id="mute" class="icon-btn sm" aria-label="صوت">${uiIcon(sfx.isMuted() ? 'soundOff' : 'soundOn', 20)}</button>
    </div>
    <div class="p-body ${opts.pad === false ? 'nopad' : ''}">${inner}</div>
    <div id="banner"></div>`;
  qs('#mute')?.addEventListener('click', () => {
    sfx.toggle();
    if (!sfx.isMuted()) sfx.press();
    qs('#mute')!.innerHTML = uiIcon(sfx.isMuted() ? 'soundOff' : 'soundOn', 20);
  });
}

function renderJoin(code: string, err?: string): void {
  bg.setMood('secret');
  const hasCode = !!params.get('code');
  // Render into the PERSISTENT #root (never rebuild app.innerHTML — doing so detaches the
  // module-level `root`, so a later lobby/game render would write to an orphaned node and
  // the screen would appear frozen on the join form even though the join succeeded).
  root.innerHTML = `
    <div class="p-top"><span class="p-brand">${mark(24)}<span class="wordmark g">${COPY.brand}</span></span></div>
    <div class="join">
      <div class="panel join-card">
        <div class="jc-eyebrow">انضمام</div>
        <div class="jc-title">خشّ المجلس</div>
        <div class="j-form">
          ${hasCode
            ? `<div class="jc-code mono" aria-label="كود الغرفة">${escapeHtml(code)}</div>`
            : `<input id="code" class="input mono" placeholder="${COPY.codePlaceholder}" value="${escapeHtml(code)}" maxlength="12" autocapitalize="characters" autocorrect="off" autocomplete="off" aria-label="كود الغرفة" />`}
          <input id="name" class="input" placeholder="${COPY.namePlaceholder}" maxlength="20" autocomplete="off" aria-label="اسمك" enterkeyhint="go" />
          <button id="go" class="btn primary wide">${COPY.join}</button>
          <div class="j-err" role="alert">${err ?? ''}</div>
        </div>
      </div>
      <div class="join-foot muted">${uiIcon('users', 16)}<span>بتلعب من جوّالك، والتلفاز يعرض المجلس للكل</span></div>
    </div>`;
  const nameEl = qs<HTMLInputElement>('#name');
  const codeEl = qs<HTMLInputElement>('#code');
  (codeEl ?? nameEl)?.focus();
  const submit = (): void => {
    void join(nameEl?.value ?? '', codeEl?.value ?? params.get('code') ?? '');
  };
  qs('#go')?.addEventListener('click', submit);
  for (const elx of [nameEl, codeEl]) elx?.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter') submit(); });
}

function lobby(v: ClientView): void {
  bg.setMood('calm');
  const me = v.players.find((p) => p.id === v.you.id);
  const isHost = v.hostId === v.you.id;
  const conn = v.players.filter((p) => p.connected);
  const allReady = conn.length >= 4 && conn.every((p) => p.ready);
  const list = v.players
    .map(
      (p) => `<div class="pcard ${p.ready ? 'is-ready' : ''} ${p.id === v.you.id ? 'is-you' : ''} ${p.connected ? '' : 'is-off'}">
        <span class="avatar" style="background:${avatarColor(p.seat)}">${escapeHtml(initial(p.nickname))}</span>
        <span class="nm">${escapeHtml(p.nickname)}${p.id === v.you.id ? ` <b class="mine">(${COPY.you})</b>` : ''}</span>
        <span style="margin-inline-start:auto">${p.id === v.hostId ? `<span class="badge host">${COPY.host}</span>` : p.ready ? `<span class="badge ok">${uiIcon('check', 14)}</span>` : '<span class="dot"></span>'}</span>
      </div>`,
    )
    .join('');
  shell(`
    <div class="lob">
      <div class="lob-count muted">${COPY.ofN(conn.length, 8)} · ${conn.filter((p) => p.ready).length} ${COPY.ready}</div>
      <div class="lob-list">${list}</div>
      <div class="lob-actions">
        <button id="ready" class="btn ${me?.ready ? '' : 'primary'} wide">${me?.ready ? COPY.unready : COPY.imReady}</button>
        ${isHost ? `<button id="start" class="btn wide" ${allReady ? '' : 'disabled'}>${allReady ? COPY.start : conn.length < 4 ? COPY.needFour : COPY.everyoneReady}</button>` : `<div class="muted lob-hint">${COPY.hostStarts}</div>`}
      </div>
    </div>`);
  qs('#ready')?.addEventListener('click', (e) => {
    const btn = e.currentTarget as HTMLElement;
    press(btn);
    sfx.ready();
    haptic(12);
    room?.send('ready', { ready: !me?.ready });
  });
  qs('#start')?.addEventListener('click', () => {
    sfx.roundStart();
    haptic(20);
    room?.send('start', {});
  });
}

function picker(v: ClientView, mode: 'declare' | 'lock'): void {
  if (mode === 'lock' && v.you.declared && selKind === null) {
    selKind = v.you.declared.kind;
    selTarget = v.you.declared.target ?? null;
  }
  const title = mode === 'declare' ? COPY.declareTitle : COPY.lockTitle;
  const sub = mode === 'declare' ? COPY.declareSub : COPY.lockSub;
  shell(`
    <div class="pick">
      <div class="pick-head"><div class="pick-title">${title}</div><div class="muted pick-sub">${sub}</div></div>
      <div class="acts">
        ${actBtn('back', COPY.support)}
        ${actBtn('dump', COPY.attack)}
        ${actBtn('sell', COPY.sell)}
      </div>
      <div id="targets" class="targets"></div>
      <div class="pick-foot">
        <button id="confirm" class="btn primary wide" disabled></button>
      </div>
    </div>`);
  renderTargets(v);
  refreshPick(v, mode);
  for (const b of qsa('.act')) {
    b.addEventListener('click', () => {
      selKind = b.dataset.kind as ActionKind;
      if (selKind === 'sell') selTarget = null;
      press(b);
      sfx.press();
      haptic(8);
      renderTargets(v);
      refreshPick(v, mode);
    });
  }
  qs('#confirm')?.addEventListener('click', () => sendPick(v, mode));
}

function renderTargets(v: ClientView): void {
  const box = qs('#targets');
  if (!box) return;
  if (selKind === 'sell') {
    box.innerHTML = `<div class="muted sell-note">${COPY.sellSelf}</div>`;
    return;
  }
  if (selKind === null) {
    box.innerHTML = `<div class="muted sell-note">${COPY.pickTarget}</div>`;
    return;
  }
  const others = v.players.filter((p) => p.id !== v.you.id && p.connected);
  box.innerHTML = `<div class="muted t-label">${COPY.pickTarget}</div><div class="chips">${others
    .map((p) => `<button class="tchip ${p.id === selTarget ? 'sel' : ''}" data-id="${p.id}" style="--c:${avatarColor(p.seat)}"><span class="avatar sm" style="background:${avatarColor(p.seat)}">${escapeHtml(initial(p.nickname))}</span>${escapeHtml(p.nickname)}</button>`)
    .join('')}</div>`;
  for (const t of qsa('.tchip', box)) {
    t.addEventListener('click', () => {
      selTarget = t.dataset.id ?? null;
      sfx.press();
      haptic(8);
      renderTargets(v);
      refreshPick(v, 'declare');
    });
  }
}

function refreshPick(v: ClientView, mode: 'declare' | 'lock'): void {
  for (const b of qsa('.act')) b.classList.toggle('on', b.dataset.kind === selKind);
  const ok = selKind === 'sell' || (!!selKind && !!selTarget);
  const c = qs<HTMLButtonElement>('#confirm');
  if (!c) return;
  c.disabled = !ok;
  const betray = mode === 'lock' && v.you.declared && ok && act({ kind: selKind!, target: selTarget ?? undefined }) !== act(v.you.declared);
  if (mode === 'lock') {
    c.textContent = betray ? COPY.betrayIt : COPY.keepPromise;
    c.classList.toggle('danger', !!betray);
    c.classList.toggle('primary', !betray);
  } else {
    c.textContent = COPY.declared;
  }
}

function sendPick(v: ClientView, mode: 'declare' | 'lock'): void {
  if (!selKind) return;
  if (selKind !== 'sell' && !selTarget) return;
  const msg = selKind === 'sell' ? { kind: 'sell' } : { kind: selKind, target: selTarget };
  const betray = mode === 'lock' && v.you.declared && act({ kind: selKind, target: selTarget ?? undefined }) !== act(v.you.declared);
  room?.send(mode, msg);
  if (selKind === 'back') sfx.support();
  else if (selKind === 'dump') sfx.attack();
  else sfx.vault();
  haptic(betray ? [10, 30, 20] : 15);
  selKind = null;
  selTarget = null;
  changing = false;
  forceRender = true;
}

function reaction(v: ClientView): void {
  const rows = v.players
    .map((p) => {
      const a = v.declares[p.id];
      return `<div class="rrow"><span class="avatar sm" style="background:${avatarColor(p.seat)}">${escapeHtml(initial(p.nickname))}</span><span class="nm">${escapeHtml(p.nickname)}${p.id === v.you.id ? ` <b class="mine">(${COPY.you})</b>` : ''}</span><span class="rico" style="color:${a ? actionColor(a.kind) : 'var(--muted)'}">${a ? actionIcon(a.kind, 24) : '—'}</span></div>`;
    })
    .join('');
  const canChange = !!v.you.declared && !v.you.reactionMoved;
  shell(`
    <div class="react">
      <div class="pick-head"><div class="pick-title">${COPY.reactionTitle}</div><div class="muted pick-sub">${COPY.reactionSub}</div></div>
      <div class="rlist">${rows}</div>
      <div class="pick-foot">
        ${canChange ? `<button id="change" class="btn wide">${COPY.changeOnce}</button>` : `<div class="muted">${v.you.reactionMoved ? COPY.changedAlready : COPY.lookUp}</div>`}
      </div>
    </div>`);
  qs('#change')?.addEventListener('click', () => {
    changing = true;
    selKind = v.you.declared?.kind ?? null;
    selTarget = v.you.declared?.target ?? null;
    sfx.press();
    forceRender = true;
    render();
  });
}

function waitScene(title: string, sub: string, kind: 'ok' | 'lock' | 'watch'): void {
  const ic = kind === 'watch' ? '' : kind === 'lock' ? '🔒' : '';
  shell(`
    <div class="wait">
      <div class="wait-mark">${kind === 'watch' ? `<div class="up-arrow">↑</div>` : `<div class="seal-badge">${ic || uiIcon('check', 40)}</div>`}</div>
      <div class="wait-title">${title}</div>
      <div class="muted wait-sub">${sub}</div>
      ${kind === 'watch' ? `<div class="muted watch-hint">${COPY.yourMoveHidden}</div>` : ''}
    </div>`);
  const w = qs('.wait');
  if (w) dassIn(w);
}

/** Shown when the recovery window lapsed: we can watch the TV but no longer act this game. */
function expiredScreen(): void {
  bg.setMood('secret');
  shell(`
    <div class="wait">
      <div class="wait-mark"><div class="seal-badge">${uiIcon('soundOff', 34)}</div></div>
      <div class="wait-title">${COPY.recoveryExpired}</div>
      <div class="muted wait-sub">${COPY.lookUp}</div>
    </div>`);
  const w = qs('.wait');
  if (w) dassIn(w);
}

function end(v: ClientView): void {
  bg.setMood('win');
  const isHost = v.hostId === v.you.id;
  const winners = v.players.filter((p) => v.winnerIds.includes(p.id));
  const iWon = v.winnerIds.includes(v.you.id);
  const label = winners.length > 1 ? COPY.coChamps : `${COPY.winner}: ${escapeHtml(winners[0]?.nickname ?? '')}`;
  shell(`
    <div class="pend">
      <div class="pend-head">${iWon ? '👑 ' : ''}${COPY.playedIt}</div>
      <div class="pend-win gold">${label}</div>
      <div class="pend-you muted">${yourResult(v, true)}</div>
      ${isHost ? `<div class="pend-actions"><button id="again" class="btn primary wide">${COPY.playAgain}</button><button id="newc" class="btn wide">${COPY.newCrew}</button></div>` : `<div class="muted">${COPY.lookUp}</div>`}
    </div>`);
  if (iWon) haptic([20, 40, 20, 40]);
  qs('#again')?.addEventListener('click', () => {
    sfx.replay();
    room?.send('restart', {});
  });
  qs('#newc')?.addEventListener('click', () => {
    sfx.replay();
    room?.send('newCrew', {});
  });
}

// ---------------- helpers ----------------
function yourResult(v: ClientView, calm = false): string {
  const me = v.players.find((p) => p.id === v.you.id);
  if (!me) return '';
  if (calm) return `${COPY.yourVault}: ${me.vault}`;
  return COPY.lookUp;
}
function bgForPhase(phase: string): void {
  const m = phase === 'LOCK' ? 'secret' : phase === 'REACTION_WINDOW' ? 'tension' : 'calm';
  bg.setMood(m as never);
}
function actBtn(kind: ActionKind, label: string): string {
  const cls = kind === 'back' ? 'up' : kind === 'dump' ? 'dn' : 'gd';
  return `<button class="act ${cls}" data-kind="${kind}" style="--c:${actionColor(kind)}"><span class="act-ic">${actionIcon(kind, 34)}</span><span class="act-lb">${label}</span></button>`;
}
function act(a?: { kind: string; target?: string }): string {
  return a ? `${a.kind}:${a.target ?? ''}` : '';
}
function banner(text: string, kind: 'warn' | 'err' | 'ok' | 'clear'): void {
  const b = qs('#banner');
  if (!b) return;
  b.innerHTML = kind === 'clear' || !text ? '' : `<div class="p-banner ${kind}">${text}</div>`;
}
function shake(sel: string): void {
  const e = qs(sel);
  if (e) {
    strike(e);
    e.classList.add('err');
    sfx.inputErr();
    haptic(30);
    setTimeout(() => e.classList.remove('err'), 600);
  }
}
function setBusy(b: boolean): void {
  const go = qs<HTMLButtonElement>('#go');
  if (go) {
    go.disabled = b;
    go.innerHTML = b ? '<span class="spinner"></span>' : COPY.join;
  }
}
function avatarColor(seat: number): string {
  return `hsl(${(seat * 47 + 20) % 360} 58% 62%)`;
}
function initial(n: string): string {
  return [...n.trim()][0] ?? '؟';
}
void copyText;

function playerCss(): string {
  return `
  html,body{height:100%;overflow:hidden}
  #root{position:relative;z-index:1;min-height:100dvh;display:flex;flex-direction:column;padding:calc(var(--safe-t) + 10px) 16px calc(var(--safe-b) + 16px)}
  .p-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
  .p-brand{display:flex;align-items:center;gap:8px;font-size:22px}
  .icon-btn.sm{width:40px;height:40px}
  .p-body{flex:1;display:flex;flex-direction:column}
  #banner{position:fixed;left:0;right:0;top:0}
  .p-banner{padding:8px;text-align:center;font-weight:800;font-size:14px;background:var(--surface-3);border-bottom:1px solid var(--line-2)}
  .p-banner.err{color:var(--red)} .p-banner.warn{color:var(--gold)} .p-banner.ok{color:var(--green)}

  .join{flex:1;display:flex;flex-direction:column;justify-content:center;gap:22px}
  .j-tag{font-size:clamp(26px,7vw,40px);font-weight:900;line-height:1.25;text-align:center}
  .j-form{display:flex;flex-direction:column;gap:12px}
  #code{direction:ltr;unicode-bidi:isolate;text-align:center}
  .j-err{color:var(--red);font-weight:800;text-align:center;min-height:20px}
  .join-foot{display:flex;align-items:center;justify-content:center;gap:8px;text-align:center;font-size:14px;line-height:1.5;padding-inline:12px}
  .join-foot svg{flex:none}
  .join-card{width:100%;max-width:420px;margin:0 auto;padding:26px 22px}
  .jc-eyebrow{font-size:13px;font-weight:800;letter-spacing:.14em;color:var(--gold);text-align:center}
  .jc-title{font-size:clamp(26px,7vw,34px);font-weight:900;text-align:center;margin:4px 0 12px}
  .jc-code{font-size:clamp(28px,8vw,42px);font-weight:900;color:var(--gold);text-align:center;letter-spacing:.12em;background:var(--surface);border:1px solid var(--line-2);border-radius:var(--r-2);padding:12px;direction:ltr;unicode-bidi:isolate}

  .lob{flex:1;display:flex;flex-direction:column;gap:14px}
  .lob-count{text-align:center;font-weight:800}
  .lob-list{flex:1;display:flex;flex-direction:column;gap:10px;overflow:auto}
  .pcard .mine{color:var(--gold)}
  .lob-actions{display:flex;flex-direction:column;gap:10px;padding-top:6px}
  .lob-hint{text-align:center}

  .pick,.react{flex:1;display:flex;flex-direction:column;gap:16px}
  .pick-head{text-align:center} .pick-title{font-size:clamp(22px,5.5vw,30px);font-weight:900} .pick-sub{font-size:14px;margin-top:4px}
  .acts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
  .act{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 8px;border-radius:var(--r-2);
    background:var(--surface);border:2px solid var(--line-2);color:var(--c);font-weight:900;font-size:17px;min-height:96px;
    transition:transform var(--t-instant) var(--e-out),border-color var(--t-micro),background var(--t-micro)}
  .act .act-lb{color:var(--text)} .act:active{transform:scale(.96)}
  .act.on{border-color:var(--c);background:color-mix(in srgb,var(--c) 12%,var(--surface));box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 20%,transparent)}
  .targets{flex:1;min-height:60px}
  .t-label,.sell-note{text-align:center;margin-bottom:10px}
  .chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
  .tchip{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:var(--r-pill);background:var(--surface);border:2px solid var(--line-2);font-weight:800;font-size:16px}
  .tchip.sel{border-color:var(--c);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 20%,transparent)}
  .pick-foot{padding-top:6px}

  .rlist{flex:1;display:flex;flex-direction:column;gap:8px;overflow:auto}
  .rrow{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:var(--r-2);background:var(--surface);border:1px solid var(--line)}
  .rrow .nm{flex:1;font-weight:800} .rrow .mine{color:var(--gold)}

  .wait{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center}
  .seal-badge{width:88px;height:88px;border-radius:26px;display:grid;place-items:center;font-size:40px;background:var(--surface-2);border:1px solid var(--line-2);color:var(--green)}
  .up-arrow{font-size:64px;color:var(--gold);animation:breathe 1.8s ease-in-out infinite}
  .wait-title{font-size:clamp(24px,6vw,34px);font-weight:900} .wait-sub{font-size:16px} .watch-hint{font-size:13px}

  .pend{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center}
  .pend-head{font-size:clamp(26px,7vw,38px);font-weight:900} .pend-win{font-size:clamp(20px,5vw,26px);font-weight:900}
  .pend-actions{display:flex;flex-direction:column;gap:10px;width:100%;max-width:340px;margin-top:12px}
  `;
}
