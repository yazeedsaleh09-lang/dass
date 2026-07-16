// V2 rules engine — pure, deterministic. New design (not v1): civic roles with hidden
// stakes, 4 hidden city variables surfaced only as bands, confirmed/rumored info with
// credibility, and the commit → reveal → challenge → lock decision flow (the online-native
// Public Commitment Phase). Reuses the v1 pattern (pure reducer → per-client redacted view).

import type { LogEntry } from '@crisis/i18n';
export type { LogEntry };

export type StateVar = 'infrastructure' | 'trust' | 'economy' | 'health';
export const STATE_VARS: readonly StateVar[] = ['infrastructure', 'trust', 'economy', 'health'];
export type CityState = Record<StateVar, number>; // 0-100, hidden
export type Band = 'critical' | 'strained' | 'stable';

export type RoleId =
  | 'hospital' | 'infrastructure' | 'economy' | 'trust' | 'emergency' | 'community' | 'housing' | 'environment';
export interface Role { id: RoleId; nameKey: string; blurbKey: string; stake: StateVar }

export type Confidence = 'confirmed' | 'rumored';
export interface InfoCard { id: string; roleId: RoleId; textKey: string; confidence: Confidence; truth: boolean }

export interface CrisisOption {
  id: string;
  titleKey: string;
  effects: Partial<CityState>;
  plantsThread?: string;
  resultKey: string;
}
export interface ThreadCallback { ifThread: string; calloutKey: string; effects?: Partial<CityState> }
export interface Crisis {
  id: string;
  titleKey: string;
  briefKey: string;
  reads: StateVar[];
  rolesRelevant: RoleId[];
  tier?: 'early' | 'mid' | 'late' | 'final';
  onThread?: ThreadCallback[];
  infoCards: InfoCard[];
  options: CrisisOption[];
}

export type Phase =
  | 'lobby' | 'prologue' | 'briefing' | 'discussion' | 'commit' | 'reveal' | 'challenge' | 'resolution' | 'interlude' | 'ending';

export interface PlayerState {
  id: string;
  seat: number;
  nickname: string;
  roleId: RoleId;
  connected: boolean;
  ready: boolean;
  commit?: string; // optionId — the single commitment that becomes the vote
  heldInfoIds: string[];
  revealedInfoIds: string[];
  sharedTrueRumor: boolean;
  sharedFalseRumor: boolean;
}
export interface RevealedInfo { playerId: string; infoId: string; textKey: string; confidence: Confidence }
export interface DecisionRecord { crisisId: string; chosenOptionId: string; splitByOption: Record<string, number> }
export interface Ending { kind: 'thriving' | 'holding' | 'fractured' | 'collapse'; textKey: string }
export interface RoleOutcome {
  playerId: string; nickname: string; roleId: RoleId; stake: StateVar; stakeBand: Band;
  noteKey: string; credibilityKey?: string;
}

export interface ContentBundle { roles: Role[]; crises: Crisis[]; playlist: string[]; startCity: CityState }
export interface PlayerInput { id: string; nickname: string }

export interface MatchState {
  phase: Phase;
  crisisIndex: number;
  playlist: string[];
  currentCrisisId?: string;
  city: CityState;
  players: PlayerState[];
  threads: string[];
  revealedInfo: RevealedInfo[];
  revealSnapshot?: Record<string, string>; // playerId -> optionId at the reveal beat
  history: DecisionRecord[];
  timeline: LogEntry[];
  seed: number;
  ended: boolean;
  ending?: Ending;
  roleOutcomes?: RoleOutcome[];
}

// ---------- rng / helpers ----------
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const ai = a[i]!, aj = a[j]!;
    a[i] = aj; a[j] = ai;
  }
  return a;
}
const clone = <T>(x: T): T => structuredClone(x);
const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

