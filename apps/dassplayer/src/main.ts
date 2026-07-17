import { Client, type Room } from 'colyseus.js';
import type { ActionKind, ClientView } from '@dass/domain';
import { COPY, actionIcon, injectBase, sfx, sting } from '@dass/ui';

declare const DASS_SERVER_URL: string;

injectBase();
addCss(playerCss());

const app = document.getElementById('app')!;
const params = new URLSearchParams(location.search);
const serverUrl = DASS_SERVER_URL || `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;
const client = new Client(serverUrl);

let room: Room | null = null;
let view: ClientView | null = null;
let renderKey = '';
let intentionalLeave = false;
let pendingKind: ActionKind | null = null;
let pendingTarget: string | null = null;

renderJoin(params.get('code') ?? '');

// ---------------- connection ----------------
async function join(name: string, code: string): Promise<void> {
  sfx.unlock();
  const nickname = name.trim().slice(0, 20) || 'لاعب';
  const roomId = code.trim();
  if (!roomId) return renderJoin(code, COPY.roomNotFound);
  try {
    setBanner(COPY.connecting);
    room = await client.joinById(roomId, { nickname });
    wire(room);
    sessionStorage.setItem('dass_rt', room.reconnectionToken);
    clearBanner();
  } catch {
    renderJoin(code, COPY.roomNotFound);
  }
}

function wire(r: Room): void {
  r.onMessage('state', (v: ClientView) => {
    view = v;
    pendingKind = null;
    pendingTarget = null;
    render();
  });
  r.onMessage('sessionlog', () => {});
  r.onLeave((codeNum: number) => {
    if (intentionalLeave) return;
    setBanner(COPY.reconnecting);
    const token = sessionStorage.getItem('dass_rt');
    if (token && codeNum !== 1000) void tryReconnect(token, 4);
    else setBanner(COPY.disconnected);
  });
}

async function tryReconnect(token: string, tries: number): Promise<void> {
  for (let i = 0; i < tries; i++) {
    try {
      room = await client.reconnect(token);
      wire(room);
      sessionStorage.setItem('dass_rt', room.reconnectionToken);
      clearBanner();
      return;
    } catch {
      await new Promise((res) => setTimeout(res, 1200));
    }
  }
  setBanner(COPY.disconnected);
}

// ---------------- render ----------------
function render(): void {
  if (!view) return;
  const v = view;
  const key = `${v.phase}|${v.round}|${!!v.you.declared}|${!!v.you.locked}|${v.ended}|${v.players.length}|${v.players.map((p) => p.connected ? 1 : 0).join('')}`;
  if (key === renderKey) return;
  renderKey = key;

  if (v.phase === 'LOBBY') return renderLobby(v);
  if (v.ended) return renderEnd(v);
  switch (v.phase) {
    case 'DECLARE':
      return v.you.declared ? waitScreen(COPY.declared, 'ننتظر الباقي يعلنون…') : pickerScreen(v, 'declare');
    case 'REACTION_WINDOW':
      return reactionScreen(v);
    case 'LOCK':
      return v.you.locked ? waitScreen(COPY.locked, COPY.lookUp) : pickerScreen(v, 'lock');
    case 'REVEAL':
    case 'VAULT_UPDATE':
      return waitScreen(COPY.lookUp, ymResult(v));
    default:
      return waitScreen('…', '');
  }
}

function shell(inner: string): void {
  app.innerHTML = `<div class="pshell"><div class="pbar">${sting(22)}<span class="pmark">${COPY.brand}</span><span class="pphase muted"></span></div>${inner}<div id="banner"></div></div>`;
}

function renderJoin(code: string, err?: string): void {
  shell(`
    <div class="pcenter">
      <div class="ptag">${COPY.tagline}</div>
      <input id="name" class="pinput" placeholder="${COPY.namePlaceholder}" maxlength="20" autocomplete="off" />
      ${params.get('code') ? '' : `<input id="code" class="pinput mono" placeholder="${COPY.codeLabel}" value="${escapeAttr(code)}" autocapitalize="off" autocorrect="off" />`}
      <button id="go" class="btn primary" style="width:100%">${COPY.join}</button>
      ${err ? `<div class="perr">${err}</div>` : `<div class="muted" style="font-size:13px">${COPY.roomHint}</div>`}
    </div>`);
  const nameEl = byId<HTMLInputElement>('name');
  const codeEl = byId<HTMLInputElement>('code');
  nameEl?.focus();
  byId('go')?.addEventListener('click', () => join(nameEl?.value ?? '', codeEl?.value ?? params.get('code') ?? ''));
}

function renderLobby(v: ClientView): void {
  const me = v.players.find((p) => p.id === v.you.id);
  const isHost = v.hostId === v.you.id;
  const list = v.players
    .map((p) => `<div class="pchip ${p.connected ? '' : 'off'}">${escapeHtml(p.nickname)}${p.id === v.hostId ? ' ★' : ''}</div>`)
    .join('');
  const enoughReady = v.players.filter((p) => p.connected).length >= 4;
  shell(`
    <div class="pcenter">
      <div class="muted">${COPY.waiting}</div>
      <div class="pchips">${list}</div>
      <button id="ready" class="btn ${me ? 'primary' : ''}" style="width:100%">${COPY.ready} ✅</button>
      ${isHost ? `<button id="start" class="btn" style="width:100%" ${enoughReady ? '' : 'disabled'}>${enoughReady ? COPY.start : COPY.needFour}</button>` : ''}
    </div>`);
  byId('ready')?.addEventListener('click', () => room?.send('ready', { ready: true }));
  byId('start')?.addEventListener('click', () => room?.send('start', {}));
}

function pickerScreen(v: ClientView, mode: 'declare' | 'lock'): void {
  const title = mode === 'declare' ? COPY.declareTitle : COPY.lockTitle;
  const sub = mode === 'declare' ? COPY.declareSub : COPY.lockSub;
  // seed the lock picker with the public declare (you then honor or betray it)
  if (mode === 'lock' && v.you.declared && pendingKind === null) {
    pendingKind = v.you.declared.kind;
    pendingTarget = v.you.declared.target ?? null;
  }
  shell(`
    <div class="pcol">
      <div class="ptitle">${title}</div>
      <div class="muted psub">${sub}</div>
      <div class="pactions">
        ${actionBtn('back', COPY.support)}
        ${actionBtn('dump', COPY.attack)}
        ${actionBtn('sell', COPY.sell)}
      </div>
      <div id="targets" class="ptargets"></div>
      <button id="confirm" class="btn primary" style="width:100%" disabled>${mode === 'declare' ? COPY.declared.replace(' ✅','') : COPY.locked.replace(' 🔒','')}</button>
    </div>`);
  byId('targets') && renderTargets(v);
  refreshPicker();
  for (const b of Array.from(document.querySelectorAll<HTMLElement>('.action'))) {
    b.addEventListener('click', () => {
      pendingKind = b.dataset.kind as ActionKind;
      if (pendingKind === 'sell') pendingTarget = null;
      renderTargets(v);
      refreshPicker();
    });
  }
  byId('confirm')?.addEventListener('click', () => {
    if (!pendingKind) return;
    const msg = pendingKind === 'sell' ? { kind: 'sell' } : { kind: pendingKind, target: pendingTarget };
    if (pendingKind !== 'sell' && !pendingTarget) return;
    room?.send(mode, msg);
    sfx.declare();
  });
}

function renderTargets(v: ClientView): void {
  const box = byId('targets');
  if (!box) return;
  if (pendingKind === 'sell' || pendingKind === null) {
    box.innerHTML = pendingKind === 'sell' ? `<div class="muted psub">تبيع نفسك — تثبّت وضعك بالخزنة.</div>` : '';
    return;
  }
  const others = v.players.filter((p) => p.id !== v.you.id && p.connected);
  box.innerHTML = `<div class="muted psub">${COPY.pickTarget}</div><div class="pchips">${others
    .map((p) => `<button class="ptarget ${p.id === pendingTarget ? 'sel' : ''}" data-id="${p.id}">${escapeHtml(p.nickname)}</button>`)
    .join('')}</div>`;
  for (const t of Array.from(box.querySelectorAll<HTMLElement>('.ptarget'))) {
    t.addEventListener('click', () => {
      pendingTarget = t.dataset.id ?? null;
      renderTargets(v);
      refreshPicker();
    });
  }
}

function refreshPicker(): void {
  for (const b of Array.from(document.querySelectorAll<HTMLElement>('.action'))) {
    b.classList.toggle('selected', b.dataset.kind === pendingKind);
  }
  const ok = pendingKind === 'sell' || (!!pendingKind && !!pendingTarget);
  const c = byId<HTMLButtonElement>('confirm');
  if (c) c.disabled = !ok;
}

function reactionScreen(v: ClientView): void {
  const rows = v.players
    .map((p) => {
      const a = v.declares[p.id];
      const ic = a ? actionIcon(a.kind, 22) : '<span class="muted">—</span>';
      return `<div class="prow"><span>${escapeHtml(p.nickname)}</span><span class="ic ${a ? a.kind : ''}">${ic}</span></div>`;
    })
    .join('');
  shell(`<div class="pcol"><div class="ptitle">${COPY.reactionTitle}</div><div class="muted psub">${COPY.reactionSub}</div><div class="plist">${rows}</div></div>`);
}

function waitScreen(title: string, sub: string): void {
  shell(`<div class="pcenter"><div class="ptitle">${title}</div><div class="muted psub">${sub}</div></div>`);
}

function ymResult(v: ClientView): string {
  const e = v.reveal?.entries.find((x) => x.playerId === v.you.id);
  if (!e) return COPY.lookUp;
  if (e.isDassa) return 'دسّيتها 🔪';
  if (e.actual?.kind === 'sell') return 'ثبّتها بالخزنة 💰';
  return 'التزمت بكلامك.';
}

function renderEnd(v: ClientView): void {
  const winners = v.players.filter((p) => v.winnerIds.includes(p.id)).map((p) => p.nickname);
  const label = winners.length > 1 ? `${COPY.coChamps}: ${winners.join(' + ')}` : `${COPY.winner}: ${escapeHtml(winners[0] ?? '')}`;
  shell(`<div class="pcenter"><div class="ptitle">${COPY.playedIt}</div><div class="pgold">${label}</div><div class="muted psub">${COPY.lookUp}</div></div>`);
}

// ---------------- helpers ----------------
function actionBtn(kind: ActionKind, label: string): string {
  const cls = kind === 'back' ? 'up' : kind === 'dump' ? 'dump' : 'sell';
  return `<button class="action ${cls}" data-kind="${kind}"><span class="ic">${actionIcon(kind, 26)}</span><span class="lbl">${label}</span></button>`;
}
function byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}
function setBanner(t: string): void {
  const b = byId('banner');
  if (b) b.innerHTML = `<div class="pbanner">${t}</div>`;
}
function clearBanner(): void {
  const b = byId('banner');
  if (b) b.innerHTML = '';
}
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
function escapeAttr(s: string): string {
  return escapeHtml(s);
}
function addCss(css: string): void {
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
}

function playerCss(): string {
  return `
  .pshell{min-height:100dvh;display:flex;flex-direction:column;padding:16px;padding-top:calc(env(safe-area-inset-top) + 12px);gap:14px}
  .pbar{display:flex;align-items:center;gap:8px}
  .pmark{font-weight:900;font-size:22px} .pphase{margin-inline-start:auto;font-size:13px}
  .pcenter{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:16px;text-align:center}
  .pcol{flex:1;display:flex;flex-direction:column;gap:14px;justify-content:center}
  .ptag{font-size:24px;font-weight:900;line-height:1.3}
  .ptitle{font-size:26px;font-weight:900} .psub{font-size:14px}
  .pgold{color:var(--gold);font-weight:900;font-size:22px}
  .pinput{width:100%;padding:16px;font-size:20px;text-align:center;background:var(--surface);border:1px solid var(--line-strong);border-radius:3px;color:var(--text)}
  .pactions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
  .action .ic{display:block}
  .ptargets{min-height:8px}
  .pchips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
  .pchip{background:var(--surface-2);border:1px solid var(--line);border-radius:3px;padding:8px 12px;font-weight:700}
  .pchip.off{opacity:.4}
  .ptarget{background:var(--surface-2);border:1px solid var(--line-strong);border-radius:3px;padding:10px 14px;font-weight:700;font-size:16px}
  .ptarget.sel{border-color:var(--gold);color:var(--gold)}
  .plist,.pchips{width:100%}
  .prow{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid var(--line)}
  .prow .ic.back{color:var(--up)} .prow .ic.dump{color:var(--down)} .prow .ic.sell{color:var(--gold)}
  .perr{color:var(--down);font-weight:700}
  .pbanner{position:fixed;top:0;left:0;right:0;background:var(--surface-2);border-bottom:1px solid var(--line-strong);padding:8px;text-align:center;font-weight:700;font-size:14px}
  `;
}
