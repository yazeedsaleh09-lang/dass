// V2 client — premium, Saudi-Arabic-first, RTL. The phone recedes during discussion;
// the reveal is the focal beat. Server sends locale-neutral keys; the client translates.
import { Client, type Room } from 'colyseus.js';
import type { ClientView } from '@crisis/v2';
import { detectLocale, dir, LOCALE_NAMES, LOCALES, renderLog, t, type Locale } from '@crisis/i18n';

declare const CRISIS_SERVER_URL: string;
const qs = new URLSearchParams(location.search);
const BUILT_IN = typeof CRISIS_SERVER_URL !== 'undefined' && CRISIS_SERVER_URL ? CRISIS_SERVER_URL : '';
function server(): string {
  if (qs.get('server')) return qs.get('server')!;
  if (BUILT_IN) return BUILT_IN;
  const h = location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'ws://localhost:2568';
  return `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;
}
const SERVER = server();

// Saudi Arabic is the primary language.
let locale: Locale = (localStorage.getItem('v2locale') as Locale) || (detectLocale(qs.get('lang')) === 'en' && !qs.get('lang') ? 'ar' : detectLocale(qs.get('lang') ?? 'ar'));
if (!LOCALES.includes(locale)) locale = 'ar';
let lastError = '';

const app = document.getElementById('app')!;
let client: Client | null = null;
let room: Room | null = null;
let view: ClientView | null = null;

const TR = (k: string, p?: Record<string, string | number>) => t(locale, k, p);
const el = (tag: string, props: Record<string, unknown> = {}, ...kids: (Node | string)[]): HTMLElement => {
  const n = document.createElement(tag);
  Object.assign(n, props);
  for (const k of kids) n.append(k as Node);
  return n;
};
const btn = (label: string, onClick: () => void, cls = ''): HTMLButtonElement => {
  const b = document.createElement('button');
  b.textContent = label; b.className = cls; b.onclick = onClick; return b;
};
const ltr = (s: string | number) => el('span', { className: 'ltr', textContent: String(s) });

function applyDir(): void { document.documentElement.dir = dir(locale); document.documentElement.lang = locale; }
function setLocale(l: Locale): void { locale = l; localStorage.setItem('v2locale', l); applyDir(); buildLang(); render(); }
function buildLang(): void {
  const bar = document.getElementById('langbar'); if (!bar) return;
  bar.replaceChildren(...LOCALES.map((l) => btn(LOCALE_NAMES[l], () => setLocale(l), l === locale ? 'primary mini' : 'ghost mini')));
}

function handlers(r: Room): void {
  r.onMessage('state', (v: ClientView) => { view = v; render(); });
  r.onError((c, m) => alert(`error ${c}: ${m ?? ''}`));
  r.onLeave(() => { room = null; view = null; render(); });
}
async function create(nick: string): Promise<void> { client = new Client(SERVER); room = await client.create('match', { nickname: nick }); handlers(room); }
async function join(code: string, nick: string): Promise<void> { if (!code) throw new Error(TR('v2.ui.enterCode')); client = new Client(SERVER); room = await client.joinById(code, { nickname: nick }); handlers(room); }
function attempt(p: Promise<void>): void { lastError = ''; void p.catch((e: unknown) => { lastError = TR('v2.ui.connError', { msg: (e as Error)?.message ?? String(e) }); render(); }); }

function timeLeft(v: ClientView): HTMLElement | string {
  if (!v.phaseEndsAt) return '';
  const s = Math.max(0, Math.round((v.phaseEndsAt - Date.now()) / 1000));
  return el('span', { className: 'timer' + (s <= 8 ? ' urgent' : '') }, ltr(`${s}s`));
}
function bandsRow(v: ClientView): HTMLElement {
  return el('div', { className: 'chips' }, ...(['infrastructure', 'trust', 'economy', 'health'] as const).map((k) =>
    el('span', { className: 'chip ' + v.cityBands[k] }, `${TR(`v2.var.${k}`)}: ${TR(`v2.band.${v.cityBands[k]}`)}`)));
}
function optTitle(v: ClientView, id?: string): string {
  const o = v.crisis?.options.find((x) => x.id === id);
  return o ? TR(o.titleKey) : TR('v2.ui.undecided');
}

function renderHome(): void {
  const nick = el('input', { placeholder: TR('v2.ui.yourName') }) as HTMLInputElement;
  nick.value = localStorage.getItem('v2nick') ?? '';
  const code = el('input', { placeholder: TR('v2.ui.roomCode') }) as HTMLInputElement;
  const getNick = () => { const n = nick.value.trim() || 'ضيف'; localStorage.setItem('v2nick', n); return n; };
  app.replaceChildren(
    ...(lastError ? [el('p', { className: 'err' }, lastError)] : []),
    el('h1', {}, TR('v2.ui.appTitle')),
    el('p', { className: 'muted' }, TR('v2.ui.tagline')),
    el('div', { className: 'card' }, el('h3', {}, TR('v2.ui.hostRoom')), nick, btn(TR('v2.ui.createRoom'), () => attempt(create(getNick())), 'primary')),
    el('div', { className: 'card' }, el('h3', {}, TR('v2.ui.joinTitle')), code, btn(TR('v2.ui.join'), () => attempt(join(code.value.trim(), getNick())))),
  );
}

function renderLobby(v: ClientView): void {
  const me = v.players.find((p) => p.id === v.you.id);
  const readyN = v.players.filter((p) => p.ready).length;
  const canStart = !!me?.isHost && v.players.length >= 4 && readyN >= 4;
  app.replaceChildren(
    el('h2', {}, TR('v2.ui.lobby', { count: v.players.length })),
    el('p', { className: 'muted' }, TR('v2.ui.roomCode') + ': ', ltr(room?.roomId ?? ''), '  —  ' + TR('v2.ui.shareHint')),
    el('div', { className: 'row' }, ...v.players.map((p) =>
      el('span', { className: 'pill' + (p.id === v.you.id ? ' you' : '') }, `${p.nickname}${p.isHost ? ' ★' : ''} ${p.ready ? '✓' : '…'}`))),
    el('div', {}, btn(me?.ready ? TR('v2.ui.unready') : TR('v2.ui.ready'), () => room?.send('ready', { ready: !me?.ready }), me?.ready ? 'ghost' : 'primary')),
    btn(TR('v2.ui.start', { ready: readyN }), () => room?.send('start', {}), canStart ? 'primary' : ''),
    btn(TR('v2.ui.leave'), () => void room?.leave(), 'ghost'),
  );
}

function roleCard(v: ClientView): HTMLElement {
  return el('div', { className: 'card' },
    el('span', { className: 'muted' }, TR('v2.ui.yourRole') + ': '),
    el('span', { className: 'roleband' }, v.you.roleNameKey ? TR(v.you.roleNameKey) : ''),
    el('p', { className: 'muted', style: 'margin:6px 0 0' }, v.you.roleBlurbKey ? TR(v.you.roleBlurbKey) : ''));
}
function infoBlock(v: ClientView, withReveal: boolean): HTMLElement | null {
  if (!v.you.info.length) return null;
  return el('div', { className: 'card' }, el('h3', {}, TR('v2.ui.yourInfo')),
    ...v.you.info.map((c) => {
      const shared = v.revealedInfo.some((r) => r.infoId === c.id && r.playerId === v.you.id);
      const line = el('div', { style: 'margin:8px 0' },
        el('span', { className: 'tag' + (c.confidence === 'rumored' ? ' rumored' : '') }, TR(`v2.conf.${c.confidence}`)), ' ', TR(c.textKey));
      if (withReveal && !shared) line.append(' ', btn(TR('v2.ui.revealToGroup'), () => room?.send('reveal', { infoId: c.id }), 'mini ghost'));
      if (shared) line.append(el('span', { className: 'muted' }, ' ✓'));
      return line;
    }));
}
function tableInfo(v: ClientView): HTMLElement | null {
  if (!v.revealedInfo.length) return null;
  return el('div', { className: 'card' }, el('h3', {}, TR('v2.ui.revealed')),
    ...v.revealedInfo.map((r) => el('div', { style: 'margin:6px 0' },
      el('span', { className: 'tag' + (r.confidence === 'rumored' ? ' rumored' : '') }, TR(`v2.conf.${r.confidence}`)), ' ', TR(r.textKey))));
}
function optionButtons(v: ClientView): HTMLElement {
  return el('div', {}, ...(v.crisis?.options ?? []).map((o) =>
    btn((v.you.commit === o.id ? '✓ ' : '') + TR(o.titleKey), () => room?.send('commit', { optionId: o.id }), v.you.commit === o.id ? 'sel' : '')));
}

function renderMatch(v: ClientView): void {
  const kids: Node[] = [];
  kids.push(el('div', { className: 'between' },
    el('span', { className: 'muted' }, TR('v2.phase.' + v.phase) + ' · ', ltr(`${v.crisisIndex + 1}/${v.total}`)),
    timeLeft(v)));
  kids.push(bandsRow(v));

  if (v.phase === 'briefing') {
    kids.push(el('h2', {}, v.crisis ? TR(v.crisis.titleKey) : ''), el('p', { className: 'big' }, v.crisis ? TR(v.crisis.briefKey) : ''));
    kids.push(roleCard(v));
    const ib = infoBlock(v, true); if (ib) kids.push(ib);
    kids.push(btn(TR('v2.ui.discussPrompt'), () => room?.send('continue', {}), 'primary'));
  } else if (v.phase === 'discussion') {
    kids.push(el('div', { className: 'focal' }, el('div', { style: 'font-size:40px' }, '🗣'), el('div', { className: 'em' }, TR('v2.ui.discussPrompt')), timeLeft(v)));
    const ib = infoBlock(v, true); if (ib) kids.push(ib);
    const ti = tableInfo(v); if (ti) kids.push(ti);
    kids.push(btn(TR('v2.ui.next'), () => room?.send('continue', {}), 'ghost'));
  } else if (v.phase === 'commit') {
    kids.push(el('h2', {}, TR('v2.ui.commitPrompt')), el('p', { className: 'muted' }, TR('v2.ui.commitHint')));
    if (v.crisis) kids.push(el('p', { className: 'muted' }, TR(v.crisis.briefKey)));
    kids.push(optionButtons(v));
    kids.push(el('p', { className: 'muted center' }, v.you.commit ? '✓ ' + TR('v2.ui.committed') : TR('v2.ui.tapToCommit')));
  } else if (v.phase === 'reveal') {
    kids.push(el('h2', { className: 'center' }, TR('v2.ui.whereTheyStand')));
    kids.push(el('div', { className: 'card' }, ...v.players.map((p) =>
      el('div', { className: 'reveal-row' }, el('b', {}, p.nickname), el('span', {}, optTitle(v, p.revealedCommit))))));
  } else if (v.phase === 'challenge') {
    kids.push(el('h2', {}, TR('v2.phase.challenge')), el('p', { className: 'big' }, TR('v2.ui.challengePrompt')));
    // live tally
    const tally: Record<string, number> = {};
    for (const p of v.players) if (p.revealedCommit) tally[p.revealedCommit] = (tally[p.revealedCommit] ?? 0) + 1;
    kids.push(el('div', { className: 'chips' }, ...(v.crisis?.options ?? []).map((o) =>
      el('span', { className: 'chip' }, `${TR(o.titleKey)}: `, ltr(tally[o.id] ?? 0)))));
    kids.push(el('h3', {}, TR('v2.ui.tapToCommit')));
    kids.push(optionButtons(v));
    kids.push(timeLeft(v) as Node);
  } else if (v.phase === 'resolution' || v.phase === 'interlude') {
    kids.push(el('div', { className: 'card story' }, v.timeline.slice(-4).map((e) => renderLog(e, locale)).join('\n')));
    if (v.phase === 'interlude') kids.push(btn(TR('v2.ui.next'), () => room?.send('continue', {}), 'primary'));
  }

  kids.push(el('div', { className: 'row', style: 'margin-top:14px' }, ...v.players.map((p) =>
    el('span', { className: 'pill' + (p.id === v.you.id ? ' you' : '') },
      `${p.nickname}`, p.nameKey ? el('span', { className: 'muted' }, ` · ${TR(p.nameKey)}`) : '',
      (v.phase === 'commit' && p.hasCommitted) ? ' ✓' : ''))));

  app.replaceChildren(...kids);
}

function renderEnding(v: ClientView): void {
  app.replaceChildren(
    el('h1', { className: 'center' }, v.ending ? TR(`v2.ending.label.${v.ending.kind}`) : ''),
    el('p', { className: 'big center' }, v.ending ? TR(v.ending.textKey) : ''),
    bandsRow(v),
    el('h3', {}, TR('v2.ui.theStory')),
    el('div', { className: 'card story' }, v.timeline.map((e) => renderLog(e, locale)).join('\n')),
    el('h3', {}, TR('v2.ui.roleOutcomes')),
    ...(v.roleOutcomes ?? []).map((ro) => el('div', { className: 'card' },
      el('b', {}, `${ro.nickname} — ${TR(`v2.role.${ro.roleId}.name`)}`),
      el('p', { style: 'margin:6px 0 0' }, TR(ro.noteKey, { role: TR(`v2.role.${ro.roleId}.name`) })),
      ...(ro.credibilityKey ? [el('p', { className: 'muted', style: 'margin:6px 0 0' }, '‹ ' + TR(ro.credibilityKey) + ' ›')] : []))),
    btn(TR('v2.ui.backHome'), () => void room?.leave(), 'primary'),
  );
}

function render(): void {
  if (!room || !view) { renderHome(); return; }
  const v = view;
  if (v.ended) renderEnding(v);
  else if (v.phase === 'lobby') renderLobby(v);
  else renderMatch(v);
}

window.setInterval(() => { if (room && view && !view.ended && view.phaseEndsAt) render(); }, 1000);
applyDir();
buildLang();
render();