export function bandFor(v: number): Band {
  if (v <= 25) return 'critical';
  if (v <= 50) return 'strained';
  return 'stable';
}
function applyEffects(city: CityState, effects: Partial<CityState>): void {
  for (const k of STATE_VARS) {
    const d = effects[k];
    if (d !== undefined) city[k] = clamp(city[k] + d);
  }
}
export function getCrisis(content: ContentBundle, id: string): Crisis {
  const c = content.crises.find((x) => x.id === id);
  if (!c) throw new Error(`unknown crisis ${id}`);
  return c;
}
export function getRole(content: ContentBundle, id: RoleId): Role {
  const r = content.roles.find((x) => x.id === id);
  if (!r) throw new Error(`unknown role ${id}`);
  return r;
}

// ---------- lifecycle ----------
export function initMatch(players: PlayerInput[], content: ContentBundle, seed: number): MatchState {
  const rng = makeRng(seed);
  const roleOrder = shuffle(content.roles, rng);
  const ps: PlayerState[] = players.map((p, i) => ({
    id: p.id, seat: i, nickname: p.nickname, roleId: roleOrder[i % roleOrder.length]!.id,
    connected: true, ready: false, heldInfoIds: [], revealedInfoIds: [],
    sharedTrueRumor: false, sharedFalseRumor: false,
  }));
  return {
    phase: 'prologue', crisisIndex: -1, playlist: content.playlist.slice(), city: { ...content.startCity },
    players: ps, threads: [], revealedInfo: [], history: [], timeline: [{ key: 'v2.log.prologue' }],
    seed, ended: false,
  };
}

function dealInfo(s: MatchState, crisis: Crisis): void {
  for (const p of s.players) { p.heldInfoIds = []; p.revealedInfoIds = []; p.commit = undefined; }
  s.revealedInfo = [];
  s.revealSnapshot = undefined;
  // Each info card goes to any player holding its role (roles can repeat if fewer players than roles).
  for (const card of crisis.infoCards) {
    for (const p of s.players) if (p.roleId === card.roleId) p.heldInfoIds.push(card.id);
  }
}

export function beginMatch(state: MatchState, content: ContentBundle): MatchState {
  const s = clone(state);
  s.crisisIndex = 0;
  return startCrisis(s, content);
}

function startCrisis(s: MatchState, content: ContentBundle): MatchState {
  const id = s.playlist[s.crisisIndex];
  if (id === undefined) throw new Error('crisis index out of range');
  const crisis = getCrisis(content, id);
  s.currentCrisisId = id;
  s.phase = 'briefing';
  // Consequence callbacks: earlier decisions reshape this crisis.
  for (const cb of crisis.onThread ?? []) {
    if (s.threads.includes(cb.ifThread)) {
      if (cb.effects) applyEffects(s.city, cb.effects);
      s.timeline.push({ key: 'v2.log.callout', params: { textKey: cb.calloutKey } });
    }
  }
  dealInfo(s, crisis);
  s.timeline.push({
    key: crisis.tier === 'final' ? 'v2.log.crisisFinal' : 'v2.log.crisis',
    params: { index: s.crisisIndex + 1, titleKey: crisis.titleKey, briefKey: crisis.briefKey },
  });
  return s;
}

export function setCommit(state: MatchState, playerId: string, optionId: string | undefined): MatchState {
  if (state.phase !== 'commit' && state.phase !== 'challenge') return state;
  const s = clone(state);
  const p = s.players.find((x) => x.id === playerId);
  if (!p) return state;
  p.commit = optionId;
  return s;
}

export function revealInfo(state: MatchState, playerId: string, infoId: string, content: ContentBundle): MatchState {
  if (!state.currentCrisisId) return state;
  const p = state.players.find((x) => x.id === playerId);
  if (!p || !p.heldInfoIds.includes(infoId) || p.revealedInfoIds.includes(infoId)) return state;
  const crisis = getCrisis(content, state.currentCrisisId);
  const card = crisis.infoCards.find((c) => c.id === infoId);
  if (!card) return state;
  const s = clone(state);
  const pp = s.players.find((x) => x.id === playerId)!;
  pp.revealedInfoIds.push(infoId);
  if (card.confidence === 'rumored') {
    if (card.truth) pp.sharedTrueRumor = true;
    else pp.sharedFalseRumor = true;
  }
  s.revealedInfo.push({ playerId, infoId, textKey: card.textKey, confidence: card.confidence });
  return s;
}

