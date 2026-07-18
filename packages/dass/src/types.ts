// دسّ — domain types. Framework-agnostic; the single source of truth for the rules.

export type Phase =
  | 'LOBBY'
  | 'DECLARE'
  | 'REACTION_WINDOW'
  | 'LOCK'
  | 'REVEAL'
  | 'VAULT_UPDATE'
  | 'GAME_END';

export type ActionKind = 'back' | 'dump' | 'sell';

export interface Action {
  kind: ActionKind;
  /** playerId for back/dump; omitted for sell (always self). */
  target?: string;
}

export interface PlayerState {
  id: string;
  seat: number;
  nickname: string;
  connected: boolean;
  /** Numberless to players (rendered as a bar). Public: movement is not secret, only authorship is. */
  liveStock: number;
  /** Banked, cumulative, shown as a number once locked. */
  vault: number;
  peakLive: number; // tiebreak
  supportReceived: number; // tiebreak
  vaultLeaderRounds: number; // primary tiebreak; never surfaced as a persistent emblem (N2)
}

/** One player's outcome in a resolved round: promised vs. done. */
export interface RevealEntry {
  playerId: string;
  declared?: Action;
  actual?: Action;
  isDassa: boolean; // a documented betrayal: actual contradicts the public declare
}

export interface RevealView {
  round: number;
  entries: RevealEntry[];
}

/** A sell (bank) event — the N1 instrument. */
export interface SellEvent {
  round: number;
  playerId: string;
  height: number;
  voluntary: boolean; // false = market-close auto-sell
}

export interface RoundRecord {
  round: number;
  reveal: RevealView;
  sells: SellEvent[];
  vaultLeaderId?: string; // N2 instrument
}

export interface GameState {
  phase: Phase;
  round: number; // 0 in lobby; 1-based in play
  totalRounds: number;
  players: PlayerState[];
  declares: Record<string, Action>; // current round, PUBLIC
  locked: Record<string, Action>; // current round, SECRET — server-only, never pushed pre-reveal
  history: RoundRecord[];
  hostId?: string;
  ended: boolean;
  winnerIds: string[];
}

// ---- client-facing (redacted) ----

export interface PublicPlayerView {
  id: string;
  seat: number;
  nickname: string;
  connected: boolean;
  live: number; // relative bar value; client renders numberless
  vault: number; // numeric (shown)
  /** Lobby-only readiness. Omitted once play starts. */
  ready?: boolean;
  /** Disconnected but inside the recovery window — the seat is being held, not abandoned. */
  recovering?: boolean;
}

export interface ClientView {
  phase: Phase;
  round: number;
  totalRounds: number;
  players: PublicPlayerView[];
  declares: Record<string, Action>; // public leans (empty until REACTION_WINDOW)
  you: { id: string; declared?: Action; locked?: Action; reactionMoved?: boolean }; // YOUR OWN choices only
  /** Deliberately absent until GAME_END: action authorship is the final reveal. */
  reveal?: RevealView;
  /** Empty during play; populated only at GAME_END for the chronological final reveal. */
  history: RevealView[];
  ended: boolean;
  winnerIds: string[];
  phaseEndsAt?: number; // set by the room, not the engine
  hostId?: string;
  /** Whether the host connection is currently live (set by the room). Drives "host reconnecting". */
  hostConnected?: boolean;
}

export interface PlayerInput {
  id: string;
  nickname: string;
  seat: number;
}
