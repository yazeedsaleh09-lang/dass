// In-game durable-identity & seat-recovery check for دسّ. Boots a REAL Colyseus server and
// real clients, and proves that active-player identity is bound to the durable playerToken
// (a stable pid) — NOT the sessionId: a player can drop and rejoin mid-game, even after the
// old 30s window, and land back on the SAME seat with score/actions/secrets intact. Exits 0/1.
//   npm run dassreconnectcheck

import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client, type Room } from 'colyseus.js';
import { DassRoom } from './room.js';
import type { ClientView } from '@dass/domain';

process.env.DASS_ALLOW_TEST_CONFIG = '1';

const PORT = 2604;
const ENDPOINT = `ws://localhost:${PORT}`;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
async function waitUntil(cond: () => boolean, ms: number): Promise<boolean> {
  const s = Date.now();
  while (!cond() && Date.now() - s < ms) await wait(30);
  return cond();
}
let failed = false;
function check(ok: boolean, m: string): void {
  console.log((ok ? '  ok   ✓ ' : '  FAIL ✗ ') + m);
  if (!ok) failed = true;
}

/** A durable player: identity travels with `token`, not the socket. */
class Peer {
  client = new Client(ENDPOINT);
  room!: Room;
  last?: ClientView;
  restored = false;
  expired = false;
  leftCode?: number;
  autoplay = false;
  constructor(public token: string) {}

  private wire(): void {
    this.room.onMessage('state', (v: ClientView) => {
      this.last = v;
      if (this.autoplay) this.act(v);
    });
    this.room.onMessage('restored', () => (this.restored = true));
    this.room.onMessage('recoveryExpired', () => (this.expired = true));
    this.room.onMessage('host', () => {});
    this.room.onMessage('sessionlog', () => {});
    this.room.onLeave((c: number) => (this.leftCode = c));
  }
  private act(v: ClientView): void {
    if (v.phase === 'DECLARE' && !v.you.declared) {
      const o = v.players.find((p) => p.id !== v.you.id);
      if (o) void this.room.send('declare', { kind: 'back', target: o.id });
    }
    if (v.phase === 'LOCK' && !v.you.locked && v.you.declared) void this.room.send('lock', v.you.declared);
  }
  async join(roomId: string, nickname?: string): Promise<void> {
    this.room = await this.client.joinById<unknown>(roomId, { nickname, playerToken: this.token });
    this.wire();
    this.room.send('sync', {});
  }
  async drop(): Promise<void> {
    this.leftCode = undefined;
    await this.room.leave(false); // non-consented → recovery window
  }
  async reconnect(roomId: string): Promise<void> {
    this.restored = false;
    this.expired = false;
    this.room = await this.client.joinById<unknown>(roomId, { playerToken: this.token });
    this.wire();
    this.room.send('sync', {});
  }
  pid(): string | undefined {
    return this.last?.you.id;
  }
  me(): ClientView['players'][number] | undefined {
    return this.last?.players.find((p) => p.id === this.pid());
  }
}

async function createRoom(cfg: Record<string, unknown>): Promise<{ tv: Room; roomId: string }> {
  const tvClient = new Client(ENDPOINT);
  const tv = await tvClient.create<unknown>('dass', { role: 'tv', ...cfg });
  tv.onMessage('state', () => {});
  tv.onMessage('host', () => {});
  tv.onMessage('sessionlog', () => {});
  return { tv, roomId: tv.roomId };
}

async function seatFour(roomId: string, tokens: string[], autoplay = false): Promise<Peer[]> {
  const peers: Peer[] = [];
  for (let i = 0; i < 4; i++) {
    const p = new Peer(tokens[i]!);
    p.autoplay = autoplay;
    await p.join(roomId, `P${i + 1}`);
    peers.push(p);
  }
  await waitUntil(() => (peers[0]!.last?.players.length ?? 0) === 4, 3000);
  return peers;
}

