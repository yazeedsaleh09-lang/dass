// BACKFIRE — the redaction boundary.
//
// SECURITY: this is the ONLY function that turns authoritative state into something a socket
// receives. It never reads another player's intel, objective, decision, tool or authorship, and
// it never emits the identity behind a secret action before that action's intended reveal:
//   · Round 1 individual votes  → never published (totals only, after resolution).
//   · Round 2 actor identities  → withheld until FINAL_REVEAL, including from the TV.
//   · Round 3 individual sides  → never published (powers only).
//   · Redirector/Guardian ids   → public only from the Round 3 event, as the design intends.

import { intelText, objectiveText, type IntelId, type ObjectiveId } from './content.js';
import {
  buildFinalReveal,
  copyContextFor,
  legalTargets,
  r1Reveal,
  r2Reveal,
  r3Reveal,
} from './engine.js';
import type { BfClientView, BfGame, BfPhase, BfPublicPlayer } from './types.js';

const ORDER: BfPhase[] = [
  'LOBBY',
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
  'R2_TIEBREAK',
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

function rank(phase: BfPhase): number {
  const i = ORDER.indexOf(phase);
  return i < 0 ? 0 : i;
}

export function atLeast(phase: BfPhase, floor: BfPhase): boolean {
  return rank(phase) >= rank(floor);
}

/** The window in which a player's own private card for the CURRENT round is legible. */
function privateWindow(phase: BfPhase): boolean {
  return (
    atLeast(phase, 'R1_INTEL') &&
    !['R1_RESOLUTION', 'R2_RESOLUTION', 'R3_RESOLUTION', 'FINAL_REVEAL'].includes(phase)
  );
}

export interface RedactOptions {
  isTv?: boolean;
  isSpectator?: boolean;
  recovering?: Set<string>;
  ready?: Record<string, boolean>;
  phaseEndsAt?: number;
  hostId?: string;
  hostConnected?: boolean;
  roomCode?: string;
}

export function redactBackfireFor(game: BfGame, playerId: string, options: RedactOptions = {}): BfClientView {
  const phase = game.phase;
  const isTv = !!options.isTv;
  const isSpectator = !!options.isSpectator;
  const seated = !isTv && !isSpectator ? game.players.find((p) => p.id === playerId) : undefined;

  const players: BfPublicPlayer[] = game.players.map((p) => ({
    id: p.id,
    seat: p.seat,
    nickname: p.nickname,
    connected: p.connected,
    ready: options.ready ? !!options.ready[p.id] : undefined,
    recovering: options.recovering?.has(p.id) || undefined,
    // A boolean, never the decision itself. This is what powers "3/5 locked" on the TV.
    locked: game.decisions[p.id] !== undefined,
    influence: phase === 'RESULTS' ? p.influence : undefined,
  }));

  const ctx = copyContextFor(game);
  const showPrivate = !!seated && privateWindow(phase);
  const showRoles = atLeast(phase, 'R3_EVENT');

  const view: BfClientView = {
    phase,
    world: { ...game.world },
    players,
    lockedCount: Object.keys(game.decisions).length,
    expectedCount: game.players.filter((p) => p.connected).length,
    you: {
      id: seated?.id ?? playerId,
      isTv,
      isSpectator,
      tool: seated ? seated.roundTool : null,
      intel: showPrivate ? intelText(seated.privateIntelId as IntelId | null, ctx) : null,
      objective: showPrivate ? objectiveText(seated.privateObjectiveId as ObjectiveId | null, ctx) : null,
      decision: seated ? (game.decisions[seated.id] ?? null) : null,
      targets: seated ? legalTargets(game, seated.id) : [],
    },
    candidates: atLeast(phase, 'R1_EVENT') ? [game.r1.candidateIds[0], game.r1.candidateIds[1]].filter(Boolean) : [],
    publicRoles: {
      redirectorId: showRoles ? game.r3.redirectorId : null,
      guardianId: showRoles ? game.r3.guardianId : null,
    },
    r1: atLeast(phase, 'R1_RESOLUTION') ? r1Reveal(game) : undefined,
    r2: atLeast(phase, 'R2_RESOLUTION') ? r2Reveal(game) : undefined,
    r3: atLeast(phase, 'R3_RESOLUTION') ? r3Reveal(game) : undefined,
    finalReveal: atLeast(phase, 'FINAL_REVEAL') ? buildFinalReveal(game) : undefined,
    results:
      phase === 'RESULTS'
        ? game.players.map((p) => ({ id: p.id, influence: p.influence, objectivesWon: p.objectivesWon.slice() }))
        : undefined,
    ended: game.ended,
    winnerIds: game.ended ? game.winnerIds : [],
    sharedFailure: game.sharedFailure,
    phaseEndsAt: options.phaseEndsAt,
    hostId: options.hostId,
    hostConnected: options.hostConnected,
    roomCode: options.roomCode,
  };
  return view;
}
