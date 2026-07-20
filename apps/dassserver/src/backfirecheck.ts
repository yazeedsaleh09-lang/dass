// BACKFIRE vertical-slice integration check: five simulated phones plus a TV, over real
// WebSockets, driving the whole slice from lobby to final reveal.
//
// It drives the deterministic QA scenario (§34): the Redirector sends the Echo at a player the
// Guardian is protecting, the Redirect side wins the vote, and the consequence returns to the
// Redirector. Alongside the rules it asserts the security property that matters most — no
// client ever receives another player's private text, and the TV never receives the identity
// behind a secret action before the final reveal.

import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client, type Room } from 'colyseus.js';
import type { BfClientView, BfPhase } from '@backfire/domain';
import { BF_DEV_SEED } from '@backfire/domain';
import { BackfireRoom } from './backfire-room.js';

const PORT = 2611;
const ENDPOINT = `ws://localhost:${PORT}`;
const NAMES = ['نورة', 'عمر', 'ليلى', 'سارة', 'فهد'];

const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
async function waitUntil(condition: () => boolean, timeoutMs: number): Promise<boolean> {
  const started = Date.now();
  while (!condition() && Date.now() - started < timeoutMs) await wait(20);
  return condition();
}

let failed = false;
function check(ok: boolean, message: string): void {
  console.log(`${ok ? '  ok   ✓' : '  FAIL ✗'} ${message}`);
  if (!ok) failed = true;
}
function section(title: string): void {
  console.log(`\n${title}`);
}

interface Seat {
  room: Room;
  index: number;
  view?: BfClientView;
  /** Every distinct private string this phone was ever shown. */
  privateText: Set<string>;
  payloads: string[];
}

