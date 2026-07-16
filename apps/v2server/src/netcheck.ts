// V2 networked check: 4 clients create/join/ready/start, play the commit->reveal->challenge
// ->lock loop to an ending; asserts roles are public, own info private, others' info not leaked.
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client, type Room } from 'colyseus.js';
import { V2Room } from './room.js';
import type { ClientView } from '@crisis/v2';

const PORT = 2606;
const EP = `ws://localhost:${PORT}`;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
async function until(c: () => boolean, ms: number) { const s = Date.now(); while (!c() && Date.now() - s < ms) await wait(40); return c(); }
let fail = 0;
const ok = (b: boolean, m: string) => { if (b) console.log('  ok  ✓ ' + m); else { fail++; console.error('  FAIL ✗ ' + m); } };

async function main(): Promise<void> {
  const gs = new Server({ transport: new WebSocketTransport({}) });
  gs.define('match', V2Room);
  await gs.listen(PORT);
  const fast = { briefing: 120, discussion: 200, commit: 400, reveal: 120, challenge: 300, resolution: 100, interlude: 100 };
  const rooms: Room[] = [];
  const latest = new Map<string, ClientView>();
  const inMatch = new Map<string, ClientView>();
  const ended = new Map<string, ClientView>();
  try {
    const host = new Client(EP);
    const hr = await host.create<unknown>('match', { nickname: 'H', phaseMs: fast, minPlayers: 4 });
    rooms.push(hr);
    for (let i = 2; i <= 4; i++) { const c = new Client(EP); rooms.push(await c.joinById<unknown>(hr.roomId, { nickname: `P${i}` })); }
    for (const r of rooms) {
      r.onMessage('state', (v: ClientView) => {
        latest.set(r.sessionId, v);
        if (v.phase !== 'lobby' && v.crisis && !inMatch.has(r.sessionId)) inMatch.set(r.sessionId, v);
        if (v.phase === 'commit' && v.crisis && !v.you.commit) { const o = v.crisis.options[0]; if (o) void r.send('commit', { optionId: o.id }); }
        if (v.ended) ended.set(r.sessionId, v);
      });
    }
    for (const r of rooms) void r.send('ready', { ready: true });
    await until(() => (latest.get(rooms[0]!.sessionId)?.players.filter((p) => p.ready).length ?? 0) === 4, 3000);
    void rooms[0]!.send('start', {});
    await until(() => ended.size === rooms.length, 15000);

    ok(ended.size === 4, 'all 4 clients reached an ending');
    const ev = [...ended.values()][0];
    ok(!!ev && ['thriving', 'holding', 'fractured', 'collapse'].includes(ev.ending!.kind), 'valid ending (' + ev?.ending?.kind + ')');
    ok(!!ev && (ev.roleOutcomes?.length ?? 0) === 4, 'role outcomes revealed for all');
    const mv = [...inMatch.values()];
    ok(mv.length >= 2 && mv.every((v) => !!v.you.roleId), 'each client sees its own role');
    ok(mv.every((v) => v.players.every((p) => !!p.roleId)), 'all roles are public (visible to everyone)');
    // privacy: another player's private info textKey should not appear in my view during a briefing
    if (mv.length >= 2) {
      const a = mv[0]!;
      const others = mv.find((v) => v.you.id !== a.you.id);
      const otherInfo = others?.you.info[0]?.textKey;
      if (otherInfo && !a.you.info.some((i) => i.textKey === otherInfo)) {
        ok(!JSON.stringify(a).includes(otherInfo), "another player's unshared private info is not leaked");
      }
    }
    for (const r of rooms) await r.leave();
  } finally { await gs.gracefullyShutdown(false); }
  console.log('\n' + (fail === 0 ? 'V2 NETWORKED CHECK: PASSED' : `V2 NETWORKED CHECK: ${fail} FAIL`));
}
main().then(() => process.exit(fail ? 1 : 0)).catch((e: unknown) => { console.error(e); process.exit(1); });
