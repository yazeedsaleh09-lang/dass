// Host-ownership & session integrity check for دسّ. Boots a REAL Colyseus server and
// real clients over WebSocket and asserts the server-authoritative host/session model:
// the room CREATOR owns host via a secret token (never join order / socket id), joins
// are idempotent (no duplicate seats), host survives disconnect/refresh, and only the
// host can drive host-only actions. Exits 0/1.
//   npm run dasshostcheck

import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client, type Room } from 'colyseus.js';
import { DassRoom } from './room.js';
import type { ClientView } from '@dass/domain';

process.env.DASS_ALLOW_TEST_CONFIG = '1';

const PORT = 2603;
const ENDPOINT = `ws://localhost:${PORT}`;
const FAST = { DECLARE: 400, REACTION_WINDOW: 150, LOCK: 400, REVEAL: 120, VAULT_UPDATE: 120 };
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
async function waitUntil(cond: () => boolean, timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  while (!cond() && Date.now() - start < timeoutMs) await wait(30);
  return cond();
}

let failed = false;
function check(ok: boolean, msg: string): void {
  if (ok) console.log('  ok   ✓ ' + msg);
  else {
    failed = true;
    console.error('  FAIL ✗ ' + msg);
  }
}

interface Tracked {
  room: Room;
  last?: ClientView;
  hostToken?: string;
  leftCode?: number;
}
function track(room: Room): Tracked {
  const t: Tracked = { room };
  room.onMessage('state', (v: ClientView) => (t.last = v));
  room.onMessage('host', (m: { token?: string }) => (t.hostToken = m?.token));
  room.onMessage('sessionlog', () => {});
  room.onMessage('newCrew', () => {});
  room.onLeave((code: number) => (t.leftCode = code));
  room.send('sync', {});
  return t;
}
function players(t: Tracked): number {
  return t.last?.players.length ?? -1;
}
function hostId(t: Tracked): string | undefined {
  return t.last?.hostId;
}

