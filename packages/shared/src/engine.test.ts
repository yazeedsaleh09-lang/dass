import { describe, it, expect } from 'vitest';
import { content } from '@crisis/content';
import {
  availableOptions,
  bandFor,
  beginMatch,
  castVote,
  clampMeter,
  computeEnding,
  getCrisis,
  GOAL_RULES,
  initMatch,
  lintContent,
  METER_IDS,
  nextPhase,
  redactStateFor,
  revealInfo,
  validateContent,
  type MatchState,
  type Meters,
  type PlayerInput,
} from './index.js';

const mkPlayers = (n: number): PlayerInput[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, nickname: `P${i + 1}` }));

/** Play a full match voting a fixed option per crisis index; capture meters at each briefing. */
function playWith(votes: string[], count = 5, seed = 1) {
  let s: MatchState = initMatch(mkPlayers(count), content, seed);
  s = beginMatch(s, content);
  const metersAtBriefing: Meters[] = [];
  let guard = 0;
  while (!s.ended && guard++ < 100) {
    if (s.crisisPhase === 'briefing') metersAtBriefing[s.crisisIndex] = { ...s.meters };
    if (s.crisisPhase === 'decision') {
      const crisis = getCrisis(content, s.currentCrisisId!);
      const fallback = availableOptions(s, crisis)[0]!.id;
      const v = votes[s.crisisIndex] ?? fallback;
      for (const p of s.players) s = castVote(s, p.id, v);
    }
    s = nextPhase(s, content);
  }
  return { s, metersAtBriefing };
}

function atFirstDecision(count = 5, seed = 1): MatchState {
  let s = initMatch(mkPlayers(count), content, seed);
  s = beginMatch(s, content); // briefing (crisis_water)
  s = nextPhase(s, content); // deliberation
  s = nextPhase(s, content); // decision
  expect(s.crisisPhase).toBe('decision');
  return s;
}

describe('meters', () => {
  it('clamps and rounds', () => {
    expect(clampMeter(-5)).toBe(0);
    expect(clampMeter(120)).toBe(100);
    expect(clampMeter(50.6)).toBe(51);
  });
  it('bands (2.6 model)', () => {
    expect(bandFor(0)).toBe('collapse');
    expect(bandFor(10)).toBe('critical');
    expect(bandFor(30)).toBe('warning');
    expect(bandFor(60)).toBe('healthy');
  });
});

describe('endings from state', () => {
  it('success when all healthy', () =>
    expect(computeEnding({ stability: 60, resources: 60, cohesion: 60 }).kind).toBe('success'));
  it('fractured when a meter is critical', () =>
    expect(computeEnding({ stability: 60, resources: 10, cohesion: 60 }).kind).toBe('fractured'));
  it('stable when warning but not critical', () =>
    expect(computeEnding({ stability: 30, resources: 60, cohesion: 60 }).kind).toBe('stable'));
  it('collapse at zero', () =>
    expect(computeEnding({ stability: 0, resources: 60, cohesion: 60 }).kind).toBe('collapse'));
});

describe('vote resolution (simple majority)', () => {
  it('applies the majority option', () => {
    let s = atFirstDecision();
    for (const p of s.players) s = castVote(s, p.id, 'c1_o3'); // strict rationing: res+5, coh-10
    s = nextPhase(s, content); // resolve
    expect(s.crisisPhase).toBe('resolution');
    expect(s.meters).toEqual({ stability: 60, resources: 60, cohesion: 55 });
    expect(s.history[0]!.chosenOptionId).toBe('c1_o3');
  });

  it('abstention never decides: no votes -> least-harmful-to-lowest-meter default', () => {
    let s = atFirstDecision(); // lowest meter is resources (55)
    s = nextPhase(s, content); // resolve with zero votes
    // Best resources delta among c1 options is c1_o3 (+5)
    expect(s.history[0]!.chosenOptionId).toBe('c1_o3');
  });

  it('tie broken toward the option least harmful to the lowest meter', () => {
    let s = atFirstDecision();
    // one vote each for o1 (res -10) and o4 (res 0); tie at 1 -> pick less harmful to resources = o4
    s = castVote(s, s.players[0]!.id, 'c1_o1');
    s = castVote(s, s.players[1]!.id, 'c1_o4');
    s = nextPhase(s, content);
    expect(s.history[0]!.chosenOptionId).toBe('c1_o4');
  });

  it('votes outside the Decision phase are ignored (server authority)', () => {
    let s = initMatch(mkPlayers(5), content, 1);
    s = beginMatch(s, content); // briefing
    const before = s.players[0]!.vote;
    s = castVote(s, s.players[0]!.id, 'c1_o1');
    expect(s.players[0]!.vote).toBe(before); // unchanged
  });
});

