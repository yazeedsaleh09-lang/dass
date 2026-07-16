import type { ContentBundle, Crisis, Role } from './engine.js';

// Civic roles. `stake` (hidden from the table) is the state variable this role cares about most.
export const roles: Role[] = [
  { id: 'hospital', nameKey: 'v2.role.hospital.name', blurbKey: 'v2.role.hospital.blurb', stake: 'health' },
  { id: 'infrastructure', nameKey: 'v2.role.infrastructure.name', blurbKey: 'v2.role.infrastructure.blurb', stake: 'infrastructure' },
  { id: 'economy', nameKey: 'v2.role.economy.name', blurbKey: 'v2.role.economy.blurb', stake: 'economy' },
  { id: 'trust', nameKey: 'v2.role.trust.name', blurbKey: 'v2.role.trust.blurb', stake: 'trust' },
  { id: 'emergency', nameKey: 'v2.role.emergency.name', blurbKey: 'v2.role.emergency.blurb', stake: 'infrastructure' },
  { id: 'community', nameKey: 'v2.role.community.name', blurbKey: 'v2.role.community.blurb', stake: 'trust' },
];

export const crises: Crisis[] = [
  {
    id: 'water',
    tier: 'early',
    titleKey: 'v2.water.title',
    briefKey: 'v2.water.brief',
    reads: ['health', 'infrastructure'],
    rolesRelevant: ['hospital', 'infrastructure', 'economy'],
    infoCards: [
      { id: 'w_hosp', roleId: 'hospital', textKey: 'v2.water.info.hospital', confidence: 'confirmed', truth: true },
      { id: 'w_econ', roleId: 'economy', textKey: 'v2.water.info.economy', confidence: 'rumored', truth: false },
      { id: 'w_infra', roleId: 'infrastructure', textKey: 'v2.water.info.infra', confidence: 'confirmed', truth: true },
    ],
    options: [
      { id: 'w_fix', titleKey: 'v2.water.o_fix.title', effects: { infrastructure: 8, economy: -8 }, plantsThread: 'filtration_fixed', resultKey: 'v2.water.o_fix.result' },
      { id: 'w_ration', titleKey: 'v2.water.o_ration.title', effects: { health: 5, trust: -10 }, plantsThread: 'resentment', resultKey: 'v2.water.o_ration.result' },
      { id: 'w_wait', titleKey: 'v2.water.o_wait.title', effects: { trust: 4, health: -3 }, plantsThread: 'contamination', resultKey: 'v2.water.o_wait.result' },
    ],
  },
  {
    id: 'power',
    tier: 'mid',
    titleKey: 'v2.power.title',
    briefKey: 'v2.power.brief',
    reads: ['infrastructure'],
    rolesRelevant: ['infrastructure', 'emergency', 'hospital'],
    onThread: [
      { ifThread: 'contamination', calloutKey: 'v2.power.callout.contamination', effects: { health: -8 } },
      { ifThread: 'filtration_fixed', calloutKey: 'v2.power.callout.fixed', effects: { infrastructure: 4 } },
    ],
    infoCards: [
      { id: 'p_infra', roleId: 'infrastructure', textKey: 'v2.power.info.infra', confidence: 'confirmed', truth: true },
      { id: 'p_emerg', roleId: 'emergency', textKey: 'v2.power.info.emergency', confidence: 'rumored', truth: true },
    ],
    options: [
      { id: 'p_hospital', titleKey: 'v2.power.o_hospital.title', effects: { health: 8, trust: -6 }, plantsThread: 'sectors_dark', resultKey: 'v2.power.o_hospital.result' },
      { id: 'p_spread', titleKey: 'v2.power.o_spread.title', effects: { infrastructure: -4, trust: 6 }, resultKey: 'v2.power.o_spread.result' },
      { id: 'p_industry', titleKey: 'v2.power.o_industry.title', effects: { economy: 8, health: -6 }, resultKey: 'v2.power.o_industry.result' },
    ],
  },
  {
    id: 'unrest',
    tier: 'late',
    titleKey: 'v2.unrest.title',
    briefKey: 'v2.unrest.brief',
    reads: ['trust'],
    rolesRelevant: ['trust', 'community', 'emergency'],
    onThread: [
      { ifThread: 'resentment', calloutKey: 'v2.unrest.callout.resentment', effects: { trust: -8 } },
      { ifThread: 'sectors_dark', calloutKey: 'v2.unrest.callout.dark', effects: { trust: -6 } },
    ],
    infoCards: [
      { id: 'u_trust', roleId: 'trust', textKey: 'v2.unrest.info.trust', confidence: 'confirmed', truth: true },
      { id: 'u_comm', roleId: 'community', textKey: 'v2.unrest.info.community', confidence: 'rumored', truth: false },
    ],
    options: [
      { id: 'u_talk', titleKey: 'v2.unrest.o_talk.title', effects: { trust: 10, economy: -5 }, resultKey: 'v2.unrest.o_talk.result' },
      { id: 'u_force', titleKey: 'v2.unrest.o_force.title', effects: { infrastructure: 4, trust: -12 }, plantsThread: 'heavy_hand', resultKey: 'v2.unrest.o_force.result' },
      { id: 'u_ignore', titleKey: 'v2.unrest.o_ignore.title', effects: { economy: 3, trust: -6 }, resultKey: 'v2.unrest.o_ignore.result' },
    ],
  },
  {
    id: 'storm',
    tier: 'final',
    titleKey: 'v2.storm.title',
    briefKey: 'v2.storm.brief',
    reads: ['infrastructure', 'trust', 'economy', 'health'],
    rolesRelevant: ['infrastructure', 'emergency', 'community', 'hospital', 'economy', 'trust'],
    onThread: [{ ifThread: 'heavy_hand', calloutKey: 'v2.storm.callout.heavy', effects: { trust: -6 } }],
    infoCards: [{ id: 's_emerg', roleId: 'emergency', textKey: 'v2.storm.info.emergency', confidence: 'confirmed', truth: true }],
    options: [
      { id: 's_together', titleKey: 'v2.storm.o_together.title', effects: { infrastructure: 10, trust: 6 }, resultKey: 'v2.storm.o_together.result' },
      { id: 's_spend', titleKey: 'v2.storm.o_spend.title', effects: { infrastructure: 8, economy: -12 }, resultKey: 'v2.storm.o_spend.result' },
      { id: 's_evacuate', titleKey: 'v2.storm.o_evacuate.title', effects: { health: 8, economy: -8, infrastructure: -6 }, resultKey: 'v2.storm.o_evacuate.result' },
    ],
  },
];

export const content: ContentBundle = {
  roles,
  crises,
  playlist: ['water', 'power', 'unrest', 'storm'],
  startCity: { infrastructure: 62, trust: 60, economy: 58, health: 64 },
};
