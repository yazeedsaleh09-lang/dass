import type { Crisis } from '@crisis/shared';

// Ported verbatim (mechanics) from Phase 2.6 §C–§F. Authored to the locked rules:
// each crisis moves >=1 meter; a safe-but-costly and a risky option; >=1 uncertain
// info card; every option plants a consequence link; final crisis gated by meters.
export const crises: Crisis[] = [
  {
    id: 'crisis_water',
    title: 'The Water Ration',
    category: 'resource',
    tier: 'early',
    publicBrief:
      'The main cistern is contaminated. Clean water runs out in days. We have to decide how to handle it — now.',
    infoCards: [
      { id: 'c1_a', content: 'The engineers can repair the filtration unit in ~3 days if it gets priority power.', reliability: 'confirmed', truth: true },
      { id: 'c1_b', content: 'A scout says there is a spring two hours out — but the route crosses the old quarantine zone.', reliability: 'reported', truth: false },
      { id: 'c1_c', content: "Someone insists the panic is overblown — the water's fine if you just boil it.", reliability: 'contested', truth: false },
      { id: 'c1_d', content: 'Rationing will hit the outer households hardest, and they will resent it.', reliability: 'confirmed', truth: true },
    ],
    options: [
      { id: 'c1_o1', title: 'Divert power to repair the filtration unit', tags: [], meterDeltas: { resources: -10, stability: -5, cohesion: 5 }, linksPlanted: ['filtration_repair'], resultText: 'Crews reroute power to the filters. Taps run low for now, but a real fix is coming.' },
      { id: 'c1_o2', title: 'Send a party to the spring', tags: ['bold', 'risky', 'actsOnRumor'], meterDeltas: { resources: 3, stability: -5, cohesion: -5 }, linksPlanted: ['spring_expedition'], resultText: 'The party reaches the spring — a trickle, not a river, and two return limping.' },
      { id: 'c1_o3', title: 'Strict equal rationing now', tags: ['safe'], meterDeltas: { resources: 5, cohesion: -10 }, linksPlanted: ['rationing_resentment'], resultText: 'Everyone tightens their belt. The outer households feel singled out.' },
      { id: 'c1_o4', title: "Trust 'just boil it' — no rationing", tags: ['risky', 'actsOnRumor'], meterDeltas: { cohesion: 5 }, linksPlanted: ['contamination_ignored'], resultText: 'Relief — no rationing. People boil their water and move on.' },
    ],
  },
  {
    id: 'crisis_newcomers',
    title: 'The Newcomers',
    category: 'social',
    tier: 'mid',
    publicBrief:
      'Six outsiders are at the gate — cold, hungry, maybe useful, maybe a burden, maybe a threat. Do we let them in?',
    infoCards: [
      { id: 'c2_a', content: 'One of them is a trained medic.', reliability: 'confirmed', truth: true },
      { id: 'c2_b', content: 'A guard swears one matches the description of raiders who hit a settlement to the north.', reliability: 'reported', truth: false },
      { id: 'c2_c', content: 'We honestly do not have surplus food for six more mouths this month.', reliability: 'confirmed', truth: true },
      { id: 'c2_d', content: 'You have heard half the settlement already wants them turned away.', reliability: 'contested', truth: false },
    ],
    options: [
      { id: 'c2_o1', title: 'Take them all in', tags: ['bold'], meterDeltas: { cohesion: 10, resources: -10 }, linksPlanted: ['medic_joined'], resultText: 'You open the gate. The medic quietly gets to work; a few grumble about the extra mouths.' },
      { id: 'c2_o2', title: 'Turn them away', tags: ['safe'], meterDeltas: { stability: 5, cohesion: -10 }, linksPlanted: ['turned_away_guilt'], resultText: 'The gate stays shut. You tell yourselves it was necessary.' },
      { id: 'c2_o3', title: 'Take some, refuse the rest', tags: [], meterDeltas: { cohesion: -5, resources: -5 }, linksPlanted: ['divided_welcome'], resultText: 'You wave some in and turn others back. No one thinks it was fair.' },
      { id: 'c2_o4', title: 'Detain and interrogate first', tags: ['actsOnRumor'], meterDeltas: { stability: 5, cohesion: -15 }, linksPlanted: ['paranoia'], resultText: 'You hold them under guard. They are terrified, not raiders. Word spreads that the council jails the desperate.' },
    ],
  },
  {
    id: 'crisis_sickness',
    title: 'The Sickness',
    category: 'health',
    tier: 'late',
    publicBrief:
      'People are falling ill — fever, spreading fast. We have medicine for maybe half the sick. What do we do?',
    onStartLinkEffects: [
      { ifLink: 'contamination_ignored', meterDeltas: { stability: -10 }, narrative: 'The water was never safe — the fever started at the cistern.' },
      { ifLink: 'filtration_repair', meterDeltas: { cohesion: 5 }, narrative: 'Clean water at least slows the spread.' },
    ],
    infoCards: [
      { id: 'c3_a', content: 'Quarantining the sick will probably contain it.', reliability: 'reported', truth: true },
      { id: 'c3_b', content: 'There is a rumor the sickness came in with the newcomers.', reliability: 'contested', truth: false },
      { id: 'c3_c', content: 'We can treat about half the sick, no more.', reliability: 'confirmed', truth: true },
    ],
    options: [
      { id: 'c3_o1', title: 'Quarantine hard', tags: ['safe'], meterDeltas: { stability: 10, cohesion: -10, resources: -5 }, linksPlanted: [], resultText: 'Doors are sealed, the sick behind them. It works — and it costs you something to watch.' },
      { id: 'c3_o2', title: 'Treat the vulnerable first, share widely', tags: ['risky'], meterDeltas: { cohesion: 10, stability: -5, resources: -5 }, linksPlanted: [], resultText: 'You spread the medicine thin and fair. Some who might have been saved are not; but no one was abandoned.' },
      { id: 'c3_o3', title: 'Treat the useful first to keep the settlement running', tags: ['sacrifice'], meterDeltas: { stability: 5, resources: 5, cohesion: -15 }, linksPlanted: [], resultText: 'You keep the settlement running by choosing who matters. It survives. So does the memory.' },
      { id: 'c3_o4', title: 'Let the medic run structured triage', tags: ['safe'], meterDeltas: { stability: 5, cohesion: 5, resources: -5 }, linksPlanted: [], requiresLink: 'medic_joined', resultText: 'The medic organizes triage with a steady hand — the closest thing to a good outcome anyone could manage.' },
    ],
  },
  {
    id: 'crisis_breach',
    title: 'The Breach',
    category: 'external',
    tier: 'final',
    publicBrief:
      'A storm surge is coming and the north wall is failing. This is the one that decides everything. Choose.',
    infoCards: [
      { id: 'c4_a', content: 'Everyone can feel it coming. There is no time to argue long.', reliability: 'confirmed', truth: true },
    ],
    options: [
      { id: 'c4_o1', title: 'Everyone to the wall — hold it together', tags: ['bold'], meterDeltas: { stability: 10 }, linksPlanted: [], resultText: 'The settlement pulls together and holds the line.', requires: { meter: 'cohesion', min: 45, failDeltas: { stability: -20 }, failText: 'People will not pull together; the wall gives way.' } },
      { id: 'c4_o2', title: 'Spend the reserves to reinforce', tags: [], meterDeltas: { stability: 5, resources: -15 }, linksPlanted: [], resultText: 'The wall is shored up in time.', requires: { meter: 'resources', min: 40, failDeltas: { stability: -10, resources: -15 }, failText: 'There is nothing left to spend; the reinforcement is half-finished.' } },
      { id: 'c4_o3', title: 'Evacuate to high ground — abandon the stores to save people', tags: ['safe'], meterDeltas: { resources: -20, stability: -10, cohesion: 10 }, linksPlanted: [], resultText: 'People live; the built place is lost to the water.' },
    ],
  },
];