describe('consequence links surface later', () => {
  it('ignoring contamination worsens the Sickness crisis (stability -10 on start)', () => {
    const { metersAtBriefing } = playWith(['c1_o4', 'c2_o2', 'c3_o1', 'c4_o3']);
    // 60/55/65 -> o4 coh+5 -> 60/55/70 -> o2 stab+5,coh-10 -> 65/55/60 -> sickness start contamination -10 -> 55
    expect(metersAtBriefing[2]!.stability).toBe(55);
  });

  it('repairing filtration instead helps at the Sickness crisis (cohesion +5, no contamination hit)', () => {
    const { metersAtBriefing } = playWith(['c1_o1', 'c2_o2', 'c3_o1', 'c4_o3']);
    // 60/55/65 -> o1 res-10,stab-5,coh+5 -> 55/45/70 -> o2 stab+5,coh-10 -> 60/45/60 -> sickness filtration coh+5 -> 65
    expect(metersAtBriefing[2]!.stability).toBe(60);
    expect(metersAtBriefing[2]!.cohesion).toBe(65);
  });
});

describe('conditional options', () => {
  it('the medic triage option only exists after taking the newcomers in', () => {
    // Without medic_joined
    let s = playWith(['c1_o1', 'c2_o2'], 5, 3).s; // ends the match, so instead inspect mid-run:
    // Re-run and stop at sickness decision to inspect availability.
    const withMedic = availabilityAtSickness(['c1_o1', 'c2_o1']);
    const withoutMedic = availabilityAtSickness(['c1_o1', 'c2_o2']);
    expect(withMedic).toContain('c3_o4');
    expect(withoutMedic).not.toContain('c3_o4');
    void s;
  });
});

function availabilityAtSickness(votes: string[]): string[] {
  let s = initMatch(mkPlayers(5), content, 7);
  s = beginMatch(s, content);
  let guard = 0;
  while (!s.ended && guard++ < 100) {
    if (s.currentCrisisId === 'crisis_sickness' && s.crisisPhase === 'decision') {
      return availableOptions(s, getCrisis(content, 'crisis_sickness')).map((o) => o.id);
    }
    if (s.crisisPhase === 'decision') {
      const v = votes[s.crisisIndex] ?? availableOptions(s, getCrisis(content, s.currentCrisisId!))[0]!.id;
      for (const p of s.players) s = castVote(s, p.id, v);
    }
    s = nextPhase(s, content);
  }
  return [];
}

describe('full match + goals', () => {
  it('always reaches a valid ending and evaluates every goal', () => {
    const { s } = playWith(['c1_o3', 'c2_o2', 'c3_o1', 'c4_o3'], 6, 9);
    expect(s.ended).toBe(true);
    expect(['success', 'stable', 'fractured', 'collapse']).toContain(s.ending!.kind);
    expect(s.goalResults).toHaveLength(6);
    for (const gr of s.goalResults!) expect(['met', 'partly', 'unmet']).toContain(gr.outcome);
  });

  it('collapse voids all private goals', () => {
    // Drive cohesion to 0: repeatedly pick the most cohesion-damaging options.
    const { s } = playWith(['c1_o3', 'c2_o4', 'c3_o3', 'c4_o1'], 5, 2);
    if (s.ending!.kind === 'collapse') {
      expect(s.goalResults!.every((g) => g.outcome === 'unmet')).toBe(true);
    }
    // (Not asserting collapse always happens — just that IF it does, goals are voided.)
  });
});

