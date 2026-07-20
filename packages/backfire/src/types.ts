// BACKFIRE — "The Broken Relay" vertical slice. Domain types.
// Framework-agnostic and the single source of truth for the rules. The server executes this
// engine authoritatively; clients only ever read a redacted view (see redact.ts).

export type BfPhase =
  | 'LOBBY'
  | 'INTRO'
  | 'R1_EVENT'
  | 'R1_INTEL'
  | 'R1_DISCUSSION'
  | 'R1_DECISION'
  | 'R1_RESOLUTION'
  | 'R1_AFTERSHOCK'
  | 'R2_EVENT'
  | 'R2_INTEL'
  | 'R2_DISCUSSION'
  | 'R2_DECISION'
  | 'R2_TIEBREAK'
  | 'R2_RESOLUTION'
  | 'R2_AFTERSHOCK'
  | 'R3_EVENT'
  | 'R3_INTEL'
  | 'R3_DISCUSSION'
  | 'R3_DECISION'
  | 'R3_RESOLUTION'
  | 'FINAL_REVEAL'
  | 'RESULTS';

export type WorldStatus = 'stable' | 'unstable' | 'critical' | 'collapse';
export type EchoStatus = 'none' | 'dormant' | 'charged' | 'critical' | 'resolved';

/** The one round-specific instrument a player holds. Not a permanent role (§11). */
export type RoundTool =
  | 'vote'
  | 'support'
  | 'disrupt'
  | 'redirect'
  | 'shield'
  | 'side' // R3: one of the three players who back a side
  | null;

export type SideChoice = 'redirect' | 'shield' | 'abstain';

/** Everything a phone may submit. Validated server-side against the player's tool. */
export type BfDecision =
  | { kind: 'vote'; target: string }
  | { kind: 'support'; target: string }
  | { kind: 'disrupt'; target: string }
  | { kind: 'redirect'; source: string; target: string }
  | { kind: 'shield'; target: string }
  | { kind: 'tiebreak'; target: string }
  | { kind: 'echo_target'; target: string }
  | { kind: 'echo_shield'; target: string }
  | { kind: 'side'; side: SideChoice };

export interface BfWorld {
  threat: number; // 0..5
  worldStatus: WorldStatus;
  echoHolderId: string | null;
  echoCharge: number; // 0..2
  echoStatus: EchoStatus;
  roundNumber: 1 | 2 | 3;
  currentCarrierId: string | null;
  routeCompromised: boolean;
  collapsed: boolean;
}

export interface BfPlayer {
  id: string;
  seat: number;
  nickname: string;
  connected: boolean;
  influence: number;
  /** Actions by this player that directly pushed Threat up — the first tiebreak (§28). */
  threatContribution: number;
  /** Secret actions of theirs that measurably changed an outcome — the second tiebreak. */
  successfulActions: number;
  roundTool: RoundTool;
  privateIntelId: string | null;
  privateObjectiveId: string | null;
  /** Per-round objective results, for the results screen. */
  objectivesWon: boolean[];
}

/**
 * The full authorship record. Kept server-side for the whole match and surfaced ONLY through
 * the final reveal — `visibleBeforeFinalReveal` is the gate every redaction honors.
 */
export interface SecretAction {
  round: 1 | 2 | 3;
  actorId: string;
  actionType: string;
  sourceTargetId?: string;
  destinationTargetId?: string;
  resolved: boolean;
  changedOutcome: boolean;
  visibleBeforeFinalReveal: boolean;
}

// ---------------- per-round server state ----------------

export interface Round1State {
  /** The two players the relay will accept as Operator. */
  candidateIds: [string, string];
  /** Which candidate carries the stable outcome. Secret until the intel that names it is read. */
  stableId: string;
  riskyId: string;
  votes: Record<string, string>; // voterId -> candidateId (SECRET)
  operatorId: string | null;
  tally: Record<string, number>; // candidateId -> votes (public after resolution)
  tiedDefault: boolean; // resolved by the stated stability default rather than a majority
  resolved: boolean;
}

export interface Round2State {
  tools: Record<string, RoundTool>;
  supports: { actorId: string; target: string }[]; // SECRET authorship
  disrupt: { actorId: string; target: string } | null;
  redirect: { actorId: string; source: string; target: string } | null;
  shield: { actorId: string; target: string } | null;
  /** Route Strength after every step, keyed by player id (public after resolution). */
  strength: Record<string, number>;
  /** Strength if only Support had applied — used to prove interference changed the outcome. */
  baseStrength: Record<string, number>;
  carrierId: string | null;
  /** Who would have carried it with Support alone. */
  naturalCarrierId: string | null;
  disruptApplied: boolean;
  redirectApplied: boolean; // the redirect found a positive Support to move
  disruptChangedCarrier: boolean;
  redirectChangedCarrier: boolean;
  compromised: boolean;
  shieldedId: string | null;
  echoExposed: boolean; // the Carrier was the Echo holder, unshielded
  routeFailed: boolean;
  tieIds: string[];
  tiebreakVotes: Record<string, string>;
  tiebreakUsed: boolean;
  tiebreakBySeat: boolean;
  resolved: boolean;
}

