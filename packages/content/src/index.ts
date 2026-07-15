import type { ContentBundle } from '@crisis/shared';
import { validateContent, lintContent } from '@crisis/shared';
import { crises } from './crises.js';
import { goals } from './goals.js';

const raw: ContentBundle = {
  crises,
  goals,
  playlist: ['crisis_water', 'crisis_newcomers', 'crisis_sickness', 'crisis_breach'],
  startMeters: { stability: 60, resources: 55, cohesion: 65 },
};

// Validate + lint at module load so bad content fails fast (correctness).
export const content: ContentBundle = validateContent(raw);

export const contentIssues: string[] = lintContent(content);
if (contentIssues.length > 0) {
  // eslint-disable-next-line no-console
  console.warn('[content] authoring lint warnings:\n' + contentIssues.map((i) => '  - ' + i).join('\n'));
}

export { crises, goals };