export function availableOptions(crisis: Crisis): CrisisOption[] {
  return crisis.options;
}

function tally(s: MatchState, opts: CrisisOption[]): { winner: CrisisOption; split: Record<string, number> } {
  const split: Record<string, number> = {};
  for (const o of opts) split[o.id] = 0;
  for (const p of s.players) if (p.commit && split[p.commit] !== undefined) split[p.commit] = (split[p.commit] ?? 0) + 1;
  const max = Math.max(0, ...Object.values(split));
  const worst = STATE_VARS.reduce((a, b) => (s.city[a] <= s.city[b] ? a : b));
  const leastHarm = (a: CrisisOption, b: CrisisOption) => ((a.effects[worst] ?? 0) >= (b.effects[worst] ?? 0) ? a : b);
  if (max === 0) return { winner: opts.reduce(leastHarm), split };
  const top = opts.filter((o) => (split[o.id] ?? 0) === max);
  return { winner: top.length === 1 ? top[0]! : top.reduce(leastHarm), split };
}

function resolveDecision(s: MatchState, content: ContentBundle): void {
  const crisis = getCrisis(content, s.currentCrisisId!);
  const opts = availableOptions(crisis);
  const { winner, split } = tally(s, opts);
  applyEffects(s.city, winner.effects);
  if (winner.plantsThread) s.threads.push(winner.plantsThread);
  s.history.push({ crisisId: crisis.id, chosenOptionId: winner.id, splitByOption: split });
  s.timeline.push({ key: 'v2.log.chose', params: { titleKey: winner.titleKey, resultKey: winner.resultKey } });
  // reveal which rumored info turned out false (fog)
  for (const ri of s.revealedInfo) {
    const card = crisis.infoCards.find((c) => c.id === ri.infoId);
    if (card && card.confidence === 'rumored' && !card.truth) {
      s.timeline.push({ key: 'v2.log.rumorFalse', params: { textKey: card.textKey } });
    }
  }
  for (const p of s.players) p.commit = undefined;
}

export function nextPhase(state: MatchState, content: ContentBundle): MatchState {
  if (state.ended) return state;
  const s = clone(state);
  switch (s.phase) {
    case 'briefing': s.phase = 'discussion'; return s;
    case 'discussion': s.phase = 'commit'; return s;
    case 'commit':
      s.revealSnapshot = {};
      for (const p of s.players) if (p.commit) s.revealSnapshot[p.id] = p.commit;
      s.phase = 'reveal';
      return s;
    case 'reveal': s.phase = 'challenge'; return s;
    case 'challenge':
      resolveDecision(s, content);
      s.phase = 'resolution';
      return s;
    case 'resolution': {
      const isLast = s.crisisIndex >= s.playlist.length - 1;
      if (isLast) return toEnding(s, content);
      s.phase = 'interlude';
      return s;
    }
    case 'interlude':
      s.crisisIndex += 1;
      return startCrisis(s, content);
    default:
      return s;
  }
}

export function computeEnding(city: CityState): Ending {
  for (const k of STATE_VARS) if (city[k] <= 0) return { kind: 'collapse', textKey: 'v2.ending.collapse.text' };
  const bands = STATE_VARS.map((k) => bandFor(city[k]));
  if (bands.every((b) => b === 'stable')) return { kind: 'thriving', textKey: 'v2.ending.thriving.text' };
  if (bands.includes('critical')) return { kind: 'fractured', textKey: 'v2.ending.fractured.text' };
  return { kind: 'holding', textKey: 'v2.ending.holding.text' };
}

