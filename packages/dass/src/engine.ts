// دسّ — pure engine. Server executes it authoritatively; clients read redacted views.
// No Date.now()/Math.random() in here — deterministic and unit-testable.

import type {
  Action,
  ClientView,
  GameState,
  PlayerInput,
  PlayerState,
  PublicPlayerView,
  RevealEntry,
  RevealView,
  RoundRecord,
  SellEvent,
} from './types.js';
import type { DassConfig } from './config.js';
import { DEFAULT_CONFIG } from './config.js';

export function initGame(
  players: PlayerInput[],
  config: DassConfig = DEFAULT_CONFIG,
  hostId?: string,
): GameState {
  const ps: PlayerState[] = players.map((p) => ({
    id: p.id,
    seat: p.seat,
    nickname: p.nickname,
    connected: true,
    liveStock: config.baselineLive,
    vault: 0,
    peakLive: config.baselineLive,
    supportReceived: 0,
    vaultLeaderRounds: 0,
  }));
  return {
    phase: 'LOBBY',
    round: 0,
    totalRounds: config.roundsForPlayers(ps.length),
    players: ps,
    declares: {},
    locked: {},
    history: [],
    hostId: hostId ?? players[0]?.id,
    ended: false,
    winnerIds: [],
  };
}

export function startGame(state: GameState): GameState {
  state.round = 1;
  state.phase = 'DECLARE';
  state.declares = {};
  state.locked = {};
  return state;
}

function findPlayer(state: GameState, id: string): PlayerState | undefined {
  return state.players.find((p) => p.id === id);
}

/** Record a PUBLIC declare (DECLARE / REACTION_WINDOW only). Returns whether accepted. */
export function applyDeclare(state: GameState, playerId: string, action: Action): boolean {
  if (state.phase !== 'DECLARE' && state.phase !== 'REACTION_WINDOW') return false;
  if (!findPlayer(state, playerId)) return false;
  if (!isValidAction(state, playerId, action)) return false;
  state.declares[playerId] = normalize(action);
  return true;
}

/** Record a SECRET locked action (LOCK only). Must follow a public declare. */
export function applyLock(state: GameState, playerId: string, action: Action): boolean {
  if (state.phase !== 'LOCK') return false;
  if (!state.declares[playerId]) return false; // a lock is a follow-through-or-betrayal of a stance
  if (!isValidAction(state, playerId, action)) return false;
  state.locked[playerId] = normalize(action);
  return true;
}

function isValidAction(state: GameState, playerId: string, action: Action): boolean {
  if (action.kind === 'sell') return true; // self, no target
  if (!action.target) return false;
  if (action.target === playerId) return false; // D1: no self-target
  return !!findPlayer(state, action.target);
}

function normalize(action: Action): Action {
  return action.kind === 'sell' ? { kind: 'sell' } : { kind: action.kind, target: action.target };
}

function sameAction(a: Action | undefined, b: Action | undefined): boolean {
  if (!a || !b) return a === b;
  if (a.kind !== b.kind) return false;
  if (a.kind === 'sell') return true;
  return a.target === b.target;
}

/**
 * Resolve the current round: apply actual (locked-or-honored) actions, bank sells
 * (snapshot AFTER this round's movement), flag dassات, credit the Vault leader.
 * Mutates + returns the round record; pushes it to history and clears the round buffers.
 */
