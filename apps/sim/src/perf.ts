// Quick engine performance + ending-distribution check (the hot path).
//   npm run perf -- 5000
import { content } from '@crisis/content';
import { availableOptions, beginMatch, castVote, getCrisis, initMatch, nextPhase } from '@crisis/shared';

function playOne(seed: number, count: number): string {
  let s = initMatch(
    Array.from({ length: count }, (_, i) => ({ id: `p${i}`, nickname: `P${i}` })),
    content,
    seed,
  );
  s = beginMatch(s, content);
  let guard = 0;
  while (!s.ended && guard++ < 200) {
    if (s.crisisPhase === 'decision') {
      const opts = availableOptions(s, getCrisis(content, s.currentCrisisId!));
      const pick = opts[(guard + seed) % opts.length]!;
      for (const p of s.players) s = castVote(s, p.id, pick.id);
    }
    s = nextPhase(s, content);
  }
  return s.ending?.kind ?? 'unfinished';
}

const N = Number(process.argv[2] ?? 5000) || 5000;
const dist: Record<string, number> = {};
const t0 = performance.now();
for (let i = 0; i < N; i++) {
  const kind = playOne(i, 4 + (i % 5)); // vary 4..8 players and seed
  dist[kind] = (dist[kind] ?? 0) + 1;
}
const ms = performance.now() - t0;
console.log(`ran ${N} full matches in ${ms.toFixed(0)}ms  →  ${(ms / N).toFixed(3)} ms/match, ~${Math.round(N / (ms / 1000))} matches/s`);
console.log('ending distribution (sanity — all reachable, not all-collapse):', dist);