async function main(): Promise<void> {
  process.env.DASS_ALLOW_TEST_CONFIG = '1';
  const server = new Server({ transport: new WebSocketTransport({}) });
  server.define('backfire', BackfireRoom);
  await server.listen(PORT);

  const seats: Seat[] = [];
  const tvPayloads: string[] = [];
  let tvView: BfClientView | undefined;
  const phasesSeen: BfPhase[] = [];

  try {
    // ---- the TV creates the room and holds host ------------------------------------
    const fast: Record<string, number> = {
      INTRO: 300,
      R1_EVENT: 250,
      R1_INTEL: 300,
      R1_DISCUSSION: 300,
      R1_DECISION: 700,
      R1_RESOLUTION: 250,
      R1_AFTERSHOCK: 250,
      R2_EVENT: 250,
      R2_INTEL: 300,
      R2_DISCUSSION: 300,
      R2_DECISION: 700,
      R2_TIEBREAK: 600,
      R2_RESOLUTION: 250,
      R2_AFTERSHOCK: 250,
      R3_EVENT: 250,
      R3_INTEL: 300,
      R3_DISCUSSION: 300,
      R3_DECISION: 700,
      R3_RESOLUTION: 250,
      FINAL_REVEAL: 400,
    };
    const tv = await new Client(ENDPOINT).create('backfire', { role: 'tv', seed: BF_DEV_SEED, phaseMs: fast });
    tv.onMessage('state', (v: BfClientView) => {
      tvView = v;
      tvPayloads.push(JSON.stringify(v));
      if (phasesSeen[phasesSeen.length - 1] !== v.phase) phasesSeen.push(v.phase);
    });
    tv.onMessage('host', () => {});
    tv.onMessage('telemetry', () => {});
    tv.send('syncHost', {});
    tv.send('sync', {});

    // ---- five phones join --------------------------------------------------------
    section('lobby and readiness');
    for (let i = 0; i < 5; i++) {
      const room = await new Client(ENDPOINT).joinById(tv.roomId, {
        nickname: NAMES[i],
        playerToken: `bfcheck-token-${i}`,
      });
      const seat: Seat = { room, index: i, privateText: new Set(), payloads: [] };
      room.onMessage('state', (v: BfClientView) => {
        seat.view = v;
        seat.payloads.push(JSON.stringify(v));
        if (v.you.intel) seat.privateText.add(v.you.intel);
        if (v.you.objective) seat.privateText.add(v.you.objective);
        drive(seat, seats);
      });
      room.onMessage('restored', () => {});
      room.onMessage('telemetry', () => {});
      room.send('sync', {});
      seats.push(seat);
    }
    await waitUntil(() => (tvView?.players.length ?? 0) === 5, 3000);
    check(tvView?.players.length === 5, 'five phones occupy five seats');

    const sixth = await rejection(tv.roomId, { nickname: 'زائد', playerToken: 'bfcheck-token-6' });
    check(/ROOM_FULL/.test(sixth), 'a sixth player is refused: the slice is exactly five');

    for (const seat of seats) seat.room.send('ready', { ready: true });
    await waitUntil(() => tvView?.players.every((p) => p.ready) === true, 3000);
    check(tvView?.players.every((p) => p.ready) === true, 'all five report ready');

    tv.send('start', {});
    await waitUntil(() => tvView?.phase !== 'LOBBY', 3000);
    check(tvView?.phase === 'INTRO', 'host start moves the room into the intro');

    // ---- run the whole slice ------------------------------------------------------
    section('full slice');
    const finished = await waitUntil(() => tvView?.phase === 'RESULTS', 40000);
    check(finished, 'the slice runs from lobby to results without stalling');

    const required: BfPhase[] = [
      'INTRO',
      'R1_EVENT',
      'R1_INTEL',
      'R1_DISCUSSION',
      'R1_DECISION',
      'R1_RESOLUTION',
      'R1_AFTERSHOCK',
      'R2_EVENT',
      'R2_INTEL',
      'R2_DISCUSSION',
      'R2_DECISION',
      'R2_RESOLUTION',
      'R2_AFTERSHOCK',
      'R3_EVENT',
      'R3_INTEL',
      'R3_DISCUSSION',
      'R3_DECISION',
      'R3_RESOLUTION',
      'FINAL_REVEAL',
      'RESULTS',
    ];
    const missing = required.filter((p) => !phasesSeen.includes(p));
    check(missing.length === 0, `every specified phase is reached${missing.length ? ` (missing ${missing.join(', ')})` : ''}`);

    // ---- rules ---------------------------------------------------------------------
    section('rules and causality');
    const final = tvView!;
    check(final.world.echoStatus === 'resolved', 'the Echo is resolved by the end of Round 3');
    check(final.r3?.outcome === 'backfire', `the scripted scenario produces the signature Backfire (got ${final.r3?.outcome})`);
    check(
      final.r3?.finalTargetId === final.r3?.redirectorId,
      'the consequence returns to the Redirector, not to their chosen target',
    );
    check(
      (final.r3?.redirectPower ?? 0) > (final.r3?.shieldPower ?? 0),
      `Redirect wins the vote ${final.r3?.redirectPower}–${final.r3?.shieldPower}`,
    );
    check(final.r3?.echoTargetId === final.r3?.protectedId, 'the Echo was sent at the protected player');
    check((final.r2?.echoCharge ?? 0) >= 1, 'Round 2 leaves the Echo charged so Round 3 has something to resolve');
    check(final.world.threat >= 0 && final.world.threat <= 5, 'Threat stays inside 0–5');

    const cards = final.finalReveal?.cards ?? [];
    check(cards.length === 5, 'the final reveal is exactly five cards');
    check(!!final.finalReveal?.summary && final.finalReveal.summary.split('.').filter((s) => s.trim()).length === 1,
      'the causal summary is one sentence');
    const redirectorName = final.players.find((p) => p.id === final.r3?.redirectorId)?.nickname ?? '';
    check(final.finalReveal!.summary.includes(redirectorName), 'the summary names the real player it landed on');
    check(!!final.finalReveal?.origin && final.finalReveal.origin.includes('بدأ الصدى'), 'the reveal connects back to Round 1');

    const results = final.results ?? [];
    check(results.length === 5, 'every player receives a result line');
    check(results.every((r) => r.influence === r.objectivesWon.filter(Boolean).length), 'Influence equals completed objectives');
    check(
      final.sharedFailure ? final.winnerIds.length === 0 : final.winnerIds.length >= 1,
      final.sharedFailure ? 'a collapsed world produces no winner' : 'a surviving world produces a winner',
    );

    // ---- secrecy --------------------------------------------------------------------
    section('secrecy');
    const allPrivate = seats.flatMap((s) => [...s.privateText]);
    check(allPrivate.length >= 10, 'phones received private intel and objectives across the rounds');

    const tvBlob = tvPayloads.join('\n');
    const leakedToTv = allPrivate.filter((text) => tvBlob.includes(text));
    check(leakedToTv.length === 0, `no private card text ever reached the TV${leakedToTv.length ? `: ${leakedToTv[0]}` : ''}`);

    let crossLeaks = 0;
    for (const seat of seats) {
      const blob = seat.payloads.join('\n');
      for (const other of seats) {
        if (other.index === seat.index) continue;
        for (const text of other.privateText) {
          if (!seat.privateText.has(text) && blob.includes(text)) crossLeaks++;
        }
      }
    }
    check(crossLeaks === 0, 'no phone ever received another phone’s private card');

    // The interference is public; the hand behind it is not, until the final reveal.
    const preRevealTv = tvPayloads.slice(0, tvPayloads.findIndex((p) => p.includes('"phase":"FINAL_REVEAL"')));
    const r2Payloads = preRevealTv.filter((p) => p.includes('"disrupted"'));
    check(r2Payloads.length > 0, 'the TV did receive the Round 2 reveal');
    check(
      r2Payloads.every((p) => !p.includes('actorId')),
      'the Round 2 reveal the TV holds contains no actor identity at all',
    );
    // A vote map and a side map both serialize as player-id → choice. Public totals never do,
    // so the absence of any id-keyed mapping is the precise test for "who chose what" leaking.
    const playerIds = (tvView?.players ?? []).map((p) => p.id);
    const idKeyedMapping = new RegExp(`"(?:${playerIds.join('|')})":"`);
    check(
      preRevealTv.every((p) => !idKeyedMapping.test(p)),
      'no player-id-keyed choice map (votes, sides) ever leaves the server',
    );
    check(
      preRevealTv.every((p) => !p.includes('"stableId"') && !p.includes('"riskyId"')),
      'which candidate was the stable one is never published as raw state',
    );
    check(
      preRevealTv.every((p) => !p.includes('"decision":{')),
      'no decision content appears in any pre-reveal TV payload',
    );

    const tvLive = tvPayloads.find((p) => p.includes('"phase":"R2_DECISION"'));
    check(!!tvLive && tvLive.includes('"locked":'), 'the TV sees lock STATUS during a decision phase');

    // ---- reconnection mid-match ------------------------------------------------------
    section('reconnection');
    const rematch = await runRematchReconnect(tv, seats);
    check(rematch.resumed, 'a phone that drops mid-match resumes the same seat with the same private card');
    check(rematch.sameIntel, 'the restored phone sees identical intel, not a reshuffled hand');

    console.log(`\n${failed ? 'BACKFIRE CHECK: FAILED' : 'BACKFIRE CHECK: PASSED'}`);
  } finally {
    for (const seat of seats) {
      try {
        await seat.room.leave();
      } catch {
        /* the room may already be gone */
      }
    }
    await server.gracefullyShutdown(false);
  }
}

