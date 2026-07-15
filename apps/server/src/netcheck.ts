// Standalone networked-match verification (run outside vitest to avoid worker-IPC clashes).
// Boots a real Colyseus server + 4 real clients, plays a full match, asserts, exits 0/1.
//   npm run netcheck

import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client, type Room } from 'colyseus.js';
import { MatchRoom } from './room.js';
import type { ClientView } from '@crisis/shared';

const PORT = 2599;
const ENDPOINT = `ws://localhost:${PORT}`;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function waitUntil(cond: () => boolean, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (!cond() && Date.now() - start < timeoutMs) await wait(40);
}

let failed = false;
function check(ok: boolean, msg: string): void {
  if (ok) console.log('  ok  ✓ ' + msg);
  else {
    failed = true;
    console.error('  FAIL ✗ ' + msg);
  }
}

async function main(): Promise<void> {
  const gs = new Server({ transport: new WebSocketTransport({}) });
  gs.define('match', MatchRoom);
  await gs.listen(PORT);
  console.log(`server up on ${ENDPOINT}`);

  const rooms: Room[] = [];
  const latest = new Map<string, ClientView>();
  const briefing = new Map<string, ClientView>();
  const ended = new Map<string, ClientView>();
  const fast = { briefing: 150, deliberation: 250, decision: 500, resolution: 100, interlude: 100 };

  try {
    // create
    const host = new Client(ENDPOINT);
    const hostRoom = await host.create<unknown>('match', { nickname: 'Host', phaseMs: fast, minPlayers: 4 });
    rooms.push(hostRoom);
    console.log('room created:', hostRoom.roomId);

    // join by id (= room code)
    for (let i = 2; i <= 4; i++) {
      const c = new Client(ENDPOINT);
      const r = await c.joinById<unknown>(hostRoom.roomId, { nickname: `P${i}` });
      rooms.push(r);
    }
    console.log('4 clients in the room');

    for (const r of rooms) {
      r.onMessage('state', (v: ClientView) => {
        latest.set(r.sessionId, v);
        if (v.stage !== 'lobby' && v.crisisPhase === 'briefing' && v.crisis && !briefing.has(r.sessionId)) {
          briefing.set(r.sessionId, v);
        }
        if (v.stage !== 'lobby' && v.crisisPhase === 'decision' && v.crisis && !v.you.vote) {
          const opt = v.crisis.options[0];
          if (opt) void r.send('vote', { optionId: opt.id });
        }
        if (v.ended) ended.set(r.sessionId, v);
      });
    }

    for (const r of rooms) void r.send('ready', { ready: true });
    await waitUntil(() => (latest.get(rooms[0]!.sessionId)?.players.filter((p) => p.ready).length ?? 0) === 4, 3000);
    check((latest.get(rooms[0]!.sessionId)?.players.filter((p) => p.ready).length ?? 0) === 4, 'all 4 marked ready in lobby');

    void rooms[0]!.send('start', {});
    await waitUntil(() => ended.size === rooms.length, 12000);

    check(ended.size === 4, 'all 4 clients reached an ending');
    const ev = [...ended.values()][0];
    check(!!ev && ['success', 'stable', 'fractured', 'collapse'].includes(ev.ending!.kind), 'valid ending (' + ev?.ending?.kind + ')');
    check(!!ev && ev.goalResults?.length === 4, 'goals revealed to everyone at the recap');

    const bv = [...briefing.values()];
    check(bv.length >= 2, 'clients received live briefing state');
    if (bv.length >= 2) {
      const a = bv[0]!;
      const b = bv[1]!;
      check(!!a.you.goalId, 'a client sees its OWN private goal during play');
      check(!JSON.stringify(a).includes(String(b.you.goalId)), "another player's private goal is NOT leaked");
      const anyPrivateLeak = a.players.some((p) => {
        const rec = p as unknown as Record<string, unknown>;
        return rec.goalId !== undefined || rec.cards !== undefined;
      });
      check(!anyPrivateLeak, 'public player list carries no private fields');
    }

    for (const r of rooms) await r.leave();
    console.log('\n' + (failed ? 'NETWORKED CHECK: FAILED' : 'NETWORKED CHECK: PASSED — ending ' + ev?.ending?.kind));
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
