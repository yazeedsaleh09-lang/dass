// BACKFIRE — pure engine for "The Broken Relay".
// No Date.now() / Math.random() in here: every branch is deterministic given (seed, decisions),
// which is what makes the QA seed (§34) and the unit tests meaningful. The server owns timers
// and calls into these functions; clients never run them.

import {
  R1_CARDS,
  R2_CARDS,
  R3_SIDE_CARDS,
  R3_SPECIAL,
  type IntelId,
  type ObjectiveId,
} from './content.js';
import { BF_PHASE_MS, MAX_THREAT, START_THREAT } from './config.js';
import { makeRng, nextInt, shuffled, type Rng } from './rng.js';
import type {
  BfDecision,
  BfFinalReveal,
  BfGame,
  BfPhase,
  BfPlayer,
  BfPlayerInput,
  EchoOutcome,
  R1Reveal,
  R2Reveal,
  R3Reveal,
  RevealCard,
  RoundTool,
  SecretAction,
  SideChoice,
  WorldStatus,
} from './types.js';

// ---------------------------------------------------------------- setup

export function initBackfire(players: BfPlayerInput[], seed: number, hostId?: string): BfGame {
  const ps: BfPlayer[] = players.map((p) => ({
    id: p.id,
    seat: p.seat,
    nickname: p.nickname,
    connected: true,
    influence: 0,
    threatContribution: 0,
    successfulActions: 0,
    roundTool: null,
    privateIntelId: null,
    privateObjectiveId: null,
    objectivesWon: [],
  }));
  return {
    phase: 'LOBBY',
    players: ps,
    world: {
      threat: START_THREAT,
      worldStatus: statusFor(START_THREAT),
      echoHolderId: null,
      echoCharge: 0,
      echoStatus: 'none',
      roundNumber: 1,
      currentCarrierId: null,
      routeCompromised: false,
      collapsed: false,
    },
    seed,
    rngState: seed >>> 0,
    r1: {
      candidateIds: ['', ''],
      stableId: '',
      riskyId: '',
      votes: {},
      operatorId: null,
      tally: {},
      tiedDefault: false,
      resolved: false,
    },
    r2: {
      tools: {},
      supports: [],
      disrupt: null,
      redirect: null,
      shield: null,
      strength: {},
      baseStrength: {},
      carrierId: null,
      naturalCarrierId: null,
      disruptApplied: false,
      redirectApplied: false,
      disruptChangedCarrier: false,
      redirectChangedCarrier: false,
      compromised: false,
      shieldedId: null,
      echoExposed: false,
      routeFailed: false,
      tieIds: [],
      tiebreakVotes: {},
      tiebreakUsed: false,
      tiebreakBySeat: false,
      resolved: false,
    },
    r3: {
      redirectorId: null,
      guardianId: null,
      echoTargetId: null,
      protectedId: null,
      sides: {},
      redirectPower: 0,
      shieldPower: 0,
      outcome: null,
      finalTargetId: null,
      resolved: false,
    },
    actions: [],
    decisions: {},
    threatLog: [],
    ended: false,
    winnerIds: [],
    sharedFailure: false,
    hostId,
  };
}

/** Enter the cinematic intro and lock in Round 1's candidates + private cards. */
export function startBackfire(game: BfGame): BfGame {
  const rng = rngOf(game);
  const order = shuffled(rng, game.players.map((p) => p.id));
  const a = order[0]!;
  const b = order[1]!;
  // Which of the two carries the stable outcome is decided here and revealed only through
  // whichever player holds the intel that names it.
  const stableFirst = nextInt(rng, 2) === 0;
  game.r1.candidateIds = [a, b];
  game.r1.stableId = stableFirst ? a : b;
  game.r1.riskyId = stableFirst ? b : a;

  const cards = shuffled(rng, R1_CARDS);
  const seats = game.players.slice().sort((x, y) => x.seat - y.seat);
  seats.forEach((p, i) => {
    const card = cards[i]!;
    p.roundTool = 'vote';
    p.privateIntelId = card.intel;
    p.privateObjectiveId = card.objective;
  });
  saveRng(game, rng);
  game.phase = 'INTRO';
  game.world.roundNumber = 1;
  return game;
}

function rngOf(game: BfGame): Rng {
  return makeRng(game.rngState);
}
function saveRng(game: BfGame, rng: Rng): void {
  game.rngState = rng.s;
}

function statusFor(threat: number): WorldStatus {
  if (threat >= MAX_THREAT) return 'collapse';
  if (threat >= 4) return 'critical';
  if (threat >= 2) return 'unstable';
  return 'stable';
}

function player(game: BfGame, id: string | null | undefined): BfPlayer | undefined {
  return id ? game.players.find((p) => p.id === id) : undefined;
}
export function nameOf(game: BfGame, id: string | null | undefined): string {
  return player(game, id)?.nickname ?? '—';
}