/**
 * A simulated phone. It reads ONLY its own view — exactly what a real player can see — and the
 * cross-player coordination (who the Guardian protects) is decided at the table level below,
 * standing in for the discussion the room would have.
 */
function drive(seat: Seat, seats: Seat[]): void {
  const v = seat.view;
  if (!v) return;
  const me = v.you;

  if (v.phase.endsWith('_INTEL')) {
    seat.room.send('ack', {});
    return;
  }
  if (me.decision) return; // already locked this phase

  if (v.phase === 'R1_DECISION') {
    // Vote for the first candidate: deterministic, and enough to produce a clear majority.
    const target = me.targets[0];
    if (target) seat.room.send('decide', { kind: 'vote', target });
    return;
  }
  if (v.phase === 'R2_TIEBREAK') {
    const target = me.targets[0];
    if (target) seat.room.send('decide', { kind: 'tiebreak', target });
    return;
  }
  if (v.phase === 'R2_DECISION') {
    const others = me.targets.filter((id) => id !== me.id);
    switch (me.tool) {
      case 'support':
        // Both Supports land on one player; the Redirect then moves one away, which lands the
        // route on a tie and exercises the secret tie-break vote as well.
        seat.room.send('decide', { kind: 'support', target: v.players[0]!.id });
        break;
      case 'disrupt':
        seat.room.send('decide', { kind: 'disrupt', target: v.players[1]!.id });
        break;
      case 'redirect':
        seat.room.send('decide', { kind: 'redirect', source: v.players[0]!.id, target: v.players[2]!.id });
        break;
      case 'shield':
        seat.room.send('decide', { kind: 'shield', target: others[0] ?? v.players[0]!.id });
        break;
      default:
        break;
    }
    return;
  }
  if (v.phase === 'R3_DECISION') {
    const victim = backfireVictim(v);
    if (me.id === v.publicRoles.redirectorId) {
      seat.room.send('decide', { kind: 'echo_target', target: victim });
    } else if (me.id === v.publicRoles.guardianId) {
      // The Guardian protects exactly the player the Redirector is about to aim at.
      seat.room.send('decide', { kind: 'echo_shield', target: victim });
    } else {
      seat.room.send('decide', { kind: 'side', side: 'redirect' });
    }
    void seats;
  }
}

