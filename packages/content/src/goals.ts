import type { Goal } from '@crisis/shared';

// Private Goals (non-scored, session-only). Presentation only; the engine owns the
// evaluation rules via GOAL_RULES keyed by these ids. Ported from Phase 2.6 §B.
export const goals: Goal[] = [
  { id: 'goal_provider', title: 'The Provider', description: 'You want Resources to be the highest meter at the end.' },
  { id: 'goal_peacemaker', title: 'The Peacemaker', description: 'You want Cohesion to be the highest meter at the end.' },
  { id: 'goal_guardian', title: 'The Guardian', description: 'You want Stability to be the highest meter at the end.' },
  { id: 'goal_humanitarian', title: 'The Humanitarian', description: 'You never want the group to sacrifice people.' },
  { id: 'goal_hardliner', title: 'The Hardliner', description: 'You believe caution is slow death — take the bold option at least twice.' },
  { id: 'goal_pragmatist', title: 'The Pragmatist', description: 'You just want to survive with no meter ever hitting critical.' },
  { id: 'goal_restless', title: 'The Restless', description: 'Status quo bores you — take a real risk at least once.' },
  { id: 'goal_skeptic', title: 'The Skeptic', description: 'You distrust rumor — refuse to act on unverified info at least once.' },
];
