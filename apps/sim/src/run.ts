// Milestone 1 "playable build": drive a full match through the pure engine headlessly.
// Deterministic (seeded). v0.2: renders text via @crisis/i18n (default English).
//   npm run sim -- [playerCount] [seed] [en|ar]

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
import { renderLog, t, type Locale } from '@crisis/i18n';

const count = Math.max(4, Math.min(8, Number(process.argv[2] ?? '5') || 5));
const seed = Number(process.argv[3] ?? '12345') || 12345;
const L: Locale = process.argv[4] === 'ar' ? 'ar' : 'en';

const players: PlayerInput[] = Array.from({ length: count }, (_, i) => ({
  id: `p${i + 1}`,
  nickname: `Player ${i + 1}`,
}));

let printed = 0;
function flush(state: MatchState): void {
  for (; printed < state.log.length; printed++) console.log(renderLog(state.log[printed]!, L));
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
  const scored = opts.map((o) => ({ o, s: scoreFor(rule, o) + rng() * 0.5 })).sort((a, b) => b.s - a.s);
  return scored[0]!.o;
}

console.log('=========================================================');
console.log(` MATCH SIMULATOR — ${count} players, seed ${seed}, lang ${L}`);
console.log('=========================================================');

let state = initMatch(players, content, seed);
flush(state);
console.log('\nPrivate goals dealt:');
for (const p of state.players) {
  const g = getGoal(content, p.goalId);
  console.log(`  ${p.nickname}: ${t(L, g.title)} — ${t(L, g.description)}`);
}

state = beginMatch(state, content);

while (!state.ended) {
  if (state.crisisPhase === 'briefing') {
    console.log('\n---------------------------------------------------------');
    flush(state);
    const crisis = getCrisis(content, state.currentCrisisId!);
    console.log('  Private info this crisis:');
    for (const p of state.players) {
      const cards = p.heldCardIds.map((id) => {
        const c = crisis.infoCards.find((x) => x.id === id);
        return c ? `[${t(L, `reliability.${c.reliability}`)}] ${t(L, c.content)}` : id;
      });
      console.log(`    ${p.nickname}: ${cards.length ? cards.join(' | ') : '(no card)'}`);
    }
  }

  if (state.crisisPhase === 'decision') {
    const crisis = getCrisis(content, state.currentCrisisId!);
    const opts = availableOptions(state, crisis);
    console.log('  Options:');
    opts.forEach((o, i) => console.log(`    ${i + 1}. ${t(L, o.title)}`));
    const rng = makeRng(seed + state.crisisIndex * 17 + 100);
    const tally: Record<string, number> = {};
    for (const p of state.players) {
      const choice = chooseVote(p.goalId, opts, rng);
      state = castVote(state, p.id, choice.id);
      const label = t(L, choice.title);
      tally[label] = (tally[label] ?? 0) + 1;
    }
    console.log('  Votes: ' + Object.entries(tally).map(([tt, n]) => `${n}×"${tt}"`).join(', '));
  }

  state = nextPhase(state, content);
  flush(state);
}

console.log('\n=========================================================');
console.log(' FINAL METERS: ' + METER_IDS.map((id) => `${t(L, `meter.${id}`)} ${state.meters[id]}`).join(' · '));
console.log(' ENDING: ' + (state.ending ? `${t(L, `ending.label.${state.ending.kind}`)} — ${t(L, state.ending.text)}` : 'n/a'));
console.log(' Private goal outcomes:');
for (const gr of state.goalResults ?? []) {
  const p = state.players.find((x) => x.id === gr.playerId)!;
  const g = getGoal(content, gr.goalId);
  const note = renderLog({ key: gr.noteKey, params: gr.noteParams }, L);
  console.log(`   ${p.nickname} (${t(L, g.title)}): ${t(L, `goal.outcome.${gr.outcome}`)} — ${note}`);
}
console.log('=========================================================');