function applyThreat(game: BfGame, delta: number, reasonId: string): number {
  const before = game.world.threat;
  const after = Math.max(0, Math.min(MAX_THREAT, before + delta));
  game.world.threat = after;
  game.world.worldStatus = statusFor(after);
  if (after >= MAX_THREAT) {
    game.world.collapsed = true;
    game.sharedFailure = true;
  }
  if (after !== before) game.threatLog.push({ round: game.world.roundNumber, delta: after - before, reasonId });
  return after - before;
}

function logAction(game: BfGame, action: SecretAction): void {
  game.actions.push(action);
}

// ---------------------------------------------------------------- phase machine

const AFTER: Record<BfPhase, BfPhase> = {
  LOBBY: 'INTRO',
  INTRO: 'R1_EVENT',
  R1_EVENT: 'R1_INTEL',
  R1_INTEL: 'R1_DISCUSSION',
  R1_DISCUSSION: 'R1_DECISION',
  R1_DECISION: 'R1_RESOLUTION',
  R1_RESOLUTION: 'R1_AFTERSHOCK',
  R1_AFTERSHOCK: 'R2_EVENT',
  R2_EVENT: 'R2_INTEL',
  R2_INTEL: 'R2_DISCUSSION',
  R2_DISCUSSION: 'R2_DECISION',
  R2_DECISION: 'R2_RESOLUTION', // may divert to R2_TIEBREAK
  R2_TIEBREAK: 'R2_RESOLUTION',
  R2_RESOLUTION: 'R2_AFTERSHOCK',
  R2_AFTERSHOCK: 'R3_EVENT',
  R3_EVENT: 'R3_INTEL',
  R3_INTEL: 'R3_DISCUSSION',
  R3_DISCUSSION: 'R3_DECISION',
  R3_DECISION: 'R3_RESOLUTION',
  R3_RESOLUTION: 'FINAL_REVEAL',
  FINAL_REVEAL: 'RESULTS',
  RESULTS: 'RESULTS',
};

/**
 * The single authoritative FSM step. Resolution happens on the transition INTO a resolution
 * phase, so the reveal payload is complete the moment the TV starts animating it.
 */
export function advancePhase(game: BfGame): BfPhase {
  if (game.ended) return game.phase;
  const from = game.phase;
  let next = AFTER[from];

  if (from === 'R1_DECISION') {
    resolveRound1(game);
  } else if (from === 'R2_DECISION') {
    const needsTiebreak = prepareRoute(game);
    if (needsTiebreak) {
      next = 'R2_TIEBREAK';
      game.r2.tiebreakUsed = true;
    } else {
      resolveRound2(game);
    }
  } else if (from === 'R2_TIEBREAK') {
    settleTiebreak(game);
    resolveRound2(game);
  } else if (from === 'R3_DECISION') {
    resolveRound3(game);
  }

  if (next === 'R2_EVENT') beginRound2(game);
  if (next === 'R3_EVENT') beginRound3(game);
  if (next === 'RESULTS') finishGame(game);

  // A new input phase always starts from a clean secret buffer.
  if (next !== from) game.decisions = {};
  game.phase = next;
  return next;
}

export function phaseDuration(phase: BfPhase): number {
  return BF_PHASE_MS[phase];
}

// ---------------------------------------------------------------- decisions

/** Everyone who must lock in the current phase. Disconnected seats are not waited on. */
export function expectedDeciders(game: BfGame): string[] {
  switch (game.phase) {
    case 'R1_DECISION':
    case 'R2_DECISION':
    case 'R2_TIEBREAK':
    case 'R3_DECISION':
      return game.players.filter((p) => p.connected).map((p) => p.id);
    default:
      return [];
  }
}

export function allLocked(game: BfGame): boolean {
  const need = expectedDeciders(game);
  return need.length > 0 && need.every((id) => game.decisions[id] !== undefined);
}

/** Targets the phone may legally choose from, computed here so a client cannot invent one. */
export function legalTargets(game: BfGame, playerId: string): string[] {
  const all = game.players.map((p) => p.id);
  switch (game.phase) {
    case 'R1_DECISION':
      return [game.r1.candidateIds[0], game.r1.candidateIds[1]];
    case 'R2_DECISION': {
      const tool = game.r2.tools[playerId];
      if (tool === 'support' || tool === 'disrupt' || tool === 'shield' || tool === 'redirect') return all;
      return [];
    }
    case 'R2_TIEBREAK':
      return game.r2.tieIds.slice();
    case 'R3_DECISION': {
      if (playerId === game.r3.redirectorId) return all.filter((id) => id !== playerId);
      if (playerId === game.r3.guardianId) return all;
      return [];
    }
    default:
      return [];
  }
}

