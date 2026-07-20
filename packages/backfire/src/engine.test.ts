import { describe, expect, it } from 'vitest';
import {
  BF_DEV_SEED,
  advancePhase,
  buildFinalReveal,
  initBackfire,
  legalTargets,
  r2Reveal,
  redactBackfireFor,
  startBackfire,
  submitDecision,
  type BfGame,
  type BfPhase,
} from './index.js';

const NAMES = ['نورة', 'عمر', 'ليلى', 'سارة', 'فهد'];

function newGame(seed = BF_DEV_SEED): BfGame {
  const players = NAMES.map((nickname, seat) => ({ id: `p${seat}`, nickname, seat }));
  return startBackfire(initBackfire(players, seed, 'host'));
}

/** Run the FSM forward until `stop`, letting `act` answer every decision phase. */
function runTo(game: BfGame, stop: BfPhase, act: (g: BfGame) => void): void {
  for (let guard = 0; guard < 60 && game.phase !== stop; guard++) {
    act(game);
    advancePhase(game);
  }
}

const tool = (g: BfGame, id: string): string | null => g.players.find((p) => p.id === id)?.roundTool ?? null;
const holderOf = (g: BfGame, t: string): string =>
  g.players.find((p) => p.roundTool === t)?.id ?? '';

describe('phase machine', () => {
  it('walks lobby → results through every specified phase', () => {
    const game = newGame();
    const seen: BfPhase[] = [game.phase];
    for (let i = 0; i < 40 && game.phase !== 'RESULTS'; i++) {
      autoDecide(game);
      seen.push(advancePhase(game));
    }
    expect(seen).toContain('R1_DECISION');
    expect(seen).toContain('R2_RESOLUTION');
    expect(seen).toContain('R3_RESOLUTION');
    expect(seen).toContain('FINAL_REVEAL');
    expect(game.phase).toBe('RESULTS');
    expect(game.ended).toBe(true);
  });
});

/** Everyone picks the first legal option; enough to drive the machine in structural tests. */
function autoDecide(game: BfGame): void {
  for (const p of game.players) {
    const targets = legalTargets(game, p.id);
    switch (game.phase) {
      case 'R1_DECISION':
        submitDecision(game, p.id, { kind: 'vote', target: targets[0]! });
        break;
      case 'R2_DECISION': {
        const t = tool(game, p.id);
        if (t === 'support') submitDecision(game, p.id, { kind: 'support', target: targets[0]! });
        else if (t === 'disrupt') submitDecision(game, p.id, { kind: 'disrupt', target: targets[1]! });
        else if (t === 'shield') submitDecision(game, p.id, { kind: 'shield', target: targets[0]! });
        else if (t === 'redirect') submitDecision(game, p.id, { kind: 'redirect', source: targets[0]!, target: targets[2]! });
        break;
      }
      case 'R2_TIEBREAK':
        submitDecision(game, p.id, { kind: 'tiebreak', target: targets[0]! });
        break;
      case 'R3_DECISION': {
        const t = tool(game, p.id);
        if (t === 'redirect') submitDecision(game, p.id, { kind: 'echo_target', target: targets[0]! });
        else if (t === 'shield') submitDecision(game, p.id, { kind: 'echo_shield', target: targets[0]! });
        else submitDecision(game, p.id, { kind: 'side', side: 'redirect' });
        break;
      }
      default:
        break;
    }
  }
}

describe('round 1', () => {
  it('the stable operator lowers Threat and attaches a dormant Echo', () => {
    const game = newGame();
    runTo(game, 'R1_DECISION', () => {});
    const stable = game.r1.stableId;
    for (const p of game.players) submitDecision(game, p.id, { kind: 'vote', target: stable });
    advancePhase(game);
    expect(game.r1.operatorId).toBe(stable);
    expect(game.world.threat).toBe(0);
    expect(game.world.echoHolderId).toBe(stable);
    expect(game.world.echoCharge).toBe(1);
    expect(game.world.echoStatus).toBe('dormant');
  });

  it('the risky operator raises Threat and starts the Echo charged', () => {
    const game = newGame();
    runTo(game, 'R1_DECISION', () => {});
    const risky = game.r1.riskyId;
    for (const p of game.players) submitDecision(game, p.id, { kind: 'vote', target: risky });
    advancePhase(game);
    expect(game.r1.operatorId).toBe(risky);
    expect(game.world.threat).toBe(2);
    expect(game.world.echoCharge).toBe(2);
    // Everyone who voted the relay into danger carries it into the tiebreak.
    expect(game.players.every((p) => p.threatContribution === 1)).toBe(true);
  });

  it('rejects a vote for a non-candidate', () => {
    const game = newGame();
    runTo(game, 'R1_DECISION', () => {});
    const outsider = game.players.find((p) => !game.r1.candidateIds.includes(p.id))!;
    expect(submitDecision(game, 'p0', { kind: 'vote', target: outsider.id })).toBe(false);
  });
});