function toEnding(s: MatchState, content: ContentBundle): MatchState {
  s.phase = 'ending';
  s.ended = true;
  s.ending = computeEnding(s.city);
  s.timeline.push({ key: 'v2.log.ending', params: { kindKey: `v2.ending.label.${s.ending.kind}`, textKey: s.ending.textKey } });
  s.roleOutcomes = s.players.map((p) => {
    const role = getRole(content, p.roleId);
    const band = bandFor(s.city[role.stake]);
    const credibilityKey = p.sharedFalseRumor
      ? 'v2.cred.false'
      : p.sharedTrueRumor
        ? 'v2.cred.true'
        : undefined;
    return {
      playerId: p.id, nickname: p.nickname, roleId: p.roleId, stake: role.stake, stakeBand: band,
      noteKey: `v2.outcome.${band}`, credibilityKey,
    };
  });
  return s;
}

// ---------- client-facing redacted view ----------
export interface ClientRole { id: RoleId; nameKey: string; blurbKey: string }
export interface ClientPlayer {
  id: string; seat: number; nickname: string; roleId: RoleId; nameKey: string;
  connected: boolean; ready: boolean; hasCommitted: boolean; isHost: boolean;
  revealedCommit?: string; // shown only after the reveal beat
}
export interface ClientView {
  phase: Phase;
  crisisIndex: number;
  total: number;
  cityBands: Record<StateVar, Band>;
  players: ClientPlayer[];
  crisis?: { id: string; titleKey: string; briefKey: string; options: { id: string; titleKey: string }[] };
  you: {
    id: string; roleId?: RoleId; roleNameKey?: string; roleBlurbKey?: string; stakeVar?: StateVar;
    info: { id: string; textKey: string; confidence: Confidence }[];
    commit?: string;
  };
  revealedInfo: RevealedInfo[];
  timeline: LogEntry[];
  ended: boolean;
  ending?: Ending;
  roleOutcomes?: RoleOutcome[];
  phaseEndsAt?: number;
}

export function redactStateFor(
  state: MatchState, playerId: string, content: ContentBundle, hostId?: string, revealStakes = false,
): ClientView {
  const you = state.players.find((p) => p.id === playerId);
  const crisis = state.currentCrisisId ? getCrisis(content, state.currentCrisisId) : undefined;
  const showCommits = state.phase === 'reveal' || state.phase === 'challenge' || state.phase === 'resolution';
  const cityBands = {} as Record<StateVar, Band>;
  for (const k of STATE_VARS) cityBands[k] = bandFor(state.city[k]);
  const players: ClientPlayer[] = state.players.map((p) => {
    const role = getRole(content, p.roleId);
    return {
      id: p.id, seat: p.seat, nickname: p.nickname, roleId: p.roleId, nameKey: role.nameKey,
      connected: p.connected, ready: p.ready, hasCommitted: p.commit !== undefined, isHost: p.id === hostId,
      revealedCommit: showCommits ? (state.revealSnapshot?.[p.id] ?? p.commit) : undefined,
    };
  });
  const yourRole = you ? getRole(content, you.roleId) : undefined;
  const info = you
    ? you.heldInfoIds.map((id) => {
        const c = crisis?.infoCards.find((x) => x.id === id);
        return c ? { id: c.id, textKey: c.textKey, confidence: c.confidence } : { id, textKey: id, confidence: 'confirmed' as Confidence };
      })
    : [];
  return {
    phase: state.phase, crisisIndex: state.crisisIndex, total: state.playlist.length, cityBands, players,
    crisis: crisis
      ? { id: crisis.id, titleKey: crisis.titleKey, briefKey: crisis.briefKey, options: crisis.options.map((o) => ({ id: o.id, titleKey: o.titleKey })) }
      : undefined,
    you: {
      id: playerId, roleId: you?.roleId, roleNameKey: yourRole?.nameKey, roleBlurbKey: yourRole?.blurbKey,
      stakeVar: revealStakes ? yourRole?.stake : yourRole?.stake, info, commit: you?.commit,
    },
    revealedInfo: state.revealedInfo.slice(),
    timeline: state.timeline.slice(),
    ended: state.ended, ending: state.ending, roleOutcomes: state.ended ? state.roleOutcomes : undefined,
  };
}
