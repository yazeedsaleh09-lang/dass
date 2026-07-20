// BACKFIRE replay integrity check: drives a full match to RESULTS over real WebSockets, then
// proves the replay contract the living-room flow depends on:
//   · the host (the TV, which created the room) can restart the room and it returns to LOBBY;
//   · a non-host phone that sends `restart` is ignored;
//   · `newCrew` from the host clears the table and notifies the old phones.
// This exists because the defect that motivated it was NOT in the engine — the server always
// honoured a host restart — but in there being no reachable client that WAS the host with a
// restart control. The TV-client regression lives in apps/bftv/src/tv-replay.test.ts.

import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client, type Room } from 'colyseus.js';
import type { BfClientView } from '@backfire/domain';
import { BF_DEV_SEED } from '@backfire/domain';
import { BackfireRoom } from './backfire-room.js';

const PORT = 2699;
const ENDPOINT = `ws://localhost:${PORT}`;
const NAMES = ['نورة', 'عمر', 'ليلى', 'سارة', 'فهد'];
const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
async function waitUntil(cond: () => boolean, ms: number): Promise<boolean> {
  const started = Date.now();
  while (!cond() && Date.now() - started < ms) await wait(20);
  return cond();
}

let failed = false;
function check(ok: boolean, message: string): void {
  console.log(`${ok ? '  ok   ✓' : '  FAIL ✗'} ${message}`);
  if (!ok) failed = true;
}

const FAST = {
  INTRO: 60, R1_EVENT: 40, R1_INTEL: 40, R1_DISCUSSION: 40, R1_DECISION: 600, R1_RESOLUTION: 60,
  R1_AFTERSHOCK: 40, R2_EVENT: 40, R2_INTEL: 40, R2_DISCUSSION: 40, R2_DECISION: 600, R2_TIEBREAK: 600,
  R2_RESOLUTION: 60, R2_AFTERSHOCK: 40, R3_EVENT: 40, R3_INTEL: 40, R3_DISCUSSION: 40, R3_DECISION: 600,
  R3_RESOLUTION: 60, FINAL_REVEAL: 120,
};

interface Seat { room: Room; view?: BfClientView; newCrew: boolean }

async function main(): Promise<void> {
  process.env.DASS_ALLOW_TEST_CONFIG = '1';
  const server = new Server({ transport: new WebSocketTransport({}) });
  server.define('backfire', BackfireRoom);
  await server.listen(PORT);

  const tv = new Client(ENDPOINT);
  let tvView: BfClientView | undefined;
  const tvRoom = await tv.create('backfire', { role: 'tv', seed: BF_DEV_SEED, phaseMs: FAST, emptyRoomGraceMs: 60000, recoveryMs: 60000 });
  tvRoom.onMessage('state', (v: BfClientView) => (tvView = v));
  tvRoom.onMessage('host', () => {});
  tvRoom.send('syncHost', {});
  tvRoom.send('sync', {});
  const code = tvRoom.roomId;

  const seats: Seat[] = [];
  for (let i = 0; i < 5; i++) {
    const c = new Client(ENDPOINT);
    const r = await c.joinById(code, { nickname: NAMES[i], playerToken: `tok-bfreplay-${i}-aaaaaaaaaaaaaaaa` });
    const seat: Seat = { room: r, newCrew: false };
    r.onMessage('state', (v: BfClientView) => (seat.view = v));
    r.onMessage('newCrew', () => (seat.newCrew = true));
    r.send('sync', {});
    seats.push(seat);
  }
  await waitUntil(() => seats.every((s) => s.view?.players.length === 5), 3000);

  async function playToResults(): Promise<boolean> {
    for (const s of seats) s.room.send('ready', { ready: true });
    await waitUntil(() => (tvView?.players.filter((p) => p.ready).length ?? 0) === 5, 3000);
    tvRoom.send('start', {});
    const driver = setInterval(() => {
      for (const s of seats) {
        const v = s.view;
        if (!v) continue;
        const ph = v.phase;
        if (ph.endsWith('_INTEL')) s.room.send('ack', {});
        if (v.you.decision) continue;
        if (ph === 'R1_DECISION' && v.you.targets[0]) s.room.send('decide', { kind: 'vote', target: v.you.targets[0] });
        else if (ph === 'R2_TIEBREAK' && v.you.targets[0]) s.room.send('decide', { kind: 'tiebreak', target: v.you.targets[0] });
        else if (ph === 'R2_DECISION' && v.you.targets[0]) {
          const t = v.you.targets[0];
          const tool = v.you.tool;
          if (tool === 'support') s.room.send('decide', { kind: 'support', target: t });
          else if (tool === 'disrupt') s.room.send('decide', { kind: 'disrupt', target: t });
          else if (tool === 'shield') s.room.send('decide', { kind: 'shield', target: t });
          else if (tool === 'redirect') s.room.send('decide', { kind: 'redirect', source: v.you.targets.find((x) => x !== t) ?? t, target: t });
        } else if (ph === 'R3_DECISION') {
          const tool = v.you.tool;
          if (tool === 'redirect' && v.you.targets[0]) s.room.send('decide', { kind: 'echo_target', target: v.you.targets[0] });
          else if (tool === 'shield' && v.you.targets[0]) s.room.send('decide', { kind: 'echo_shield', target: v.you.targets[0] });
          else if (tool === 'side') s.room.send('decide', { kind: 'side', side: 'redirect' });
        }
      }
    }, 100);
    const reached = await waitUntil(() => tvView?.phase === 'RESULTS', 25000);
    clearInterval(driver);
    return reached;
  }

  console.log('\nfirst match');
  check(await playToResults(), 'the slice runs to RESULTS');
  check(tvView?.hostId === tvView?.you.id === false, 'the TV is the host (hostId is the TV session, not a seated player)');
  check(!seats.some((s) => s.view && s.view.hostId === s.view.you.id), 'no phone is the host, so the host controls must live on the TV');

  console.log('\nreplay contract');
  seats[0]!.room.send('restart', {});
  await wait(500);
  check(tvView?.phase === 'RESULTS', 'a restart from a non-host phone is ignored');

  tvRoom.send('restart', {});
  check(await waitUntil(() => tvView?.phase === 'LOBBY', 3000), 'a restart from the host (TV) returns the room to LOBBY');
  check((tvView?.players.length ?? 0) === 5, 'Play Again keeps the same five players');
  check((tvView?.players.every((p) => !p.ready) ?? false), 'readiness is reset for the rematch');

  console.log('\nsecond match + new crew');
  check(await playToResults(), 'the rematch also runs cleanly to RESULTS');
  tvRoom.send('newCrew', {});
  check(await waitUntil(() => tvView?.phase === 'LOBBY' && (tvView?.players.length ?? 9) === 0, 3000), 'New Crew from the host empties the table back to LOBBY');
  check(await waitUntil(() => seats.every((s) => s.newCrew), 2000), 'every old phone is told to leave for the new crew');

  console.log(`\nBACKFIRE REPLAY CHECK: ${failed ? 'FAILED' : 'PASSED'}`);
  await server.gracefullyShutdown(false);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