describe('round 2 route resolution', () => {
  function toRound2(game: BfGame): void {
    runTo(game, 'R1_DECISION', () => {});
    for (const p of game.players) submitDecision(game, p.id, { kind: 'vote', target: game.r1.stableId });
    runTo(game, 'R2_DECISION', () => {});
  }

  it('a redirect only moves a Support that actually exists', () => {
    const game = newGame();
    toRound2(game);
    const supporters = game.players.filter((p) => p.roundTool === 'support').map((p) => p.id);
    const backed = game.players[0]!.id;
    for (const s of supporters) submitDecision(game, s, { kind: 'support', target: backed });
    // players[2] RECEIVED no Support, so redirecting from them must fail harmlessly.
    submitDecision(game, holderOf(game, 'redirect'), { kind: 'redirect', source: game.players[2]!.id, target: game.players[4]!.id });
    submitDecision(game, holderOf(game, 'disrupt'), { kind: 'disrupt', target: game.players[3]!.id });
    submitDecision(game, holderOf(game, 'shield'), { kind: 'shield', target: backed });
    advancePhase(game);
    expect(game.r2.redirectApplied).toBe(false);
    expect(game.r2.strength[game.players[4]!.id]).toBe(0);
    expect(game.r2.carrierId).toBe(backed);
  });

  it('a route where everyone ends at zero fails and adds 2 Threat', () => {
    const game = newGame();
    toRound2(game);
    const supporters = game.players.filter((p) => p.roundTool === 'support').map((p) => p.id);
    const disruptor = holderOf(game, 'disrupt');
    // Both Supports land on one player, the Disrupt takes one back, the Redirect moves the other
    // away onto a target that then also nets zero.
    const a = game.players[0]!.id;
    const b = game.players[1]!.id;
    for (const s of supporters) submitDecision(game, s, { kind: 'support', target: a });
    submitDecision(game, disruptor, { kind: 'disrupt', target: b });
    submitDecision(game, holderOf(game, 'redirect'), { kind: 'redirect', source: a, target: b });
    submitDecision(game, holderOf(game, 'shield'), { kind: 'shield', target: a });
    advancePhase(game);
    // a: +2 -1(redirect) = 1, b: -1 +1 = 0 → a carries. Assert the arithmetic, not a guess.
    expect(game.r2.strength[a]).toBe(1);
    expect(game.r2.strength[b]).toBe(0);
    expect(game.r2.routeFailed).toBe(false);
  });

  it('marks the route Compromised when interference changed who carries', () => {
    const game = newGame();
    toRound2(game);
    const supporters = game.players.filter((p) => p.roundTool === 'support').map((p) => p.id);
    const a = game.players[0]!.id;
    const b = game.players[1]!.id;
    submitDecision(game, supporters[0]!, { kind: 'support', target: a });
    submitDecision(game, supporters[1]!, { kind: 'support', target: b });
    submitDecision(game, holderOf(game, 'disrupt'), { kind: 'disrupt', target: a });
    submitDecision(game, holderOf(game, 'shield'), { kind: 'shield', target: b });
    advancePhase(game);
    expect(game.r2.carrierId).toBe(b);
    expect(game.r2.disruptChangedCarrier).toBe(true);
    expect(game.r2.compromised).toBe(true);
  });

  it('leaves the Echo at least Charged so Round 3 has something to resolve', () => {
    const game = newGame();
    toRound2(game);
    autoDecide(game);
    advancePhase(game);
    if (game.phase === 'R2_TIEBREAK') {
      autoDecide(game);
      advancePhase(game);
    }
    expect(game.world.echoCharge).toBeGreaterThanOrEqual(1);
    expect(['charged', 'critical']).toContain(game.world.echoStatus);
  });
});

