// BACKFIRE — "المُرحِّل المكسور" (The Broken Relay). All private text a phone can receive.
// Every card is SPECIFIC and ACTIONABLE (§Pillar 1): it names players and states a rule the
// holder can reason about, never "something dangerous may happen".

export type IntelId =
  | 'r1_stable'
  | 'r1_echo'
  | 'r1_future'
  | 'r1_obj_risky'
  | 'r1_obj_stable'
  | 'r2_support_a'
  | 'r2_support_b'
  | 'r2_disrupt'
  | 'r2_redirect'
  | 'r2_shield'
  | 'r3_redirector'
  | 'r3_guardian'
  | 'r3_side_a'
  | 'r3_side_b'
  | 'r3_side_c';

export type ObjectiveId =
  | 'r1o_threat_low'
  | 'r1o_minority'
  | 'r1o_majority'
  | 'r1o_pick_risky'
  | 'r1o_pick_stable'
  | 'r2o_support_carrier'
  | 'r2o_threat_flat'
  | 'r2o_disrupt_changed'
  | 'r2o_redirect_changed'
  | 'r2o_no_critical'
  | 'r3o_redirect_wins'
  | 'r3o_shield_wins'
  | 'r3o_avoid_echo'
  | 'r3o_winning_side'
  | 'r3o_no_collapse';

/** Names the templates can interpolate. Resolved by the engine before anything is sent. */
export interface CopyContext {
  stable: string;
  risky: string;
  echoHolder: string;
}

// Names are free text with no inferable gender, so every template stays nominal: "اختيار X"
// and "مع X", never "اختير X" or "هو X".
const INTEL: Record<IntelId, (c: CopyContext) => string> = {
  r1_stable: (c) => `مع ${c.stable} مُشغِّلاً، ينزل التهديد درجة واحدة.`,
  r1_echo: (c) => `مع ${c.risky} مُشغِّلاً، يبدأ الصدى بشحنة أقوى.`,
  r1_future: () => 'إذا حمل صاحبُ الصدى النواة في الجولة القادمة بلا حماية، يرتفع التهديد.',
  r1_obj_risky: (c) => `${c.risky} أنفع لك مما يبدو. اجعل الغرفة تميل إلى هذا الاسم.`,
  r1_obj_stable: (c) => `${c.stable} هو خيارك. اجعل الغرفة تميل إلى هذا الاسم.`,
  r2_support_a: () => 'الصدى يصير حرِجاً إذا حمل صاحبُه النواة بلا حماية.',
  r2_support_b: () => 'المسار الناجح ينزّل التهديد درجة واحدة.',
  r2_disrupt: () => 'تعطيلك مجهول: التلفاز يُظهر أن المسار انقطع، ولا يُظهر مَن قطعه.',
  r2_redirect: () => 'التحويل يعمل فقط إذا كان المصدر عليه دعمٌ موجب. غير ذلك يسقط بلا أثر.',
  r2_shield: () => 'الدرع يمنع شحن الصدى في هذه الجولة فقط. لا يحميك مما بعدها.',
  r3_redirector: () => 'إذا حوّلت الصدى نحو لاعبٍ محميّ، سيرجع إليك أنت.',
  r3_guardian: () => 'حمايتك تحتوي الصدى، لكن فقط إذا كان لجانبك دعمٌ كافٍ.',
  r3_side_a: () => 'يصل التهديد إلى الانهيار إذا نزل الصدى بلا احتواء والتهديد أصلاً ٤.',
  r3_side_b: () => 'المحوِّل يتحكّم بالوجهة، لكنه لا يتحكّم بنجاح التحويل.',
  r3_side_c: () => 'الهدف المحميّ قد يجعل الصدى يعكس اتجاهه.',
};

