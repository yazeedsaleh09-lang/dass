import { Client, type Room } from 'colyseus.js';
import type { ClientView, RevealEntry } from '@dass/domain';
import { COPY, WASEET, actionIcon, injectBase, phaseLabel, pick, sfx, sleep, sting, waseetMark } from '@dass/ui';

declare const DASS_SERVER_URL: string;
injectBase();
addCss(tvCss());

const app = document.getElementById('app')!;
const serverUrl = DASS_SERVER_URL || `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;
const client = new Client(serverUrl);

let room: Room | null = null;
let view: ClientView | null = null;
let prev: ClientView | null = null;
let stageBuilt = false;
let sawDassaGame = false;
let sawVaultGame = false;
const cols = new Map<string, HTMLElement>();

// timing for the countdown ring
let phaseStart = 0;
let phaseEnd = 0;
let lastTickSec = -1;

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
    requestAnimationFrame(tick);
  } catch {
    app.innerHTML = `<div class="tv-center"><div class="big">${COPY.genericError}</div></div>`;
  }
}

// ---------- opening (first ~3s) ----------
async function opening(): Promise<void> {
  app.innerHTML = `<div class="opening"><div class="logo"><span class="word">${COPY.brand}</span><span class="sting">${sting(64)}</span></div><div class="otag">${COPY.tagline}</div></div>`;
  await sleep(2600);
}

// ---------- state routing ----------
function onState(): void {
  const v = view!;
  if (v.phase === 'LOBBY') {
    stageBuilt = false;
    return renderLobby(v);
  }
  if (!stageBuilt) buildStage(v);
  updateStage(v);
  transitions(prev, v);
}

function renderLobby(v: ClientView): void {
  const code = room?.roomId ?? '';
  const url = `${location.origin}/play?code=${code}`;
  const players = v.players
    .map((p, i) => `<div class="jchip" style="animation-delay:${i * 60}ms">${escapeHtml(p.nickname)}${p.id === v.hostId ? ' <span class="host">★</span>' : ''}</div>`)
    .join('');
  app.innerHTML = `
    <div class="lobby">
      <div class="lhead"><span class="word sm">${COPY.brand}</span>${sting(34)}</div>
      <div class="lcode">
        <div class="muted">${COPY.roomHint}</div>
        <div class="code mono">${escapeHtml(code)}</div>
        <div class="url mono muted">${escapeHtml(url)}</div>
      </div>
      <div class="ljoined"><div class="muted">${v.players.length} دخلوا</div><div class="jchips">${players}</div></div>
      <div class="lfoot muted">${v.players.length >= 4 ? 'الهوست يبدأ من جواله' : COPY.needFour}</div>
    </div>`;
}

// ---------- stage ----------
function buildStage(v: ClientView): void {
  cols.clear();
  const columns = v.players
    .map(
      (p) => `
    <div class="col" data-id="${p.id}">
      <div class="intent"></div>
      <div class="bar-wrap"><div class="bar"></div></div>
      <div class="vault">0</div>
      <div class="pname">${escapeHtml(p.nickname)}</div>
    </div>`,
    )
    .join('');
  app.innerHTML = `
    <div class="stage">
      <header class="thead">
        <span class="word sm">${COPY.brand}</span>
        <span class="phase"></span>
        <span class="rnd muted"></span>
        <span class="ring"></span>
      </header>
      <div class="floor">${columns}</div>
      <div class="moment"></div>
      <div class="waseet-slot"></div>
    </div>`;
  for (const p of v.players) {
    const c = app.querySelector<HTMLElement>(`.col[data-id="${cssId(p.id)}"]`);
    if (c) cols.set(p.id, c);
  }
  stageBuilt = true;
}

function updateStage(v: ClientView): void {
  const head = app.querySelector('.phase');
  if (head) head.textContent = phaseLabel(v.phase);
  const rnd = app.querySelector('.rnd');
  if (rnd) rnd.textContent = v.round > 0 ? `جولة ${v.round}/${v.totalRounds}` : '';

  const ceiling = Math.max(30, ...v.players.map((p) => p.live)) * 1.12;
  for (const p of v.players) {
    const c = cols.get(p.id);
    if (!c) continue;
    const bar = c.querySelector<HTMLElement>('.bar');
    const before = prev?.players.find((x) => x.id === p.id)?.live;
    if (bar) {
      bar.style.height = `${clamp((p.live / ceiling) * 100, 3, 100)}%`;
      bar.classList.toggle('dn', before !== undefined && p.live < before);
    }
    const vlt = c.querySelector<HTMLElement>('.vault');
    if (vlt) vlt.textContent = String(p.vault);
    c.classList.toggle('off', !p.connected);
  }

  // phase-timer bookkeeping for the ring
  if (v.phaseEndsAt && v.phaseEndsAt !== phaseEnd) {
    phaseStart = Date.now();
    phaseEnd = v.phaseEndsAt;
    lastTickSec = -1;
  }
  if (!v.phaseEndsAt) phaseEnd = 0;
}

// ---------- transitions (one-shot motion + sound) ----------
function transitions(p: ClientView | null, v: ClientView): void {
  const changed = p?.phase !== v.phase;
  if (changed) {
    if (v.phase === 'DECLARE') {
      clearIntents();
      waseet(pick(WASEET.declare, v.round));
    }
    if (v.phase === 'REACTION_WINDOW') revealDeclares(v);
    if (v.phase === 'LOCK') sealTransition();
    if (v.phase === 'REVEAL') void doReveal(v);
  }
  // vault increases → gold snap + thunk (drives the "first vault" الوسيط once)
  if (p) {
    for (const pl of v.players) {
      const was = p.players.find((x) => x.id === pl.id)?.vault ?? 0;
      if (pl.vault > was) {
        vaultSnap(pl.id);
        if (!sawVaultGame) {
          sawVaultGame = true;
          waseet(pick(WASEET.firstVault, v.round));
        }
      }
    }
  }
  if (v.ended && !p?.ended) void finalReveal(v);
}

function revealDeclares(v: ClientView): void {
  let i = 0;
  for (const p of v.players) {
    const a = v.declares[p.id];
    const slot = cols.get(p.id)?.querySelector<HTMLElement>('.intent');
    if (!slot) continue;
    if (a) {
      slot.style.animationDelay = `${i * 70}ms`;
      slot.className = `intent show ${a.kind}`;
      slot.innerHTML = actionIcon(a.kind, 40);
    } else {
      slot.className = 'intent';
      slot.innerHTML = '';
    }
    i++;
  }
}

function sealTransition(): void {
  const floor = app.querySelector<HTMLElement>('.floor');
  if (!floor) return;
  const seal = document.createElement('div');
  seal.className = 'seal';
  floor.appendChild(seal);
  window.setTimeout(() => seal.remove(), 700);
  for (const c of cols.values()) c.querySelector('.intent')?.classList.add('fog');
}

async function doReveal(v: ClientView): Promise<void> {
  const entries = v.reveal?.entries ?? [];
  for (const c of cols.values()) c.querySelector('.intent')?.classList.remove('fog');
  // honored actions first (quiet), then the dassات (the drama), staggered
  for (const e of entries) {
    if (e.isDassa) continue;
    setIntent(e.playerId, e.actual?.kind, false);
  }
  for (const e of entries.filter((x) => x.isDassa)) {
    await crackReveal(e);
  }
}

async function crackReveal(e: RevealEntry): Promise<void> {
  const slot = cols.get(e.playerId)?.querySelector<HTMLElement>('.intent');
  if (!slot) return;
  // show the DECLARED promise, then stab+crack it into the ACTUAL — sound fires from the SAME event
  if (e.declared) {
    slot.className = `intent show ${e.declared.kind}`;
    slot.innerHTML = actionIcon(e.declared.kind, 40) + `<svg class="crack" viewBox="0 0 40 40"><path d="M8 6 L20 18 L13 28 L26 34"/></svg>`;
  }
  await sleep(120);
  sfx.dassa(); // ← same reveal event as the crack; cannot drift
  slot.querySelector('.crack')?.classList.add('go');
  slot.classList.add('shake');
  await sleep(260);
  if (e.actual) {
    slot.className = `intent show dassa ${e.actual.kind}`;
    slot.innerHTML =
      actionIcon(e.actual.kind, 40) +
      `<div class="dtag"><span class="pm">${COPY.dassaTag}</span></div>`;
  }
  if (!sawDassaGame) {
    sawDassaGame = true;
    waseet(pick(WASEET.dassa, e.playerId.length));
  }
  await sleep(220);
}

function setIntent(id: string, kind: string | undefined, dassa: boolean): void {
  const slot = cols.get(id)?.querySelector<HTMLElement>('.intent');
  if (!slot || !kind) return;
  slot.className = `intent show ${kind}${dassa ? ' dassa' : ''}`;
  slot.innerHTML = actionIcon(kind as 'back' | 'dump' | 'sell', 40);
}

function clearIntents(): void {
  for (const c of cols.values()) {
    const s = c.querySelector<HTMLElement>('.intent');
    if (s) {
      s.className = 'intent';
      s.innerHTML = '';
    }
  }
}

function vaultSnap(id: string): void {
  const vlt = cols.get(id)?.querySelector<HTMLElement>('.vault');
  if (!vlt) return;
  vlt.classList.remove('snap');
  void vlt.offsetWidth; // reflow to restart the animation
  vlt.classList.add('snap');
  sfx.vaultLock();
}

async function finalReveal(v: ClientView): Promise<void> {
  phaseEnd = 0;
  const moment = app.querySelector<HTMLElement>('.moment');
  if (!moment) return;
  moment.className = 'moment on';
  moment.innerHTML = `<div class="fbig">${COPY.finalTitle}</div>`;
  sfx.finalReveal();
  waseet(pick(WASEET.final, v.round));
  await sleep(1400);
  // escalate through the documented dassات
  let gap = 620;
  for (const rv of v.history) {
    for (const e of rv.entries.filter((x) => x.isDassa)) {
      const who = v.players.find((p) => p.id === e.playerId)?.nickname ?? '';
      moment.innerHTML = `<div class="fcrack">${actionIcon(e.declared?.kind ?? 'back', 64)}<span class="fx">✕</span>${actionIcon(e.actual?.kind ?? 'dump', 64)}</div><div class="fwho">${escapeHtml(who)} — ${COPY.dassaTag}</div>`;
      sfx.dassa();
      await sleep(gap);
      gap = Math.max(260, gap - 60);
    }
  }
  // land on the winner — no crown (forbidden)
  const winners = v.players.filter((p) => v.winnerIds.includes(p.id));
  const label = winners.length > 1 ? COPY.coChamps : COPY.winner;
  moment.innerHTML = `<div class="winner"><div class="wlabel">${label}</div><div class="wname">${winners.map((w) => escapeHtml(w.nickname)).join(' + ')}</div><div class="wvault vault snap">${winners[0]?.vault ?? ''}</div><div class="wsub muted">${COPY.newCrew}</div></div>`;
}

function waseet(text: string): void {
  const slot = app.querySelector<HTMLElement>('.waseet-slot');
  if (!slot) return;
  slot.innerHTML = `<div class="waseet">${waseetMark(34)}<span class="txt">${escapeHtml(text)}</span></div>`;
  window.setTimeout(() => {
    if (slot.textContent === '' || slot.querySelector('.txt')?.textContent === text) slot.innerHTML = '';
  }, 4200);
}

// ---------- countdown ring ----------
function tick(): void {
  const ring = app.querySelector<HTMLElement>('.ring');
  if (ring && phaseEnd > 0) {
    const now = Date.now();
    const total = Math.max(1, phaseEnd - phaseStart);
    const remain = Math.max(0, phaseEnd - now);
    const p = remain / total;
    ring.style.setProperty('--p', String(p));
    const sec = Math.ceil(remain / 1000);
    ring.classList.toggle('urgent', sec <= 3 && sec > 0);
    if (sec !== lastTickSec && sec <= 3 && sec > 0) {
      lastTickSec = sec;
      sfx.countdownTick(true);
    }
  } else if (ring) {
    ring.style.setProperty('--p', '0');
  }
  requestAnimationFrame(tick);
}

// ---------- helpers ----------
function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
function cssId(id: string): string {
  return id.replace(/["\\]/g, '');
}
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
function addCss(css: string): void {
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
}

function tvCss(): string {
  return `
  .tv-center,.opening,.lobby,.stage{width:100vw;height:100dvh;overflow:hidden}
  .opening{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:var(--bg)}
  .opening .logo{display:flex;align-items:flex-start;gap:12px;animation:bloomIn 1200ms var(--ease-out)}
  .word{font-weight:900;letter-spacing:-.01em} .word.sm{font-size:30px}
  .opening .word{font-size:clamp(80px,16vw,180px);line-height:.9}
  .otag{font-size:clamp(20px,3vw,34px);font-weight:700;opacity:0;animation:bloomIn 800ms var(--ease-out) 900ms forwards}
  .big{font-size:32px;font-weight:900}
  .tv-center{display:flex;align-items:center;justify-content:center}

  .lobby{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;text-align:center;padding:40px}
  .lhead{display:flex;align-items:center;gap:10px}
  .lcode .code{font-size:clamp(56px,10vw,120px);font-weight:900;color:var(--gold);letter-spacing:.08em}
  .lcode .url{font-size:18px;margin-top:6px}
  .jchips{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;max-width:1100px;margin-top:12px}
  .jchip{background:var(--surface);border:1px solid var(--line-strong);border-radius:3px;padding:12px 20px;font-size:22px;font-weight:700;animation:bloomIn var(--t-declare) var(--ease-out) both}
  .jchip .host{color:var(--gold)}
  .lfoot{font-size:20px}

  .stage{display:flex;flex-direction:column;padding:26px 34px;gap:18px;position:relative}
  .thead{display:flex;align-items:center;gap:18px}
  .thead .phase{font-size:26px;font-weight:900;margin-inline-start:8px}
  .thead .rnd{font-size:18px}
  .ring{margin-inline-start:auto;width:56px;height:56px}
  .floor{flex:1;display:flex;align-items:flex-end;justify-content:center;gap:clamp(12px,2.2vw,40px);position:relative;padding-bottom:8px}
  .col{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:10px;height:100%;min-width:90px;max-width:170px;flex:1}
  .col.off{opacity:.45}
  .intent{height:52px;display:flex;align-items:center;justify-content:center;opacity:0;position:relative}
  .intent.show{opacity:1;animation:bloomIn var(--t-declare) var(--ease-out) both}
  .intent.back{color:var(--up)} .intent.dump{color:var(--down)} .intent.sell{color:var(--gold)}
  .intent.fog{filter:blur(2px);opacity:.5;transition:all var(--t-declare) var(--ease-out)}
  .intent .crack{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
  .intent .dtag{position:absolute;top:-14px;inset-inline-end:-10px}
  .dtag .pm{background:var(--down);color:#fff;font-size:12px;font-weight:800;padding:2px 6px;border-radius:2px}
  .bar-wrap{width:clamp(46px,6vw,96px);height:46vh;display:flex;align-items:flex-end;background:linear-gradient(180deg,transparent,rgba(255,255,255,.03))}
  .bar{width:100%;height:33%}
  .vault{font-size:clamp(26px,3vw,44px)}
  .pname{font-size:clamp(15px,1.4vw,22px);font-weight:700;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .seal{position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(245,240,232,.10),transparent);animation:sealSweep 700ms var(--ease-out)}

  .waseet-slot{position:absolute;bottom:20px;inset-inline-start:34px}
  .moment{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(10,10,15,.72);backdrop-filter:blur(3px)}
  .moment.on{display:flex}
  .fbig{font-size:clamp(40px,7vw,90px);font-weight:900;animation:bloomIn var(--t-dramatic) var(--ease-out)}
  .fcrack{display:flex;align-items:center;gap:20px;color:var(--text);animation:bloomIn var(--t-reveal) var(--ease-overshoot)}
  .fcrack .fx{font-size:60px;color:var(--down)}
  .fwho{margin-top:16px;font-size:28px;font-weight:800;text-align:center}
  .winner{text-align:center;animation:bloomIn var(--t-dramatic) var(--ease-overshoot)}
  .winner .wlabel{font-size:28px;color:var(--muted)}
  .winner .wname{font-size:clamp(48px,8vw,110px);font-weight:900}
  .winner .wvault{font-size:clamp(60px,10vw,140px)}
  .winner .wsub{font-size:20px;margin-top:12px}
  `;
}