export type EchoOutcome = 'contained' | 'landed' | 'redirected' | 'backfire';

export interface Round3State {
  redirectorId: string | null; // public this round (§22)
  guardianId: string | null; // public this round
  echoTargetId: string | null; // SECRET until resolution
  protectedId: string | null; // SECRET until resolution
  sides: Record<string, SideChoice>; // SECRET; only totals are ever published
  redirectPower: number;
  shieldPower: number;
  outcome: EchoOutcome | null;
  finalTargetId: string | null;
  resolved: boolean;
}

export interface BfGame {
  phase: BfPhase;
  players: BfPlayer[];
  world: BfWorld;
  seed: number;
  rngState: number;
  r1: Round1State;
  r2: Round2State;
  r3: Round3State;
  actions: SecretAction[];
  /** Current decision phase buffer. SECRET — never pushed to another client. */
  decisions: Record<string, BfDecision>;
  threatLog: { round: number; delta: number; reasonId: string }[];
  ended: boolean;
  winnerIds: string[];
  sharedFailure: boolean;
  hostId?: string;
}

// ---------------- client-facing (redacted) ----------------

export interface BfPublicPlayer {
  id: string;
  seat: number;
  nickname: string;
  connected: boolean;
  ready?: boolean;
  recovering?: boolean;
  /** Whether this player has locked their decision — a count, never the content (§Pillar 2). */
  locked: boolean;
  /** Only populated once the match is over. */
  influence?: number;
}

/** Anonymous resolution payload for Round 1. Individual votes are never published. */
export interface R1Reveal {
  candidateIds: [string, string];
  operatorId: string | null;
  tally: { id: string; votes: number }[];
  stableWon: boolean;
  tiedDefault: boolean;
  threatDelta: number;
  echoCharge: number;
}

/**
 * Anonymous resolution payload for Round 2. Deliberately carries NO actor ids: the TV animates
 * interference without ever holding the identity of who caused it (§Pillar 2 / §16).
 */
export interface R2Reveal {
  supportTargets: string[]; // who received Support, in application order (owners omitted)
  disrupted: boolean;
  disruptTarget: string | null;
  redirected: boolean;
  redirectFrom: string | null;
  redirectTo: string | null;
  strength: { id: string; value: number }[];
  carrierId: string | null;
  naturalCarrierId: string | null;
  routeFailed: boolean;
  compromised: boolean;
  echoExposed: boolean;
  shieldBlocked: boolean;
  tiebreakUsed: boolean;
  tiebreakBySeat: boolean;
  threatDelta: number;
  echoCharge: number;
  echoStatus: EchoStatus;
}

/** Round 3 payload. Redirector/Guardian are public this round; individual sides never are. */
export interface R3Reveal {
  redirectorId: string | null;
  guardianId: string | null;
  echoTargetId: string | null;
  protectedId: string | null;
  redirectPower: number;
  shieldPower: number;
  outcome: EchoOutcome | null;
  finalTargetId: string | null;
  echoCharge: number;
  threatDelta: number;
}

export interface RevealCard {
  id: 'first_choice' | 'hidden_interference' | 'changed_path' | 'protection' | 'backfire';
  title: string;
  line: string;
  /** Player the card points at, for the TV to highlight. */
  focusId: string | null;
  tone: 'neutral' | 'interference' | 'protection' | 'backfire';
}

export interface BfFinalReveal {
  cards: RevealCard[];
  summary: string;
  origin: string;
  collapsed: boolean;
}

/** What a single client is allowed to know right now. */
export interface BfClientView {
  phase: BfPhase;
  world: BfWorld;
  players: BfPublicPlayer[];
  lockedCount: number;
  expectedCount: number;
  you: {
    id: string;
    isTv: boolean;
    isSpectator: boolean;
    tool: RoundTool;
    /** Rendered private text — already localized; only ever this player's own. */
    intel: string | null;
    objective: string | null;
    decision: BfDecision | null;
    /** Options the phone may present, computed server-side so the client cannot invent one. */
    targets: string[];
  };
  /** The two players the relay will accept as Operator. Public from the Round 1 event on. */
  candidates: string[];
  /** R3 only: these two positions are deliberately public (§22). Their targets are not. */
  publicRoles: { redirectorId: string | null; guardianId: string | null };
  r1?: R1Reveal;
  r2?: R2Reveal;
  r3?: R3Reveal;
  finalReveal?: BfFinalReveal;
  results?: { id: string; influence: number; objectivesWon: boolean[] }[];
  ended: boolean;
  winnerIds: string[];
  sharedFailure: boolean;
  phaseEndsAt?: number;
  hostId?: string;
  hostConnected?: boolean;
  roomCode?: string;
}

export interface BfPlayerInput {
  id: string;
  nickname: string;
  seat: number;
}
