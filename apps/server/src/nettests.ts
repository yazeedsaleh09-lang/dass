// Multiplayer edge-case tests (standalone; real server + real clients). Exits 0/1.
//   npm run nettests
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client, type Room } from 'colyseus.js';
import { MatchRoom } from './room.js';
import type { ClientView } from '@crisis/shared';

const PORT = 2600;
const ENDPOINT = `ws://localhost:${PORT}`;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
async function waitUntil(cond: () => boolean, timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  while (!cond() && Date.now() - start < timeoutMs) await wait(30);
  return cond();
}
let failures = 0;
function check(ok: boolean, msg: string): void {
  if (ok) console.log('  ok  ✓ ' + msg);
  else {
    failures++;
    console.error('  FAIL ✗ ' + msg);
  }
}

interface Wired {
  room: Room;
  last(): ClientView | undefined;
  ended(): boolean;
}
function wire(room: Room, autoVote = true): Wired {
  let last: ClientView | undefined;
  let ended = false;
  room.onMessage('state', (v: ClientView) => {
    last = v;
    if (autoVote && v.stage !== 'lobby' && v.crisisPhase === 'decision' && v.crisis && !v.you.vote) {
      const o = v.crisis.options[0];
      if (o) void room.send('vote', { optionId: o.id });
    }
    if (v.ended) ended = true;
  });
  return { room, last: () => last, ended: () => ended };
}
function iAmHost(w: Wired): boolean {
  const v = w.last();
  return v ? (v.players.find((p) => p.id === v.you.id)?.isHost ?? false) : false;
}
const fast = { briefing: 120, deliberation: 200, decision: 400, resolution: 80, interlude: 80 };

async function scenarioHostMigration(): Promise<void> {
  console.log('\n[host migration] host leaves the lobby; another player can start');
  const clients: Client[] = [];
  const w: Wired[] = [];
  try {
    const c0 = new Client(ENDPOINT);
    clients.push(c0);
    const host = await c0.create<unknown>('match', { nickname: 'Host', phaseMs: fast, minPlayers: 4 });
    w.push(wire(host));
    for (let i = 2; i <= 5; i++) {
      const c = new Client(ENDPOINT);
      clients.push(c);
      w.push(wire(await c.joinById<unknown>(host.roomId, { nickname: `P${i}` })));
    }
    await waitUntil(() => (w[1]!.last()?.players.length ?? 0) === 5, 2000);
    check(iAmHost(w[0]!), 'creator is host');
    await w[0]!.room.leave(true); // host leaves
    const migrated = await waitUntil(() => iAmHost(w[1]!), 2500);
    check(migrated, 'host crown migrated to a remaining player');
    for (const x of w.slice(1)) void x.room.send('ready', { ready: true });
    await waitUntil(() => (w[1]!.last()?.players.filter((p) => p.ready).length ?? 0) >= 4, 2500);
    void w[1]!.room.send('start', {});
    const done = await waitUntil(() => w.slice(1).every((x) => x.ended()), 9000);
    check(done, 'match ran to an ending under the migrated host');
    for (const x of w.slice(1)) await x.room.leave(true);
  } catch (e) {
    check(false, 'host-migration scenario threw: ' + (e as Error).message);
  }
}

async function scenarioBelowMinimum(): Promise<void> {
  console.log('\n[below minimum] a player leaves mid-match; the rest still finish');
  const w: Wired[] = [];
  try {
    const c0 = new Client(ENDPOINT);
    const host = await c0.create<unknown>('match', { nickname: 'Host', phaseMs: { ...fast, briefing: 500 }, minPlayers: 4 });
    w.push(wire(host));
    for (let i = 2; i <= 4; i++) {
      const c = new Client(ENDPOINT);
      w.push(wire(await c.joinById<unknown>(host.roomId, { nickname: `P${i}` })));
    }
    await waitUntil(() => (w[0]!.last()?.players.length ?? 0) === 4, 2000);
    for (const x of w) void x.room.send('ready', { ready: true });
    await waitUntil(() => (w[0]!.last()?.players.filter((p) => p.ready).length ?? 0) === 4, 2000);
    void w[0]!.room.send('start', {});
    await waitUntil(() => w[3]!.last()?.stage !== 'lobby', 3000);
    await w[3]!.room.leave(true); // one player quits mid-match
    const done = await waitUntil(() => w.slice(0, 3).every((x) => x.ended()), 10000);
    check(done, 'remaining 3 players reached an ending (no stall, no elimination)');
    for (const x of w.slice(0, 3)) await x.room.leave(true);
  } catch (e) {
    check(false, 'below-minimum scenario threw: ' + (e as Error).message);
  }
}

