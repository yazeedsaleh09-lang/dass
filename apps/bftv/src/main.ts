import { Client, type Room } from 'colyseus.js';
import type { BfClientView, BfPhase, BfPublicPlayer } from '@backfire/domain';
import {
  COPY,
  ECHO_TEXT,
  WORLD_TEXT,
  addStyle,
  arNum,
  arDigits,
  cut,
  escapeHtml,
  injectBase,
  qs,
  qsa,
  qrSvg,
  reduced,
  reveal,
  seatGlyph,
  settle,
  sfx,
  sleep,
  stagger,
  strike,
} from '@backfire/ui';
import { tvCss } from './tv-css.js';
import { relayStage, nodeX, NODE_Y, FLOOR_Y } from './relay.js';

declare const BF_SERVER_URL: string;
declare const BF_PUBLIC_URL: string;

injectBase();
addStyle(tvCss());
const app = document.getElementById('app')!;
app.innerHTML = `
  <button id="mute" class="icon-btn tv-mute" aria-label="الصوت"></button>
  <div id="stage" class="tv-stage"></div>
  <div id="cue" class="cue-caption" role="status" aria-live="polite"></div>`;
const stage = qs('#stage')!;

const serverUrl = BF_SERVER_URL || `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;
const publicUrl = (BF_PUBLIC_URL || location.origin).replace(/\/$/, '');
const client = new Client(serverUrl);

let room: Room | null = null;
let view: BfClientView | null = null;
let prev: BfClientView | null = null;
let mode: 'boot' | 'lobby' | 'world' | 'final' | 'results' = 'boot';
let seenIds = new Set<string>();
/** Fires the "crew complete" beat exactly once per lobby, on the fifth arrival. */
let crewAnnounced = false;
let phaseStart = 0;
let phaseEnd = 0;
let lastSecond = -1;
/** Bumped on every phase change; a running cinematic aborts when its token goes stale. */
let sequenceToken = 0;
let lastThreat = 1;
/** True once the server has handed this TV the host token — only the host may restart the room. */
let isHost = false;

setupMute();
void boot();

// ---------------------------------------------------------------- connection

interface HostSession {
  roomId: string;
  token: string;
}
function readHostSession(): HostSession | null {
  try {
    const raw = sessionStorage.getItem('bf_host');
    return raw ? (JSON.parse(raw) as HostSession) : null;
  } catch {
    return null;
  }
}

async function boot(): Promise<void> {
  try {
    const opening = openingSequence();
    let openingDone = false;
    room = await openRoom();
    room.onMessage('host', (m: { token?: string }) => {
      if (m?.token && room) {
        isHost = true;
        sessionStorage.setItem('bf_host', JSON.stringify({ roomId: room.roomId, token: m.token }));
        // A results screen already on the wall must gain its controls the moment host is confirmed.
        if (mode === 'results' && view) void resultsScene(view);
      }
    });
    room.onMessage('state', (v: BfClientView) => {
      prev = view;
      view = v;
      if (openingDone) onState();
    });
    room.onMessage('telemetry', () => {});
    room.send('syncHost', {});
    room.send('sync', {});
    await opening;
    openingDone = true;
    sfx.unlock();
    if (view) onState();
    requestAnimationFrame(tick);
  } catch {
    stage.innerHTML = `<div class="tv-err">${COPY.genericError}</div>`;
  }
}

/** Reclaim host of a recently created room after a refresh; otherwise open a fresh one. */
async function openRoom(): Promise<Room> {
  const saved = readHostSession();
  if (saved) {
    try {
      return await client.joinById(saved.roomId, { role: 'tv', hostToken: saved.token });
    } catch {
      sessionStorage.removeItem('bf_host');
    }
  }
  return client.create('backfire', { role: 'tv', ...devOptions() });
}

/**
 * QA affordances (§34): `?seed=` reproduces a scenario and `?fast=` compresses the phase clock
 * for visual/audio validation. Both are ignored by the server unless it was started with
 * DASS_ALLOW_TEST_CONFIG, so they cannot alter a real session.
 */
function devOptions(): Record<string, unknown> {
  const params = new URLSearchParams(location.search);
  const options: Record<string, unknown> = {};
  const seed = Number(params.get('seed'));
  if (Number.isFinite(seed) && seed > 0) options.seed = seed;
  const fast = Number(params.get('fast'));
  if (Number.isFinite(fast) && fast > 0) {
    const decision = Math.max(600, fast * 3);
    options.phaseMs = {
      INTRO: fast, R1_EVENT: fast, R1_INTEL: fast, R1_DISCUSSION: fast, R1_DECISION: decision,
      R1_RESOLUTION: fast * 2, R1_AFTERSHOCK: fast, R2_EVENT: fast, R2_INTEL: fast,
      R2_DISCUSSION: fast, R2_DECISION: decision, R2_TIEBREAK: decision, R2_RESOLUTION: fast * 2,
      R2_AFTERSHOCK: fast, R3_EVENT: fast, R3_INTEL: fast, R3_DISCUSSION: fast,
      R3_DECISION: decision, R3_RESOLUTION: fast * 2, FINAL_REVEAL: fast * 3,
    };
  }
  return options;
}

async function openingSequence(): Promise<void> {
  stage.innerHTML = `
    <div class="opening">
      <div class="op-word bf-word">${COPY.brand}</div>
      <div class="op-rule"></div>
      <div class="op-tag">${COPY.tagline}</div>
    </div>`;
  const word = qs('.op-word')!;
  if (!reduced()) {
    word.animate(
      { opacity: [0, 1], letterSpacing: ['.5em', '.03em'] },
      { duration: 1100, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' },
    );
    qs('.op-rule')!.animate({ transform: ['scaleX(0)', 'scaleX(1)'] }, { duration: 800, delay: 500, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
    qs('.op-tag')!.animate({ opacity: [0, 1] }, { duration: 600, delay: 1000, fill: 'both' });
  }
  await sleep(reduced() ? 200 : 2200);
}

// ---------------------------------------------------------------- routing

function onState(): void {
  const v = view!;
  document.body.className = `world-${v.world.worldStatus}`;

  if (v.phase === 'LOBBY') {
    if (mode !== 'lobby') {
      mode = 'lobby';
      seenIds = new Set(v.players.map((p) => p.id));
      renderLobby(v);
    } else updateLobby(v);
    return;
  }
  if (v.phase === 'RESULTS') {
    if (mode !== 'results') {
      mode = 'results';
      sequenceToken++;
      void resultsScene(v);
    }
    return;
  }
  if (v.phase === 'FINAL_REVEAL') {
    if (mode !== 'final') {
      mode = 'final';
      sequenceToken++;
      void finalRevealScene(v);
    }
    return;
  }
  if (v.phase === 'INTRO') {
    if (mode !== 'world') {
      mode = 'world';
      buildWorld(v);
    }
    if (prev?.phase !== 'INTRO') {
      sequenceToken++;
      void introScene(v, sequenceToken);
    }
    return;
  }
  if (mode !== 'world') {
    mode = 'world';
    buildWorld(v);
  }
  updateWorld(v);
  if (prev?.phase !== v.phase) {
    sequenceToken++;
    void onPhaseEnter(v, sequenceToken);
  }
}

// ---------------------------------------------------------------- lobby

function renderLobby(v: BfClientView): void {
  const code = v.roomCode ?? room?.roomId ?? '';
  const url = `${publicUrl}/play?code=${encodeURIComponent(code)}`;
  stage.innerHTML = `
    <div class="lobby">
      <header class="lb-head">
        <span class="bf-word lb-brand">${COPY.brand}</span>
        <span class="lb-scenario">${COPY.scenario}</span>
      </header>
      <div class="lb-body">
        <div class="lb-qr">
          <div class="qr-frame">${qrSvg(url)}</div>
          <div class="qr-cap">${COPY.scanToJoin}</div>
        </div>
        <div class="lb-join">
          <div class="eyebrow">${COPY.orType}</div>
          <div class="lb-code mono">${escapeHtml(code)}</div>
          <div class="lb-url mono">${escapeHtml(url.replace(/^https?:\/\//, ''))}</div>
        </div>
      </div>
      <div class="lb-seats">
        <div class="lb-count" id="lbcount"></div>
        <div class="seat-grid" id="seatgrid"></div>
      </div>
      <div class="lb-foot" id="lbfoot"></div>
    </div>`;
  updateLobby(v, true);
}

function updateLobby(v: BfClientView, first = false): void {
  const grid = qs('#seatgrid');
  if (!grid) return;
  const connected = v.players.filter((p) => p.connected);
  const present = connected.length;
  const readyCount = connected.filter((p) => p.ready).length;
  const full = present === 5;
  const canStart = full && connected.every((p) => p.ready);

  // The single status the room reads across the room: how many are here, how many are set.
  // "الطاقم مكتمل" is a distinct state, not the same small count with a different number.
  const count = qs('#lbcount');
  if (count) {
    count.innerHTML = full
      ? `<span class="lc-badge">${COPY.crewComplete}</span><span class="lc-ready mono">${arNum(readyCount)}/${arNum(5)} ${COPY.readyPlural}</span>`
      : `<span class="lc-count mono">${arNum(present)}/${arNum(5)}</span><span class="lc-word">${COPY.present}</span>`;
  }

  const cards = v.players.slice(0, 5).map((p) => lobbySeat(p));
  const ghosts = Array.from({ length: Math.max(0, 5 - v.players.length) }, (_, i) => ghostSeat(v.players.length + i));
  grid.innerHTML = cards.concat(ghosts).join('');

  const lobby = qs('.lobby');
  if (lobby) {
    lobby.classList.toggle('crew-complete', full);
    lobby.classList.toggle('all-ready', canStart);
  }

  const foot = qs('#lbfoot');
  if (foot) {
    const hint = canStart ? COPY.allReadyGo : full ? COPY.crewReady : COPY.needFive;
    foot.innerHTML = `
      <span class="lb-hint ${canStart ? 'go' : ''}">${hint}</span>
      <button id="tv-start" class="btn primary lg" ${canStart ? '' : 'disabled'}>${COPY.start}</button>`;
    qs('#tv-start')?.addEventListener('click', () => {
      if (!canStart) return;
      sfx.event();
      room?.send('start', {});
    });
  }

  let arrived = false;
  for (const p of v.players) {
    if (seenIds.has(p.id)) continue;
    seenIds.add(p.id);
    if (first) continue;
    arrived = true;
    const card = qs(`.seat-card[data-id="${cssId(p.id)}"]`);
    if (card) cut(card);
    sfx.join();
  }
  // The fifth arrival is the moment the room has been waiting for: mark it louder than a join.
  if (arrived && full && !crewAnnounced) {
    crewAnnounced = true;
    sfx.event();
    const badge = qs('.lc-badge');
    if (badge) cut(badge);
    for (const card of qsa('.seat-card:not(.ghost)')) cut(card, 40);
  }
  if (!full) crewAnnounced = false;
}

function lobbySeat(p: BfPublicPlayer): string {
  return `<div class="seat-card ${p.ready ? 'is-ready' : ''} ${p.connected ? '' : 'is-off'}" data-id="${escapeHtml(p.id)}">
    <span class="seat">${seatGlyph(p.seat)}</span>
    <span class="seat-name">${escapeHtml(p.nickname)}</span>
    <span class="seat-state">${p.recovering ? '…' : p.ready ? COPY.ready : COPY.notReady}</span>
  </div>`;
}
function ghostSeat(index: number): string {
  return `<div class="seat-card ghost" aria-hidden="true">
    <span class="seat">${seatGlyph(index)}</span>
    <span class="seat-name">${COPY.emptySeat}</span>
    <span class="seat-state"></span>
  </div>`;
}

// ---------------------------------------------------------------- world stage

function buildWorld(v: BfClientView): void {
  stage.innerHTML = `
    <div class="world stage-frame">
      <header class="hud">
        <div class="hud-left">
          <span class="bf-word hud-brand">${COPY.brand}</span>
          <span class="hud-round eyebrow"></span>
        </div>
        <div class="hud-mid">
          <div class="threat" role="img" id="threatmeter">
            <span class="threat-label">${COPY.threat}</span>
            <span class="threat-bars"></span>
            <span class="threat-state mono"></span>
          </div>
        </div>
        <div class="hud-right">
          <span class="echo-chip" id="echochip"></span>
          <span class="timer mono" id="timer"></span>
        </div>
      </header>
      <div class="scene-title" id="scenetitle"></div>
      <div class="relay-wrap">${relayStage(v.players)}</div>
      <footer class="stage-foot">
        <div class="lock-strip" id="lockstrip"></div>
        <div class="prompt-line" id="promptline"></div>
      </footer>
      <div class="progress" id="progress"></div>
    </div>`;
  updateWorld(v);
}

function updateWorld(v: BfClientView): void {
  const round = qs('.hud-round');
  if (round) round.textContent = `${COPY.round} ${arNum(v.world.roundNumber)} / ${arNum(3)}`;

  paintThreat(v.world.threat, v.world.worldStatus);
  sfx.setThreatBed(v.world.threat);

  const chip = qs('#echochip');
  if (chip) {
    const holder = nameOf(v, v.world.echoHolderId);
    chip.innerHTML =
      v.world.echoStatus === 'none'
        ? ''
        : `<span class="echo-dot"></span><span>${COPY.echo}: ${escapeHtml(holder)}</span><span class="echo-state">${ECHO_TEXT[v.world.echoStatus] ?? ''}</span>`;
    chip.classList.toggle('critical', v.world.echoStatus === 'critical');
  }

  for (const p of v.players) {
    const node = qs(`.rnode[data-id="${cssId(p.id)}"]`);
    if (!node) continue;
    node.classList.toggle('is-off', !p.connected);
    node.classList.toggle('is-recovering', !!p.recovering);
    node.classList.toggle('is-echo', p.id === v.world.echoHolderId);
    node.classList.toggle('is-candidate', v.candidates.includes(p.id));
    node.classList.toggle('is-carrier', p.id === v.world.currentCarrierId);
    node.classList.toggle('is-redirector', p.id === v.publicRoles.redirectorId);
    node.classList.toggle('is-guardian', p.id === v.publicRoles.guardianId);
  }

  paintLockStrip(v);

  if (v.phaseEndsAt && v.phaseEndsAt !== phaseEnd) {
    phaseStart = Date.now();
    phaseEnd = v.phaseEndsAt;
    lastSecond = -1;
  }
  if (!v.phaseEndsAt) phaseEnd = 0;
}

function paintThreat(threat: number, status: string): void {
  const bars = qs('.threat-bars');
  if (bars) {
    bars.innerHTML = Array.from({ length: 5 }, (_, i) => {
      const on = i < threat;
      const hot = on && threat >= 4;
      return `<span class="threat-bar ${on ? 'on' : ''} ${hot ? 'hot' : ''}"></span>`;
    }).join('');
  }
  const state = qs('.threat-state');
  // Never colour alone: the world state is always spelled out (§32).
  if (state) state.textContent = `${arNum(threat)}/${arNum(5)} · ${WORLD_TEXT[status] ?? ''}`;
  const meter = qs('#threatmeter');
  if (meter) meter.setAttribute('aria-label', `${COPY.threat} ${threat} ${WORLD_TEXT[status] ?? ''}`);
  if (threat !== lastThreat) {
    const rose = threat > lastThreat;
    lastThreat = threat;
    if (meter) cut(meter);
    if (rose) sfx.threatUp();
    else sfx.threatDown();
  }
}

function paintLockStrip(v: BfClientView): void {
  const strip = qs('#lockstrip');
  if (!strip) return;
  const isDecision = v.phase.endsWith('_DECISION') || v.phase === 'R2_TIEBREAK';
  if (!isDecision) {
    strip.innerHTML = '';
    strip.classList.remove('show');
    return;
  }
  strip.classList.add('show');
  // Counts only. Which player locked WHAT never reaches this screen.
  strip.innerHTML = `
    <span class="lock-count mono">${arNum(v.lockedCount)}/${arNum(v.expectedCount)}</span>
    <span class="lock-word">${'قرارات مقفلة'}</span>
    <span class="lock-pips">${v.players
      .map((p) => `<span class="pip ${p.locked ? 'on' : ''}"></span>`)
      .join('')}</span>`;
}

function setTitle(main: string, sub = '', tone: 'plain' | 'alarm' = 'plain'): void {
  const node = qs('#scenetitle');
  if (!node) return;
  node.className = `scene-title show ${tone === 'alarm' ? 'alarm' : ''}`;
  node.innerHTML = `<div class="st-main">${escapeHtml(main)}</div>${sub ? `<div class="st-sub">${escapeHtml(sub)}</div>` : ''}`;
  reveal(qs('.st-main', node)!);
  if (sub) settle(qs('.st-sub', node)!, 220);
}
function clearTitle(): void {
  const node = qs('#scenetitle');
  if (node) {
    node.className = 'scene-title';
    node.innerHTML = '';
  }
}
function setPrompt(text: string): void {
  const node = qs('#promptline');
  if (!node) return;
  node.innerHTML = text ? `<span>${escapeHtml(text)}</span>` : '';
  if (text) settle(node);
}

/** A text equivalent for a critical sound cue, for anyone playing without audio (§32). */
function cue(caption: string): void {
  const node = qs('#cue');
  if (!node) return;
  node.textContent = caption;
  node.classList.add('show');
  window.setTimeout(() => {
    if (node.textContent === caption) node.classList.remove('show');
  }, 2200);
}

// ---------------------------------------------------------------- cinematics

const live = (token: number): boolean => token === sequenceToken;
async function beat(ms: number, token: number): Promise<boolean> {
  await sleep(reduced() ? Math.min(ms, 220) : ms);
  return live(token);
}

/**
 * The eyes-up beat: a hard 3·2·1 the instant the host starts, so the whole room turns to the TV
 * before the narration begins. Aborts cleanly if the phase moves on under it (reconnect/resync).
 */
async function countdownScene(token: number): Promise<void> {
  const overlay = document.createElement('div');
  overlay.className = 'tv-countdown';
  stage.appendChild(overlay);
  for (const n of ['٣', '٢', '١']) {
    if (!live(token)) return void overlay.remove();
    overlay.innerHTML = `<span class="cd-num">${n}</span>`;
    const num = qs('.cd-num', overlay);
    if (num) cut(num);
    sfx.pulse(n === '١');
    if (!(await beat(reduced() ? 180 : 620, token))) return void overlay.remove();
  }
  if (live(token)) {
    overlay.innerHTML = `<span class="cd-go">${COPY.matchStarting}</span>`;
    const go = qs('.cd-go', overlay);
    if (go) reveal(go);
    sfx.event();
    await beat(reduced() ? 150 : 560, token);
  }
  overlay.remove();
}

async function introScene(v: BfClientView, token: number): Promise<void> {
  clearTitle();
  await countdownScene(token);
  if (!live(token)) return;
  const svg = qs('.relay-svg');
  svg?.classList.add('intro-mode');
  drawRelayLine();
  if (!(await beat(1400, token))) return;
  revealNodes();
  if (!(await beat(1600, token))) return;
  setTitle(COPY.introA);
  if (!(await beat(4200, token))) return;
  setTitle(COPY.introB);
  if (!(await beat(4200, token))) return;
  destabilize();
  cue(COPY.cueDisrupt);
  if (!(await beat(2000, token))) return;
  setTitle(COPY.introC);
  if (!(await beat(4200, token))) return;
  setTitle(COPY.scenario, COPY.tagline);
  svg?.classList.remove('intro-mode');
}

function drawRelayLine(): void {
  const line = qs<SVGPathElement>('#relayline');
  if (!line) return;
  const length = line.getTotalLength?.() ?? 900;
  line.style.strokeDasharray = String(length);
  line.style.strokeDashoffset = String(length);
  line.animate({ strokeDashoffset: [String(length), '0'] }, { duration: reduced() ? 1 : 1500, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
}

function revealNodes(): void {
  stagger(qsa('.rnode'), 130, (n, d) => {
    n.classList.add('visible');
    return cut(n, d);
  });
}

function destabilize(): void {
  const svg = qs('.relay-svg');
  if (svg) strike(svg);
  sfx.disrupt();
}

async function onPhaseEnter(v: BfClientView, token: number): Promise<void> {
  switch (v.phase) {
    case 'R1_EVENT':
      return relayBreakScene(token);
    case 'R1_INTEL':
      return intelScene(token);
    case 'R1_DISCUSSION':
      return discussionScene(COPY.r1Discussion, token);
    case 'R1_DECISION':
      setTitle(COPY.r1Decision);
      setPrompt('');
      sfx.pulse();
      return;
    case 'R1_RESOLUTION':
      return round1Resolution(v, token);
    case 'R1_AFTERSHOCK':
      return aftershockScene(COPY.r1Aftershock, COPY.r1Prompt, COPY.r1Bridge, token);
    case 'R2_EVENT':
      return round2Event(v, token);
    case 'R2_INTEL':
      return intelScene(token);
    case 'R2_DISCUSSION':
      return discussionScene(COPY.r2Discussion, token);
    case 'R2_DECISION':
      setTitle(COPY.r2Decision);
      setPrompt('');
      sfx.pulse();
      return;
    case 'R2_TIEBREAK':
      setTitle(COPY.tiebreak);
      sfx.pulse(true);
      return;
    case 'R2_RESOLUTION':
      return round2Resolution(v, token);
    case 'R2_AFTERSHOCK':
      return aftershockScene(COPY.r2Aftershock, COPY.r2Prompt, COPY.r2Bridge, token);
    case 'R3_EVENT':
      return round3Event(v, token);
    case 'R3_INTEL':
      return intelScene(token);
    case 'R3_DISCUSSION':
      return discussionScene(COPY.r3Discussion, token);
    case 'R3_DECISION':
      setTitle(COPY.r3Decision);
      setPrompt('');
      sfx.pulse(true);
      return;
    case 'R3_RESOLUTION':
      return round3Resolution(v, token);
    default:
      return;
  }
}

async function relayBreakScene(token: number): Promise<void> {
  clearTitle();
  const svg = qs('.relay-svg');
  const line = qs('#relayline');
  line?.classList.add('running');
  if (!(await beat(1200, token))) return;
  line?.classList.remove('running');
  line?.classList.add('broken');
  qs('#fracture')?.classList.add('show');
  if (svg) strike(svg);
  sfx.event();
  cue(COPY.cueDisrupt);
  if (!(await beat(900, token))) return;
  setTitle(COPY.r1EventA, COPY.r1EventB, 'alarm');
}

async function intelScene(token: number): Promise<void> {
  setTitle(COPY.intelArrived, COPY.intelRead);
  sfx.intel();
  await beat(400, token);
}

async function discussionScene(prompt: string, token: number): Promise<void> {
  setTitle(prompt);
  setPrompt(COPY.discussNow);
  sfx.discussionOpen();
  await beat(300, token);
}

async function aftershockScene(head: string, prompt: string, bridge: string, token: number): Promise<void> {
  setTitle(head);
  if (!(await beat(3800, token))) return;
  setTitle(prompt);
  setPrompt('');
  if (!(await beat(7000, token))) return;
  setTitle(bridge);
  sfx.echoCharge();
}

// ---- Round 1 resolution (§9) --------------------------------------------------

async function round1Resolution(v: BfClientView, token: number): Promise<void> {
  const r1 = v.r1;
  if (!r1) return;
  clearTitle();
  setPrompt('');

  // 1. the candidate who lost steps back
  const loser = r1.candidateIds.find((id) => id !== r1.operatorId);
  if (loser) qs(`.rnode[data-id="${cssId(loser)}"]`)?.classList.add('dimmed');
  if (!(await beat(900, token))) return;

  // 2. the chosen Operator is held
  const opNode = qs(`.rnode[data-id="${cssId(r1.operatorId)}"]`);
  opNode?.classList.add('spotlight');
  // Nominal phrasing: player names are free text, so the copy never assumes gender agreement.
  setTitle(`${COPY.operator}: ${nameOf(v, r1.operatorId)}`);
  sfx.carrier();
  if (!(await beat(1600, token))) return;

  // 3. the totals — never the individual votes
  const tally = r1.tally.map((t) => `${escapeHtml(nameOf(v, t.id))} ${arNum(t.votes)}`).join('   ·   ');
  setTitle(r1.tiedDefault ? COPY.tiebreakSeat : tally);
  if (!(await beat(2400, token))) return;

  // 4. the relay restarts
  qs('#fracture')?.classList.remove('show');
  qs('#relayline')?.classList.remove('broken');
  qs('#relayline')?.classList.add('running');
  setTitle(COPY.relayBack);
  sfx.support();
  if (!(await beat(2600, token))) return;

  // 5. the Echo appears and attaches — the last thing shown, so its cause is already established
  setTitle(`${COPY.echoAttached} ${nameOf(v, r1.operatorId)}`);
  opNode?.classList.add('is-echo');
  const echoRing = qs(`.rnode[data-id="${cssId(r1.operatorId)}"] .echo-ring`);
  if (echoRing) cut(echoRing);
  sfx.echoCharge();
  cue(COPY.cueShield);
  await beat(2400, token);
  opNode?.classList.remove('spotlight');
  if (loser) qs(`.rnode[data-id="${cssId(loser)}"]`)?.classList.remove('dimmed');
}

// ---- Round 2 (§10, §16) -------------------------------------------------------

async function round2Event(v: BfClientView, token: number): Promise<void> {
  clearFx();
  setTitle(COPY.r2EventA, COPY.r2EventB);
  sfx.event();
  await beat(600, token);
}

/**
 * The layered Round 2 reveal. Every layer shows WHAT happened; none of them shows WHO — the
 * payload the TV received does not contain an actor id at all.
 */
async function round2Resolution(v: BfClientView, token: number): Promise<void> {
  const r2 = v.r2;
  if (!r2) return;
  clearTitle();
  setPrompt('');

  // Layer 1 — support forms, from the floor of the stage rather than from any player.
  setTitle(COPY.routeForming);
  for (const target of r2.supportTargets) {
    drawSupportArc(target);
    sfx.support();
    if (!(await beat(520, token))) return;
  }
  if (!(await beat(700, token))) return;

  // Layer 2 — interference
  if (r2.disrupted && r2.disruptTarget) {
    setTitle(COPY.routeDisrupted);
    breakArc(r2.disruptTarget);
    sfx.disrupt();
    cue(COPY.cueDisrupt);
    if (!(await beat(1800, token))) return;
  }

  // Layer 3 — redirection
  if (r2.redirected && r2.redirectFrom && r2.redirectTo) {
    setTitle(COPY.routeChanged);
    moveArc(r2.redirectFrom, r2.redirectTo);
    sfx.redirect();
    cue(COPY.cueRedirect);
    if (!(await beat(1900, token))) return;
  }

  // Layer 4 — the Carrier. A beat of silence first.
  if (r2.routeFailed || !r2.carrierId) {
    setTitle(COPY.routeFailed, '', 'alarm');
    sfx.disrupt();
    if (!(await beat(2600, token))) return;
  } else {
    if (!(await beat(800, token))) return;
    const carrier = qs(`.rnode[data-id="${cssId(r2.carrierId)}"]`);
    carrier?.classList.add('spotlight', 'is-carrier');
    setTitle(`${COPY.carrier}: ${nameOf(v, r2.carrierId)}`);
    sfx.carrier();
    if (!(await beat(2200, token))) return;

    // Layer 5 — the Echo recognizes its holder
    if (r2.echoExposed) {
      setTitle(COPY.echoRecognized, '', 'alarm');
      qs('.relay-svg')?.classList.add('echo-live');
      sfx.echoCharge();
      cue(COPY.cueBackfire);
      if (!(await beat(2400, token))) return;
    } else if (r2.shieldBlocked) {
      setTitle(COPY.shieldBlocked);
      sfx.shield();
      cue(COPY.cueShield);
      if (!(await beat(2200, token))) return;
    }
    carrier?.classList.remove('spotlight');
  }

  // Layer 6 — Threat moves only now, once every cause is on screen.
  if (r2.compromised) {
    setTitle('المسار كان مُخترَقاً.', '', 'alarm');
    if (!(await beat(2000, token))) return;
  }
  const meter = qs('#threatmeter');
  if (meter) cut(meter);
  await beat(1200, token);
}

function clearFx(): void {
  for (const arc of qsa('.support-arc')) arc.remove();
  qs('.relay-svg')?.classList.remove('echo-live');
  for (const n of qsa('.rnode')) n.classList.remove('spotlight', 'dimmed');
}

function arcLayer(): SVGGElement | null {
  return qs<SVGGElement>('#arcs') as SVGGElement | null;
}

function arcPath(index: number, targetX: number): string {
  const startX = 500 + (index % 2 === 0 ? -1 : 1) * (40 + index * 24);
  return `M${startX} ${FLOOR_Y} C${startX} ${FLOOR_Y - 70}, ${targetX} ${NODE_Y + 90}, ${targetX} ${NODE_Y + 34}`;
}

function drawSupportArc(targetId: string): void {
  const layer = arcLayer();
  const target = indexOfNode(targetId);
  if (!layer || target < 0) return;
  const index = qsa('.support-arc').length;
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('class', 'support-arc');
  path.setAttribute('data-target', targetId);
  path.setAttribute('d', arcPath(index, nodeX(target)));
  layer.appendChild(path);
  const length = path.getTotalLength?.() ?? 200;
  path.style.strokeDasharray = String(length);
  path.style.strokeDashoffset = String(length);
  path.animate({ strokeDashoffset: [String(length), '0'] }, { duration: reduced() ? 1 : 620, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
}

function breakArc(targetId: string): void {
  const arc = qsa<SVGPathElement>(`.support-arc[data-target="${cssId(targetId)}"]`)[0];
  const node = qs(`.rnode[data-id="${cssId(targetId)}"]`);
  if (node) strike(node);
  if (!arc) return;
  arc.classList.add('cut');
  arc.animate({ opacity: [1, 0.15] }, { duration: reduced() ? 1 : 240, fill: 'both' });
}

function moveArc(fromId: string, toId: string): void {
  const arc = qsa<SVGPathElement>(`.support-arc[data-target="${cssId(fromId)}"]:not(.cut)`)[0];
  const toIndex = indexOfNode(toId);
  if (!arc || toIndex < 0) return;
  const index = Array.from(arc.parentNode?.children ?? []).indexOf(arc);
  arc.setAttribute('data-target', toId);
  arc.classList.add('moved');
  const next = arcPath(Math.max(0, index), nodeX(toIndex));
  if (reduced()) {
    arc.setAttribute('d', next);
    return;
  }
  const from = arc.getAttribute('d') ?? next;
  arc.animate({ d: [`path('${from}')`, `path('${next}')`] } as PropertyIndexedKeyframes, {
    duration: 700,
    easing: 'cubic-bezier(.65,0,.35,1)',
    fill: 'both',
  });
  window.setTimeout(() => arc.setAttribute('d', next), 700);
}

function indexOfNode(id: string): number {
  return qsa('.rnode').findIndex((n) => n.getAttribute('data-id') === id);
}

// ---- Round 3 (§19, §25) -------------------------------------------------------

async function round3Event(v: BfClientView, token: number): Promise<void> {
  clearFx();
  setTitle(COPY.r3EventA, COPY.r3EventB, 'alarm');
  sfx.echoCharge();
  if (!(await beat(3200, token))) return;
  const redirector = nameOf(v, v.publicRoles.redirectorId);
  const guardian = nameOf(v, v.publicRoles.guardianId);
  setTitle(`${COPY.redirector}: ${redirector}`, `${COPY.guardian}: ${guardian}`);
}

/** The signature sequence. Freeze, direction, balance, protection, silence, return. */
async function round3Resolution(v: BfClientView, token: number): Promise<void> {
  const r3 = v.r3;
  if (!r3) return;
  clearTitle();
  setPrompt('');

  // 1 — freeze
  qs('.world')?.classList.add('frozen');
  sfx.stopBed();
  if (!(await beat(1100, token))) return;

  // 2 — the Echo at its current holder
  const holderId = prev?.world.echoHolderId ?? v.world.echoHolderId;
  const holderNode = qs(`.rnode[data-id="${cssId(holderId)}"]`);
  holderNode?.classList.add('spotlight', 'is-echo');
  setTitle(`${COPY.echoOn} ${nameOf(v, holderId)}`);
  sfx.echoCharge();
  if (!(await beat(2000, token))) return;

  // 3 — the chosen direction
  if (r3.echoTargetId) {
    setTitle(`${'الوجهة'}: ${nameOf(v, r3.echoTargetId)}`);
    drawReturnPath(holderId, r3.echoTargetId);
    sfx.redirect();
    cue(COPY.cueRedirect);
    if (!(await beat(2000, token))) return;
  }

  // 4 — the balance, totals only
  setTitle(`${COPY.redirectSide} ${arNum(r3.redirectPower)}   —   ${COPY.shieldSide} ${arNum(r3.shieldPower)}`);
  if (!(await beat(2400, token))) return;

  // 5 — the protection appears
  if (r3.protectedId) {
    const guarded = qs(`.rnode[data-id="${cssId(r3.protectedId)}"]`);
    guarded?.classList.add('shielded');
    setTitle(`${COPY.guardian}: ${'حماية'} ${nameOf(v, r3.protectedId)}`);
    sfx.shield();
    cue(COPY.cueShield);
    if (!(await beat(1800, token))) return;
  }

  // 6 — silence
  clearTitle();
  if (!(await beat(reduced() ? 200 : 900, token))) return;

  // 7 — the outcome
  if (r3.outcome === 'backfire') {
    setTitle(COPY.bounced, '', 'alarm');
    reverseReturnPath(r3.echoTargetId, r3.finalTargetId);
    sfx.backfire();
    cue(COPY.cueBackfire);
    if (!(await beat(2600, token))) return;
    setTitle(`${COPY.returnedTo} ${nameOf(v, r3.finalTargetId)}`, '', 'alarm');
    markFinal(r3.finalTargetId);
  } else if (r3.outcome === 'contained') {
    setTitle(COPY.contained);
    sfx.shield();
    if (!(await beat(2000, token))) return;
    setTitle(`${COPY.contained}`, `${nameOf(v, r3.finalTargetId)}`);
  } else {
    setTitle(`${COPY.landedOn} ${nameOf(v, r3.finalTargetId)}`, '', 'alarm');
    sfx.echoCharge();
    markFinal(r3.finalTargetId);
  }
  if (!(await beat(2600, token))) return;

  // 8 — the Threat result, last
  const meter = qs('#threatmeter');
  if (meter) cut(meter);
  if (v.world.collapsed) {
    sfx.collapse();
    cue(COPY.cueCollapse);
    setTitle(COPY.collapseTitle, COPY.collapseLine, 'alarm');
    document.body.classList.add('world-collapse');
  }
  qs('.world')?.classList.remove('frozen');
}

function returnLayer(): SVGGElement | null {
  return qs<SVGGElement>('#returns') as SVGGElement | null;
}

function drawReturnPath(fromId: string | null, toId: string | null): void {
  const layer = returnLayer();
  const from = indexOfNode(fromId ?? '');
  const to = indexOfNode(toId ?? '');
  if (!layer || from < 0 || to < 0) return;
  layer.innerHTML = '';
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('class', 'return-path');
  path.setAttribute('id', 'returnpath');
  const x1 = nodeX(from);
  const x2 = nodeX(to);
  const lift = NODE_Y - 110;
  path.setAttribute('d', `M${x1} ${NODE_Y - 36} C${x1} ${lift}, ${x2} ${lift}, ${x2} ${NODE_Y - 36}`);
  layer.appendChild(path);
  const length = path.getTotalLength?.() ?? 300;
  path.style.strokeDasharray = String(length);
  path.style.strokeDashoffset = String(length);
  path.animate({ strokeDashoffset: [String(length), '0'] }, { duration: reduced() ? 1 : 900, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' });
}

/** The path physically runs back the way it came — the visual half of the Backfire. */
function reverseReturnPath(fromId: string | null, backToId: string | null): void {
  const path = qs<SVGPathElement>('#returnpath');
  if (path) {
    const length = path.getTotalLength?.() ?? 300;
    path.classList.add('rejected');
    path.animate({ strokeDashoffset: ['0', String(length)] }, { duration: reduced() ? 1 : 520, easing: 'cubic-bezier(.9,.03,.2,1)', fill: 'both' });
  }
  window.setTimeout(() => drawReturnPath(fromId, backToId), reduced() ? 1 : 560);
  window.setTimeout(() => {
    const back = qs('#returnpath');
    back?.classList.add('rejected');
  }, reduced() ? 2 : 600);
}

function markFinal(id: string | null): void {
  const node = qs(`.rnode[data-id="${cssId(id)}"]`);
  if (!node) return;
  node.classList.add('final-hit');
  strike(node);
}

// ---------------------------------------------------------------- final reveal

async function finalRevealScene(v: BfClientView, ): Promise<void> {
  const token = sequenceToken;
  const final = v.finalReveal;
  if (!final) return;
  document.body.className = `world-${v.world.worldStatus}`;
  stage.innerHTML = `
    <div class="final stage-frame">
      <div class="fn-head"><span class="bf-word">${COPY.brand}</span><span class="fn-title">${COPY.finalTitle}</span></div>
      <div class="fn-card" id="fncard"></div>
      <div class="fn-dots" id="fndots"></div>
    </div>`;
  const dots = qs('#fndots')!;
  dots.innerHTML = final.cards.map(() => '<span class="fn-dot"></span>').join('');
  const slot = qs('#fncard')!;

  for (let i = 0; i < final.cards.length; i++) {
    if (!live(token)) return;
    const card = final.cards[i]!;
    qsa('.fn-dot', dots).forEach((d, idx) => d.classList.toggle('on', idx <= i));
    slot.innerHTML = `
      <article class="rc tone-${card.tone}">
        <div class="rc-index mono">${arNum(i + 1)} / ${arNum(final.cards.length)}</div>
        <h2 class="rc-title">${escapeHtml(card.title)}</h2>
        <p class="rc-line">${escapeHtml(arDigits(card.line))}</p>
      </article>`;
    const article = qs('.rc', slot)!;
    reveal(article);
    if (card.tone === 'backfire') {
      sfx.backfire();
      cue(COPY.cueBackfire);
    } else if (card.tone === 'interference') sfx.disrupt();
    else if (card.tone === 'protection') sfx.shield();
    else sfx.support();
    if (!(await beat(i === final.cards.length - 1 ? 7000 : 5600, token))) return;
  }

  if (!live(token)) return;
  slot.innerHTML = `
    <article class="rc summary">
      <p class="rc-summary">${escapeHtml(arDigits(final.summary))}</p>
      <p class="rc-origin">${escapeHtml(arDigits(final.origin))}</p>
      ${final.collapsed ? `<p class="rc-collapse">${COPY.collapseLine}</p>` : ''}
    </article>`;
  reveal(qs('.rc', slot)!);
  sfx.resultsIn();
}

// ---------------------------------------------------------------- results

async function resultsScene(v: BfClientView): Promise<void> {
  const token = sequenceToken;
  const results = (v.results ?? []).slice().sort((a, b) => b.influence - a.influence);
  const winners = v.players.filter((p) => v.winnerIds.includes(p.id));
  stage.innerHTML = `
    <div class="results stage-frame">
      <div class="rs-head">
        <span class="eyebrow">${COPY.resultsTitle}</span>
        <h1 class="rs-title">${
          v.sharedFailure
            ? COPY.collapseTitle
            : winners.length > 1
              ? COPY.coWinners
              : escapeHtml(winners[0]?.nickname ?? '—')
        }</h1>
        ${v.sharedFailure ? `<p class="rs-note">${COPY.collapseLine}</p>` : ''}
      </div>
      <div class="rs-rows" id="rsrows"></div>
      <div class="rs-summary">${escapeHtml(arDigits(v.finalReveal?.summary ?? ''))}</div>
      ${
        isHost
          ? `<div class="rs-actions">
              <button id="tv-again" class="btn primary lg">${COPY.playAgain}</button>
              <button id="tv-newcrew" class="btn ghost lg">${COPY.newCrew}</button>
            </div>`
          : `<div class="rs-foot muted">${COPY.playAgain} · ${COPY.newCrew} — من جوّال المُضيف</div>`
      }
    </div>`;
  const rows = qs('#rsrows')!;
  results.forEach((r, i) => {
    const p = v.players.find((x) => x.id === r.id);
    if (!p) return;
    const row = document.createElement('div');
    row.className = `rs-row ${v.winnerIds.includes(r.id) ? 'is-winner' : ''}`;
    row.innerHTML = `
      <span class="rs-rank mono">${arNum(i + 1)}</span>
      <span class="seat sm">${seatGlyph(p.seat)}</span>
      <span class="rs-name">${escapeHtml(p.nickname)}</span>
      <span class="rs-objs">${r.objectivesWon.map((won) => `<span class="obj ${won ? 'won' : ''}"></span>`).join('')}</span>
      <span class="rs-inf mono">${arNum(r.influence)} ${COPY.influence}</span>`;
    rows.appendChild(row);
  });
  stagger(qsa('.rs-row', rows), 140);
  // The host controls the room's replay from the TV, exactly as it owned "Start" in the lobby.
  qs('#tv-again')?.addEventListener('click', () => {
    sfx.event();
    room?.send('restart', {});
  });
  qs('#tv-newcrew')?.addEventListener('click', () => {
    sfx.press();
    room?.send('newCrew', {});
  });
  sfx.resultsIn();
  await beat(200, token);
}

// ---------------------------------------------------------------- clock

function tick(): void {
  const timer = qs<HTMLElement>('#timer');
  const progress = qs<HTMLElement>('#progress');
  if (phaseEnd > 0) {
    const now = Date.now();
    const total = Math.max(1, phaseEnd - phaseStart);
    const remain = Math.max(0, phaseEnd - now);
    if (progress) progress.style.setProperty('--p', String(remain / total));
    const seconds = Math.ceil(remain / 1000);
    const urgent = seconds <= 10 && seconds > 0 && isTimedInput();
    if (timer) {
      timer.textContent = urgent ? arNum(seconds) : '';
      timer.classList.toggle('urgent', urgent);
    }
    if (seconds !== lastSecond && urgent) {
      lastSecond = seconds;
      sfx.pulse(seconds <= 3);
    }
  } else if (timer) {
    timer.textContent = '';
    if (progress) progress.style.setProperty('--p', '0');
  }
  requestAnimationFrame(tick);
}

function isTimedInput(): boolean {
  const phase = view?.phase;
  if (!phase) return false;
  const timed: BfPhase[] = ['R1_DISCUSSION', 'R1_DECISION', 'R2_DISCUSSION', 'R2_DECISION', 'R2_TIEBREAK', 'R3_DISCUSSION', 'R3_DECISION'];
  return timed.includes(phase);
}

// ---------------------------------------------------------------- helpers

function nameOf(v: BfClientView, id: string | null | undefined): string {
  return v.players.find((p) => p.id === id)?.nickname ?? '—';
}
function cssId(id: string | null | undefined): string {
  return String(id ?? '').replace(/["\\]/g, '');
}
function setupMute(): void {
  const button = qs<HTMLButtonElement>('#mute')!;
  const paint = (): void => {
    button.textContent = sfx.isMuted() ? '🔇' : '🔊';
    button.setAttribute('aria-pressed', String(sfx.isMuted()));
  };
  paint();
  button.addEventListener('click', () => {
    sfx.toggle();
    if (!sfx.isMuted()) {
      sfx.press();
      if (view) sfx.setThreatBed(view.world.threat);
    }
    paint();
  });
}