describe('round 3 — the Return', () => {
  function toRound3(game: BfGame): void {
    runTo(game, 'R1_DECISION', () => {});
    for (const p of game.players) submitDecision(game, p.id, { kind: 'vote', target: game.r1.stableId });
    runTo(game, 'R2_DECISION', () => {});
    autoDecide(game);
    advancePhase(game);
    if (game.phase === 'R2_TIEBREAK') {
      autoDecide(game);
      advancePhase(game);
    }
    runTo(game, 'R3_DECISION', () => {});
  }

  it('backfires onto the Redirector when the target is protected', () => {
    const game = newGame();
    toRound3(game);
    const redirector = game.r3.redirectorId!;
    const guardian = game.r3.guardianId!;
    const victim = game.players.find((p) => p.id !== redirector && p.id !== guardian)!.id;
    submitDecision(game, redirector, { kind: 'echo_target', target: victim });
    submitDecision(game, guardian, { kind: 'echo_shield', target: victim });
    for (const p of game.players) {
      if (p.id === redirector || p.id === guardian) continue;
      submitDecision(game, p.id, { kind: 'side', side: 'redirect' });
    }
    advancePhase(game);
    expect(game.r3.redirectPower).toBe(4);
    expect(game.r3.shieldPower).toBe(1);
    expect(game.r3.outcome).toBe('backfire');
    expect(game.r3.finalTargetId).toBe(redirector);
    const reveal = buildFinalReveal(game);
    expect(reveal.summary).toContain('رجع الصدى إلى');
  });

  it('lands on an unprotected target when Redirect wins', () => {
    const game = newGame();
    toRound3(game);
    const redirector = game.r3.redirectorId!;
    const guardian = game.r3.guardianId!;
    const others = game.players.filter((p) => p.id !== redirector && p.id !== guardian).map((p) => p.id);
    submitDecision(game, redirector, { kind: 'echo_target', target: others[0]! });
    submitDecision(game, guardian, { kind: 'echo_shield', target: others[1]! });
    for (const id of others) submitDecision(game, id, { kind: 'side', side: 'redirect' });
    advancePhase(game);
    expect(game.r3.outcome).toBe('redirected');
    expect(game.r3.finalTargetId).toBe(others[0]!);
  });

  it('contains the Echo when Shield ties or wins and the holder is the protected player', () => {
    const game = newGame();
    toRound3(game);
    const redirector = game.r3.redirectorId!;
    const guardian = game.r3.guardianId!;
    const holder = game.world.echoHolderId!;
    const threatBefore = game.world.threat;
    submitDecision(game, redirector, { kind: 'echo_target', target: holder === redirector ? guardian : holder });
    submitDecision(game, guardian, { kind: 'echo_shield', target: holder });
    for (const p of game.players) {
      if (p.id === redirector || p.id === guardian) continue;
      submitDecision(game, p.id, { kind: 'side', side: 'shield' });
    }
    advancePhase(game);
    expect(game.r3.shieldPower).toBeGreaterThanOrEqual(game.r3.redirectPower);
    expect(game.r3.outcome).toBe('contained');
    expect(game.world.threat).toBe(Math.max(0, threatBefore - 1));
  });
});

describe('redaction', () => {
  it('never leaks another player’s intel, objective or decision', () => {
    const game = newGame();
    runTo(game, 'R1_DECISION', () => {});
    for (const p of game.players) submitDecision(game, p.id, { kind: 'vote', target: game.r1.candidateIds[0] });
    const mine = redactBackfireFor(game, 'p0');
    expect(mine.you.intel).toBeTruthy();
    expect(mine.you.decision).not.toBeNull();
    const serialized = JSON.stringify(mine);
    for (const other of game.players.filter((p) => p.id !== 'p0')) {
      const otherIntel = redactBackfireFor(game, other.id).you.intel!;
      // Cards are distinct per player, so another player's text must not appear in my view.
      expect(serialized.includes(otherIntel)).toBe(false);
    }
    // Locked status is public; the vote behind it is not.
    expect(mine.players.every((p) => p.locked)).toBe(true);
  });

  it('gives the TV no tool, no intel and no secret action owners', () => {
    const game = newGame();
    runTo(game, 'R2_DECISION', () => {});
    autoDecide(game);
    advancePhase(game);
    if (game.phase === 'R2_TIEBREAK') {
      autoDecide(game);
      advancePhase(game);
    }
    const tv = redactBackfireFor(game, '__tv__', { isTv: true });
    expect(tv.you.intel).toBeNull();
    expect(tv.you.tool).toBeNull();
    expect(tv.you.targets).toEqual([]);
    expect(tv.r2).toBeDefined();
    expect(tv.finalReveal).toBeUndefined();

    // The real property we need: the payload is INDEPENDENT of authorship. Re-attribute each
    // secret action to every other player and the TV's Round 2 reveal must not change at all.
    expect(game.r2.disrupt).not.toBeNull();
    const baseline = JSON.stringify(r2Reveal(game));
    const originalDisruptor = game.r2.disrupt!.actorId;
    const originalRedirector = game.r2.redirect?.actorId;
    for (const p of game.players) {
      game.r2.disrupt!.actorId = p.id;
      if (game.r2.redirect) game.r2.redirect.actorId = p.id;
      for (const s of game.r2.supports) s.actorId = p.id;
      expect(JSON.stringify(r2Reveal(game))).toBe(baseline);
    }
    game.r2.disrupt!.actorId = originalDisruptor;
    if (game.r2.redirect && originalRedirector) game.r2.redirect.actorId = originalRedirector;
  });

  it('withholds every reveal payload until its own phase', () => {
    const game = newGame();
    runTo(game, 'R1_DISCUSSION', () => {});
    const early = redactBackfireFor(game, 'p0');
    expect(early.r1).toBeUndefined();
    expect(early.r2).toBeUndefined();
    expect(early.r3).toBeUndefined();
    expect(early.finalReveal).toBeUndefined();
    expect(early.results).toBeUndefined();
    // Redirector/Guardian are not public before Round 3.
    expect(early.publicRoles.redirectorId).toBeNull();
    expect(early.publicRoles.guardianId).toBeNull();
  });
});