/** The scripted collision point: one player who is neither special position. */
function backfireVictim(v: BfClientView): string {
  const candidate = v.players.find((p) => p.id !== v.publicRoles.redirectorId && p.id !== v.publicRoles.guardianId);
  return candidate?.id ?? v.players[0]!.id;
}

async function runRematchReconnect(tv: Room, seats: Seat[]): Promise<{ resumed: boolean; sameIntel: boolean }> {
  tv.send('restart', {});
  await waitUntil(() => seats.every((s) => s.view?.phase === 'LOBBY'), 4000);
  for (const seat of seats) seat.room.send('ready', { ready: true });
  await waitUntil(() => seats.every((s) => s.view?.players.every((p) => p.ready)), 4000);
  tv.send('start', {});

  const victim = seats[2]!;
  const gotIntel = await waitUntil(() => !!victim.view?.you.intel, 8000);
  const before = victim.view?.you.intel ?? '';
  const roomId = victim.room.roomId;
  await victim.room.leave(false); // an ungraceful drop: the seat must be held

  const resumedRoom = await new Client(ENDPOINT).joinById(roomId, { playerToken: 'bfcheck-token-2' });
  let restored = false;
  resumedRoom.onMessage('restored', () => (restored = true));
  resumedRoom.onMessage('state', (v: BfClientView) => {
    victim.view = v;
    if (v.you.intel) victim.privateText.add(v.you.intel);
    victim.room = resumedRoom;
    drive(victim, seats);
  });
  resumedRoom.onMessage('telemetry', () => {});
  resumedRoom.send('sync', {});
  victim.room = resumedRoom;

  const back = await waitUntil(() => restored && !!victim.view?.you.intel, 6000);
  const after = victim.view?.you.intel ?? '';
  await waitUntil(() => seats.every((s) => s.view?.phase === 'RESULTS'), 40000);
  return { resumed: gotIntel && back, sameIntel: !!before && before === after };
}

async function rejection(roomId: string, options: Record<string, unknown>): Promise<string> {
  try {
    await new Client(ENDPOINT).joinById(roomId, options);
    return '';
  } catch (error) {
    return String((error as { message?: string })?.message ?? error);
  }
}

main()
  .then(() => process.exit(failed ? 1 : 0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