describe('fog stays private (redacted client view)', () => {
  it('a player never sees another player\'s goal or held cards', () => {
    let s = initMatch(mkPlayers(5), content, 5);
    s = beginMatch(s, content); // briefing, cards dealt
    const a = s.players[0]!;
    const b = s.players[1]!;
    const crisis = getCrisis(content, s.currentCrisisId!);

    const view = redactStateFor(s, a.id, content, a.id);
    // You see your own goal + cards
    expect(view.you.goalId).toBe(a.goalId);
    expect(view.you.cards.map((c) => c.id).sort()).toEqual(a.heldCardIds.slice().sort());
    // Public players carry no private fields (type-enforced; assert at runtime too)
    for (const p of view.players) expect((p as unknown as Record<string, unknown>).goalId).toBeUndefined();

    // A card that ONLY player B holds must not leak into A's view.
    const bOnly = b.heldCardIds.find((id) => !a.heldCardIds.includes(id));
    if (bOnly) {
      const card = crisis.infoCards.find((c) => c.id === bOnly)!;
      expect(JSON.stringify(view)).not.toContain(card.content);
    }
  });

  it('revealed info becomes visible to everyone', () => {
    let s = initMatch(mkPlayers(5), content, 5);
    s = beginMatch(s, content);
    const a = s.players[0]!;
    const cardId = a.heldCardIds[0];
    if (cardId) {
      s = revealInfo(s, a.id, cardId, content);
      const other = s.players[2]!;
      const view = redactStateFor(s, other.id, content);
      expect(view.revealedCards.some((r) => r.cardId === cardId)).toBe(true);
    }
  });

  it('all goals are revealed only at the ending', () => {
    const mid = beginMatch(initMatch(mkPlayers(4), content, 5), content);
    expect(redactStateFor(mid, mid.players[0]!.id, content).goalResults).toBeUndefined();
    const { s } = playWith(['c1_o3', 'c2_o2', 'c3_o1', 'c4_o3'], 4, 5);
    const endView = redactStateFor(s, s.players[0]!.id, content);
    expect(endView.goalResults).toHaveLength(4);
  });
});

function toFinalDecision(votesPath: string[], seed = 1): MatchState {
  let s = initMatch(mkPlayers(4), content, seed);
  s = beginMatch(s, content);
  let guard = 0;
  while (guard++ < 100) {
    if (s.currentCrisisId === 'crisis_breach' && s.crisisPhase === 'decision') return s;
    if (s.crisisPhase === 'decision') {
      const v = votesPath[s.crisisIndex] ?? availableOptions(s, getCrisis(content, s.currentCrisisId!))[0]!.id;
      for (const p of s.players) s = castVote(s, p.id, v);
    }
    s = nextPhase(s, content);
    if (s.ended) throw new Error('ended before final');
  }
  throw new Error('never reached final decision');
}

describe('final-crisis gating', () => {
  it('"hold the wall" SUCCEEDS with high cohesion and FAILS with low cohesion', () => {
    const high = toFinalDecision(['c1_o1', 'c2_o1', 'c3_o4']); // keeps cohesion high (+medic path)
    expect(high.meters.cohesion).toBeGreaterThanOrEqual(45);
    let hs = high;
    const beforeHigh = hs.meters.stability;
    for (const p of hs.players) hs = castVote(hs, p.id, 'c4_o1');
    hs = nextPhase(hs, content);
    expect(hs.meters.stability).toBeGreaterThan(beforeHigh); // success: stability +10

    const low = toFinalDecision(['c1_o3', 'c2_o4', 'c3_o3']); // trashes cohesion
    expect(low.meters.cohesion).toBeLessThan(45);
    let ls = low;
    const beforeLow = ls.meters.stability;
    for (const p of ls.players) ls = castVote(ls, p.id, 'c4_o1');
    ls = nextPhase(ls, content);
    expect(ls.meters.stability).toBeLessThan(beforeLow); // fail: stability -20
  });
});

describe('unknown/spectator view', () => {
  it('an unknown viewer receives no private goal or cards', () => {
    let s = initMatch(mkPlayers(4), content, 1);
    s = beginMatch(s, content);
    const v = redactStateFor(s, 'ghost-not-a-player', content);
    expect(v.you.goalId).toBeUndefined();
    expect(v.you.cards).toEqual([]);
  });
});

describe('content integrity', () => {
  it('validates and lints clean', () => {
    expect(() => validateContent(content)).not.toThrow();
    expect(lintContent(content)).toEqual([]);
  });
  it('every goal has an engine rule', () => {
    for (const g of content.goals) expect(GOAL_RULES[g.id]).toBeDefined();
  });
  it('has 3 meters', () => expect(METER_IDS).toHaveLength(3));
});