export function resolveRound(state: GameState, config: DassConfig = DEFAULT_CONFIG): RoundRecord {
  const round = state.round;

  // actual per player: locked ?? honor declare. No declare ⇒ abstain (undefined).
  const actual: Record<string, Action | undefined> = {};
  for (const p of state.players) {
    const declared = state.declares[p.id];
    actual[p.id] = declared ? (state.locked[p.id] ?? declared) : undefined;
  }

  // 1. backs/dumps (all before sells)
  for (const p of state.players) {
    const a = actual[p.id];
    if (!a || a.kind === 'sell' || !a.target) continue;
    const t = findPlayer(state, a.target);
    if (!t || t.id === p.id) continue;
    if (a.kind === 'back') {
      t.liveStock += config.backAmount;
      t.supportReceived += config.backAmount;
    } else {
      t.liveStock = Math.max(config.minLive, t.liveStock - config.dumpAmount);
    }
  }

  // 2. sells (snapshot post-movement, then reset to baseline)
  const sells: SellEvent[] = [];
  for (const p of state.players) {
    const a = actual[p.id];
    if (!a || a.kind !== 'sell') continue;
    const height = p.liveStock;
    p.vault += height;
    p.liveStock = config.baselineLive;
    sells.push({ round, playerId: p.id, height, voluntary: true });
  }

  // 3. peaks (tiebreak)
  for (const p of state.players) if (p.liveStock > p.peakLive) p.peakLive = p.liveStock;

  // 4. dassة detection
  const entries: RevealEntry[] = state.players.map((p) => {
    const declared = state.declares[p.id];
    const act = actual[p.id];
    return { playerId: p.id, declared, actual: act, isDassa: !!declared && !!act && !sameAction(declared, act) };
  });
  const reveal: RevealView = { round, entries };

  // 5. Vault leader credit (hidden tiebreak stat; no persistent emblem — N2)
  const maxVault = Math.max(...state.players.map((p) => p.vault));
  let vaultLeaderId: string | undefined;
  if (maxVault > 0) {
    const leaders = state.players.filter((p) => p.vault === maxVault);
    for (const l of leaders) l.vaultLeaderRounds += 1;
    vaultLeaderId = leaders.length === 1 ? leaders[0]!.id : undefined;
  }

  const record: RoundRecord = { round, reveal, sells, vaultLeaderId };
  state.history.push(record);
  state.declares = {};
  state.locked = {};
  return record;
}

export function isLastRound(state: GameState): boolean {
  return state.round >= state.totalRounds;
}

/** Advance to the next round's DECLARE. */
export function nextRound(state: GameState): GameState {
  state.round += 1;
  state.phase = 'DECLARE';
  state.declares = {};
  state.locked = {};
  return state;
}

/** Market Close: unsold live auto-banks at the haircut, then the winner is computed. */
export function endGame(state: GameState, config: DassConfig = DEFAULT_CONFIG): SellEvent[] {
  const autoSells: SellEvent[] = [];
  for (const p of state.players) {
    const banked = Math.floor(p.liveStock * config.marketCloseHaircut);
    if (banked > 0) {
      p.vault += banked;
      autoSells.push({ round: state.round, playerId: p.id, height: banked, voluntary: false });
    }
    p.liveStock = 0;
  }
  state.winnerIds = computeWinner(state);
  state.ended = true;
  state.phase = 'GAME_END';
  return autoSells;
}

/** Winner = biggest Vault; tiebreak: vaultLeaderRounds → supportReceived → peakLive → co-champions. */
export function computeWinner(state: GameState): string[] {
  const maxVault = Math.max(...state.players.map((p) => p.vault));
  let pool = state.players.filter((p) => p.vault === maxVault);
  for (const key of [
    (p: PlayerState) => p.vaultLeaderRounds,
    (p: PlayerState) => p.supportReceived,
    (p: PlayerState) => p.peakLive,
  ]) {
    if (pool.length <= 1) break;
    const max = Math.max(...pool.map(key));
    pool = pool.filter((p) => key(p) === max);
  }
  return pool.map((p) => p.id); // one winner, or co-champions if fully tied
}

/**
 * Build the redacted, client-safe view for one player.
 * SECURITY (§10): never reads state.locked for OTHER players. A locked action reaches a
 * client only as `you.locked` (its own) or inside a reveal (post-resolution, when public).
 */
export function redactDassStateFor(state: GameState, playerId: string): ClientView {
  const players: PublicPlayerView[] = state.players.map((p) => ({
    id: p.id,
    seat: p.seat,
    nickname: p.nickname,
    connected: p.connected,
    live: p.liveStock,
    vault: p.vault,
  }));

  // Declares are public only from REACTION_WINDOW on; during DECLARE you see only your own.
  let declares: Record<string, Action>;
  if (state.phase === 'DECLARE') {
    const mine = state.declares[playerId];
    declares = mine ? { [playerId]: mine } : {};
  } else {
    declares = { ...state.declares };
  }

  const thisReveal =
    state.phase === 'REVEAL' || state.phase === 'VAULT_UPDATE'
      ? state.history[state.history.length - 1]?.reveal
      : undefined;

  return {
    phase: state.phase,
    round: state.round,
    totalRounds: state.totalRounds,
    players,
    declares,
    you: {
      id: playerId,
      declared: state.declares[playerId],
      locked: state.locked[playerId], // YOUR OWN locked action only
    },
    reveal: thisReveal,
    history: state.history.map((r) => r.reveal),
    ended: state.ended,
    winnerIds: state.winnerIds,
    hostId: state.hostId,
  };
}
