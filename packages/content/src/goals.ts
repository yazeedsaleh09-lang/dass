import type { Goal } from '@crisis/shared';

// v0.2: title/description are i18n KEYS (resolved from @crisis/i18n). The engine owns the
// evaluation rules via GOAL_RULES keyed by id. Presentation lives in the translation files.
export const goals: Goal[] = [
  { id: 'goal_provider', title: 'goal.provider.title', description: 'goal.provider.desc' },
  { id: 'goal_peacemaker', title: 'goal.peacemaker.title', description: 'goal.peacemaker.desc' },
  { id: 'goal_guardian', title: 'goal.guardian.title', description: 'goal.guardian.desc' },
  { id: 'goal_humanitarian', title: 'goal.humanitarian.title', description: 'goal.humanitarian.desc' },
  { id: 'goal_hardliner', title: 'goal.hardliner.title', description: 'goal.hardliner.desc' },
  { id: 'goal_pragmatist', title: 'goal.pragmatist.title', description: 'goal.pragmatist.desc' },
  { id: 'goal_restless', title: 'goal.restless.title', description: 'goal.restless.desc' },
  { id: 'goal_skeptic', title: 'goal.skeptic.title', description: 'goal.skeptic.desc' },
];
