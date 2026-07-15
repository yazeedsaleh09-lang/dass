import type { Crisis } from '@crisis/shared';

// v0.2: all visible text is now an i18n KEY (resolved from @crisis/i18n en.json/ar.json).
// Structure/mechanics unchanged from v0.1. Authored to the locked rules.
export const crises: Crisis[] = [
  {
    id: 'crisis_water',
    title: 'crisis.water.title',
    category: 'resource',
    tier: 'early',
    publicBrief: 'crisis.water.brief',
    infoCards: [
      { id: 'c1_a', content: 'crisis.water.card.a', reliability: 'confirmed', truth: true },
      { id: 'c1_b', content: 'crisis.water.card.b', reliability: 'reported', truth: false },
      { id: 'c1_c', content: 'crisis.water.card.c', reliability: 'contested', truth: false },
      { id: 'c1_d', content: 'crisis.water.card.d', reliability: 'confirmed', truth: true },
    ],
    options: [
      { id: 'c1_o1', title: 'crisis.water.o1.title', tags: [], meterDeltas: { resources: -10, stability: -5, cohesion: 5 }, linksPlanted: ['filtration_repair'], resultText: 'crisis.water.o1.result' },
      { id: 'c1_o2', title: 'crisis.water.o2.title', tags: ['bold', 'risky', 'actsOnRumor'], meterDeltas: { resources: 3, stability: -5, cohesion: -5 }, linksPlanted: ['spring_expedition'], resultText: 'crisis.water.o2.result' },
      { id: 'c1_o3', title: 'crisis.water.o3.title', tags: ['safe'], meterDeltas: { resources: 5, cohesion: -10 }, linksPlanted: ['rationing_resentment'], resultText: 'crisis.water.o3.result' },
      { id: 'c1_o4', title: 'crisis.water.o4.title', tags: ['risky', 'actsOnRumor'], meterDeltas: { cohesion: 5 }, linksPlanted: ['contamination_ignored'], resultText: 'crisis.water.o4.result' },
    ],
  },
  {
    id: 'crisis_newcomers',
    title: 'crisis.newcomers.title',
    category: 'social',
    tier: 'mid',
    publicBrief: 'crisis.newcomers.brief',
    infoCards: [
      { id: 'c2_a', content: 'crisis.newcomers.card.a', reliability: 'confirmed', truth: true },
      { id: 'c2_b', content: 'crisis.newcomers.card.b', reliability: 'reported', truth: false },
      { id: 'c2_c', content: 'crisis.newcomers.card.c', reliability: 'confirmed', truth: true },
      { id: 'c2_d', content: 'crisis.newcomers.card.d', reliability: 'contested', truth: false },
    ],
    options: [
      { id: 'c2_o1', title: 'crisis.newcomers.o1.title', tags: ['bold'], meterDeltas: { cohesion: 10, resources: -10 }, linksPlanted: ['medic_joined'], resultText: 'crisis.newcomers.o1.result' },
      { id: 'c2_o2', title: 'crisis.newcomers.o2.title', tags: ['safe'], meterDeltas: { stability: 5, cohesion: -10 }, linksPlanted: ['turned_away_guilt'], resultText: 'crisis.newcomers.o2.result' },
      { id: 'c2_o3', title: 'crisis.newcomers.o3.title', tags: [], meterDeltas: { cohesion: -5, resources: -5 }, linksPlanted: ['divided_welcome'], resultText: 'crisis.newcomers.o3.result' },
      { id: 'c2_o4', title: 'crisis.newcomers.o4.title', tags: ['actsOnRumor'], meterDeltas: { stability: 5, cohesion: -15 }, linksPlanted: ['paranoia'], resultText: 'crisis.newcomers.o4.result' },
    ],
  },
  {
    id: 'crisis_sickness',
    title: 'crisis.sickness.title',
    category: 'health',
    tier: 'late',
    publicBrief: 'crisis.sickness.brief',
    onStartLinkEffects: [
      { ifLink: 'contamination_ignored', meterDeltas: { stability: -10 }, narrative: 'crisis.sickness.link.contamination' },
      { ifLink: 'filtration_repair', meterDeltas: { cohesion: 5 }, narrative: 'crisis.sickness.link.filtration' },
    ],
    infoCards: [
      { id: 'c3_a', content: 'crisis.sickness.card.a', reliability: 'reported', truth: true },
      { id: 'c3_b', content: 'crisis.sickness.card.b', reliability: 'contested', truth: false },
      { id: 'c3_c', content: 'crisis.sickness.card.c', reliability: 'confirmed', truth: true },
    ],
    options: [
      { id: 'c3_o1', title: 'crisis.sickness.o1.title', tags: ['safe'], meterDeltas: { stability: 10, cohesion: -10, resources: -5 }, linksPlanted: [], resultText: 'crisis.sickness.o1.result' },
      { id: 'c3_o2', title: 'crisis.sickness.o2.title', tags: ['risky'], meterDeltas: { cohesion: 10, stability: -5, resources: -5 }, linksPlanted: [], resultText: 'crisis.sickness.o2.result' },
      { id: 'c3_o3', title: 'crisis.sickness.o3.title', tags: ['sacrifice'], meterDeltas: { stability: 5, resources: 5, cohesion: -15 }, linksPlanted: [], resultText: 'crisis.sickness.o3.result' },
      { id: 'c3_o4', title: 'crisis.sickness.o4.title', tags: ['safe'], meterDeltas: { stability: 5, cohesion: 5, resources: -5 }, linksPlanted: [], requiresLink: 'medic_joined', resultText: 'crisis.sickness.o4.result' },
    ],
  },
  {
    id: 'crisis_breach',
    title: 'crisis.breach.title',
    category: 'external',
    tier: 'final',
    publicBrief: 'crisis.breach.brief',
    infoCards: [{ id: 'c4_a', content: 'crisis.breach.card.a', reliability: 'confirmed', truth: true }],
    options: [
      { id: 'c4_o1', title: 'crisis.breach.o1.title', tags: ['bold'], meterDeltas: { stability: 10 }, linksPlanted: [], resultText: 'crisis.breach.o1.result', requires: { meter: 'cohesion', min: 45, failDeltas: { stability: -20 }, failText: 'crisis.breach.o1.fail' } },
      { id: 'c4_o2', title: 'crisis.breach.o2.title', tags: [], meterDeltas: { stability: 5, resources: -15 }, linksPlanted: [], resultText: 'crisis.breach.o2.result', requires: { meter: 'resources', min: 40, failDeltas: { stability: -10, resources: -15 }, failText: 'crisis.breach.o2.fail' } },
      { id: 'c4_o3', title: 'crisis.breach.o3.title', tags: ['safe'], meterDeltas: { resources: -20, stability: -10, cohesion: 10 }, linksPlanted: [], resultText: 'crisis.breach.o3.result' },
    ],
  },
];
