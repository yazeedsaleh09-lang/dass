import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client, type Room } from 'colyseus.js';
import { isRoomCode, normalizeRoomCode, type ClientView } from '@dass/domain';
import { DassRoom } from './room.js';
import { getRoomStatus } from './lifecycle.js';

const PORT = 2605;
const ENDPOINT = `ws://localhost:${PORT}`;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
async function waitUntil(condition: () => boolean, timeoutMs: number): Promise<boolean> {
  const started = Date.now();
  while (!condition() && Date.now() - started < timeoutMs) await wait(30);
  return condition();
}

let failed = false;
function check(ok: boolean, message: string): void {
  console.log(`${ok ? '  ok   ✓' : '  FAIL ✗'} ${message}`);
  if (!ok) failed = true;
}

async function rejection(roomId: string, options: Record<string, unknown>): Promise<string> {
  try {
    await new Client(ENDPOINT).joinById(roomId, options);
    return '';
  } catch (error) {
    return String((error as { message?: string })?.message ?? error);
  }
}

function track(room: Room): { view?: ClientView; hostToken?: string } {
  const tracked: { view?: ClientView; hostToken?: string } = {};
  room.onMessage('state', (view: ClientView) => (tracked.view = view));
  room.onMessage('host', (message: { token?: string }) => (tracked.hostToken = message.token));
  room.onMessage('sessionlog', () => {});
  room.onMessage('restored', () => {});
  room.send('syncHost', {});
  room.send('sync', {});
  return tracked;
}

