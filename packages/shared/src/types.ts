// Domain types for the locked social-crisis engine.
// These implement the locked Phase-1 design (3 meters, authored crises, fog info,
// consequence links, simple-majority vote, non-scored private goals, endings-from-state).
// No new mechanics are introduced here.

export type MeterId = 'stability' | 'resources' | 'cohesion';
export const METER_IDS: readonly MeterId[] = ['stability', 'resources', 'cohesion'];
export type Meters = Record<MeterId, number>;

// Band model from Phase 2.6: healthy >45, warning 20-45, critical 1-19, collapse 0.
export type Band = 'collapse' | 'critical' | 'warning' | 'healthy';

export type Reliability = 'confirmed' | 'reported' | 'contested';

// Authoring metadata used to evaluate private goals from decision history
// (implements CoreLoop §6 "goal evaluated from final state + decisions"). Not a mechanic.
export type OptionTag = 'safe' | 'bold' | 'risky' | 'sacrifice' | 'actsOnRumor';

export interface InfoCard {
  id: string;
  content: string;
  reliability: Reliability;
  /** Resolves at Resolution. 'confirmed' cards are always true. */
  truth: boolean;
}

export interface RequiresRule {
  meter: MeterId;
  min: number;
  /** Applied instead of meterDeltas when the requirement is NOT met (final-crisis gating). */
  failDeltas: Partial<Meters>;
  failText: string;
}

export interface CrisisOption {
  id: string;
  title: string;
  tags: OptionTag[];
  meterDeltas: Partial<Meters>;
  linksPlanted: string[];
  resultText: string;
  /** Optional final-crisis gating on a meter threshold. */
  requires?: RequiresRule;
  /** If set, this option only exists when the given consequence link is active. */
  requiresLink?: string;
}

export type CrisisCategory =
  | 'resource'
  | 'social'
  | 'external'
  | 'infrastructure'
  | 'health'
  | 'moral';

export type CrisisTier = 'early' | 'mid' | 'late' | 'final';

export interface OnStartLinkEffect {
  ifLink: string;
  meterDeltas?: Partial<Meters>;
  narrative?: string;
}

export interface Crisis {
  id: string;
  title: string;
  category: CrisisCategory;
  tier: CrisisTier;
  publicBrief: string;
  infoCards: InfoCard[];
  options: CrisisOption[];
  /** Link-conditioned effects applied when the crisis starts (implements CrisisSystem §6). */
  onStartLinkEffects?: OnStartLinkEffect[];
}

export type GoalRule =
  | { kind: 'highestMeter'; meter: MeterId }
  | { kind: 'surviveNoCritical' }
  | { kind: 'boldAtLeast'; n: number }
  | { kind: 'leastSafeAtLeastOnce' }
  | { kind: 'neverSacrifice' }
  | { kind: 'refusedRumor' };

export interface Goal {
  id: string;
  title: string;
  description: string;
  /** Optional: the engine owns the canonical rule via GOAL_RULES (keyed by id). */
  rule?: GoalRule;
}

export type GoalOutcome = 'met' | 'partly' | 'unmet';

export type MatchStage = 'lobby' | 'prologue' | 'crisis' | 'ending';
export type CrisisPhase = 'briefing' | 'deliberation' | 'decision' | 'resolution' | 'interlude';

export interface PlayerState {
  id: string;
  seat: number;
  nickname: string;
  goalId: string;
  connected: boolean;
  ready: boolean;
  /** optionId chosen this crisis, or undefined = abstain. */
  vote?: string;
  heldCardIds: string[];
  revealedCardIds: string[];
}

export interface DecisionRecord {
  crisisId: string;
  chosenOptionId: string;
  tags: OptionTag[];
  hadUncertainInfo: boolean;
  votes: Record<string, string>;
  metersAfter: Meters;
}

export interface Ending {
  kind: 'success' | 'stable' | 'fractured' | 'collapse';
  text: string;
}

export interface GoalResult {
  playerId: string;
  goalId: string;
  outcome: GoalOutcome;
  note: string;
}

export interface RevealedCard {
  playerId: string;
  cardId: string;
  content: string;
  reliability: Reliability;
}

export interface MatchState {
  stage: MatchStage;
  crisisPhase: CrisisPhase;
  crisisIndex: number;
  /** Ordered crisis ids; the last one is the Final Crisis (tier 'final'). */
  playlist: string[];
  currentCrisisId?: string;
  meters: Meters;
  players: PlayerState[];
  activeLinks: string[];
  history: DecisionRecord[];
  everCritical: Record<MeterId, boolean>;
  /** Info cards a player chose to reveal to the whole group this crisis. */
  revealedCards: RevealedCard[];
  seed: number;
  ended: boolean;
  ending?: Ending;
  goalResults?: GoalResult[];
  /** Human-readable narration, appended as the match progresses. */
  log: string[];
}

// ---- Client-facing view (redacted: hides other players' private goals/cards) ----
export interface PublicPlayer {
  id: string;
  seat: number;
  nickname: string;
  connected: boolean;
  ready: boolean;
  hasVoted: boolean;
  isHost: boolean;
}

export interface ClientOption {
  id: string;
  title: string;
}

export interface ClientCrisis {
  id: string;
  title: string;
  category: CrisisCategory;
  tier: CrisisTier;
  publicBrief: string;
  options: ClientOption[];
}

export interface ClientView {
  stage: MatchStage;
  crisisPhase: CrisisPhase;
  crisisIndex: number;
  playlistLength: number;
  meters: Meters;
  players: PublicPlayer[];
  crisis?: ClientCrisis;
  you: {
    id: string;
    goalId?: string;
    goalTitle?: string;
    goalDescription?: string;
    cards: { id: string; content: string; reliability: Reliability }[];
    vote?: string;
  };
  revealedCards: RevealedCard[];
  log: string[];
  ended: boolean;
  ending?: Ending;
  /** Present only when ended: everyone's goal is revealed at the recap. */
  goalResults?: (GoalResult & { nickname: string; goalTitle: string })[];
  /** Server-set epoch ms when the current timed phase ends (for the client clock). */
  phaseEndsAt?: number;
}

export interface PlayerInput {
  id: string;
  nickname: string;
}

export interface ContentBundle {
  crises: Crisis[];
  goals: Goal[];
  /** Ordered crisis ids for v0.1 (linear playlist; last = final). */
  playlist: string[];
  startMeters: Meters;
}
