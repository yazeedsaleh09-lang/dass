// Headless edge-case QA (§B.2) — verifies behaviors we must not merely assume:
//   • a player who never acts (timeout) ABSTAINS and is NOT eliminated; the game still ends.
//   • a client joining AFTER start becomes a SPECTATOR (not seated as a 5th player).
//   npm run dassqacheck

import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client, type Room } from 'colyseus.js';
import { DassRoom } from './room.js';
import type { ClientView } from '@dass/domain';

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
      r.onMessage('state', (v: ClientView) => {
        latest.set(r.sessionId, v);
        if (v.ended) ended.set(r.sessionId, v);
        if (idx === silent) return; // the silent player never declares/locks
        if (v.phase === 'DECLARE' && !v.you.declared) {
          const o = v.players.find((p) => p.id !== r.sessionId);
          if (o) void r.send('declare', { kind: 'back', target: o.id });
        }
        if (v.phase === 'LOCK' && !v.you.locked && v.you.declared) void r.send('lock', v.you.declared);
      });
      r.onMessage('sessionlog', () => {});
    });

    for (const r of rooms) void r.send('ready', { ready: true });
    await waitUntil(() => (latest.get(rooms[0]!.sessionId)?.players.filter((p) => p.connected).length ?? 0) === 4, 3000);
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
    check(!!ev && ev.players.length === 4, 'roster stayed 4 — the late joiner was NOT seated (spectator)');
    check(!!ev && ev.players.some((p) => p.id === rooms[silent]!.sessionId), 'the silent player is still on the board (not eliminated)');
    check(!!ev && ev.winnerIds.length >= 1, 'a winner was still determined');
    const sv = specView as ClientView | null;
    check(!!sv && sv.players.length === 4, 'the spectator sees the 4 players (public view), not itself as a 5th');

    for (const r of rooms) await r.leave();
    await specRoom.leave();
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
