// Milestone 1 "playable build": drive a full match through the pure engine headlessly.
// Deterministic (seeded). Proves the end-to-end loop before networking/UI are added.
//
// Usage:  npm run sim -- [playerCount] [seed]
//   e.g.  npm run sim -- 6 42

import { content } from '@crisis/content';
import {
  availableOptions,
  beginMatch,
  castVote,
  getCrisis,
  getGoal,
  GOAL_RULES,
  initMatch,
  makeRng,
  METER_IDS,
  nextPhase,
  type CrisisOption,
  type GoalRule,
  type MatchState,
  type PlayerInput,
} from '@crisis/shared';

const count = Math.max(4, Math.min(8, Number(process.argv[2] ?? '5') || 5));
const seed = Number(process.argv[3] ?? '12345') || 12345;

const players: PlayerInput[] = Array.from({ length: count }, (_, i) => ({
  id: `p${i + 1}`,
  nickname: `Player ${i + 1}`,
}));

let printed = 0;
function flush(state: MatchState): void {
  for (; printed < state.log.length; printed++) console.log(state.log[printed]);
}

function scoreFor(rule: GoalRule | undefined, o: CrisisOption): number {
  if (!rule) return 0;
  switch (rule.kind) {
    case 'highestMeter':
      return o.meterDeltas[rule.meter] ?? 0;
    case 'boldAtLeast':
      return o.tags.includes('bold') ? 5 : 0;
    case 'leastSafeAtLeastOnce':
      return o.tags.includes('bold') || o.tags.includes('risky') ? 5 : 0;
    case 'neverSacrifice':
      return o.tags.includes('sacrifice') ? -10 : o.meterDeltas.cohesion ?? 0;
    case 'surviveNoCritical':
      return Math.min(...METER_IDS.map((id) => o.meterDeltas[id] ?? 0));
    case 'refusedRumor':
      return o.tags.includes('actsOnRumor') ? -10 : 1;
    default:
      return 0;
  }
}

function chooseVote(goalId: string, opts: CrisisOption[], rng: () => number): CrisisOption {
  const rule = GOAL_RULES[goalId];
  const scored = opts
    .map((o) => ({ o, s: scoreFor(rule, o) + rng() * 0.5 }))
    .sort((a, b) => b.s - a.s);
  return scored[0]!.o;
}

console.log('=========================================================');
console.log(` MATCH SIMULATOR — ${count} players, seed ${seed}`);
console.log('=========================================================');

let state = initMatch(players, content, seed);
flush(state);
console.log('\nPrivate goals dealt:');
for (const p of state.players) {
  const g = getGoal(content, p.goalId);
  console.log(`  ${p.nickname}: ${g.title} — ${g.description}`);
}

state = beginMatch(state, content);

while (!state.ended) {
  if (state.crisisPhase === 'briefing') {
    console.log('\n---------------------------------------------------------');
    flush(state); // prints the crisis headline
    const crisis = getCrisis(content, state.currentCrisisId!);
    console.log('  Private info this crisis:');
    for (const p of state.players) {
      const cards = p.heldCardIds.map((id) => {
        const c = crisis.infoCards.find((x) => x.id === id);
        return c ? `[${c.reliability}] ${c.content}` : id;
      });
      console.log(`    ${p.nickname}: ${cards.length ? cards.join(' | ') : '(no card)'}`);
    }
  }

  if (state.crisisPhase === 'decision') {
    const crisis = getCrisis(content, state.currentCrisisId!);
    const opts = availableOptions(state, crisis);
    console.log('  Options:');
    opts.forEach((o, i) => console.log(`    ${i + 1}. ${o.title}`));
    const rng = makeRng(seed + state.crisisIndex * 17 + 100);
    const tally: Record<string, number> = {};
    for (const p of state.players) {
      const choice = chooseVote(p.goalId, opts, rng);
      state = castVote(state, p.id, choice.id);
      tally[choice.title] = (tally[choice.title] ?? 0) + 1;
    }
    console.log('  Votes: ' + Object.entries(tally).map(([t, n]) => `${n}×"${t}"`).join(', '));
  }

  state = nextPhase(state, content);
  flush(state);
}

console.log('\n=========================================================');
console.log(' FINAL METERS: ' + METER_IDS.map((id) => `${id} ${state.meters[id]}`).join(' · '));
console.log(' ENDING: ' + (state.ending ? `${state.ending.kind.toUpperCase()} — ${state.ending.text}` : 'n/a'));
console.log(' Private goal outcomes:');
for (const gr of state.goalResults ?? []) {
  const p = state.players.find((x) => x.id === gr.playerId)!;
  const g = getGoal(content, gr.goalId);
  console.log(`   ${p.nickname} (${g.title}): ${gr.outcome.toUpperCase()} — ${gr.note}`);
}
console.log('=========================================================');
