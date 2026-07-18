// Headless edge-case QA (§B.2) — verifies behaviors we must not merely assume:
//   • a player who never acts (timeout) ABSTAINS and is NOT eliminated; the game still ends.
//   • a client joining AFTER start becomes a SPECTATOR (not seated as a 5th player).
//   npm run dassqacheck

import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client, type Room } from 'colyseus.js';
import { DassRoom } from './room.js';
import type { ClientView } from '@dass/domain';

process.env.DASS_ALLOW_TEST_CONFIG = '1';

const PORT = 2602;
const ENDPOINT = `ws://localhost:${PORT}`;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
async function waitUntil(cond: () => boolean, ms: number): Promise<void> {
  const s = Date.now();
  while (!cond() && Date.now() - s < ms) await wait(40);
}
let failed = false;
const check = (ok: boolean, m: string) => {
  console.log((ok ? '  ok   ✓ ' : '  FAIL ✗ ') + m);
  if (!ok) failed = true;
};

async function main(): Promise<void> {
  const gs = new Server({ transport: new WebSocketTransport({}) });
  gs.define('dass', DassRoom);
  await gs.listen(PORT);

  const rooms: Room[] = [];
  const latest = new Map<string, ClientView>();
  const ended = new Map<string, ClientView>();
  const fast = { DECLARE: 350, REACTION_WINDOW: 120, LOCK: 350, REVEAL: 100, VAULT_UPDATE: 100 };
  const silent = 3; // rooms[3] never acts

  try {
    const host = new Client(ENDPOINT);
    const hostRoom = await host.create<unknown>('dass', { phaseMs: fast, minPlayers: 4 });
    rooms.push(hostRoom);
    for (let i = 2; i <= 4; i++) rooms.push(await new Client(ENDPOINT).joinById<unknown>(hostRoom.roomId, { nickname: `P${i}` }));

    rooms.forEach((r, idx) => {
      r.onMessage('host', () => {});
      r.onMessage('state', (v: ClientView) => {
        latest.set(r.sessionId, v);
        if (v.ended) ended.set(r.sessionId, v);
        if (idx === silent) return; // the silent player never declares/locks
        if (v.phase === 'DECLARE' && !v.you.declared) {
          const o = v.players.find((p) => p.id !== v.you.id);
          if (o) void r.send('declare', { kind: 'back', target: o.id });
        }
        if (v.phase === 'LOCK' && !v.you.locked && v.you.declared) void r.send('lock', v.you.declared);
      });
      r.onMessage('sessionlog', () => {});
    });

    for (const r of rooms) void r.send('ready', { ready: true });
    await waitUntil(() => (latest.get(rooms[0]!.sessionId)?.players.filter((p) => p.ready && p.connected).length ?? 0) === 4, 3000);
    void rooms[0]!.send('start', {});

    // once in play, a 5th client joins → must become a spectator, not a player
    await waitUntil(() => (latest.get(rooms[0]!.sessionId)?.phase ?? 'LOBBY') !== 'LOBBY', 4000);
    const spec = new Client(ENDPOINT);
    const specRoom = await spec.joinById<unknown>(hostRoom.roomId, { nickname: 'LATE' });
    let specView: ClientView | null = null;
    specRoom.onMessage('state', (v: ClientView) => (specView = v));

    await waitUntil(() => ended.size >= 4, 12000);
    await wait(200);

    check(ended.size >= 4, 'the 4 seated players reached GAME_END despite one silent player');
    const ev = [...ended.values()][0];
    const silentPid = latest.get(rooms[silent]!.sessionId)?.you.id;
    check(!!ev && ev.players.length === 4, 'roster stayed 4 — the late joiner was NOT seated (spectator)');
    check(!!ev && !!silentPid && ev.players.some((p) => p.id === silentPid), 'the silent player is still on the board (not eliminated)');
    check(!!ev && ev.winnerIds.length >= 1, 'a winner was still determined');
    const sv = specView as ClientView | null;
    check(!!sv && sv.players.length === 4, 'the spectator sees the 4 players (public view), not itself as a 5th');

    // Same-crew replay returns connected players to a fresh, unready lobby.
    void rooms[0]!.send('restart', {});
    await waitUntil(() => latest.get(rooms[0]!.sessionId)?.phase === 'LOBBY', 2000);
    const replay = latest.get(rooms[0]!.sessionId);
    check(!!replay && replay.players.length === 4, 'same-crew replay returns all connected players to the lobby');
    check(!!replay && replay.players.every((p) => p.ready === false), 'replay resets readiness instead of reusing stale state');

    for (const r of rooms) await r.leave();
    await specRoom.leave();

    // A TV must not consume one of the 8 player seats, and player nine is rejected.
    const tvRoom = await new Client(ENDPOINT).create<unknown>('dass', { role: 'tv' });
    let tvLobby: ClientView | null = null;
    tvRoom.onMessage('state', (v: ClientView) => (tvLobby = v));
    tvRoom.onMessage('host', () => {});
    tvRoom.onMessage('sessionlog', () => {});
    const eight: Room[] = [];
    for (let i = 1; i <= 8; i++) {
      const joined = await new Client(ENDPOINT).joinById<unknown>(tvRoom.roomId, { nickname: '12345678901234567890' });
      joined.onMessage('state', () => {});
      joined.onMessage('sessionlog', () => {});
      eight.push(joined);
    }
    await waitUntil(() => (tvLobby as ClientView | null)?.players.length === 8, 2000);
    let ninthRejected = false;
    try {
      await new Client(ENDPOINT).joinById<unknown>(tvRoom.roomId, { nickname: 'P9' });
    } catch {
      ninthRejected = true;
    }
    check(eight.length === 8, 'TV plus 8 real player clients fit in one room');
    check(ninthRejected, 'the ninth player is rejected by the server');
    const uniqueNames = new Set((tvLobby as ClientView | null)?.players.map((p) => p.nickname.toLocaleLowerCase('ar')) ?? []);
    check(uniqueNames.size === 8, 'duplicate 20-character nicknames receive unique visible suffixes');
    for (const r of eight) await r.leave();
    await tvRoom.leave();

    // Client-provided room tuning is ignored unless the server explicitly enables test config.
    delete process.env.DASS_ALLOW_TEST_CONFIG;
    const hardened = await new Client(ENDPOINT).create<unknown>('dass', { nickname: 'Solo', minPlayers: 1, phaseMs: fast });
    let hardenedView: ClientView | null = null;
    hardened.onMessage('state', (v: ClientView) => (hardenedView = v));
    hardened.onMessage('host', () => {});
    hardened.onMessage('sessionlog', () => {});
    void hardened.send('ready', { ready: true });
    void hardened.send('start', {});
    await wait(300);
    check((hardenedView as ClientView | null)?.phase === 'LOBBY', 'clients cannot lower production minimum players or phase timers');
    await hardened.leave();

    // Host ownership does NOT migrate to a player when the host disconnects (no auto-promote).
    const migrationClient = new Client(ENDPOINT);
    const migrationHost = await migrationClient.create<unknown>('dass', { nickname: 'Host' });
    migrationHost.onMessage('state', () => {});
    migrationHost.onMessage('host', () => {});
    migrationHost.onMessage('sessionlog', () => {});
    const originalHostId = migrationHost.sessionId;
    const successorClient = new Client(ENDPOINT);
    const successor = await successorClient.joinById<unknown>(migrationHost.roomId, { nickname: 'Next', playerToken: 'succ' });
    let successorView: ClientView | null = null;
    successor.onMessage('state', (v: ClientView) => (successorView = v));
    successor.onMessage('host', () => {});
    successor.onMessage('sessionlog', () => {});
    await migrationHost.leave(true);
    await wait(400);
    check((successorView as ClientView | null)?.hostId !== successor.sessionId, 'a remaining player is NOT auto-promoted to host on host disconnect');
    check((successorView as ClientView | null)?.hostId === originalHostId, 'host ownership stays with the (now-absent) creator, awaiting token reclaim');
    void successor.send('start', {});
    await wait(300);
    check((successorView as ClientView | null)?.phase === 'LOBBY', 'the non-host survivor still cannot start the game');
    await successor.leave();

    // An unconsented drop is resumed by the DURABLE token onto the same seat (a fresh socket
    // with the same pid), not by a Colyseus reconnection token.
    const reconnectClient = new Client(ENDPOINT);
    const beforeDrop = await reconnectClient.create<unknown>('dass', { nickname: 'Reconnect', playerToken: 'recon-pt' });
    let beforeView: ClientView | null = null;
    beforeDrop.onMessage('state', (v: ClientView) => (beforeView = v));
    beforeDrop.onMessage('host', () => {});
    beforeDrop.onMessage('sessionlog', () => {});
    beforeDrop.send('sync', {});
    await waitUntil(() => !!(beforeView as ClientView | null)?.you.id, 2000);
    const originalPid = (beforeView as ClientView | null)?.you.id;
    const originalSessionId = beforeDrop.sessionId;
    await beforeDrop.leave(false);
    await wait(200);
    const afterClient = new Client(ENDPOINT);
    const afterDrop = await afterClient.joinById<unknown>(beforeDrop.roomId, { playerToken: 'recon-pt' });
    let reconnectedView: ClientView | null = null;
    afterDrop.onMessage('state', (v: ClientView) => (reconnectedView = v));
    afterDrop.onMessage('host', () => {});
    afterDrop.onMessage('sessionlog', () => {});
    afterDrop.send('sync', {});
    await waitUntil(() => !!(reconnectedView as ClientView | null)?.you.id, 2000);
    check((reconnectedView as ClientView | null)?.you.id === originalPid, 'token reconnect preserves the durable seat identity (pid)');
    check(afterDrop.sessionId !== originalSessionId, 'the reconnect uses a new socket (identity is not the sessionId)');
    check((reconnectedView as ClientView | null)?.players.length === 1, 'reconnection does not duplicate the player');
    await afterDrop.leave();
    console.log('\n' + (failed ? 'DASS QA CHECK: FAILED' : 'DASS QA CHECK: PASSED'));
  } finally {
    await gs.gracefullyShutdown(false);
  }
}

main()
  .then(() => process.exit(failed ? 1 : 0))
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