async function main(): Promise<void> {
  const gs = new Server({ transport: new WebSocketTransport({}) });
  gs.define('dass', DassRoom);
  await gs.listen(PORT);
  console.log(`server up on ${ENDPOINT}`);

  try {
    // ---- A. Creator owns host; joining players never do -------------------------------
    const tvClient = new Client(ENDPOINT);
    const tvRoom = await tvClient.create<unknown>('dass', { role: 'tv', phaseMs: FAST, minPlayers: 4 });
    const tv = track(tvRoom);
    const roomId = tvRoom.roomId;
    await waitUntil(() => !!tv.last, 3000);

    check(!!tv.hostToken && tv.hostToken.length >= 16, '1. room creator (TV) received a secret host token');
    check(hostId(tv) === tvRoom.sessionId, '1. creator holds host ownership');

    const pRooms: Room[] = [];
    const pTracks: Tracked[] = [];
    for (let i = 1; i <= 4; i++) {
      const c = new Client(ENDPOINT);
      const r = await c.joinById<unknown>(roomId, { nickname: `P${i}`, playerToken: `pt-${i}` });
      pRooms.push(r);
      pTracks.push(track(r));
    }
    await waitUntil(() => players(tv) === 4, 3000);

    check(players(tv) === 4, 'four players seated');
    check(hostId(tv) === tvRoom.sessionId, '2/3. first & later joining players did NOT become host');
    check(
      pRooms.every((r) => hostId(pTracks[pRooms.indexOf(r)]!) === tvRoom.sessionId && hostId(pTracks[pRooms.indexOf(r)]!) !== r.sessionId),
      '4. every player sees the TV as host, not themselves',
    );

    // ---- B. Duplicate join is idempotent (no second seat) ------------------------------
    const dupClient = new Client(ENDPOINT);
    const dupRoom = await dupClient.joinById<unknown>(roomId, { nickname: 'P1-again', playerToken: 'pt-1' });
    track(dupRoom);
    await wait(400);
    check(players(tv) === 4, '8/9/11. re-join with same playerToken did NOT create a duplicate seat');
    check(pTracks[0]!.leftCode === 4002, 'stale duplicate connection for that seat was evicted');

    // ---- C. Host stability across churn / player-order change --------------------------
    await pRooms[3]!.leave(true); // P4 leaves for good
    await waitUntil(() => players(tv) === 3, 3000);
    const p5Client = new Client(ENDPOINT);
    const p5Room = await p5Client.joinById<unknown>(roomId, { nickname: 'P5', playerToken: 'pt-5' });
    const p5 = track(p5Room);
    await waitUntil(() => players(tv) === 4, 3000);
    check(hostId(tv) === tvRoom.sessionId, '17. player leave/join reordering did NOT move host');

    // ---- D. Player refresh resumes the SAME seat (durable token, new socket) ------------
    const p3Pid = pTracks[2]!.last?.you.id; // stable pid, independent of the socket
    const p3OldSession = pRooms[2]!.sessionId;
    await pRooms[2]!.leave(false); // non-consented drop; seat held by the durable token
    await wait(300);
    const p3Client2 = new Client(ENDPOINT);
    const p3New = await p3Client2.joinById<unknown>(roomId, { playerToken: 'pt-3' }); // rejoin by token
    const p3Track = track(p3New);
    await waitUntil(() => !!p3Track.last, 3000);
    check(players(tv) === 4, '7. player refresh did NOT add a seat (resumed existing)');
    check(p3Track.last?.you.id === p3Pid, '18. resumed seat kept its durable pid across the socket change');
    check(p3New.sessionId !== p3OldSession, '18. the socket (sessionId) changed but the identity did not');

    // ---- E. A different room never reuses the wrong seat -------------------------------
    const tv2Client = new Client(ENDPOINT);
    const tv2Room = await tv2Client.create<unknown>('dass', { role: 'tv', phaseMs: FAST, minPlayers: 4 });
    const tv2 = track(tv2Room);
    const other = new Client(ENDPOINT);
    const otherRoom = await other.joinById<unknown>(tv2Room.roomId, { nickname: 'Solo', playerToken: 'pt-1' });
    track(otherRoom);
    await waitUntil(() => players(tv2) === 1, 3000);
    check(tv2Room.roomId !== roomId, '12. second room is a distinct room');
    check(players(tv2) === 1, '12. same browser token in a different room = fresh seat, not the old one');

    // ---- F. Only the host can start (players & bare viewers cannot) ---------------------
    // Ready everyone currently seated in room1: P1(dup), P2, P3(resumed), P5.
    for (const r of [dupRoom, pRooms[1]!, p3New, p5Room]) r.send('ready', { ready: true });
    await wait(500);

    pRooms[1]!.send('start', {}); // a normal player
    await wait(400);
    check(tv.last?.phase === 'LOBBY', '14. a normal player cannot start the game');

    const viewerClient = new Client(ENDPOINT);
    const viewerRoom = await viewerClient.joinById<unknown>(roomId, { role: 'tv' }); // viewer, no host token
    track(viewerRoom);
    await wait(300);
    viewerRoom.send('start', {});
    await wait(400);
    check(tv.last?.phase === 'LOBBY', '15. a display/viewer without the host token cannot start');
    check(hostId(tv) === tvRoom.sessionId, '15. a second display did not seize host');

    // ---- G. Host disconnect does NOT promote a player ----------------------------------
    await tvRoom.leave(true); // host closes the TV
    await wait(400);
    check(hostId(p5) === tvRoom.sessionId, '16. host disconnect did NOT auto-promote player 1');
    pRooms[1]!.send('start', {});
    await wait(400);
    check(p5.last?.phase === 'LOBBY', '16. no player could start while the host was away');

    // ---- H/I. Host reclaims via token and regains control ------------------------------
    const tvBackClient = new Client(ENDPOINT);
    const tvBack = await tvBackClient.joinById<unknown>(roomId, { role: 'tv', hostToken: tv.hostToken });
    const tvB = track(tvBack);
    await waitUntil(() => hostId(p5) === tvBack.sessionId, 3000);
    check(hostId(p5) === tvBack.sessionId, '5/6. host session restored on reclaim (new socket, same ownership)');
    check(hostId(p5) !== tvRoom.sessionId, 'reclaim rebinding host off the stale session');

    tvBack.send('start', {});
    const started = await waitUntil(() => (tvB.last?.phase ?? 'LOBBY') !== 'LOBBY', 3000);
    check(started, 'I. the reclaimed host CAN start the game when everyone is ready');
    check(hostId(tvB) === tvBack.sessionId, 'host ownership intact once play begins');

    console.log('\n' + (failed ? 'DASS HOST CHECK: FAILED' : 'DASS HOST CHECK: PASSED'));
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