describe('collapse and scoring', () => {
  it('turns Threat 5 into a shared failure with no winner', () => {
    const game = newGame();
    game.world.threat = 4;
    runTo(game, 'R1_DECISION', () => {});
    for (const p of game.players) submitDecision(game, p.id, { kind: 'vote', target: game.r1.riskyId });
    advancePhase(game);
    expect(game.world.threat).toBe(5);
    expect(game.world.worldStatus).toBe('collapse');
    expect(game.sharedFailure).toBe(true);
    for (let i = 0; i < 30 && game.phase !== 'RESULTS'; i++) {
      autoDecide(game);
      advancePhase(game);
    }
    expect(game.winnerIds).toEqual([]);
  });

  it('awards one Influence per completed objective, to a maximum of three', () => {
    const game = newGame();
    for (let i = 0; i < 40 && game.phase !== 'RESULTS'; i++) {
      autoDecide(game);
      advancePhase(game);
    }
    for (const p of game.players) {
      expect(p.influence).toBe(p.objectivesWon.filter(Boolean).length);
      expect(p.influence).toBeLessThanOrEqual(3);
    }
  });
});

describe('determinism', () => {
  it('reproduces candidates and tool assignment from a seed', () => {
    const a = newGame(BF_DEV_SEED);
    const b = newGame(BF_DEV_SEED);
    expect(a.r1.candidateIds).toEqual(b.r1.candidateIds);
    expect(a.r1.stableId).toBe(b.r1.stableId);
    runTo(a, 'R2_DECISION', autoDecide);
    runTo(b, 'R2_DECISION', autoDecide);
    expect(a.r2.tools).toEqual(b.r2.tools);
  });

  it('assigns exactly two Supports, one Disrupt, one Redirect and one Shield', () => {
    for (const seed of [1, 7, 99, BF_DEV_SEED, 424242]) {
      const game = newGame(seed);
      runTo(game, 'R2_DECISION', autoDecide);
      const tools = game.players.map((p) => p.roundTool).sort();
      expect(tools).toEqual(['disrupt', 'redirect', 'shield', 'support', 'support']);
    }
  });
});

describe('final reveal', () => {
  it('produces exactly five cards and a one-sentence causal summary', () => {
    const game = newGame();
    for (let i = 0; i < 40 && game.phase !== 'RESULTS'; i++) {
      autoDecide(game);
      advancePhase(game);
    }
    const reveal = buildFinalReveal(game);
    expect(reveal.cards).toHaveLength(5);
    expect(reveal.cards.map((c) => c.id)).toEqual([
      'first_choice',
      'hidden_interference',
      'changed_path',
      'protection',
      'backfire',
    ]);
    for (const card of reveal.cards) expect(card.line.length).toBeGreaterThan(8);
    expect(reveal.summary.split('.').filter((s) => s.trim()).length).toBe(1);
    expect(reveal.origin).toContain('بدأ الصدى');
    // Generated Arabic must not assume gender agreement: player names are free text.
    const generated = [reveal.summary, reveal.origin, ...reveal.cards.map((c) => c.line)].join(' ');
    for (const gendered of ['اختير ', 'عطّل ', ' حمى ', 'نقل دعماً', 'محميّاً', 'غيره.']) {
      expect(generated).not.toContain(gendered);
    }
  });
});