async function main(): Promise<void> {
  delete process.env.DASS_ALLOW_TEST_CONFIG;
  const server = new Server({ transport: new WebSocketTransport({}) });
  server.define('dass', DassRoom);
  await server.listen(PORT);

  try {
    // Production validation and room-code behavior.
    const tv = await new Client(ENDPOINT).create('dass', { role: 'tv' });
    const host = track(tv);
    await waitUntil(() => !!host.hostToken && !!host.view, 2000);
    check(isRoomCode(tv.roomId), 'room creation emits one uppercase, unambiguous production code');
    check(normalizeRoomCode(`  ${tv.roomId.toLowerCase()}  `) === tv.roomId, 'manual lower-case and surrounding spaces normalize to the displayed code');
    check(getRoomStatus(tv.roomId) === 'active', 'new room is active');
    check(!JSON.stringify(host.view).includes(host.hostToken ?? 'missing-token'), 'host token is absent from public room state');

    const validToken = '0123456789abcdef01234567';
    const arabic = await new Client(ENDPOINT).joinById(tv.roomId, { nickname: 'يزيد', playerToken: validToken });
    const arabicTrack = track(arabic);
    await waitUntil(() => (host.view?.players.length ?? 0) === 1, 2000);
    check(host.view?.players[0]?.nickname === 'يزيد', 'Arabic nickname joins successfully');

    const duplicate = await new Client(ENDPOINT).joinById(tv.roomId, { nickname: 'يزيد', playerToken: '1123456789abcdef01234567' });
    track(duplicate);
    await waitUntil(() => (host.view?.players.length ?? 0) === 2, 2000);
    check(new Set(host.view?.players.map((player) => player.nickname)).size === 2, 'duplicate nickname receives a unique visible suffix');

    check((await rejection(tv.roomId, { nickname: '', playerToken: '2123456789abcdef01234567' })).includes('EMPTY_NAME'), 'empty nickname is rejected by the server');
    check((await rejection(tv.roomId, { nickname: 'a'.repeat(21), playerToken: '3123456789abcdef01234567' })).includes('NAME_TOO_LONG'), 'overlong nickname is rejected');
    check((await rejection(tv.roomId, { nickname: '<script>alert(1)</script>', playerToken: '4123456789abcdef01234567' })).includes('UNSUPPORTED_NAME'), 'script/markup nickname is rejected');
    check((await rejection(tv.roomId, { nickname: 'Bad token', playerToken: 'short' })).includes('INVALID_PLAYER_TOKEN'), 'invalid player token is rejected');
    check((await rejection(tv.roomId, { role: 'tv', hostToken: 'not-the-host-token' })).includes('INVALID_HOST_TOKEN'), 'invalid host token cannot claim host');

    const originalRoomId = tv.roomId;
    await tv.leave(false);
    const refreshedTv = await new Client(ENDPOINT).joinById(originalRoomId, { role: 'tv', hostToken: host.hostToken });
    const refreshedHost = track(refreshedTv);
    await waitUntil(() => refreshedHost.view?.hostId === refreshedTv.sessionId, 2000);
    check(refreshedTv.roomId === originalRoomId, 'host refresh reclaims the same room instead of creating a duplicate');
    check(refreshedHost.view?.hostId === refreshedTv.sessionId, 'host ownership reconnects using the private token');

    await arabic.leave(true);
    await duplicate.leave(true);
    await refreshedTv.leave(true);

    // Fast lifecycle checks use explicitly gated test configuration.
    process.env.DASS_ALLOW_TEST_CONFIG = '1';
    const expiring = await new Client(ENDPOINT).create('dass', { role: 'tv', emptyRoomGraceMs: 120 });
    const expiredId = expiring.roomId;
    track(expiring);
    await expiring.leave(true);
    await waitUntil(() => getRoomStatus(expiredId) === 'expired', 2000);
    check(getRoomStatus(expiredId) === 'expired', 'empty room is destroyed and marked expired');
    check((await rejection(expiredId, { nickname: 'Late', playerToken: 'late' })).includes('not found'), 'players cannot join a destroyed room');

    const fast = { DECLARE: 90, REACTION_WINDOW: 60, LOCK: 90, REVEAL: 40, VAULT_UPDATE: 40 };
    const closedTv = await new Client(ENDPOINT).create('dass', { role: 'tv', minPlayers: 4, phaseMs: fast });
    const closedTrack = track(closedTv);
    const players: Room[] = [];
    for (let i = 0; i < 4; i++) {
      const player = await new Client(ENDPOINT).joinById(closedTv.roomId, { nickname: `P${i + 1}`, playerToken: `flow-${i}` });
      player.onMessage('state', (view: ClientView) => {
        if (view.phase === 'DECLARE' && !view.you.declared) {
          const target = view.players.find((candidate) => candidate.id !== view.you.id);
          if (target) player.send('declare', { kind: 'back', target: target.id });
        }
        if (view.phase === 'LOCK' && !view.you.locked && view.you.declared) player.send('lock', view.you.declared);
      });
      player.onMessage('sessionlog', () => {});
      player.send('sync', {});
      players.push(player);
    }
    await waitUntil(() => closedTrack.view?.players.length === 4, 2000);
    for (const player of players) player.send('ready', { ready: true });
    await waitUntil(() => closedTrack.view?.players.every((player) => player.ready) === true, 2000);
    closedTv.send('start', {});
    await waitUntil(() => closedTrack.view?.ended === true, 12000);
    check(closedTrack.view?.ended === true && getRoomStatus(closedTv.roomId) === 'closed', 'completed game marks room closed');
    check((await rejection(closedTv.roomId, { nickname: 'Late', playerToken: 'unknown' })).includes('ROOM_CLOSED'), 'new player gets the closed-room rejection');

    closedTv.send('newCrew', {});
    await waitUntil(() => closedTrack.view?.phase === 'LOBBY' && closedTrack.view.players.length === 0, 2000);
    check(closedTrack.view?.phase === 'LOBBY' && closedTrack.view.players.length === 0 && getRoomStatus(closedTv.roomId) === 'active', 'new-crew cleanup clears identities and reopens a clean lobby');

    for (const player of players) await player.leave();
    await closedTv.leave();
    console.log(`\n${failed ? 'DASS FLOW CHECK: FAILED' : 'DASS FLOW CHECK: PASSED'}`);
  } finally {
    await server.gracefullyShutdown(false);
  }
}

main()
  .then(() => process.exit(failed ? 1 : 0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