const OBJECTIVE: Record<ObjectiveId, (c: CopyContext) => string> = {
  r1o_threat_low: () => 'أنهِ هذه الجولة والتهديد ١ أو أقل.',
  r1o_minority: () => 'كن مع الأقلية — صوّت للاسم الذي لن يصير مُشغِّلاً.',
  r1o_majority: () => 'صوّت مع الأغلبية.',
  r1o_pick_risky: (c) => `اجعل اختيار المُشغِّل يقع على ${c.risky}.`,
  r1o_pick_stable: (c) => `اجعل اختيار المُشغِّل يقع على ${c.stable}.`,
  r2o_support_carrier: () => 'اجعل مَن تدعمه هو حامل النواة.',
  r2o_threat_flat: () => 'لا تدع التهديد يرتفع في هذه الجولة.',
  r2o_disrupt_changed: () => 'اجعل تعطيلك يغيّر هوية الحامل.',
  r2o_redirect_changed: () => 'اجعل الحامل مختلفاً عن صاحب أعلى دعمٍ أوّلي.',
  r2o_no_critical: () => 'امنع الصدى من أن يصير حرِجاً.',
  r3o_redirect_wins: () => 'اجعل جانب التحويل يفوز بالتصويت.',
  r3o_shield_wins: () => 'اجعل جانب الدرع يفوز بالتصويت.',
  r3o_avoid_echo: () => 'لا تدع الصدى ينزل عليك.',
  r3o_winning_side: () => 'كن في الجانب الفائز.',
  r3o_no_collapse: () => 'امنع التهديد من الوصول إلى الانهيار.',
};

export function intelText(id: IntelId | null, c: CopyContext): string | null {
  return id ? INTEL[id](c) : null;
}

export function objectiveText(id: ObjectiveId | null, c: CopyContext): string | null {
  return id ? OBJECTIVE[id](c) : null;
}

/** Round 1 cards A–E (§9), each paired with the objective its holder pursues. */
export const R1_CARDS: { intel: IntelId; objective: ObjectiveId }[] = [
  { intel: 'r1_stable', objective: 'r1o_threat_low' },
  { intel: 'r1_echo', objective: 'r1o_minority' },
  { intel: 'r1_future', objective: 'r1o_majority' },
  { intel: 'r1_obj_risky', objective: 'r1o_pick_risky' },
  { intel: 'r1_obj_stable', objective: 'r1o_pick_stable' },
];

/** Round 2: each tool carries its own intel and its own private objective (§12). */
export const R2_CARDS: Record<'support_a' | 'support_b' | 'disrupt' | 'redirect' | 'shield', { intel: IntelId; objective: ObjectiveId }> = {
  support_a: { intel: 'r2_support_a', objective: 'r2o_support_carrier' },
  support_b: { intel: 'r2_support_b', objective: 'r2o_threat_flat' },
  disrupt: { intel: 'r2_disrupt', objective: 'r2o_disrupt_changed' },
  redirect: { intel: 'r2_redirect', objective: 'r2o_redirect_changed' },
  shield: { intel: 'r2_shield', objective: 'r2o_no_critical' },
};

/** Round 3: the two special positions plus three fragments of the bounce rule (§21). */
export const R3_SPECIAL = {
  redirect: { intel: 'r3_redirector' as IntelId, objective: 'r3o_redirect_wins' as ObjectiveId },
  shield: { intel: 'r3_guardian' as IntelId, objective: 'r3o_shield_wins' as ObjectiveId },
};

export const R3_SIDE_CARDS: { intel: IntelId; objective: ObjectiveId }[] = [
  { intel: 'r3_side_a', objective: 'r3o_avoid_echo' },
  { intel: 'r3_side_b', objective: 'r3o_winning_side' },
  { intel: 'r3_side_c', objective: 'r3o_no_collapse' },
];

export const WORLD_LABEL: Record<string, string> = {
  stable: 'مستقر',
  unstable: 'مضطرب',
  critical: 'حرِج',
  collapse: 'انهيار',
};

export const ECHO_LABEL: Record<string, string> = {
  none: '—',
  dormant: 'خامل',
  charged: 'مشحون',
  critical: 'حرِج',
  resolved: 'انتهى',
};

export const TOOL_LABEL: Record<string, string> = {
  vote: 'صوت',
  support: 'دعم',
  disrupt: 'تعطيل',
  redirect: 'تحويل',
  shield: 'درع',
  side: 'انحياز',
};
