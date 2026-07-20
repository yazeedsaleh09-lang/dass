import type { BfPhase } from './types.js';

/**
 * Phase durations (§7). Tuned so a full slice runs ~8 minutes of screen time plus lobby,
 * with no phase long enough to leave a player watching an inactive screen.
 */
export const BF_PHASE_MS: Record<BfPhase, number> = {
  LOBBY: 0,
  INTRO: 24000,
  R1_EVENT: 8000,
  R1_INTEL: 13000,
  R1_DISCUSSION: 50000,
  R1_DECISION: 18000,
  R1_RESOLUTION: 22000,
  R1_AFTERSHOCK: 15000,
  R2_EVENT: 8000,
  R2_INTEL: 14000,
  R2_DISCUSSION: 60000,
  R2_DECISION: 20000,
  R2_TIEBREAK: 6000,
  R2_RESOLUTION: 28000,
  R2_AFTERSHOCK: 18000,
  R3_EVENT: 9000,
  R3_INTEL: 14000,
  R3_DISCUSSION: 60000,
  R3_DECISION: 20000,
  R3_RESOLUTION: 26000,
  FINAL_REVEAL: 46000,
  RESULTS: 0,
};

/** Phases where phones submit and the room may advance early once everyone has locked. */
export const DECISION_PHASES: ReadonlySet<BfPhase> = new Set<BfPhase>([
  'R1_DECISION',
  'R2_DECISION',
  'R2_TIEBREAK',
  'R3_DECISION',
]);

/** Phases where a phone shows a "continue" acknowledgement rather than a game action. */
export const INTEL_PHASES: ReadonlySet<BfPhase> = new Set<BfPhase>(['R1_INTEL', 'R2_INTEL', 'R3_INTEL']);

export const BF_PLAYERS = 5;
export const START_THREAT = 1;
export const MAX_THREAT = 5;

/** Fixed development seed used by the QA harness and visual/audio validation (§34). */
export const BF_DEV_SEED = 20260720;
