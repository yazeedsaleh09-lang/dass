// Ugly-but-functional v0.1 web client. Plain DOM + colyseus.js.
// Reuses the SAME server + rules. No polish/animation/audio (per v0.1 rules).
import { Client, type Room } from 'colyseus.js';
import type { ClientView } from '@crisis/shared';

// CRISIS_SERVER_URL is injected at build time by esbuild (see apps/web/build.mjs).
// Priority: ?server= override → build-time env → same-host dev default.
declare const CRISIS_SERVER_URL: string;
const params = new URLSearchParams(location.search);
const BUILT_IN = typeof CRISIS_SERVER_URL !== 'undefined' && CRISIS_SERVER_URL ? CRISIS_SERVER_URL : '';
function defaultServer(): string {
  if (BUILT_IN) return BUILT_IN; // baked at build (e.g. Netlify + separate server)
  const h = location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'ws://localhost:2567'; // local dev
  // hosted same-origin: the server also serves this page (single-host deploy)
  return `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;
}
const SERVER = params.get('server') ?? defaultServer();
let lastError = '';

const app = document.getElementById('app')!;
let client: Client | null = null;
let room: Room | null = null;
let view: ClientView | null = null;
const chatLog: string[] = [];
let timerHandle: number | undefined;

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

function connectHandlers(r: Room): void {
  r.onMessage('state', (v: ClientView) => {
    view = v;
    render();
  });
  r.onMessage('chat', (m: { name: string; text: string }) => {
    chatLog.push(`${m.name}: ${m.text}`);
    render();
  });
  r.onMessage('signal', (m: { name: string; kind: string }) => {
    chatLog.push(`— ${m.name} signals: ${m.kind.replace('_', ' ')}`);
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
  const r = await client.create('match', { nickname });
  room = r;
  connectHandlers(r);
}
async function joinRoom(code: string, nickname: string): Promise<void> {
  if (!code) throw new Error('Enter a room code');
  client = new Client(SERVER);
  const r = await client.joinById(code, { nickname });
  room = r;
  connectHandlers(r);
}
/** Run a connect action, surfacing failures (server down / bad code) instead of crashing. */
function attempt(p: Promise<void>): void {
  lastError = '';
  void p.catch((e: unknown) => {
    lastError = `Could not connect (server: ${SERVER}). ${(e as Error)?.message ?? String(e)}`;
    render();
  });
}

function renderHome(): void {
  const nick = el('input', { id: 'nick', placeholder: 'Your name' }) as HTMLInputElement;
  nick.value = localStorage.getItem('nick') ?? '';
  const code = el('input', { id: 'code', placeholder: 'Room code' }) as HTMLInputElement;
  const getNick = () => {
    const n = nick.value.trim() || 'Player';
    localStorage.setItem('nick', n);
    return n;
  };
  const banner: Node[] = lastError ? [el('p', { className: 'err' }, lastError)] : [];
  app.replaceChildren(
    ...banner,
    el('h1', {}, 'Crisis — v0.1 prototype'),
    el('p', { className: 'muted' }, `server: ${SERVER} · ugly on purpose · needs 4+ players`),
    el('div', { className: 'card' },
      el('h3', {}, 'Host a room'),
      nick,
      el('div', { className: 'row' }, btn('Create room', () => attempt(createRoom(getNick())), { primary: true })),
    ),
    el('div', { className: 'card' },
      el('h3', {}, 'Join a room'),
      code,
      el('div', { className: 'row' }, btn('Join', () => attempt(joinRoom(code.value.trim(), getNick()))),
      ),
    ),
  );
}

function meterRow(v: ClientView): HTMLElement {
  const m = v.meters;
  const one = (label: string, val: number) => el('span', { className: 'meter' }, el('span', { className: 'muted' }, label + ' '), el('b', {}, String(val)));
  return el('div', { className: 'meters' }, one('Stability', m.stability), one('Resources', m.resources), one('Cohesion', m.cohesion));
}

function timeLeft(v: ClientView): string {
  if (!v.phaseEndsAt) return '';
  const s = Math.max(0, Math.round((v.phaseEndsAt - Date.now()) / 1000));
  return ` · ${s}s`;
}

function renderLobby(v: ClientView): void {
  const me = v.players.find((p) => p.id === v.you.id);
  const readyCount = v.players.filter((p) => p.ready).length;
  const canStart = !!me?.isHost && v.players.length >= 4 && readyCount >= 4;
  app.replaceChildren(
    el('h2', {}, `Lobby — ${v.players.length} player(s)`),
    el('p', { className: 'muted' }, `Room code: ${room?.roomId ?? ''} — share it. Need 4 ready to start.`),
    el('div', {}, ...v.players.map((p) =>
      el('div', { className: 'pill' + (p.id === v.you.id ? ' you' : '') }, `${p.nickname}${p.isHost ? ' 👑' : ''} ${p.ready ? '✓ready' : '…'}${p.connected ? '' : ' (offline)'}`),
    )),
    el('div', { className: 'row' },
      btn(me?.ready ? 'Unready' : 'Ready', () => room?.send('ready', { ready: !me?.ready }), { primary: !me?.ready }),
      btn(`Start (${readyCount}/4)`, () => room?.send('start', {}), { primary: true, disabled: !canStart }),
      btn('Leave', () => void room?.leave()),
    ),
  );
}

function renderMatch(v: ClientView): void {
  const kids: Node[] = [];
  kids.push(el('h2', {}, `Crisis ${v.crisisIndex + 1}/${v.playlistLength}${v.crisis?.tier === 'final' ? ' — FINAL' : ''} · ${v.crisisPhase}${timeLeft(v)}`));
  kids.push(meterRow(v));

  if (v.you.goalTitle) {
    kids.push(el('div', { className: 'card you' }, el('b', {}, 'Your private goal: '), `${v.you.goalTitle} — ${v.you.goalDescription ?? ''}`));
  }

  if (v.crisis) {
    kids.push(el('div', { className: 'card' }, el('b', {}, v.crisis.title + ': '), v.crisis.publicBrief));
  }

  // Your private info cards
  if (v.you.cards.length) {
    const cardEls = v.you.cards.map((c) => {
      const wrap = el('div', {}, el('span', { className: 'tag' }, `[${c.reliability}] `), c.content, ' ');
      if (v.crisisPhase === 'deliberation') {
        wrap.append(btn('Reveal to group', () => room?.send('reveal', { cardId: c.id })));
      }
      return wrap;
    });
    kids.push(el('div', { className: 'card' }, el('b', {}, 'Your private info:'), ...cardEls));
  } else {
    kids.push(el('div', { className: 'muted' }, 'You hold no private info this crisis.'));
  }

  // Revealed info (public)
  if (v.revealedCards.length) {
    kids.push(el('div', { className: 'card' }, el('b', {}, 'Revealed to the group:'),
      ...v.revealedCards.map((r) => el('div', {}, el('span', { className: 'tag' }, `[${r.reliability}] `), r.content))));
  }

  // Options / voting
  if (v.crisis && v.crisisPhase === 'decision') {
    const voted = v.you.vote;
    kids.push(el('h3', {}, voted ? 'You voted. (change until the timer ends)' : 'Cast your vote:'));
    for (const o of v.crisis.options) {
      const b = btn((voted === o.id ? '✓ ' : '') + o.title, () => room?.send('vote', { optionId: o.id }), { primary: voted === o.id });
      b.className += ' opt';
      kids.push(b);
    }
    const votedCount = v.players.filter((p) => p.hasVoted).length;
    kids.push(el('p', { className: 'muted' }, `${votedCount}/${v.players.length} voted`));
  } else if (v.crisis && v.crisisPhase === 'briefing') {
    kids.push(el('p', { className: 'muted' }, 'Read your info. Discussion opens next.'));
    kids.push(btn('Ready (skip wait)', () => room?.send('continue', {})));
  } else if (v.crisisPhase === 'deliberation') {
    kids.push(el('h3', {}, 'Discuss'));
  } else if (v.crisisPhase === 'interlude') {
    kids.push(btn('Continue', () => room?.send('continue', {}), { primary: true }));
  }

  // Players
  kids.push(el('div', { className: 'row' }, ...v.players.map((p) =>
    el('span', { className: 'pill' + (p.id === v.you.id ? ' you' : '') }, `${p.nickname}${p.hasVoted ? ' ✓' : ''}${p.connected ? '' : ' (off)'}`))));

  // Chat + signals
  kids.push(el('h3', {}, 'Talk'));
  kids.push(el('div', { className: 'row' },
    ...['agree', 'disagree', 'warning', 'need_info'].map((k) => btn(k.replace('_', ' '), () => room?.send('signal', { kind: k })))));
  const chatIn = el('input', { placeholder: 'say something…' }) as HTMLInputElement;
  chatIn.onkeydown = (e) => {
    if ((e as KeyboardEvent).key === 'Enter' && chatIn.value.trim()) {
      room?.send('chat', { text: chatIn.value.trim() });
      chatIn.value = '';
    }
  };
  kids.push(el('div', { className: 'row' }, chatIn, btn('Send', () => {
    if (chatIn.value.trim()) { room?.send('chat', { text: chatIn.value.trim() }); chatIn.value = ''; }
  })));
  kids.push(el('div', { id: 'log' }, chatLog.slice(-40).join('\n')));

  app.replaceChildren(...kids);
}

function renderEnding(v: ClientView): void {
  app.replaceChildren(
    el('h1', {}, `Ending: ${v.ending?.kind.toUpperCase() ?? '?'}`),
    el('p', {}, v.ending?.text ?? ''),
    meterRow(v),
    el('h3', {}, 'The story'),
    el('div', { id: 'log' }, v.log.join('\n')),
    el('h3', {}, 'Private goals'),
    el('div', {}, ...(v.goalResults ?? []).map((g) =>
      el('div', { className: 'card' }, el('b', {}, `${g.nickname} — ${g.goalTitle}: `), el('span', {}, `${g.outcome.toUpperCase()} — ${g.note}`)))),
    el('div', { className: 'row' }, btn('Back to home', () => void room?.leave(), { primary: true })),
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

// live timer refresh during timed phases
timerHandle = window.setInterval(() => {
  if (room && view && !view.ended && view.phaseEndsAt) render();
}, 1000);
void timerHandle;

render();
