// v0.2 web client: full i18n (en/ar) + RTL. The server sends locale-neutral keys;
// the client translates everything, so switching language is instant (no refresh, no round-trip).
import { Client, type Room } from 'colyseus.js';
import type { ClientView } from '@crisis/shared';
import { detectLocale, dir, LOCALE_NAMES, LOCALES, renderLog, t, type Locale } from '@crisis/i18n';

declare const CRISIS_SERVER_URL: string;
const params = new URLSearchParams(location.search);
const BUILT_IN = typeof CRISIS_SERVER_URL !== 'undefined' && CRISIS_SERVER_URL ? CRISIS_SERVER_URL : '';
function defaultServer(): string {
  if (BUILT_IN) return BUILT_IN;
  const h = location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'ws://localhost:2567';
  return `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;
}
const SERVER = params.get('server') ?? defaultServer();

let locale: Locale = detectLocale(params.get('lang') ?? localStorage.getItem('locale'));
let lastError = '';
type ChatItem = { kind: 'chat'; name: string; text: string } | { kind: 'signal'; name: string; sig: string };
const chatLog: ChatItem[] = [];

const app = document.getElementById('app')!;
let client: Client | null = null;
let room: Room | null = null;
let view: ClientView | null = null;

const TR = (key: string, p?: Record<string, string | number>): string => t(locale, key, p);

const el = (tag: string, props: Record<string, unknown> = {}, ...kids: (Node | string)[]): HTMLElement => {
  const n = document.createElement(tag);
  Object.assign(n, props);
  for (const k of kids) n.append(k as Node);
  return n;
};
const btn = (label: string, onClick: () => void, opts: { primary?: boolean; disabled?: boolean } = {}): HTMLButtonElement => {
  const b = document.createElement('button');
  b.textContent = label;
  if (opts.primary) b.className = 'primary';
  b.disabled = !!opts.disabled;
  b.onclick = onClick;
  return b;
};
/** Wrap a number/code/timer so it always reads left-to-right, even inside RTL text. */
const ltr = (s: string | number): HTMLElement => el('span', { className: 'ltr', textContent: String(s) });

function applyDir(): void {
  document.documentElement.dir = dir(locale);
  document.documentElement.lang = locale;
}
function setLocale(l: Locale): void {
  locale = l;
  localStorage.setItem('locale', l);
  applyDir();
  buildLangBar();
  render();
}
function buildLangBar(): void {
  const bar = document.getElementById('langbar');
  if (!bar) return;
  bar.replaceChildren(
    el('span', { className: 'muted', textContent: TR('ui.language') + ': ' }),
    ...LOCALES.map((l) => {
      const b = btn(LOCALE_NAMES[l], () => setLocale(l), { primary: l === locale });
      b.className = (b.className + ' langbtn').trim();
      return b;
    }),
  );
}

function connectHandlers(r: Room): void {
  r.onMessage('state', (v: ClientView) => {
    view = v;
    render();
  });
  r.onMessage('chat', (m: { name: string; text: string }) => {
    chatLog.push({ kind: 'chat', name: m.name, text: m.text });
    render();
  });
  r.onMessage('signal', (m: { name: string; kind: string }) => {
    chatLog.push({ kind: 'signal', name: m.name, sig: m.kind });
    render();
  });
  r.onError((code, msg) => alert(`error ${code}: ${msg ?? ''}`));
  r.onLeave(() => {
    room = null;
    view = null;
    render();
  });
}

async function createRoom(nickname: string): Promise<void> {
  client = new Client(SERVER);
  room = await client.create('match', { nickname });
  connectHandlers(room);
}
async function joinRoom(code: string, nickname: string): Promise<void> {
  if (!code) throw new Error(TR('ui.enterCode'));
  client = new Client(SERVER);
  room = await client.joinById(code, { nickname });
  connectHandlers(room);
}
function attempt(p: Promise<void>): void {
  lastError = '';
  void p.catch((e: unknown) => {
    lastError = TR('ui.connError', { msg: (e as Error)?.message ?? String(e) });
    render();
  });
}

function renderHome(): void {
  const nick = el('input', { id: 'nick', placeholder: TR('ui.yourName') }) as HTMLInputElement;
  nick.value = localStorage.getItem('nick') ?? '';
  const code = el('input', { id: 'code', placeholder: TR('ui.roomCode') }) as HTMLInputElement;
  const getNick = () => {
    const n = nick.value.trim() || 'Player';
    localStorage.setItem('nick', n);
    return n;
  };
  const banner: Node[] = lastError ? [el('p', { className: 'err' }, lastError)] : [];
  app.replaceChildren(
    ...banner,
    el('h1', {}, TR('ui.appTitle')),
    el('p', { className: 'muted' }, TR('ui.tagline')),
    el('div', { className: 'card' },
      el('h3', {}, TR('ui.hostRoom')),
      nick,
      el('div', { className: 'row' }, btn(TR('ui.createRoom'), () => attempt(createRoom(getNick())), { primary: true })),
    ),
    el('div', { className: 'card' },
      el('h3', {}, TR('ui.joinTitle')),
      code,
      el('div', { className: 'row' }, btn(TR('ui.join'), () => attempt(joinRoom(code.value.trim(), getNick())))),
    ),
  );
}

function meterRow(v: ClientView): HTMLElement {
  const m = v.meters;
  const one = (id: 'stability' | 'resources' | 'cohesion') =>
    el('span', { className: 'meter' }, el('span', { className: 'muted' }, TR(`meter.${id}`) + ' '), el('b', {}, ltr(m[id])));
  return el('div', { className: 'meters' }, one('stability'), one('resources'), one('cohesion'));
}

function renderLobby(v: ClientView): void {
  const me = v.players.find((p) => p.id === v.you.id);
  const readyCount = v.players.filter((p) => p.ready).length;
  const canStart = !!me?.isHost && v.players.length >= 4 && readyCount >= 4;
  app.replaceChildren(
    el('h2', {}, TR('ui.lobby', { count: v.players.length })),
    el('p', { className: 'muted' }, el('span', {}, TR('ui.codeLabel') + ' '), ltr(room?.roomId ?? ''), el('span', {}, ' — ' + TR('ui.shareHint'))),
    el('div', {}, ...v.players.map((p) =>
      el('span', { className: 'pill' + (p.id === v.you.id ? ' you' : '') },
        `${p.nickname}${p.isHost ? ' 👑' : ''} ${p.ready ? '✓' + TR('ui.readyTag') : '…'}${p.connected ? '' : ' (' + TR('ui.offline') + ')'}`),
    )),
    el('div', { className: 'row' },
      btn(me?.ready ? TR('ui.unready') : TR('ui.ready'), () => room?.send('ready', { ready: !me?.ready }), { primary: !me?.ready }),
      btn(TR('ui.start', { ready: readyCount }), () => room?.send('start', {}), { primary: true, disabled: !canStart }),
      btn(TR('ui.leave'), () => void room?.leave()),
    ),
  );
}

function renderMatch(v: ClientView): void {
  const kids: Node[] = [];
  const phase = TR(`phase.${v.crisisPhase}`);
  const headerKey = v.crisis?.tier === 'final' ? 'ui.crisisHeaderFinal' : 'ui.crisisHeader';
  const header = el('h2', {}, TR(headerKey, { index: v.crisisIndex + 1, total: v.playlistLength, phase }));
  if (v.phaseEndsAt) {
    const s = Math.max(0, Math.round((v.phaseEndsAt - Date.now()) / 1000));
    header.append(el('span', { className: 'muted' }, ' · '), ltr(TR('ui.timeLeft', { s })));
  }
  kids.push(header, meterRow(v));

  if (v.you.goalTitle) {
    kids.push(el('div', { className: 'card you' },
      el('b', {}, TR('ui.yourGoal') + ' '), `${TR(v.you.goalTitle)} — ${v.you.goalDescription ? TR(v.you.goalDescription) : ''}`));
  }
  if (v.crisis) {
    kids.push(el('div', { className: 'card' }, el('b', {}, TR(v.crisis.title) + ': '), TR(v.crisis.publicBrief)));
  }

  if (v.you.cards.length) {
    const cardEls = v.you.cards.map((c) => {
      const wrap = el('div', {}, el('span', { className: 'tag' }, `[${TR(`reliability.${c.reliability}`)}] `), TR(c.content), ' ');
      if (v.crisisPhase === 'deliberation') wrap.append(btn(TR('ui.reveal'), () => room?.send('reveal', { cardId: c.id })));
      return wrap;
    });
    kids.push(el('div', { className: 'card' }, el('b', {}, TR('ui.yourInfo')), ...cardEls));
  } else {
    kids.push(el('div', { className: 'muted' }, TR('ui.noInfo')));
  }

  if (v.revealedCards.length) {
    kids.push(el('div', { className: 'card' }, el('b', {}, TR('ui.revealed')),
      ...v.revealedCards.map((r) => el('div', {}, el('span', { className: 'tag' }, `[${TR(`reliability.${r.reliability}`)}] `), TR(r.content)))));
  }

  if (v.crisis && v.crisisPhase === 'decision') {
    kids.push(el('h3', {}, v.you.vote ? TR('ui.votedHint') : TR('ui.castVote')));
    for (const o of v.crisis.options) {
      const b = btn((v.you.vote === o.id ? '✓ ' : '') + TR(o.title), () => room?.send('vote', { optionId: o.id }), { primary: v.you.vote === o.id });
      b.className = (b.className + ' opt').trim();
      kids.push(b);
    }
    const votedCount = v.players.filter((p) => p.hasVoted).length;
    kids.push(el('p', { className: 'muted' }, TR('ui.votedCount', { n: votedCount, total: v.players.length })));
  } else if (v.crisis && v.crisisPhase === 'briefing') {
    kids.push(el('p', { className: 'muted' }, TR('ui.briefingHint')));
    kids.push(btn(TR('ui.readySkip'), () => room?.send('continue', {})));
  } else if (v.crisisPhase === 'deliberation') {
    kids.push(el('h3', {}, TR('ui.discuss')));
  } else if (v.crisisPhase === 'interlude') {
    kids.push(btn(TR('ui.continue'), () => room?.send('continue', {}), { primary: true }));
  }

  kids.push(el('div', { className: 'row' }, ...v.players.map((p) =>
    el('span', { className: 'pill' + (p.id === v.you.id ? ' you' : '') }, `${p.nickname}${p.hasVoted ? ' ✓' : ''}${p.connected ? '' : ' (' + TR('ui.offline') + ')'}`))));

  kids.push(el('h3', {}, TR('ui.talk')));
  kids.push(el('div', { className: 'row' },
    ...['agree', 'disagree', 'warning', 'need_info'].map((k) => btn(TR(`signal.${k}`), () => room?.send('signal', { kind: k })))));
  const chatIn = el('input', { placeholder: TR('ui.saySomething') }) as HTMLInputElement;
  const sendChat = () => {
    if (chatIn.value.trim()) {
      room?.send('chat', { text: chatIn.value.trim() });
      chatIn.value = '';
    }
  };
  chatIn.onkeydown = (e) => {
    if ((e as KeyboardEvent).key === 'Enter') sendChat();
  };
  kids.push(el('div', { className: 'row' }, chatIn, btn(TR('ui.send'), sendChat)));
  const logLines = chatLog.slice(-40).map((c) =>
    c.kind === 'chat' ? `${c.name}: ${c.text}` : TR('ui.signalMsg', { name: c.name, kind: TR(`signal.${c.sig}`) }));
  kids.push(el('div', { id: 'log' }, logLines.join('\n')));

  app.replaceChildren(...kids);
}

function renderEnding(v: ClientView): void {
  const kindLabel = v.ending ? TR(`ending.label.${v.ending.kind}`) : '?';
  app.replaceChildren(
    el('h1', {}, TR('ui.endingHeader', { kind: kindLabel })),
    el('p', {}, v.ending ? TR(v.ending.text) : ''),
    meterRow(v),
    el('h3', {}, TR('ui.theStory')),
    el('div', { id: 'log' }, v.log.map((e) => renderLog(e, locale)).join('\n')),
    el('h3', {}, TR('ui.privateGoals')),
    el('div', {}, ...(v.goalResults ?? []).map((g) =>
      el('div', { className: 'card' },
        el('b', {}, `${g.nickname} — ${TR(g.goalTitle)}: `),
        el('span', {}, `${TR(`goal.outcome.${g.outcome}`)} — ${renderLog({ key: g.noteKey, params: g.noteParams }, locale)}`)))),
    el('div', { className: 'row' }, btn(TR('ui.backHome'), () => void room?.leave(), { primary: true })),
  );
}

function render(): void {
  if (!room || !view) {
    renderHome();
    return;
  }
  const v = view;
  if (v.ended) renderEnding(v);
  else if (v.stage === 'lobby') renderLobby(v);
  else renderMatch(v);
}

window.setInterval(() => {
  if (room && view && !view.ended && view.phaseEndsAt) render();
}, 1000);

applyDir();
buildLangBar();
render();
