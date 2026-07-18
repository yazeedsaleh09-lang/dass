import { Client, type Room } from 'colyseus.js';
import type { ClientView, PublicPlayerView, RevealEntry, RevealView } from '@dass/domain';
import {
  COPY,
  WASEET,
  actionColor,
  actionIcon,
  addStyle,
  celebrate,
  countTo,
  dassIn,
  escapeHtml,
  injectBase,
  mark,
  mountBackground,
  pick,
  pop,
  pullReveal,
  qs,
  qsa,
  qrSvg,
  reduced,
  sfx,
  sleep,
  stagger,
  uiIcon,
  phaseLabel,
  type Mood,
} from '@dass/ui';

declare const DASS_SERVER_URL: string;

injectBase();
addStyle(tvCss());
const bg = mountBackground();
const app = document.getElementById('app')!;
app.innerHTML = `<button id="mute" class="icon-btn tv-mute" aria-label="صوت"></button><div id="stage" class="scene"></div>`;
const stage = qs('#stage')!;
setupMute();

const serverUrl = DASS_SERVER_URL || `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;
const client = new Client(serverUrl);
let room: Room | null = null;
let view: ClientView | null = null;
let prev: ClientView | null = null;
let mode: 'boot' | 'lobby' | 'stage' | 'end' = 'boot';
let seenIds = new Set<string>();
let sawVault = false;
let phaseStart = 0;
let phaseEnd = 0;
let lastSec = -1;
const cols = new Map<string, HTMLElement>();

void boot();

async function boot(): Promise<void> {
  await opening();
  sfx.unlock();
  try {
    room = await client.create('dass', { role: 'tv' });
    room.onMessage('state', (v: ClientView) => {
      prev = view;
      view = v;
      onState();
    });
    room.onMessage('sessionlog', () => {});
    room.send('sync', {});
    requestAnimationFrame(tick);
  } catch {
    stage.innerHTML = `<div class="tv-err">${COPY.genericError}</div>`;
  }
}

// ---------------- opening ----------------
async function opening(): Promise<void> {
  stage.innerHTML = `
    <div class="opening">
      <div class="ol">${mark(96)}</div>
      <div class="ow wordmark g">${COPY.brand}</div>
      <div class="ot">${COPY.tagline}</div>
      <div class="osweep"></div>
    </div>`;
  bg.setMood('secret');
  sfx.open();
  const l = qs('.ol')!;
  const w = qs('.ow')!;
  if (!reduced()) {
    l.animate({ opacity: [0, 1], transform: ['translateY(20px) rotate(-8deg)', 'translateY(0) rotate(0)'], filter: ['blur(10px)', 'blur(0)'] }, { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
    w.animate({ opacity: [0, 1], transform: ['scale(.9)', 'scale(1)'], filter: ['blur(12px)', 'blur(0)'] }, { duration: 800, delay: 300, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
    qs('.ot')!.animate({ opacity: [0, 1] }, { duration: 600, delay: 900, fill: 'both' });
  }
  bg.setMood('calm');
  await sleep(reduced() ? 200 : 2400);
}

// ---------------- routing ----------------
function onState(): void {
  const v = view!;
  if (v.phase === 'LOBBY') {
    if (mode !== 'lobby') {
      mode = 'lobby';
      seenIds = new Set(v.players.map((p) => p.id));
      renderLobby(v);
    } else updateLobby(v);
    return;
  }
  if (v.ended) {
    if (mode !== 'end') {
      mode = 'end';
      void finalSequence(v);
    }
    return;
  }
  if (mode !== 'stage') {
    mode = 'stage';
    buildStage(v);
  }
  updateStage(v);
  transitions(prev, v);
}

// ---------------- lobby ----------------
function renderLobby(v: ClientView): void {
  bg.setMood('calm');
  const code = room?.roomId ?? '';
  const url = `${location.origin}/play?code=${code}`;
  stage.innerHTML = `
    <div class="lobby">
      <header class="l-head">
        <span class="l-mark">${mark(40)}</span>
        <span class="l-titles">
          <span class="wordmark g l-brand">${COPY.brand}</span>
          <span class="muted l-sub">${COPY.subtitle}</span>
        </span>
      </header>
      <div class="l-body">
        <div class="panel qr-card">
          <div class="qr">${qrSvg(url)}</div>
          <div class="qr-cap muted">${COPY.scanToJoin}</div>
        </div>
        <div class="l-join">
          <div class="muted j-hint">${COPY.orType}</div>
          <div class="code-host">${formatCode(code)}</div>
          <div class="muted j-url mono">${escapeHtml(shortUrl(url))}</div>
          <div class="waseet l-waseet"><span class="wm">${mark(22)}</span><span>${pick(WASEET.lobby, 1)}</span></div>
        </div>
      </div>
      <div class="l-players">
        <div class="l-count muted"></div>
        <div class="pgrid" id="pgrid"></div>
      </div>
      <div class="l-foot muted" id="lfoot"></div>
    </div>`;
  updateLobby(v, true);
}

function updateLobby(v: ClientView, first = false): void {
  const grid = qs('#pgrid');
  if (!grid) return;
  const conn = v.players.filter((p) => p.connected);
  const readyN = conn.filter((p) => p.ready).length;
  const cnt = qs('.l-count');
  if (cnt) cnt.innerHTML = `${uiIcon('users', 18)} ${COPY.ofN(conn.length, 8)} · ${readyN} ${COPY.ready}`;
  const foot = qs('#lfoot');
  const allReady = conn.length >= 4 && conn.every((p) => p.ready);
  if (foot) foot.textContent = allReady ? COPY.everyoneReady : conn.length >= 4 ? COPY.hostStarts : COPY.needFour;

  const MAXSEATS = 8;
  const cards = v.players.slice(0, MAXSEATS).map((p) => lobbyCard(p, v.hostId));
  const ghosts = Array.from({ length: Math.max(0, MAXSEATS - cards.length) }, (_, i) => ghostSeat(v.players.length + i + 1));
  grid.innerHTML = cards.concat(ghosts).join('');
  const fresh = v.players.filter((p) => !seenIds.has(p.id));
  for (const p of fresh) {
    seenIds.add(p.id);
    const card = qs(`.pgrid .pcard[data-id="${cssId(p.id)}"]`);
    if (card && !first) {
      dassIn(card);
      sfx.join();
      bg.flash('support');
    }
  }
  if (allReady && first === false) sfx.ready();
}

function ghostSeat(seat: number): string {
  return `<div class="pcard ghost" aria-hidden="true">
    <span class="avatar ghost-av">${seat.toLocaleString('ar-EG')}</span>
    <span class="nm muted">${COPY.emptySeat}</span>
  </div>`;
}
function lobbyCard(p: PublicPlayerView, hostId?: string): string {
  return `<div class="pcard ${p.ready ? 'is-ready' : ''} ${p.connected ? '' : 'is-off'}" data-id="${p.id}">
    <span class="avatar" style="background:${avatarColor(p.seat)}">${escapeHtml(initial(p.nickname))}</span>
    <span class="nm">${escapeHtml(p.nickname)}</span>
    <span class="pc-badge">${p.id === hostId ? `<span class="badge host">${COPY.host}</span>` : p.ready ? `<span class="badge ok">${uiIcon('check', 14)}</span>` : '<span class="dot"></span>'}</span>
  </div>`;
}

// ---------------- stage ----------------
function buildStage(v: ClientView): void {
  cols.clear();
  stage.innerHTML = `
    <div class="game">
      <header class="hud">
        <span class="hud-mark">${mark(26)}</span>
        <span class="hud-phase"></span>
        <span class="hud-round muted mono"></span>
        <span class="ring hud-ring" style="--rs:52px"></span>
      </header>
      <div class="floor">${v.players.map(stageCol).join('')}</div>
      <div class="moment" id="moment"></div>
      <div class="waseet-slot" id="wslot"></div>
    </div>`;
  for (const p of v.players) {
    const c = qs<HTMLElement>(`.col[data-id="${cssId(p.id)}"]`);
    if (c) cols.set(p.id, c);
  }
}

function stageCol(p: PublicPlayerView): string {
  return `<div class="col" data-id="${p.id}">
    <div class="intent"></div>
    <div class="bar-track"><div class="bar"></div></div>
    <div class="vaultnum col-vault">0</div>
    <div class="col-name"><span class="avatar sm" style="background:${avatarColor(p.seat)}">${escapeHtml(initial(p.nickname))}</span><span class="nm">${escapeHtml(p.nickname)}</span></div>
  </div>`;
}

function updateStage(v: ClientView): void {
  const ph = qs('.hud-phase');
  if (ph) ph.textContent = phaseLabel(v.phase);
  const rd = qs('.hud-round');
  if (rd) rd.textContent = v.round > 0 ? `${v.round} / ${v.totalRounds}` : '';
  const ceiling = Math.max(30, ...v.players.map((p) => p.live)) * 1.15;
  for (const p of v.players) {
    const c = cols.get(p.id);
    if (!c) continue;
    const bar = qs<HTMLElement>('.bar', c);
    const before = prev?.players.find((x) => x.id === p.id)?.live;
    if (bar) {
      bar.style.height = `${clamp((p.live / ceiling) * 100, 4, 100)}%`;
      bar.classList.toggle('falling', before !== undefined && p.live < before);
    }
    const vlt = qs<HTMLElement>('.col-vault', c);
    if (vlt && Number(vlt.textContent) !== p.vault) countTo(vlt, p.vault);
    c.classList.toggle('is-off', !p.connected);
  }
  if (v.phaseEndsAt && v.phaseEndsAt !== phaseEnd) {
    phaseStart = Date.now();
    phaseEnd = v.phaseEndsAt;
    lastSec = -1;
  }
  if (!v.phaseEndsAt) phaseEnd = 0;
}

function transitions(p: ClientView | null, v: ClientView): void {
  const changed = p?.phase !== v.phase;
  if (changed) {
    if (v.phase === 'DECLARE') {
      clearIntents();
      bg.setMood('calm');
      sfx.roundStart();
      waseet(pick(WASEET.declare, v.round));
    }
    if (v.phase === 'REACTION_WINDOW') {
      revealDeclares(v);
      bg.setMood('tension');
      waseet(pick(WASEET.reaction, v.round));
    }
    if (v.phase === 'LOCK') {
      sealTransition();
      bg.setMood('secret');
      waseet(pick(WASEET.lock, v.round));
    }
    if (v.phase === 'REVEAL') {
      movementReveal(p, v);
      bg.setMood('calm');
    }
  }
  if (v.phase === 'REACTION_WINDOW' && JSON.stringify(p?.declares) !== JSON.stringify(v.declares)) revealDeclares(v);
  if (p) {
    for (const pl of v.players) {
      const was = p.players.find((x) => x.id === pl.id)?.vault ?? 0;
      if (pl.vault > was) {
        vaultSnap(pl.id);
        if (!sawVault) {
          sawVault = true;
          waseet(pick(WASEET.firstVault, v.round));
        }
      }
    }
  }
}

function revealDeclares(v: ClientView): void {
  const slots: Element[] = [];
  let i = 0;
  for (const p of v.players) {
    const a = v.declares[p.id];
    const slot = qs<HTMLElement>('.intent', cols.get(p.id));
    if (!slot) continue;
    if (a) {
      slot.className = 'intent show';
      slot.style.color = actionColor(a.kind);
      slot.innerHTML = actionIcon(a.kind, 40);
      slots.push(slot);
    } else {
      slot.className = 'intent';
      slot.innerHTML = '';
    }
    i++;
  }
  stagger(slots, 70, (n, d) => pop(n, d));
}

function sealTransition(): void {
  const floor = qs('.floor');
  if (floor) {
    const seal = document.createElement('div');
    seal.className = 'seal';
    floor.appendChild(seal);
    window.setTimeout(() => seal.remove(), 720);
  }
  for (const c of cols.values()) qs('.intent', c)?.classList.add('fog');
}

function movementReveal(p: ClientView | null, v: ClientView): void {
  // Bars move; authorship stays sealed for the Market Close reveal. Play direction sounds.
  let up = 0;
  let dn = 0;
  for (const pl of v.players) {
    const was = p?.players.find((x) => x.id === pl.id)?.live;
    if (was !== undefined) {
      if (pl.live > was) up++;
      else if (pl.live < was) dn++;
    }
  }
  for (const c of cols.values()) {
    const s = qs<HTMLElement>('.intent', c);
    if (s) {
      s.className = 'intent';
      s.innerHTML = '';
    }
  }
  if (dn > up) {
    sfx.attack();
    bg.flash('attack');
  } else if (up > 0) {
    sfx.support();
    bg.flash('support');
  }
}

function clearIntents(): void {
  for (const c of cols.values()) {
    const s = qs<HTMLElement>('.intent', c);
    if (s) {
      s.className = 'intent';
      s.innerHTML = '';
    }
  }
}

function vaultSnap(id: string): void {
  const vlt = qs<HTMLElement>('.col-vault', cols.get(id));
  if (!vlt) return;
  vlt.classList.remove('snap');
  void vlt.offsetWidth;
  vlt.classList.add('snap');
  sfx.vault();
}

// ---------------- final reveal ----------------
async function finalSequence(v: ClientView): Promise<void> {
  bg.setMood('secret');
  let skip = false;
  const onSkip = (e: Event): void => {
    if (e instanceof KeyboardEvent && e.code !== 'Space' && e.code !== 'Enter') return;
    skip = true;
  };
  addEventListener('keydown', onSkip);
  addEventListener('click', onSkip);
  const wait = (ms: number): Promise<void> => (skip ? Promise.resolve() : sleep(ms));

  stage.innerHTML = `<div class="final"><div class="f-title wordmark g">${COPY.finalTitle}</div><div class="f-sub muted">${COPY.finalSub}</div><div class="f-stage" id="fstage"></div><div class="skip-hint muted">${COPY.skip} — مسافة</div></div>`;
  const f = qs('.final')!;
  pullReveal(qs('.f-title')!);
  sfx.roundClose();
  waseet(pick(WASEET.final, 1));
  await wait(1500);

  const fstage = qs('#fstage')!;
  let pace = 640;
  for (const rv of v.history) {
    if (skip) break;
    const events = rv.entries.filter((e) => e.actual);
    for (const e of events) {
      if (skip) break;
      const who = name(v, e.playerId);
      const tgt = e.actual?.target ? name(v, e.actual.target) : '';
      fstage.innerHTML = revealCard(e, who, tgt, rv.round);
      const card = qs('.rcard', fstage)!;
      if (e.isDassa) {
        pop(card);
        sfx.betray();
        bg.flash('attack');
        qs('.crack', card)?.classList.add('go');
      } else {
        dassIn(card);
        if (e.actual?.kind === 'back') sfx.support();
        else if (e.actual?.kind === 'sell') sfx.vault();
      }
      await wait(e.isDassa ? pace + 260 : pace);
      pace = Math.max(300, pace - 34);
    }
  }
  removeEventListener('keydown', onSkip);
  removeEventListener('click', onSkip);
  await winnerScene(v, f);
}

function revealCard(e: RevealEntry, who: string, tgt: string, round: number): string {
  const dec = e.declared;
  const act = e.actual!;
  const line = act.kind === 'sell' ? `${who} ${COPY.sell}` : `${who} ${act.kind === 'back' ? COPY.support : COPY.attack} ${tgt}`;
  const tag = e.isDassa
    ? `<div class="r-dassa">${COPY.dassa} 🔪</div><div class="r-promise muted">${COPY.promised}: ${dec ? declLabel(dec.kind) : '—'}</div>`
    : `<div class="r-kept">${COPY.kept} ✓</div>`;
  return `<div class="rcard ${e.isDassa ? 'dassa' : ''}">
    <div class="r-round muted mono">${COPY.round} ${round}</div>
    <div class="r-ic" style="color:${actionColor(act.kind)}">${actionIcon(act.kind, 72)}${e.isDassa ? crackSvg() : ''}</div>
    <div class="r-line">${escapeHtml(line)}</div>
    ${tag}
  </div>`;
}

async function winnerScene(v: ClientView, f: Element): Promise<void> {
  bg.setMood('win');
  const winners = v.players.filter((p) => v.winnerIds.includes(p.id));
  const rest = [...v.players].filter((p) => !v.winnerIds.includes(p.id)).sort((a, b) => b.vault - a.vault);
  f.innerHTML = `
    <div class="winwrap">
      <div class="w-label muted">${winners.length > 1 ? COPY.coChamps : COPY.winner}</div>
      <div class="w-cards">${winners.map((w) => `<div class="w-card"><span class="avatar big" style="background:${avatarColor(w.seat)}">${escapeHtml(initial(w.nickname))}</span><div class="w-name">${escapeHtml(w.nickname)}</div><div class="vaultnum w-vault">${w.vault}</div></div>`).join('')}</div>
      <div class="w-tag muted">${pick(WASEET.winner, 1)}</div>
      <div class="standings" id="standings"></div>
      <div class="w-foot muted">${COPY.playAgain} · ${COPY.newCrew} — من جوال الهوست</div>
    </div>`;
  const wc = qs('.w-cards')!;
  pop(wc);
  celebrate();
  sfx.win();
  const st = qs('#standings')!;
  await sleep(700);
  const rows: Element[] = [];
  rest.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'st-row';
    row.innerHTML = `<span class="st-rank muted mono">${i + 2}</span><span class="avatar sm" style="background:${avatarColor(p.seat)}">${escapeHtml(initial(p.nickname))}</span><span class="st-name">${escapeHtml(p.nickname)}</span><span class="vaultnum st-vault">${p.vault}</span>`;
    st.appendChild(row);
    rows.push(row);
  });
  stagger(rows, 90, (n, d) => dassIn(n, d));
}

// ---------------- countdown loop ----------------
function tick(): void {
  const ring = qs<HTMLElement>('.hud-ring');
  if (ring && phaseEnd > 0) {
    const now = Date.now();
    const total = Math.max(1, phaseEnd - phaseStart);
    const remain = Math.max(0, phaseEnd - now);
    ring.style.setProperty('--p', String(remain / total));
    const sec = Math.ceil(remain / 1000);
    const urgent = sec <= 3 && sec > 0;
    ring.classList.toggle('urgent', urgent);
    if (sec !== lastSec && urgent) {
      lastSec = sec;
      sfx.countdown(true);
      bg.flash('tension');
    }
  } else if (ring) ring.style.setProperty('--p', '0');
  requestAnimationFrame(tick);
}

// ---------------- helpers ----------------
function waseet(text: string): void {
  const slot = qs('#wslot');
  if (!slot) return;
  slot.innerHTML = `<div class="waseet"><span class="wm">${mark(22)}</span><span>${escapeHtml(text)}</span></div>`;
  const w = qs('.waseet', slot);
  if (w) dassIn(w);
  window.setTimeout(() => {
    if (qs('.waseet span:last-child', slot)?.textContent === text) slot.innerHTML = '';
  }, 4600);
}
function name(v: ClientView, id: string): string {
  return v.players.find((p) => p.id === id)?.nickname ?? '؟';
}
function declLabel(k: string): string {
  return k === 'back' ? COPY.supportShort : k === 'dump' ? COPY.attackShort : COPY.sellShort;
}
function crackSvg(): string {
  return `<svg class="crack" viewBox="0 0 72 72" aria-hidden="true"><path d="M18 12 L38 34 L26 46 L50 62" stroke="#fff" stroke-width="2.5" fill="none" stroke-linejoin="miter" stroke-dasharray="200" stroke-dashoffset="200"/></svg>`;
}
function setupMute(): void {
  const b = qs<HTMLButtonElement>('#mute')!;
  const paint = (): void => {
    b.innerHTML = uiIcon(sfx.isMuted() ? 'soundOff' : 'soundOn', 22);
  };
  paint();
  b.addEventListener('click', () => {
    sfx.toggle();
    if (!sfx.isMuted()) sfx.press();
    paint();
  });
}
function formatCode(code: string): string {
  const g = code.match(/.{1,3}/g) ?? [code];
  return `<span class="code mono">${g.map((x) => `<b>${escapeHtml(x)}</b>`).join('<i>·</i>')}</span>`;
}
function shortUrl(url: string): string {
  return url.replace(/^https?:\/\//, '');
}
function avatarColor(seat: number): string {
  return `hsl(${(seat * 47 + 20) % 360} 58% 62%)`;
}
function initial(n: string): string {
  return [...n.trim()][0] ?? '؟';
}
function cssId(id: string): string {
  return id.replace(/["\\]/g, '');
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

// ---------------- scene CSS ----------------
function tvCss(): string {
  return `
  html,body{height:100%;overflow:hidden}
  .tv-mute{position:fixed;top:calc(var(--safe-t) + 16px);left:calc(var(--safe-l) + 16px);z-index:var(--z-hud)}
  .tv-err{position:fixed;inset:0;display:grid;place-items:center;font-size:var(--fs-h2);font-weight:800}
  #stage{display:flex;flex-direction:column}

  .opening{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;position:relative}
  .opening .ow{font-size:var(--fs-display)}
  .opening .ot{font-size:var(--fs-h3);font-weight:700;color:var(--text-2)}

  .lobby{flex:1;display:grid;grid-template-rows:auto 1fr auto auto;gap:clamp(14px,2.4vh,30px);max-width:1500px;margin:0 auto;width:100%;padding-inline:clamp(16px,2vw,40px);padding-block:clamp(10px,2vh,24px)}
  .l-head{display:flex;align-items:center;gap:14px}
  .l-titles{display:flex;flex-direction:column;gap:2px;line-height:1.15}
  .l-brand{font-size:var(--fs-h1)} .l-sub{font-size:var(--fs-h3)}
  .l-body{display:grid;grid-template-columns:auto 1fr;gap:clamp(24px,4vw,64px);align-items:center}
  .qr-card{padding:20px;display:flex;flex-direction:column;gap:12px;align-items:center;background:#f4eee3;border:none}
  .qr{width:clamp(170px,19vw,260px);height:clamp(170px,19vw,260px)} .qr-cap{color:#4a4030!important;font-weight:800}
  .l-join{display:flex;flex-direction:column;gap:14px}
  .code-host{direction:ltr;unicode-bidi:isolate;text-align:left}
  .code-host .code{display:inline-flex;direction:ltr;unicode-bidi:isolate;align-items:center;gap:4px;font-size:var(--fs-code);font-weight:900}
  .code-host .code b{background:linear-gradient(180deg,var(--gold-2),var(--gold-deep));-webkit-background-clip:text;background-clip:text;color:transparent}
  .code-host .code i{color:var(--muted);font-style:normal;font-size:.6em}
  .j-url{font-size:clamp(14px,1.6vw,20px);direction:ltr;unicode-bidi:isolate;text-align:left} .j-hint{font-size:var(--fs-h3)}
  .l-players{display:flex;flex-direction:column;gap:12px}
  .pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
  .pgrid .pcard{font-size:clamp(16px,1.6vw,22px)} .pc-badge{margin-inline-start:auto}
  .pcard.ghost{border-style:dashed;border-color:var(--line-2);background:color-mix(in srgb,var(--surface) 40%,transparent)}
  .pcard.ghost .ghost-av{background:transparent;color:var(--muted);border:1.6px dashed var(--line-3);font-weight:800}
  .pcard.ghost .nm{color:var(--muted);opacity:.8}
  .l-foot{font-size:var(--fs-h3);text-align:center}

  .game{flex:1;display:flex;flex-direction:column;gap:20px;position:relative}
  .hud{display:flex;align-items:center;gap:18px}
  .hud-phase{font-size:var(--fs-h2);font-weight:900} .hud-round{font-size:var(--fs-h3);margin-inline-start:4px}
  .hud-ring{margin-inline-start:auto}
  .floor{flex:1;display:flex;align-items:flex-end;justify-content:center;gap:clamp(14px,2.4vw,44px);position:relative;padding-bottom:8px}
  .col{flex:1;max-width:180px;min-width:96px;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:12px}
  .col.is-off{opacity:.4}
  .intent{height:56px;display:grid;place-items:center;opacity:0;position:relative}
  .intent.show{opacity:1} .intent.fog{filter:blur(3px);opacity:.4;transition:all var(--t-comp) var(--e-out)}
  .bar-track{width:clamp(48px,6vw,100px);height:46vh;display:flex;align-items:flex-end;background:linear-gradient(180deg,transparent,rgba(255,255,255,.03));border-radius:8px;border:1px solid var(--line)}
  .bar{height:33%}
  .col-vault{font-size:var(--fs-vault)}
  .col-name{display:flex;align-items:center;gap:8px;max-width:100%;font-weight:800;font-size:clamp(14px,1.4vw,20px)}
  .col-name .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .avatar.sm{width:30px;height:30px;border-radius:9px;font-size:14px} .avatar.big{width:96px;height:96px;border-radius:26px;font-size:44px}
  .seal{position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(139,121,242,.16),transparent);animation:sealSweep .72s var(--e-out)}
  .waseet-slot{position:absolute;bottom:6px;inset-inline-start:0}
  .moment{position:absolute;inset:0;pointer-events:none}

  .final{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;position:relative}
  .f-title{font-size:var(--fs-h1)} .f-sub{font-size:var(--fs-h3)}
  .f-stage{min-height:46vh;display:grid;place-items:center;width:100%}
  .skip-hint{position:fixed;bottom:calc(var(--safe-b) + 16px);inset-inline-end:20px;font-size:var(--fs-cap)}
  .rcard{display:flex;flex-direction:column;align-items:center;gap:10px;padding:28px 40px;border-radius:var(--r-3);
    background:linear-gradient(180deg,var(--surface-2),var(--surface));border:1px solid var(--line-2);box-shadow:var(--sh-card);min-width:min(90vw,420px)}
  .rcard.dassa{border-color:color-mix(in srgb,var(--red) 55%,transparent);box-shadow:var(--glow-red)}
  .r-round{font-size:var(--fs-label)} .r-ic{position:relative} .crack{position:absolute;inset:0} .crack.go path{animation:crackDraw var(--t-comp) var(--e-sharp) forwards}
  .r-line{font-size:var(--fs-h2);font-weight:900} .r-dassa{color:var(--red);font-weight:900;font-size:var(--fs-h3)} .r-kept{color:var(--green);font-weight:800}
  .winwrap{display:flex;flex-direction:column;align-items:center;gap:16px}
  .w-label{font-size:var(--fs-h3)} .w-cards{display:flex;gap:24px}
  .w-card{display:flex;flex-direction:column;align-items:center;gap:8px}
  .w-name{font-size:var(--fs-h2);font-weight:900} .w-vault{font-size:var(--fs-display)}
  .w-tag{font-size:var(--fs-h3)}
  .standings{display:flex;flex-direction:column;gap:8px;width:min(90vw,520px);margin-top:8px}
  .st-row{display:flex;align-items:center;gap:12px;padding:10px 16px;border-radius:var(--r-2);background:var(--surface);border:1px solid var(--line)}
  .st-rank{width:24px} .st-name{font-weight:800;flex:1} .st-vault{font-size:var(--fs-h3)}
  .w-foot{font-size:var(--fs-body);margin-top:8px}

  @media (max-width:900px){ .l-body{grid-template-columns:1fr} .qr{margin:0 auto} }
  `;
}
