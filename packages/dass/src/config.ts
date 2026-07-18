import type { Phase } from './types.js';

export type TimedPhase = Exclude<Phase, 'LOBBY' | 'GAME_END'>;

/**
 * Every knob the paper-playtest tunes lives here (gate posture: config, not hardcoded).
 * An ITERATE verdict = change these values + re-run; no loop rewrite.
 */
export interface DassConfig {
  baselineLive: number;
  backAmount: number;
  dumpAmount: number;
  minLive: number;
  /** 0..1 — fraction of unsold live banked at Market Close (the F4↔N1 knob). */
  marketCloseHaircut: number;
  minPlayers: number;
  maxPlayers: number;
  roundsForPlayers: (n: number) => number;
  phaseMs: Record<TimedPhase, number>;
  /**
   * In-game recovery window (ms): how long a disconnected ACTIVE player's seat is held
   * as recoverable before a returning token is treated as a spectator. Their seat stays
   * on the board (abstaining, never eliminated) regardless — this only governs whether a
   * reconnect RESTORES the active identity or joins as a watcher.
   */
  recoveryMs: number;
}

export const DEFAULT_CONFIG: DassConfig = {
  baselineLive: 10,
  backAmount: 3,
  dumpAmount: 3,
  minLive: 0,
  marketCloseHaircut: 0.5,
  minPlayers: 4,
  maxPlayers: 8,
  roundsForPlayers: (n) => (n <= 4 ? 8 : n <= 6 ? 7 : 6),
  phaseMs: {
    DECLARE: 20000,
    REACTION_WINDOW: 20000,
    LOCK: 10000,
    REVEAL: 4000,
    VAULT_UPDATE: 3000,
  },
  recoveryMs: 120000,
};
