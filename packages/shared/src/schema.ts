// Runtime validation of authored content (correctness at the content boundary).
import { z } from 'zod';
import type { ContentBundle } from './types.js';

const meterId = z.enum(['stability', 'resources', 'cohesion']);
const meters = z.object({ stability: z.number(), resources: z.number(), cohesion: z.number() });
const partialMeters = z
  .object({ stability: z.number(), resources: z.number(), cohesion: z.number() })
  .partial();
const reliability = z.enum(['confirmed', 'reported', 'contested']);
const optionTag = z.enum(['safe', 'bold', 'risky', 'sacrifice', 'actsOnRumor']);

const infoCard = z.object({
  id: z.string().min(1),
  content: z.string().min(1),
  reliability,
  truth: z.boolean(),
});

const requiresRule = z.object({
  meter: meterId,
  min: z.number(),
  failDeltas: partialMeters,
  failText: z.string(),
});

const crisisOption = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  tags: z.array(optionTag),
  meterDeltas: partialMeters,
  linksPlanted: z.array(z.string()),
  resultText: z.string().min(1),
  requires: requiresRule.optional(),
  requiresLink: z.string().optional(),
});

const crisis = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(['resource', 'social', 'external', 'infrastructure', 'health', 'moral']),
  tier: z.enum(['early', 'mid', 'late', 'final']),
  publicBrief: z.string().min(1),
  infoCards: z.array(infoCard),
  options: z.array(crisisOption).min(2).max(4),
  onStartLinkEffects: z
    .array(
      z.object({
        ifLink: z.string(),
        meterDeltas: partialMeters.optional(),
        narrative: z.string().optional(),
      }),
    )
    .optional(),
});

const goal = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const contentBundleSchema = z.object({
  crises: z.array(crisis).min(1),
  goals: z.array(goal).min(1),
  playlist: z.array(z.string()).min(1),
  startMeters: meters,
});

/** Parse + validate an authored content bundle. Throws on invalid content. */
export function validateContent(input: unknown): ContentBundle {
  return contentBundleSchema.parse(input) as ContentBundle;
}

/** Lint checks beyond shape — enforces the locked authoring rules (CrisisSystem §9.3). */
export function lintContent(bundle: ContentBundle): string[] {
  const issues: string[] = [];
  for (const c of bundle.crises) {
    if (c.options.length < 2) issues.push(`${c.id}: needs >= 2 options`);
    const movesAMeter = c.options.some((o) => Object.keys(o.meterDeltas).length > 0);
    if (!movesAMeter) issues.push(`${c.id}: no option moves any meter`);
    if (c.tier !== 'final') {
      const hasUncertain = c.infoCards.some((card) => card.reliability !== 'confirmed');
      if (!hasUncertain) issues.push(`${c.id}: no uncertain info card (fog missing)`);
    }
  }
  for (const id of bundle.playlist) {
    if (!bundle.crises.some((c) => c.id === id)) issues.push(`playlist references unknown crisis: ${id}`);
  }
  return issues;
}