async function scenarioNonHostStart(): Promise<void> {
  console.log('\n[start gating] only the host can start');
  const w: Wired[] = [];
  try {
    const c0 = new Client(ENDPOINT);
    const host = await c0.create<unknown>('match', { nickname: 'Host', phaseMs: fast, minPlayers: 4 });
    w.push(wire(host));
    for (let i = 2; i <= 4; i++) {
      const c = new Client(ENDPOINT);
      w.push(wire(await c.joinById<unknown>(host.roomId, { nickname: `P${i}` })));
    }
    await waitUntil(() => (w[0]!.last()?.players.length ?? 0) === 4, 2000);
    for (const x of w) void x.room.send('ready', { ready: true });
    await waitUntil(() => (w[0]!.last()?.players.filter((p) => p.ready).length ?? 0) === 4, 2000);
    void w[1]!.room.send('start', {}); // NON-host tries to start
    await wait(600);
    check(w[0]!.last()?.stage === 'lobby', 'non-host start was ignored (still in lobby)');
    void w[0]!.room.send('start', {}); // host starts
    const done = await waitUntil(() => w.every((x) => x.ended()), 9000);
    check(done, 'host start worked and the match finished');
    for (const x of w) await x.room.leave(true);
  } catch (e) {
    check(false, 'start-gating scenario threw: ' + (e as Error).message);
  }
}

async function scenarioReconnect(): Promise<void> {
  console.log('\n[reconnect] a dropped player rejoins and the match completes');
  try {
    const slowStart = { briefing: 1600, deliberation: 400, decision: 600, resolution: 120, interlude: 120 };
    const c0 = new Client(ENDPOINT);
    const host = await c0.create<unknown>('match', { nickname: 'Host', phaseMs: slowStart, minPlayers: 4 });
    const w0 = wire(host);
    const others: { client: Client; w: Wired }[] = [];
    for (let i = 2; i <= 4; i++) {
      const c = new Client(ENDPOINT);
      others.push({ client: c, w: wire(await c.joinById<unknown>(host.roomId, { nickname: `P${i}` })) });
    }
    await waitUntil(() => (w0.last()?.players.length ?? 0) === 4, 2000);
    void host.send('ready', { ready: true });
    for (const o of others) void o.w.room.send('ready', { ready: true });
    await waitUntil(() => (w0.last()?.players.filter((p) => p.ready).length ?? 0) === 4, 2000);
    void host.send('start', {});
    await waitUntil(() => w0.last()?.stage !== 'lobby', 3000); // in briefing

    const drop = others[2]!; // P4
    const token = drop.w.room.reconnectionToken;
    await drop.w.room.leave(false); // unconsented drop
    await wait(250);
    const rejoinedRoom = await drop.client.reconnect(token);
    const w4b = wire(rejoinedRoom);

    const tracked: Wired[] = [w0, others[0]!.w, others[1]!.w, w4b];
    const done = await waitUntil(() => tracked.every((x) => x.ended()), 12000);
    check(done, 'dropped player reconnected and all clients reached an ending');
    for (const x of tracked) await x.room.leave(true);
  } catch (e) {
    check(false, 'reconnect scenario threw: ' + (e as Error).message);
  }
}

async function main(): Promise<void> {
  const gs = new Server({ transport: new WebSocketTransport({}) });
  gs.define('match', MatchRoom);
  await gs.listen(PORT);
  console.log('edge-case server up on ' + ENDPOINT);
  try {
    await scenarioHostMigration();
    await scenarioBelowMinimum();
    await scenarioNonHostStart();
    await scenarioReconnect();
  } finally {
    await gs.gracefullyShutdown(false);
  }
  console.log('\n' + (failures === 0 ? 'ALL EDGE-CASE TESTS PASSED' : `EDGE-CASE TESTS: ${failures} FAILURE(S)`));
}

main()
  .then(() => process.exit(failures === 0 ? 0 : 1))
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
