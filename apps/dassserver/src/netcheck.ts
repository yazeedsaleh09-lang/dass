// Standalone networked verification for دسّ (run outside vitest to avoid worker/WS clashes).
// Boots a real Colyseus server + 4 real clients, plays a full game, asserts sync + the
// SECURITY invariant (a locked action never leaks to another client pre-reveal). Exits 0/1.
//   npm run dassnetcheck

import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client, type Room } from 'colyseus.js';
import { DassRoom } from './room.js';
import type { ClientView } from '@dass/domain';

const PORT = 2601;
const ENDPOINT = `ws://localhost:${PORT}`;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
async function waitUntil(cond: () => boolean, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (!cond() && Date.now() - start < timeoutMs) await wait(40);
}

let failed = false;
function check(ok: boolean, msg: string): void {
  if (ok) console.log('  ok   ✓ ' + msg);
  else {
    failed = true;
    console.error('  FAIL ✗ ' + msg);
  }
}

async function main(): Promise<void> {
  const gs = new Server({ transport: new WebSocketTransport({}) });
  gs.define('dass', DassRoom);
  await gs.listen(PORT);
  console.log(`server up on ${ENDPOINT}`);

  const rooms: Room[] = [];
  const latest = new Map<string, ClientView>();
  const round1Lock = new Map<string, ClientView>(); // round-1 LOCK-phase view per client
  const ended = new Map<string, ClientView>();
  const fast = { DECLARE: 400, REACTION_WINDOW: 150, LOCK: 500, REVEAL: 120, VAULT_UPDATE: 120 };
  let sawDassa = false;

  try {
    const host = new Client(ENDPOINT);
    const hostRoom = await host.create<unknown>('dass', { nickname: 'Host', phaseMs: fast, minPlayers: 4 });
    rooms.push(hostRoom);
    for (let i = 2; i <= 4; i++) {
      const c = new Client(ENDPOINT);
      rooms.push(await c.joinById<unknown>(hostRoom.roomId, { nickname: `P${i}` }));
    }
    console.log('4 clients in room', hostRoom.roomId);

    const betrayer = rooms[0]!.sessionId;
    const betrayTarget = rooms[1]!.sessionId;

    for (const r of rooms) {
      r.onMessage('state', (v: ClientView) => {
        latest.set(r.sessionId, v);
        if (v.phase === 'LOCK' && v.round === 1) round1Lock.set(r.sessionId, v);

        if (v.phase === 'DECLARE' && !v.you.declared) {
          if (r.sessionId === betrayer) {
            void r.send('declare', { kind: 'back', target: betrayTarget }); // public promise
          } else {
            const other = v.players.find((p) => p.id !== r.sessionId);
            if (other) void r.send('declare', { kind: 'back', target: other.id });
          }
        }
        if (v.phase === 'LOCK' && !v.you.locked && v.you.declared) {
          if (r.sessionId === betrayer) {
            void r.send('lock', { kind: 'dump', target: betrayTarget }); // SECRET betrayal
          } else {
            void r.send('lock', v.you.declared); // honor the public promise
          }
        }
        if (v.reveal?.entries.some((e) => e.isDassa)) sawDassa = true;
        if (v.ended) ended.set(r.sessionId, v);
      });
    }

    for (const r of rooms) void r.send('ready', { ready: true });
    await waitUntil(
      () => (latest.get(rooms[0]!.sessionId)?.players.filter((p) => p.connected).length ?? 0) === 4,
      3000,
    );
    void rooms[0]!.send('start', {});
    await waitUntil(() => ended.size === rooms.length, 15000);

    // --- sync / flow ---
    check(ended.size === 4, 'all 4 clients reached GAME_END');
    const ev = [...ended.values()][0];
    check(!!ev && ev.winnerIds.length >= 1, 'a winner was determined (' + ev?.winnerIds.join(',') + ')');
    check(!!ev && ev.players.some((p) => p.vault > 0), 'at least one Vault banked value');
    check(sawDassa, 'a dassة (broken promise) was revealed during play');

    // --- SECURITY: the locked secret must not leak pre-reveal ---
    check(round1Lock.size >= 3, 'captured round-1 LOCK views');
    const betrayerLock = round1Lock.get(betrayer);
    check(betrayerLock?.you.locked?.kind === 'dump', 'betrayer sees its OWN locked action');
    let leaked = false;
    for (const [sid, v] of round1Lock) {
      if (sid === betrayer) continue;
      // round 1 has no public history yet; the only 'dump' in existence is the betrayer's SECRET.
      if (JSON.stringify(v).includes('dump')) leaked = true;
    }
    check(!leaked, "another player's locked action is NOT in any other client's frame pre-reveal");

    for (const r of rooms) await r.leave();
    console.log('\n' + (failed ? 'DASS NETWORKED CHECK: FAILED' : 'DASS NETWORKED CHECK: PASSED'));
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
