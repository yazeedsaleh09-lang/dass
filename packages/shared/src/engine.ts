// Pure, deterministic rules engine. No side effects, no wall-clock, no Math.random.
// The server executes this authoritatively; the client reuses it for display.
// Everything here implements the LOCKED design — no new mechanics.

import type {
  Band,
  ClientView,
  ContentBundle,
  Crisis,
  CrisisOption,
  Ending,
  Goal,
  GoalOutcome,
  GoalResult,
  LogEntry,
  MatchState,
  Meters,
  MeterId,
  PlayerInput,
  PlayerState,
  PublicPlayer,
  Reliability,
} from './types.js';
import { METER_IDS } from './types.js';

// ---------- deterministic RNG (mulberry32) ----------
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
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
    const ai = a[i]!;
    const aj = a[j]!;
    a[i] = aj;
    a[j] = ai;
  }
  return a;
}

const clone = <T>(x: T): T => structuredClone(x);

// ---------- meters ----------
export function clampMeter(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function bandFor(v: number): Band {
  if (v <= 0) return 'collapse';
  if (v < 20) return 'critical';
  if (v <= 45) return 'warning';
  return 'healthy';
}

function applyDeltas(s: MatchState, deltas: Partial<Meters>): void {
  for (const id of METER_IDS) {
    const d = deltas[id];
    if (d === undefined) continue;
    s.meters[id] = clampMeter(s.meters[id] + d);
    if (bandFor(s.meters[id]) === 'critical') s.everCritical[id] = true;
  }
}

function lowestMeter(m: Meters): MeterId {
  let low: MeterId = 'stability';
  for (const id of METER_IDS) if (m[id] < m[low]) low = id;
  return low;
}

// ---------- content lookups ----------
export function getCrisis(content: ContentBundle, id: string): Crisis {
  const c = content.crises.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown crisis: ${id}`);
  return c;
}

export function getGoal(content: ContentBundle, id: string): Goal {
  const g = content.goals.find((x) => x.id === id);
  if (!g) throw new Error(`Unknown goal: ${id}`);
  return g;
}

/** Options available given active consequence links (implements CrisisSystem conditional options). */
export function availableOptions(state: MatchState, crisis: Crisis): CrisisOption[] {
  return crisis.options.filter((o) => !o.requiresLink || state.activeLinks.includes(o.requiresLink));
}

function addLink(s: MatchState, link: string): void {
  if (!s.activeLinks.includes(link)) s.activeLinks.push(link);
}

// ---------- match lifecycle ----------
export function initMatch(players: PlayerInput[], content: ContentBundle, seed: number): MatchState {
  const rng = makeRng(seed);
  const goalOrder = shuffle(content.goals, rng);
  const playerStates: PlayerState[] = players.map((p, i) => ({
    id: p.id,
    seat: i,
    nickname: p.nickname,
    goalId: goalOrder[i % goalOrder.length]!.id,
    connected: true,
    ready: false,
    vote: undefined,
    heldCardIds: [],
    revealedCardIds: [],
  }));

  return {
    stage: 'prologue',
    crisisPhase: 'briefing',
    crisisIndex: -1,
    playlist: content.playlist.slice(),
    currentCrisisId: undefined,
    meters: { ...content.startMeters },
    players: playerStates,
    activeLinks: [],
    history: [],
    everCritical: { stability: false, resources: false, cohesion: false },
    revealedCards: [],
    seed,
    ended: false,
    log: [
      {
        key: 'log.prologue',
        params: {
          stability: content.startMeters.stability,
          resources: content.startMeters.resources,
          cohesion: content.startMeters.cohesion,
        },
      },
    ],
  };
}

/** Deal a crisis's info cards asymmetrically across seats (the Fog of Crisis). */
function dealInfo(s: MatchState, crisis: Crisis): void {
  for (const p of s.players) {
    p.heldCardIds = [];
    p.revealedCardIds = [];
    p.vote = undefined;
  }
  if (s.players.length === 0) return;
  const rng = makeRng(s.seed + s.crisisIndex + 1);
  const order = shuffle(s.players.map((p) => p.seat), rng);
  crisis.infoCards.forEach((card, i) => {
    const seat = order[i % order.length]!;
    const player = s.players.find((p) => p.seat === seat);
    if (player) player.heldCardIds.push(card.id);
  });
}

export function beginMatch(state: MatchState, content: ContentBundle): MatchState {
  const s = clone(state);
  s.stage = 'crisis';
  s.crisisIndex = 0;
  return startCrisis(s, content);
}

function startCrisis(s: MatchState, content: ContentBundle): MatchState {
  const crisisId = s.playlist[s.crisisIndex];
  if (crisisId === undefined) throw new Error('startCrisis: index out of range');
  const crisis = getCrisis(content, crisisId);
  s.currentCrisisId = crisisId;
  s.crisisPhase = 'briefing';
  s.revealedCards = [];

  // Apply link-conditioned pre-effects (consequence links surfacing).
  for (const eff of crisis.onStartLinkEffects ?? []) {
    if (s.activeLinks.includes(eff.ifLink)) {
      if (eff.meterDeltas) applyDeltas(s, eff.meterDeltas);
      if (eff.narrative) s.log.push({ key: 'log.plain', params: { textKey: eff.narrative } });
    }
  }

  dealInfo(s, crisis);
  s.log.push({
    key: crisis.tier === 'final' ? 'log.crisisIntroFinal' : 'log.crisisIntro',
    params: { index: s.crisisIndex + 1, titleKey: crisis.title, briefKey: crisis.publicBrief },
  });

  // A collapse could be triggered by an onStart link effect.
  checkCollapse(s);
  return s;
}

export function castVote(state: MatchState, playerId: string, optionId: string): MatchState {
  if (state.crisisPhase !== 'decision') return state; // authority: votes only in Decision
  const s = clone(state);
  const player = s.players.find((p) => p.id === playerId);
  if (!player) return state;
  // Record intent; availability is validated against content in resolveDecision (tallyWinner).
  player.vote = optionId;
  return s;
}

/** A player reveals one of their own info cards to the whole group (Fog of Crisis). */
export function revealInfo(state: MatchState, playerId: string, cardId: string, content: ContentBundle): MatchState {
  if (!state.currentCrisisId) return state;
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;
  if (!player.heldCardIds.includes(cardId)) return state; // can only reveal your own card
  if (player.revealedCardIds.includes(cardId)) return state; // already revealed
  const crisis = getCrisis(content, state.currentCrisisId);
  const card = crisis.infoCards.find((c) => c.id === cardId);
  if (!card) return state;
  const s = clone(state);
  const p = s.players.find((x) => x.id === playerId)!;
  p.revealedCardIds.push(cardId);
  s.revealedCards.push({ playerId, cardId, content: card.content, reliability: card.reliability });
  return s;
}

function findGoal(content: ContentBundle, id: string): Goal | undefined {
  return content.goals.find((g) => g.id === id);
}

/**
 * Build the redacted, client-safe view for one player.
 * Hides every OTHER player's private goal and info cards (the fog stays server-side).
 * At the ending, all goals are revealed (the recap).
 */
export function redactStateFor(
  state: MatchState,
  playerId: string,
  content: ContentBundle,
  hostId?: string,
): ClientView {
  const you = state.players.find((p) => p.id === playerId);
  const crisis = state.currentCrisisId ? getCrisis(content, state.currentCrisisId) : undefined;

  const players: PublicPlayer[] = state.players.map((p) => ({
    id: p.id,
    seat: p.seat,
    nickname: p.nickname,
    connected: p.connected,
    ready: p.ready,
    hasVoted: p.vote !== undefined,
    isHost: p.id === hostId,
  }));

  const yourGoal = you ? findGoal(content, you.goalId) : undefined;
  const cards = you
    ? you.heldCardIds.map((id) => {
        const c = crisis?.infoCards.find((x) => x.id === id);
        return c
          ? { id: c.id, content: c.content, reliability: c.reliability }
          : { id, content: '(unknown)', reliability: 'confirmed' as Reliability };
      })
    : [];

  const goalResults =
    state.ended && state.goalResults
      ? state.goalResults.map((gr) => {
          const p = state.players.find((x) => x.id === gr.playerId);
          const g = findGoal(content, gr.goalId);
          return { ...gr, nickname: p?.nickname ?? gr.playerId, goalTitle: g?.title ?? gr.goalId };
        })
      : undefined;

  return {
    stage: state.stage,
    crisisPhase: state.crisisPhase,
    crisisIndex: state.crisisIndex,
    playlistLength: state.playlist.length,
    meters: { ...state.meters },
    players,
    crisis: crisis
      ? {
          id: crisis.id,
          title: crisis.title,
          category: crisis.category,
          tier: crisis.tier,
          publicBrief: crisis.publicBrief,
          options: availableOptions(state, crisis).map((o) => ({ id: o.id, title: o.title })),
        }
      : undefined,
    you: {
      id: playerId,
      goalId: you?.goalId,
      goalTitle: yourGoal?.title,
      goalDescription: yourGoal?.description,
      cards,
      vote: you?.vote,
    },
    revealedCards: state.revealedCards.slice(),
    log: state.log.slice(),
    ended: state.ended,
    ending: state.ending,
    goalResults,
  };
}

function tallyWinner(s: MatchState, opts: CrisisOption[]): CrisisOption {
  const counts = new Map<string, number>();
  for (const p of s.players) {
    if (p.vote && opts.some((o) => o.id === p.vote)) {
      counts.set(p.vote, (counts.get(p.vote) ?? 0) + 1);
    }
  }
  const low = lowestMeter(s.meters);
  const leastHarmful = (a: CrisisOption, b: CrisisOption): CrisisOption =>
    (a.meterDeltas[low] ?? 0) >= (b.meterDeltas[low] ?? 0) ? a : b;

  const maxVotes = Math.max(0, ...[...counts.values()]);
  if (maxVotes === 0) {
    // No votes: default to the option least harmful to the lowest meter (CoreLoop §5).
    return opts.reduce(leastHarmful);
  }
  const top = opts.filter((o) => (counts.get(o.id) ?? 0) === maxVotes);
  if (top.length === 1) return top[0]!;
  // Tie: least harmful to the lowest meter, then first authored order.
  return top.reduce(leastHarmful);
}

export function resolveDecision(state: MatchState, content: ContentBundle): MatchState {
  const s = clone(state);
  if (!s.currentCrisisId) return s;
  const crisis = getCrisis(content, s.currentCrisisId);
  const opts = availableOptions(s, crisis);
  const chosen = tallyWinner(s, opts);

  // Apply effects (final-crisis gating via `requires`).
  let effectDeltas = chosen.meterDeltas;
  let resultText = chosen.resultText;
  if (chosen.requires) {
    const meetsReq = s.meters[chosen.requires.meter] >= chosen.requires.min;
    if (!meetsReq) {
      effectDeltas = chosen.requires.failDeltas;
      resultText = chosen.requires.failText;
    }
  }
  applyDeltas(s, effectDeltas);
  for (const link of chosen.linksPlanted) addLink(s, link);

  // Reveal fog: which uncertain info proved false.
  const uncertain = crisis.infoCards.filter((c) => c.reliability !== 'confirmed');
  const hadUncertainInfo = uncertain.length > 0;
  for (const card of uncertain) {
    s.log.push({ key: card.truth ? 'log.infoTrue' : 'log.infoFalse', params: { contentKey: card.content } });
  }

  const votesSnapshot: Record<string, string> = {};
  for (const p of s.players) if (p.vote) votesSnapshot[p.id] = p.vote;

  s.history.push({
    crisisId: crisis.id,
    chosenOptionId: chosen.id,
    tags: chosen.tags.slice(),
    hadUncertainInfo,
    votes: votesSnapshot,
    metersAfter: { ...s.meters },
  });

  s.log.push({ key: 'log.chose', params: { titleKey: chosen.title, resultKey: resultText } });
  s.log.push({
    key: 'log.meters',
    params: { stability: s.meters.stability, resources: s.meters.resources, cohesion: s.meters.cohesion },
  });

  s.crisisPhase = 'resolution';
  checkCollapse(s);
  return s;
}

function checkCollapse(s: MatchState): void {
  for (const id of METER_IDS) {
    if (s.meters[id] <= 0) {
      s.ended = true;
      s.stage = 'ending';
      s.ending = { kind: 'collapse', text: 'ending.collapse.text' };
      s.log.push({ key: 'log.collapse', params: { meterKey: `meter.${id}` } });
      s.goalResults = evaluateGoals(s, id);
      return;
    }
  }
}

export function nextPhase(state: MatchState, content: ContentBundle): MatchState {
  if (state.ended) return state;
  const s = clone(state);
  switch (s.crisisPhase) {
    case 'briefing':
      s.crisisPhase = 'deliberation';
      return s;
    case 'deliberation':
      s.crisisPhase = 'decision';
      return s;
    case 'decision':
      return resolveDecision(s, content);
    case 'resolution': {
      if (s.ended) return s;
      const isLast = s.crisisIndex >= s.playlist.length - 1;
      if (isLast) return toEnding(s, content);
      s.crisisPhase = 'interlude';
      return s;
    }
    case 'interlude': {
      s.crisisIndex += 1;
      return startCrisis(s, content);
    }
    default:
      return s;
  }
}

function toEnding(s: MatchState, content: ContentBundle): MatchState {
  s.stage = 'ending';
  s.ended = true;
  s.ending = computeEnding(s.meters);
  s.log.push({
    key: 'log.ending',
    params: { kindKey: `ending.label.${s.ending.kind}`, textKey: s.ending.text },
  });
  s.goalResults = evaluateGoals(s);
  void content;
  return s;
}

export function computeEnding(m: Meters): Ending {
  for (const id of METER_IDS) if (m[id] <= 0) return { kind: 'collapse', text: 'ending.collapse.text' };
  const bands = METER_IDS.map((id) => bandFor(m[id]));
  if (bands.includes('critical')) return { kind: 'fractured', text: 'ending.fractured.text' };
  if (bands.every((b) => b === 'healthy')) return { kind: 'success', text: 'ending.success.text' };
  return { kind: 'stable', text: 'ending.stable.text' };
}

// ---------- private goals (non-scored, evaluated from final state + history) ----------
export function evaluateGoals(s: MatchState, collapseMeter?: MeterId): GoalResult[] {
  const collapsed = s.ending?.kind === 'collapse' || collapseMeter !== undefined;
  return s.players.map((p) => {
    const goalId = p.goalId;
    if (collapsed) {
      return { playerId: p.id, goalId, outcome: 'unmet' as GoalOutcome, noteKey: 'goal.note.collapseVoid' };
    }
    const [outcome, noteKey, noteParams] = resolveGoal(p.goalId, s);
    return { playerId: p.id, goalId, outcome, noteKey, noteParams };
  });
}

// Returns [outcome, noteKey, noteParams?] — the note is an i18n key rendered client-side.
function resolveGoal(goalId: string, s: MatchState): [GoalOutcome, string, Record<string, string | number>?] {
  const rule = GOAL_RULES[goalId];
  if (!rule) return ['unmet', 'goal.note.unresolved'];
  const m = s.meters;
  const highest = METER_IDS.reduce((a, b) => (m[a] >= m[b] ? a : b));
  const highestTied = METER_IDS.filter((id) => m[id] === m[highest]).length > 1;

  switch (rule.kind) {
    case 'highestMeter': {
      const mk = { meterKey: `meter.${rule.meter}` };
      if (m[rule.meter] === m[highest] && !highestTied) return ['met', 'goal.note.highestMet', mk];
      if (m[rule.meter] === m[highest]) return ['partly', 'goal.note.highestTied', mk];
      return ['unmet', 'goal.note.highestUnmet', mk];
    }
    case 'surviveNoCritical': {
      const anyCritical = METER_IDS.some((id) => s.everCritical[id]);
      return anyCritical ? ['partly', 'goal.note.survivePartly'] : ['met', 'goal.note.surviveMet'];
    }
    case 'boldAtLeast': {
      const bold = s.history.filter((h) => h.tags.includes('bold')).length;
      if (bold >= rule.n) return ['met', 'goal.note.boldMet', { bold }];
      if (bold === rule.n - 1) return ['partly', 'goal.note.boldPartly', { bold, need: rule.n }];
      return ['unmet', 'goal.note.boldUnmet', { bold }];
    }
    case 'leastSafeAtLeastOnce': {
      const risky = s.history.some((h) => h.tags.includes('bold') || h.tags.includes('risky'));
      return risky ? ['met', 'goal.note.leastSafeMet'] : ['unmet', 'goal.note.leastSafeUnmet'];
    }
    case 'neverSacrifice': {
      const sacrificed = s.history.some((h) => h.tags.includes('sacrifice'));
      return sacrificed ? ['unmet', 'goal.note.neverSacrificeUnmet'] : ['met', 'goal.note.neverSacrificeMet'];
    }
    case 'refusedRumor': {
      const opportunities = s.history.filter((h) => h.hadUncertainInfo);
      const refused = opportunities.some((h) => !h.tags.includes('actsOnRumor'));
      const acted = opportunities.some((h) => h.tags.includes('actsOnRumor'));
      if (refused && !acted) return ['met', 'goal.note.refusedMet'];
      if (refused) return ['partly', 'goal.note.refusedPartly'];
      return ['unmet', 'goal.note.refusedUnmet'];
    }
    default:
      return ['unmet', 'goal.note.unresolved'];
  }
}

// Goal rules are keyed by goal id. Content defines matching goal metadata (title/description).
// Kept here so the engine can evaluate without importing content (dependency rule: engine depends on nothing).
export const GOAL_RULES: Record<string, import('./types.js').GoalRule> = {
  goal_provider: { kind: 'highestMeter', meter: 'resources' },
  goal_peacemaker: { kind: 'highestMeter', meter: 'cohesion' },
  goal_guardian: { kind: 'highestMeter', meter: 'stability' },
  goal_pragmatist: { kind: 'surviveNoCritical' },
  goal_hardliner: { kind: 'boldAtLeast', n: 2 },
  goal_restless: { kind: 'leastSafeAtLeastOnce' },
  goal_humanitarian: { kind: 'neverSacrifice' },
  goal_skeptic: { kind: 'refusedRumor' },
};