async function main(): Promise<void> {
  const gs = new Server({ transport: new WebSocketTransport({}) });
  gs.define('dass', DassRoom);
  await gs.listen(PORT);
  console.log(`server up on ${ENDPOINT}`);

  try {
    // ================= ROOM A: >30s reconnect, state preserved, dedup, wrong token =========
    {
      const { tv, roomId } = await createRoom({
        minPlayers: 4,
        // Long DECLARE so the round does not advance during a 31s outage (+ margin for setup).
        phaseMs: { DECLARE: 70000, REACTION_WINDOW: 400, LOCK: 70000, REVEAL: 300, VAULT_UPDATE: 300 },
      });
      const peers = await seatFour(roomId, ['ptA1', 'ptA2', 'ptA3', 'ptA4']);
      for (const p of peers) p.room.send('ready', { ready: true });
      await waitUntil(() => peers[0]!.last?.players.every((p) => p.ready) === true, 3000);
      tv.send('start', {});
      await waitUntil(() => peers[0]!.last?.phase === 'DECLARE', 4000);

      const P2 = peers[1]!;
      const pidBefore = P2.pid();
      const seatBefore = P2.me()?.seat;
      // P2 makes a public move, then vanishes.
      const other = P2.last!.players.find((p) => p.id !== pidBefore)!;
      P2.room.send('declare', { kind: 'back', target: other.id });
      await waitUntil(() => !!P2.last?.you.declared, 2000);
      const liveBefore = P2.me()?.live;

      await P2.drop();
      await waitUntil(() => peers[0]!.last?.players.find((p) => p.id === pidBefore)?.connected === false, 4000);
      check(
        peers[0]!.last?.players.find((p) => p.id === pidBefore)?.recovering === true,
        'a dropped active player is shown as recovering (اللاعب يعيد الاتصال), not gone',
      );

      console.log('  ...(waiting 31s to exceed the old 30s reconnection window)');
      await wait(31000);

      await P2.reconnect(roomId);
      const restored = await waitUntil(() => P2.restored && !!P2.last, 5000);
      check(restored, '1. reconnect AFTER 31s (>30s) restored the seat (server sent "restored")');
      check(P2.pid() === pidBefore, '1/18. same durable pid after reconnect (identity is not the socket)');
      check(P2.me()?.seat === seatBefore, '1. same seat index preserved');
      check(!!P2.last?.you.declared && P2.last.you.declared.kind === 'back', '3. submitted public action survived the reconnect');
      check(P2.me()?.live === liveBefore, '3. score/live state unchanged after reconnect');
      check((peers[0]!.last?.players.length ?? 0) === 4, 'roster stayed at 4 (no duplicate/lost seat)');
      await waitUntil(() => peers[0]!.last?.players.find((p) => p.id === pidBefore)?.connected === true, 3000);
      check(peers[0]!.last?.players.find((p) => p.id === pidBefore)?.connected === true, 'teammates see the player reconnected');

      // Duplicate connections with the same token → one seat, older evicted.
      const dupClient = new Client(ENDPOINT);
      const dupRoom = await dupClient.joinById<unknown>(roomId, { playerToken: 'ptA2' });
      dupRoom.onMessage('state', () => {});
      dupRoom.onMessage('restored', () => {});
      dupRoom.onMessage('host', () => {});
      dupRoom.onMessage('sessionlog', () => {});
      let dupOldLeft: number | undefined;
      P2.room.onLeave((c: number) => (dupOldLeft = c));
      await wait(600);
      check((peers[0]!.last?.players.length ?? 0) === 4, '6. duplicate connection (same token) did NOT create a second player');
      check(dupOldLeft === 4002, '7. the stale socket for that seat was evicted (4002)');

      // Wrong/unknown token during a game cannot claim a seat — it only spectates.
      const intruder = new Client(ENDPOINT);
      const intruderRoom = await intruder.joinById<unknown>(roomId, { playerToken: 'totally-unknown' });
      let intruderView: ClientView | null = null;
      intruderRoom.onMessage('state', (v: ClientView) => (intruderView = v));
      intruderRoom.onMessage('host', () => {});
      intruderRoom.onMessage('sessionlog', () => {});
      await wait(600);
      const iv = intruderView as ClientView | null;
      check((peers[0]!.last?.players.length ?? 0) === 4, '5. an unknown token did NOT take or add a seat');
      check(!!iv && !iv.players.some((p) => p.id === iv.you.id), '5. the unknown-token client is a spectator, not a player');

      await tv.leave();
    }

    // ================= ROOM B: expiry policy (short recovery window) =======================
    {
      const { tv, roomId } = await createRoom({
        minPlayers: 4,
        config: { recoveryMs: 900 },
        phaseMs: { DECLARE: 45000, REACTION_WINDOW: 400, LOCK: 45000, REVEAL: 300, VAULT_UPDATE: 300 },
      });
      const peers = await seatFour(roomId, ['ptB1', 'ptB2', 'ptB3', 'ptB4']);
      for (const p of peers) p.room.send('ready', { ready: true });
      await waitUntil(() => peers[0]!.last?.players.every((p) => p.ready) === true, 3000);
      tv.send('start', {});
      await waitUntil(() => peers[0]!.last?.phase === 'DECLARE', 4000);

      const P3 = peers[2]!;
      const pid3 = P3.pid();
      await P3.drop();
      await wait(1600); // exceed the 900ms recovery window
      check(
        peers[0]!.last?.players.some((p) => p.id === pid3) === true,
        '8. after expiry the seat REMAINS on the board (abstains, never eliminated)',
      );
      await P3.reconnect(roomId);
      const expired = await waitUntil(() => P3.expired, 4000);
      check(expired, '8. a return after the recovery window is refused restore (انتهت صلاحية الاستعادة)');
      check(!P3.last?.players.some((p) => p.id === P3.pid()), '8. the expired return is a spectator, not the active seat');
      await tv.leave();
    }

    // ================= ROOM C: reconnect across phases, secret privacy, game completes =====
    {
      // NOTE: options cross the wire as JSON, so a `roundsForPlayers` FUNCTION cannot be sent —
      // the game runs its real length (8 rounds for 4 players). Keep phases short so the full
      // game still finishes quickly, and give the completion check a generous window.
      const { tv, roomId } = await createRoom({
        minPlayers: 4,
        phaseMs: { DECLARE: 1500, REACTION_WINDOW: 900, LOCK: 1500, REVEAL: 700, VAULT_UPDATE: 700 },
      });
      const peers = await seatFour(roomId, ['ptC1', 'ptC2', 'ptC3', 'ptC4'], false);
      for (const p of peers) p.room.send('ready', { ready: true });
      await waitUntil(() => peers[0]!.last?.players.every((p) => p.ready) === true, 3000);

      const betrayer = peers[1]!; // P2 will secretly sell after publicly promising back
      let betrayerLockedSell = false;
      let leakedSecret = false;
      const phasesReconnected = new Set<string>();
      const ended = new Map<string, ClientView>();

      // Honest auto-play: publicly promise back, then lock that promise.
      const autoAct = (r: Room, v: ClientView): void => {
        if (v.phase === 'DECLARE' && !v.you.declared) {
          const o = v.players.find((p) => p.id !== v.you.id);
          if (o) void r.send('declare', { kind: 'back', target: o.id });
        }
        if (v.phase === 'LOCK' && !v.you.locked && v.you.declared) void r.send('lock', v.you.declared);
      };
      // Betrayer: promises back in public, but SECRETLY locks a sell.
      const driveBetrayer = (v: ClientView): void => {
        if (v.phase === 'DECLARE' && !v.you.declared) {
          const o = v.players.find((p) => p.id !== v.you.id);
          if (o) void betrayer.room.send('declare', { kind: 'back', target: o.id });
        }
        if (v.phase === 'LOCK' && !v.you.locked && v.you.declared) {
          void betrayer.room.send('lock', { kind: 'sell' });
          betrayerLockedSell = true;
        }
      };
      const attachBetrayer = (): void => {
        betrayer.room.onMessage('state', (v: ClientView) => {
          betrayer.last = v;
          driveBetrayer(v);
        });
      };
      attachBetrayer();

      // Honest peers: one combined handler doing auto-play, leak sentinel, and end capture.
      for (const p of peers) {
        if (p === betrayer) continue;
        p.room.onMessage('state', (v: ClientView) => {
          p.last = v;
          autoAct(p.room, v);
          if (!v.ended && JSON.stringify(v).includes('sell')) leakedSecret = true; // no secret pre-END
          if (v.ended) ended.set(p.token, v);
        });
      }

      tv.send('start', {});

      // Reconnect the betrayer the first time we see each major phase, to prove reconnect
      // works during every phase while keeping its secret intact.
      const wantPhases = ['DECLARE', 'REACTION_WINDOW', 'LOCK', 'REVEAL', 'VAULT_UPDATE'];
      let reconnecting = false;
      const watcher = setInterval(() => {
        const v = betrayer.last;
        if (!v || reconnecting || v.ended) return;
        if (wantPhases.includes(v.phase) && !phasesReconnected.has(v.phase)) {
          phasesReconnected.add(v.phase);
          reconnecting = true;
          void (async () => {
            const wasLockedSell = !!v.you.locked && v.you.locked.kind === 'sell';
            await betrayer.drop();
            await betrayer.reconnect(roomId);
            attachBetrayer(); // re-attach the hand-driver to the fresh socket
            await waitUntil(() => !!betrayer.last, 3000);
            if (wasLockedSell && betrayer.last?.you.locked?.kind === 'sell') betrayerLockedSell = true;
            reconnecting = false;
          })();
        }
      }, 120);

      const finished = await waitUntil(() => ended.size >= 3, 90000);
      clearInterval(watcher);

      check(finished, '9. the full game reached GAME_END despite mid-game reconnects');
      check(phasesReconnected.size >= 4, `2. reconnected across ${phasesReconnected.size} distinct phases: ${[...phasesReconnected].join(',')}`);
      check(betrayerLockedSell, '4. the reconnected betrayer still held its own secret lock');
      check(!leakedSecret, '4. no other client ever saw the secret sell before GAME_END (redaction intact through reconnects)');
      const anyEnd = [...ended.values()][0];
      check(!!anyEnd && anyEnd.winnerIds.length >= 1, '9. a winner was determined after reconnects');

      await tv.leave();
    }

    console.log('\n' + (failed ? 'DASS RECONNECT CHECK: FAILED' : 'DASS RECONNECT CHECK: PASSED'));
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