/** Validate + record a secret decision. Returns whether it was accepted. */
export function submitDecision(game: BfGame, playerId: string, decision: BfDecision): boolean {
  const p = player(game, playerId);
  if (!p) return false;
  const targets = new Set(legalTargets(game, playerId));
  const phase = game.phase;

  if (phase === 'R1_DECISION') {
    if (decision.kind !== 'vote' || !targets.has(decision.target)) return false;
    game.decisions[playerId] = { kind: 'vote', target: decision.target };
    return true;
  }
  if (phase === 'R2_TIEBREAK') {
    if (decision.kind !== 'tiebreak' || !targets.has(decision.target)) return false;
    game.decisions[playerId] = { kind: 'tiebreak', target: decision.target };
    return true;
  }
  if (phase === 'R2_DECISION') {
    const tool = game.r2.tools[playerId];
    if (tool === 'support' && decision.kind === 'support' && targets.has(decision.target)) {
      game.decisions[playerId] = { kind: 'support', target: decision.target };
      return true;
    }
    if (tool === 'disrupt' && decision.kind === 'disrupt' && targets.has(decision.target)) {
      game.decisions[playerId] = { kind: 'disrupt', target: decision.target };
      return true;
    }
    if (tool === 'shield' && decision.kind === 'shield' && targets.has(decision.target)) {
      game.decisions[playerId] = { kind: 'shield', target: decision.target };
      return true;
    }
    if (
      tool === 'redirect' &&
      decision.kind === 'redirect' &&
      targets.has(decision.source) &&
      targets.has(decision.target) &&
      decision.source !== decision.target
    ) {
      game.decisions[playerId] = { kind: 'redirect', source: decision.source, target: decision.target };
      return true;
    }
    return false;
  }
  if (phase === 'R3_DECISION') {
    if (playerId === game.r3.redirectorId) {
      if (decision.kind !== 'echo_target' || !targets.has(decision.target)) return false;
      game.decisions[playerId] = { kind: 'echo_target', target: decision.target };
      return true;
    }
    if (playerId === game.r3.guardianId) {
      if (decision.kind !== 'echo_shield' || !targets.has(decision.target)) return false;
      game.decisions[playerId] = { kind: 'echo_shield', target: decision.target };
      return true;
    }
    if (decision.kind !== 'side') return false;
    const side: SideChoice = decision.side === 'redirect' || decision.side === 'shield' ? decision.side : 'abstain';
    game.decisions[playerId] = { kind: 'side', side };
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- round 1

function resolveRound1(game: BfGame): void {
  const r1 = game.r1;
  const tally: Record<string, number> = { [r1.candidateIds[0]]: 0, [r1.candidateIds[1]]: 0 };
  for (const p of game.players) {
    const d = game.decisions[p.id];
    if (d?.kind !== 'vote') continue;
    r1.votes[p.id] = d.target;
    tally[d.target] = (tally[d.target] ?? 0) + 1;
    logAction(game, {
      round: 1,
      actorId: p.id,
      actionType: 'vote',
      destinationTargetId: d.target,
      resolved: true,
      changedOutcome: false,
      // Individual votes stay private for the whole match: only totals are ever published.
      visibleBeforeFinalReveal: false,
    });
  }
  r1.tally = tally;
  const [a, b] = r1.candidateIds;
  const va = tally[a] ?? 0;
  const vb = tally[b] ?? 0;
  if (va === vb) {
    // Stated, non-arbitrary default: with no majority the relay falls to the safer hand.
    r1.operatorId = r1.stableId;
    r1.tiedDefault = true;
  } else {
    r1.operatorId = va > vb ? a : b;
  }
  const operator = r1.operatorId;
  const stableWon = operator === r1.stableId;

  game.world.echoHolderId = operator;
  if (stableWon) {
    applyThreat(game, -1, 'r1_stable_operator');
    game.world.echoCharge = 1;
    game.world.echoStatus = 'dormant';
  } else {
    applyThreat(game, +1, 'r1_risky_operator');
    game.world.echoCharge = 2;
    game.world.echoStatus = 'charged';
    for (const [voterId, choice] of Object.entries(r1.votes)) {
      if (choice === operator) {
        const v = player(game, voterId);
        if (v) v.threatContribution += 1;
      }
    }
  }
  r1.resolved = true;
  scoreRound1(game);
}

function scoreRound1(game: BfGame): void {
  const r1 = game.r1;
  for (const p of game.players) {
    const vote = r1.votes[p.id];
    let won = false;
    switch (p.privateObjectiveId as ObjectiveId | null) {
      case 'r1o_threat_low':
        won = game.world.threat <= 1;
        break;
      case 'r1o_not_operator':
        won = r1.operatorId !== p.id;
        break;
      case 'r1o_majority':
        won = !r1.tiedDefault && !!vote && vote === r1.operatorId;
        break;
      case 'r1o_pick_risky':
        won = r1.operatorId === r1.riskyId;
        break;
      case 'r1o_pick_stable':
        won = r1.operatorId === r1.stableId;
        break;
      default:
        won = false;
    }
    p.objectivesWon[0] = won;
    if (won) p.influence += 1;
  }
}

// ---------------------------------------------------------------- round 2

function beginRound2(game: BfGame): void {
  game.world.roundNumber = 2;
  const rng = rngOf(game);
  const seats = game.players.slice().sort((x, y) => x.seat - y.seat);
  const kinds: (keyof typeof R2_CARDS)[] = shuffled(rng, ['support_a', 'support_b', 'disrupt', 'redirect', 'shield']);
  seats.forEach((p, i) => {
    const kind = kinds[i]!;
    const card = R2_CARDS[kind];
    const tool: RoundTool = kind === 'support_a' || kind === 'support_b' ? 'support' : kind;
    p.roundTool = tool;
    p.privateIntelId = card.intel;
    p.privateObjectiveId = card.objective;
    game.r2.tools[p.id] = tool;
  });
  saveRng(game, rng);
}

/** Winner of a strength map, ties broken by seat order. Used only for counterfactuals. */
function topBySeat(game: BfGame, strength: Record<string, number>): string | null {
  let best: BfPlayer | null = null;
  let bestValue = -Infinity;
  for (const p of game.players.slice().sort((a, b) => a.seat - b.seat)) {
    const value = strength[p.id] ?? 0;
    if (value > bestValue) {
      bestValue = value;
      best = p;
    }
  }
  return bestValue > 0 ? (best?.id ?? null) : null;
}

interface RouteInputs {
  supports: { actorId: string; target: string }[];
  disrupt: { actorId: string; target: string } | null;
  redirect: { actorId: string; source: string; target: string } | null;
}

/** Apply the route steps in the published order: Support, then Disrupt, then Redirect (§15). */
function computeStrength(game: BfGame, inputs: RouteInputs): { strength: Record<string, number>; redirectApplied: boolean } {
  const strength: Record<string, number> = {};
  for (const p of game.players) strength[p.id] = 0;
  for (const s of inputs.supports) strength[s.target] = (strength[s.target] ?? 0) + 1;
  if (inputs.disrupt) strength[inputs.disrupt.target] = (strength[inputs.disrupt.target] ?? 0) - 1;
  let redirectApplied = false;
  if (inputs.redirect) {
    const hasPositiveSupport = inputs.supports.some((s) => s.target === inputs.redirect!.source);
    if (hasPositiveSupport) {
      strength[inputs.redirect.source] = (strength[inputs.redirect.source] ?? 0) - 1;
      strength[inputs.redirect.target] = (strength[inputs.redirect.target] ?? 0) + 1;
      redirectApplied = true;
    }
  }
  return { strength, redirectApplied };
}

/**
 * Fold the phones' secret decisions into Route Strength and pick the Carrier.
 * Returns true when the result is tied and a secret tie-break vote is required (§15 step 4).
 */
function prepareRoute(game: BfGame): boolean {
  const r2 = game.r2;
  r2.supports = [];
  r2.disrupt = null;
  r2.redirect = null;
  r2.shield = null;

  for (const p of game.players) {
    const d = game.decisions[p.id];
    if (!d) continue;
    if (d.kind === 'support') r2.supports.push({ actorId: p.id, target: d.target });
    else if (d.kind === 'disrupt') r2.disrupt = { actorId: p.id, target: d.target };
    else if (d.kind === 'redirect') r2.redirect = { actorId: p.id, source: d.source, target: d.target };
    else if (d.kind === 'shield') r2.shield = { actorId: p.id, target: d.target };
  }

  const full = computeStrength(game, { supports: r2.supports, disrupt: r2.disrupt, redirect: r2.redirect });
  r2.strength = full.strength;
  r2.redirectApplied = full.redirectApplied;
  r2.disruptApplied = !!r2.disrupt;
  r2.baseStrength = computeStrength(game, { supports: r2.supports, disrupt: null, redirect: null }).strength;
  r2.naturalCarrierId = topBySeat(game, r2.baseStrength);
  r2.shieldedId = r2.shield?.target ?? null;

  const values = game.players.map((p) => r2.strength[p.id] ?? 0);
  const max = Math.max(...values);
  if (max <= 0) {
    r2.routeFailed = true;
    r2.carrierId = null;
    r2.tieIds = [];
    return false;
  }
  const tied = game.players.filter((p) => (r2.strength[p.id] ?? 0) === max).map((p) => p.id);
  if (tied.length === 1) {
    r2.carrierId = tied[0]!;
    r2.tieIds = [];
    return false;
  }
  r2.tieIds = tied;
  r2.carrierId = null;
  return true;
}

function settleTiebreak(game: BfGame): void {
  const r2 = game.r2;
  const tally: Record<string, number> = {};
  for (const id of r2.tieIds) tally[id] = 0;
  for (const p of game.players) {
    const d = game.decisions[p.id];
    if (d?.kind !== 'tiebreak') continue;
    if (!(d.target in tally)) continue;
    r2.tiebreakVotes[p.id] = d.target;
    tally[d.target] = (tally[d.target] ?? 0) + 1;
  }
  const max = Math.max(...Object.values(tally), 0);
  const leaders = r2.tieIds.filter((id) => (tally[id] ?? 0) === max);
  if (leaders.length === 1) {
    r2.carrierId = leaders[0]!;
    return;
  }
  // Stated fallback, announced on the TV: seat order decides. Never a hidden coin flip.
  const bySeat = leaders
    .map((id) => player(game, id))
    .filter((p): p is BfPlayer => !!p)
    .sort((a, b) => a.seat - b.seat);
  r2.carrierId = bySeat[0]?.id ?? null;
  r2.tiebreakBySeat = true;
}

function carrierWithout(game: BfGame, omit: 'disrupt' | 'redirect'): string | null {
  const r2 = game.r2;
  const inputs: RouteInputs = {
    supports: r2.supports,
    disrupt: omit === 'disrupt' ? null : r2.disrupt,
    redirect: omit === 'redirect' ? null : r2.redirect,
  };
  return topBySeat(game, computeStrength(game, inputs).strength);
}

function resolveRound2(game: BfGame): void {
  const r2 = game.r2;
  const world = game.world;
  const threatBefore = world.threat;

  if (r2.disrupt) {
    r2.disruptChangedCarrier = carrierWithout(game, 'disrupt') !== r2.carrierId;
    logAction(game, {
      round: 2,
      actorId: r2.disrupt.actorId,
      actionType: 'disrupt',
      destinationTargetId: r2.disrupt.target,
      resolved: true,
      changedOutcome: r2.disruptChangedCarrier,
      visibleBeforeFinalReveal: false,
    });
  }
  if (r2.redirect) {
    r2.redirectChangedCarrier = r2.redirectApplied && carrierWithout(game, 'redirect') !== r2.carrierId;
    logAction(game, {
      round: 2,
      actorId: r2.redirect.actorId,
      actionType: r2.redirectApplied ? 'redirect' : 'redirect_failed',
      sourceTargetId: r2.redirect.source,
      destinationTargetId: r2.redirect.target,
      resolved: r2.redirectApplied,
      changedOutcome: r2.redirectChangedCarrier,
      visibleBeforeFinalReveal: false,
    });
  }
  for (const s of r2.supports) {
    logAction(game, {
      round: 2,
      actorId: s.actorId,
      actionType: 'support',
      destinationTargetId: s.target,
      resolved: true,
      changedOutcome: s.target === r2.carrierId,
      visibleBeforeFinalReveal: false,
    });
  }
  if (r2.shield) {
    logAction(game, {
      round: 2,
      actorId: r2.shield.actorId,
      actionType: 'shield',
      destinationTargetId: r2.shield.target,
      resolved: true,
      changedOutcome: r2.shield.target === r2.carrierId && r2.carrierId === world.echoHolderId,
      visibleBeforeFinalReveal: false,
    });
  }

  r2.compromised = r2.disruptChangedCarrier || r2.redirectChangedCarrier;
  world.currentCarrierId = r2.carrierId;
  world.routeCompromised = r2.compromised;

  if (r2.routeFailed) {
    applyThreat(game, +2, 'r2_route_failed');
    world.echoCharge = Math.min(2, world.echoCharge + 1);
    if (r2.disrupt) {
      const d = player(game, r2.disrupt.actorId);
      if (d) d.threatContribution += 1;
    }
  } else {
    applyThreat(game, -1, 'r2_route_success');
    if (r2.carrierId && r2.carrierId === world.echoHolderId && r2.shieldedId !== r2.carrierId) {
      r2.echoExposed = true;
      applyThreat(game, +1, 'r2_echo_exposed');
      world.echoCharge = Math.min(2, world.echoCharge + 1);
      for (const s of r2.supports) {
        if (s.target === r2.carrierId) {
          const sp = player(game, s.actorId);
          if (sp) sp.threatContribution += 1;
        }
      }
    }
    if (r2.compromised) {
      applyThreat(game, +1, 'r2_compromised');
      if (r2.disruptChangedCarrier && r2.disrupt) {
        const d = player(game, r2.disrupt.actorId);
        if (d) d.threatContribution += 1;
      }
      if (r2.redirectChangedCarrier && r2.redirect) {
        const rd = player(game, r2.redirect.actorId);
        if (rd) rd.threatContribution += 1;
      }
    }
  }

  // Round 3 must have a real consequence to resolve, so the Echo ends Round 2 at least Charged.
  const heavy = r2.echoExposed || r2.compromised || r2.routeFailed;
  world.echoCharge = heavy ? 2 : Math.max(1, world.echoCharge);
  world.echoStatus = r2.echoExposed ? 'critical' : 'charged';

  r2.resolved = true;
  scoreRound2(game, threatBefore);
}

function scoreRound2(game: BfGame, threatBefore: number): void {
  const r2 = game.r2;
  for (const p of game.players) {
    const mySupport = r2.supports.find((s) => s.actorId === p.id);
    let won = false;
    switch (p.privateObjectiveId as ObjectiveId | null) {
      case 'r2o_support_carrier':
        won = !!mySupport && !!r2.carrierId && mySupport.target === r2.carrierId;
        break;
      case 'r2o_threat_flat':
        won = game.world.threat <= threatBefore;
        break;
      case 'r2o_disrupt_changed':
        won = r2.disruptChangedCarrier;
        break;
      case 'r2o_redirect_changed':
        won = !!r2.carrierId && !!r2.naturalCarrierId && r2.carrierId !== r2.naturalCarrierId;
        break;
      case 'r2o_no_critical':
        won = game.world.echoStatus !== 'critical';
        break;
      default:
        won = false;
    }
    p.objectivesWon[1] = won;
    if (won) p.influence += 1;

    if (mySupport && mySupport.target === r2.carrierId) p.successfulActions += 1;
    if (r2.disrupt?.actorId === p.id && r2.disruptChangedCarrier) p.successfulActions += 1;
    if (r2.redirect?.actorId === p.id && r2.redirectChangedCarrier) p.successfulActions += 1;
    if (r2.shield?.actorId === p.id && r2.shieldedId === r2.carrierId && r2.carrierId === game.world.echoHolderId) {
      p.successfulActions += 1;
    }
  }
}

// ---------------------------------------------------------------- round 3

function beginRound3(game: BfGame): void {
  game.world.roundNumber = 3;
  const r3 = game.r3;
  // The Redirect and Shield holders keep control into the final round (§20). Their identity is
  // public now; only their targets stay secret.
  r3.redirectorId = game.players.find((p) => game.r2.tools[p.id] === 'redirect')?.id ?? null;
  r3.guardianId = game.players.find((p) => game.r2.tools[p.id] === 'shield')?.id ?? null;

  const rng = rngOf(game);
  const others = shuffled(
    rng,
    game.players.filter((p) => p.id !== r3.redirectorId && p.id !== r3.guardianId).map((p) => p.id),
  );
  for (const p of game.players) {
    if (p.id === r3.redirectorId) {
      p.roundTool = 'redirect';
      p.privateIntelId = R3_SPECIAL.redirect.intel;
      p.privateObjectiveId = R3_SPECIAL.redirect.objective;
    } else if (p.id === r3.guardianId) {
      p.roundTool = 'shield';
      p.privateIntelId = R3_SPECIAL.shield.intel;
      p.privateObjectiveId = R3_SPECIAL.shield.objective;
    } else {
      const index = others.indexOf(p.id);
      const card = R3_SIDE_CARDS[Math.max(0, index) % R3_SIDE_CARDS.length]!;
      p.roundTool = 'side';
      p.privateIntelId = card.intel;
      p.privateObjectiveId = card.objective;
    }
  }
  saveRng(game, rng);
}

function resolveRound3(game: BfGame): void {
  const r3 = game.r3;
  const world = game.world;

  for (const p of game.players) {
    const d = game.decisions[p.id];
    if (!d) continue;
    if (d.kind === 'echo_target' && p.id === r3.redirectorId) {
      r3.echoTargetId = d.target;
      logAction(game, {
        round: 3,
        actorId: p.id,
        actionType: 'echo_target',
        destinationTargetId: d.target,
        resolved: true,
        changedOutcome: false,
        visibleBeforeFinalReveal: false,
      });
    } else if (d.kind === 'echo_shield' && p.id === r3.guardianId) {
      r3.protectedId = d.target;
      logAction(game, {
        round: 3,
        actorId: p.id,
        actionType: 'echo_shield',
        destinationTargetId: d.target,
        resolved: true,
        changedOutcome: false,
        visibleBeforeFinalReveal: false,
      });
    } else if (d.kind === 'side') {
      r3.sides[p.id] = d.side;
    }
  }

  const sideValues = Object.values(r3.sides);
  r3.redirectPower = 1 + sideValues.filter((s) => s === 'redirect').length;
  r3.shieldPower = 1 + sideValues.filter((s) => s === 'shield').length;

  const holder = world.echoHolderId;
  const charge = Math.max(1, world.echoCharge);
  let outcome: EchoOutcome;
  let finalTarget: string | null;

  if (r3.shieldPower >= r3.redirectPower || !r3.echoTargetId) {
    if (holder && r3.protectedId === holder) {
      outcome = 'contained';
      finalTarget = holder;
      applyThreat(game, -1, 'r3_contained');
    } else {
      outcome = 'landed';
      finalTarget = holder;
      applyThreat(game, +charge, 'r3_landed');
      const g = player(game, r3.guardianId);
      if (g) g.threatContribution += 1;
    }
  } else if (r3.echoTargetId !== r3.protectedId) {
    outcome = 'redirected';
    finalTarget = r3.echoTargetId;
    applyThreat(game, +charge, 'r3_redirected');
    const rd = player(game, r3.redirectorId);
    if (rd) rd.threatContribution += 1;
  } else {
    // The signature Backfire: a protected target rejects the Echo and it returns to the sender.
    outcome = 'backfire';
    finalTarget = r3.redirectorId;
    applyThreat(game, +1, 'r3_backfire');
    const rd = player(game, r3.redirectorId);
    if (rd) rd.threatContribution += 1;
  }

  r3.outcome = outcome;
  r3.finalTargetId = finalTarget;
  world.echoHolderId = finalTarget;
  world.echoStatus = 'resolved';
  r3.resolved = true;
  scoreRound3(game);
}

function scoreRound3(game: BfGame): void {
  const r3 = game.r3;
  const redirectWon = r3.redirectPower > r3.shieldPower;
  for (const p of game.players) {
    const side = r3.sides[p.id];
    let won = false;
    switch (p.privateObjectiveId as ObjectiveId | null) {
      case 'r3o_redirect_wins':
        won = redirectWon;
        break;
      case 'r3o_shield_wins':
        won = !redirectWon;
        break;
      case 'r3o_avoid_echo':
        won = r3.finalTargetId !== p.id;
        break;
      case 'r3o_winning_side':
        won = !!side && side !== 'abstain' && (side === 'redirect') === redirectWon;
        break;
      case 'r3o_no_collapse':
        won = game.world.threat < MAX_THREAT;
        break;
      default:
        won = false;
    }
    p.objectivesWon[2] = won;
    if (won) p.influence += 1;

    if (p.id === r3.redirectorId && r3.outcome === 'redirected') p.successfulActions += 1;
    if (p.id === r3.guardianId && (r3.outcome === 'contained' || r3.outcome === 'backfire')) p.successfulActions += 1;
    if (side && side !== 'abstain' && (side === 'redirect') === redirectWon) p.successfulActions += 1;
  }
}

// ---------------------------------------------------------------- ending

function finishGame(game: BfGame): void {
  game.ended = true;
  game.winnerIds = game.sharedFailure ? [] : computeWinners(game);
}

/** Highest Influence; ties: fewer Threat-raising actions → more successful secret actions (§28). */
export function computeWinners(game: BfGame): string[] {
  const max = Math.max(...game.players.map((p) => p.influence));
  let pool = game.players.filter((p) => p.influence === max);
  if (pool.length > 1) {
    const min = Math.min(...pool.map((p) => p.threatContribution));
    pool = pool.filter((p) => p.threatContribution === min);
  }
  if (pool.length > 1) {
    const best = Math.max(...pool.map((p) => p.successfulActions));
    pool = pool.filter((p) => p.successfulActions === best);
  }
  return pool.map((p) => p.id);
}

// ---------------------------------------------------------------- reveal payloads

export function r1Reveal(game: BfGame): R1Reveal | undefined {
  if (!game.r1.resolved) return undefined;
  const r1 = game.r1;
  return {
    candidateIds: r1.candidateIds,
    operatorId: r1.operatorId,
    tally: r1.candidateIds.map((id) => ({ id, votes: r1.tally[id] ?? 0 })),
    stableWon: r1.operatorId === r1.stableId,
    tiedDefault: r1.tiedDefault,
    threatDelta: r1.operatorId === r1.stableId ? -1 : +1,
    echoCharge: game.world.echoCharge,
  };
}

/**
 * Round 2's public payload. Actor ids are deliberately dropped here — the TV receives what
 * happened, never who did it, until the final reveal.
 */
export function r2Reveal(game: BfGame): R2Reveal | undefined {
  if (!game.r2.resolved) return undefined;
  const r2 = game.r2;
  return {
    supportTargets: r2.supports.map((s) => s.target),
    disrupted: r2.disruptApplied,
    disruptTarget: r2.disrupt?.target ?? null,
    redirected: r2.redirectApplied,
    redirectFrom: r2.redirectApplied ? (r2.redirect?.source ?? null) : null,
    redirectTo: r2.redirectApplied ? (r2.redirect?.target ?? null) : null,
    strength: game.players.map((p) => ({ id: p.id, value: r2.strength[p.id] ?? 0 })),
    carrierId: r2.carrierId,
    naturalCarrierId: r2.naturalCarrierId,
    routeFailed: r2.routeFailed,
    compromised: r2.compromised,
    echoExposed: r2.echoExposed,
    shieldBlocked: !!r2.shieldedId && r2.shieldedId === r2.carrierId && r2.carrierId === game.world.echoHolderId,
    tiebreakUsed: r2.tiebreakUsed,
    tiebreakBySeat: r2.tiebreakBySeat,
    threatDelta: 0,
    echoCharge: game.world.echoCharge,
    echoStatus: game.world.echoStatus,
  };
}

export function r3Reveal(game: BfGame): R3Reveal | undefined {
  if (!game.r3.resolved) return undefined;
  const r3 = game.r3;
  return {
    redirectorId: r3.redirectorId,
    guardianId: r3.guardianId,
    echoTargetId: r3.echoTargetId,
    protectedId: r3.protectedId,
    redirectPower: r3.redirectPower,
    shieldPower: r3.shieldPower,
    outcome: r3.outcome,
    finalTargetId: r3.finalTargetId,
    echoCharge: game.world.echoCharge,
    threatDelta: 0,
  };
}

/** The five cards + the required one-sentence causal summary (§29, §30). */
export function buildFinalReveal(game: BfGame): BfFinalReveal {
  const n = (id: string | null | undefined): string => nameOf(game, id);
  const r1 = game.r1;
  const r2 = game.r2;
  const r3 = game.r3;
  const cards: RevealCard[] = [];

  // NOTE ON COPY: player names are free text and carry no inferable gender, so every generated
  // line uses nominal, gender-neutral Arabic ("اختيار X" rather than "اختير X"). A masculine
  // verb reads as a bug the moment someone at the table is called سارة.
  const votesFor = (id: string | null): number => (id ? (r1.tally[id] ?? 0) : 0);
  const other = r1.candidateIds.find((id) => id !== r1.operatorId) ?? null;
  cards.push({
    id: 'first_choice',
    title: 'الاختيار الأول',
    line: r1.tiedDefault
      ? `تعادلت الأصوات، فذهب المُرحِّل إلى اليد الأكثر أماناً: ${n(r1.operatorId)}. والتصق الصدى بالمُشغِّل.`
      : `اختيار الغرفة: ${n(r1.operatorId)} بـ ${votesFor(r1.operatorId)} مقابل ${votesFor(other)}، والتصق الصدى بالمُشغِّل.`,
    focusId: r1.operatorId,
    tone: 'neutral',
  });

  cards.push({
    id: 'hidden_interference',
    title: 'التدخّل الخفي',
    line: r2.disrupt
      ? `${n(r2.disrupt.actorId)} — تعطيل ${n(r2.disrupt.target)}${r2.disruptChangedCarrier ? '، وبه تغيّرت هوية الحامل.' : '، والحامل لم يتغيّر.'}`
      : 'لم يقع أي تعطيل في تلك الجولة.',
    focusId: r2.disrupt?.actorId ?? null,
    tone: 'interference',
  });

  cards.push({
    id: 'changed_path',
    title: 'المسار المُبدَّل',
    line: !r2.redirect
      ? 'لم يُنقل أي دعم.'
      : r2.redirectApplied
        ? `${n(r2.redirect.actorId)} — نقل دعمٍ من ${n(r2.redirect.source)} إلى ${n(r2.redirect.target)}${r2.redirectChangedCarrier ? '، وبه تبدّل الحامل.' : '، والحامل لم يتبدّل.'}`
        : `${n(r2.redirect.actorId)} — محاولة نقل دعمٍ من ${n(r2.redirect.source)}، وسقطت لأن المصدر بلا دعمٍ موجب.`,
    focusId: r2.redirect?.actorId ?? null,
    tone: 'interference',
  });

  cards.push({
    id: 'protection',
    title: 'الحماية',
    line: r3.protectedId
      ? `${n(r3.guardianId)} — حماية ${n(r3.protectedId)} في الجولة الأخيرة.`
      : `${n(r3.guardianId)} — بلا حماية مستخدَمة.`,
    focusId: r3.protectedId,
    tone: 'protection',
  });

  cards.push({
    id: 'backfire',
    title: r3.outcome === 'backfire' ? 'الارتداد' : 'النهاية',
    line: finalLine(game),
    focusId: r3.finalTargetId,
    tone: r3.outcome === 'backfire' ? 'backfire' : 'neutral',
  });

  return {
    cards,
    summary: finalLine(game),
    origin: originLine(game),
    collapsed: game.world.collapsed,
  };
}

function finalLine(game: BfGame): string {
  const n = (id: string | null | undefined): string => nameOf(game, id);
  const r3 = game.r3;
  switch (r3.outcome) {
    case 'backfire':
      return `رجع الصدى إلى ${n(r3.redirectorId)} لأن الوجهة كانت ${n(r3.echoTargetId)} تحت حماية ${n(r3.guardianId)}.`;
    case 'redirected':
      return `نزل الصدى على ${n(r3.echoTargetId)} لأن جانب التحويل غلب ${r3.redirectPower}–${r3.shieldPower} والوجهة بلا حماية.`;
    case 'contained':
      return `احتُوي الصدى عند ${n(r3.finalTargetId)} لأن جانب الدرع غلب ${r3.shieldPower}–${r3.redirectPower} والحماية كانت في مكانها.`;
    case 'landed':
      return `نزل الصدى على ${n(r3.finalTargetId)} لأن الحماية ذهبت إلى لاعبٍ آخر.`;
    default:
      return 'لم يُحسم الصدى.';
  }
}

function originLine(game: BfGame): string {
  const n = (id: string | null | undefined): string => nameOf(game, id);
  const parts = [`بدأ الصدى مع اختيار ${n(game.r1.operatorId)} مُشغِّلاً`];
  if (game.r2.echoExposed) parts.push('واشتعل حين حمل صاحبُه النواة بلا حماية');
  else if (game.r2.compromised) parts.push('واشتدّ خلال مسارٍ مُخترَق');
  else if (game.r2.routeFailed) parts.push('واشتدّ حين فشل المسار');
  return `${parts.join('، ')}.`;
}

/** Intel/objective text is resolved against live names before it ever leaves the server. */
export function copyContextFor(game: BfGame): { stable: string; risky: string; echoHolder: string } {
  return {
    stable: nameOf(game, game.r1.stableId),
    risky: nameOf(game, game.r1.riskyId),
    echoHolder: nameOf(game, game.world.echoHolderId),
  };
}

export type { IntelId, ObjectiveId };
