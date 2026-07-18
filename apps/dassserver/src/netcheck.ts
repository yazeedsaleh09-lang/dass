// Standalone networked verification for دسّ (run outside vitest to avoid worker/WS clashes).
// Boots a real Colyseus server + 4 real clients, plays a full game, asserts sync + the
// SECURITY invariant (a locked action never leaks to another client pre-reveal). Exits 0/1.
//   npm run dassnetcheck

import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client, type Room } from 'colyseus.js';
import { DassRoom } from './room.js';
import type { ClientView } from '@dass/domain';

process.env.DASS_ALLOW_TEST_CONFIG = '1';

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
  let leakedBeforeEnd = false;
  let reactionChangeAccepted = false;

  try {
    const host = new Client(ENDPOINT);
    const hostRoom = await host.create<unknown>('dass', { nickname: 'Host', phaseMs: fast, minPlayers: 4 });
    hostRoom.onMessage('state', () => {});
    hostRoom.onMessage('host', () => {});
    hostRoom.onMessage('sessionlog', () => {});
    rooms.push(hostRoom);
    for (let i = 2; i <= 4; i++) {
      const c = new Client(ENDPOINT);
      const joined = await c.joinById<unknown>(hostRoom.roomId, { nickname: `P${i}` });
      joined.onMessage('state', () => {});
      joined.onMessage('sessionlog', () => {});
      rooms.push(joined);
    }
    console.log('4 clients in room', hostRoom.roomId);

    // Identity is the durable pid (you.id), NOT the socket sessionId.
    let betrayer = '';
    let betrayTarget = '';

    for (const r of rooms) {
      r.onMessage('state', (v: ClientView) => {
        latest.set(r.sessionId, v);
        if (!v.ended && (v.history.length > 0 || v.reveal !== undefined)) leakedBeforeEnd = true;
        if (v.phase === 'LOCK' && v.round === 1) round1Lock.set(v.you.id, v);

        if (v.phase === 'DECLARE' && !v.you.declared) {
          if (v.you.id === betrayer) {
            void r.send('declare', { kind: 'back', target: betrayTarget }); // public promise
          } else {
            const other = v.players.find((p) => p.id !== v.you.id);
            if (other) void r.send('declare', { kind: 'back', target: other.id });
          }
        }
        if (v.phase === 'REACTION_WINDOW' && v.round === 1 && v.you.id === betrayer && !v.you.reactionMoved) {
          void r.send('declare', { kind: 'dump', target: betrayTarget });
          void r.send('declare', { kind: 'sell' }); // must be rejected: only one public move
        }
        if (
          v.phase === 'REACTION_WINDOW' &&
          v.you.id === betrayer &&
          v.you.reactionMoved &&
          v.you.declared?.kind === 'dump'
        ) reactionChangeAccepted = true;
        if (v.phase === 'LOCK' && !v.you.locked && v.you.declared) {
          if (v.you.id === betrayer) {
            void r.send('lock', { kind: 'sell' }); // SECRET betrayal after publicly moving to dump
          } else {
            void r.send('lock', v.you.declared); // honor the public promise
          }
        }
        if (v.reveal?.entries.some((e) => e.isDassa)) sawDassa = true;
        if (v.ended) ended.set(r.sessionId, v);
      });
      r.send('sync', {});
    }

    await waitUntil(() => rooms.every((r) => !!latest.get(r.sessionId)?.you.id), 3000);
    betrayer = latest.get(rooms[0]!.sessionId)!.you.id;
    betrayTarget = latest.get(rooms[1]!.sessionId)!.you.id;

    for (const r of rooms) void r.send('ready', { ready: true });
    await waitUntil(() => (latest.get(rooms[0]!.sessionId)?.players.filter((p) => p.ready && p.connected).length ?? 0) === 4, 3000);
    void rooms[0]!.send('start', {});
    await waitUntil(() => ended.size === rooms.length, 15000);

    // --- sync / flow ---
    check(ended.size === 4, 'all 4 clients reached GAME_END');
    const ev = [...ended.values()][0];
    check(!!ev && ev.winnerIds.length >= 1, 'a winner was determined (' + ev?.winnerIds.join(',') + ')');
    check(!!ev && ev.players.some((p) => p.vault > 0), 'at least one Vault banked value');
    check(sawDassa, 'a dassة (broken promise) appeared in the final reveal');
    check(reactionChangeAccepted, 'one public reaction-window change was accepted and the second was rejected');
    check(!leakedBeforeEnd, 'action authorship/history stayed sealed until GAME_END');

    // --- SECURITY: the locked secret must not leak pre-reveal ---
    check(round1Lock.size >= 3, 'captured round-1 LOCK views');
    const betrayerLock = round1Lock.get(betrayer);
    check(betrayerLock?.you.locked?.kind === 'sell', 'betrayer sees its OWN locked action');
    let leaked = false;
    for (const [sid, v] of round1Lock) {
      if (sid === betrayer) continue;
      // No other player declared sell in round one; it exists only as the betrayer's SECRET lock.
      if (JSON.stringify(v).includes('sell')) leaked = true;
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
