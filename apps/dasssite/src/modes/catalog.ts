// BACKFIRE "worlds" — the game modes shown in the Modes experience.
//
// IMPORTANT: this is a VISUAL marketing prototype. None of these modes are wired to
// the engine, and only the playable vertical slice ("majlis") links to a real route.
// Everything else is a designed concept with a clear "قريبًا" / waitlist state — no
// checkout, no entitlement, no false "purchased" confirmation.

export type ModeAvailability = 'playable' | 'coming-soon' | 'waitlist';
export type ModeIntensity = 'هادئ' | 'متوسط' | 'عالٍ' | 'عالٍ جدًا';

export interface GameMode {
  id: string;
  /** Arabic name — the primary label. */
  name: string;
  /** Latin codename used as an art-direction detail only. */
  codename: string;
  /** One-line premise. Cinematic, direct, no English marketing translationese. */
  premise: string;
  /** A longer setup shown on the detail page (2–3 sentences). */
  brief: string;
  /** The single hidden-information hook that makes the world specific. */
  hook: string;
  players: string;
  duration: string;
  intensity: ModeIntensity;
  /** Price label already formatted (visual only). Empty when included. */
  price: string;
  /** Small tag under the price, e.g. "ضمن اللعبة". */
  priceNote?: string;
  availability: ModeAvailability;
  accent: string;
  /** Route to open when playable; otherwise undefined. */
  playRoute?: string;
  /** Three short "beats" that preview how a round feels in this world. */
  beats: [string, string, string];
}

export const MODES: GameMode[] = [
  {
    id: 'majlis',
    name: 'المجلس',
    codename: 'THE ORIGINAL',
    premise: 'خمس جوالات، طاولة واحدة، ووعود تنقلب في السر.',
    brief: 'الطور الأساسي وأول ما تلعبونه. كل لاعب يجلس على الطاولة ويعلن نيّته أمام الجميع، لكن القرار الحقيقي يُقفل على جواله. ما تكشفه الشاشة في نهاية الجولة هو الفرق بين ما قيل وما فُعل.',
    hook: 'وعدك معلن للجميع، وقرارك مخفي عن الكل.',
    players: '٤–٨ لاعبين',
    duration: '١٥–٢٥ دقيقة',
    intensity: 'متوسط',
    price: 'مجاني',
    priceNote: 'ضمن اللعبة',
    availability: 'playable',
    accent: '#b72e38',
    playRoute: '/create',
    beats: ['أعلنوا نيّاتكم على الطاولة', 'اقفلوا القرار الحقيقي سرًّا', 'الشاشة تكشف من التزم ومن انقلب'],
  },
  {
    id: 'classroom',
    name: 'الصف',
    codename: 'THE CLASS',
    premise: 'سرٌّ واحد بين خمسة طلاب، ومجلس تأديب لا يعرف الرحمة.',
    brief: 'حدث شيء في الصف، والإدارة تريد اسمًا واحدًا قبل الجرس. كل طالب يحمل جزءًا من الحقيقة وسببًا للكذب. من يحمي صاحبه؟ ومن يبيعه ليخرج نظيفًا؟',
    hook: 'أحدكم يعرف الفاعل. وأحدكم هو الفاعل.',
    players: '٥ لاعبين',
    duration: '٢٠ دقيقة',
    intensity: 'عالٍ',
    price: '٢٩ ر.س',
    availability: 'coming-soon',
    accent: '#c8873a',
    beats: ['وزّعوا الشهادات المتناقضة', 'صوّتوا على اسم قبل الجرس', 'الحقيقة تظهر بعد فوات الأوان'],
  },
  {
    id: 'siege',
    name: 'الحصار',
    codename: 'SIEGE',
    premise: 'المدينة محاصرة، والقرار: من يخرج ومن يبقى خلف الجدار.',
    brief: 'المؤن تكفي القليل، والبوابة تُفتح مرة واحدة كل ليلة. كل لاعب يمثّل بيتًا له مصالحه وأسراره. التحالفات تُبنى في الظلام، وتنهار عند أول رغيف.',
    hook: 'من تُنقذه الليلة قد يغلق البوابة في وجهك غدًا.',
    players: '٥–٦ لاعبين',
    duration: '٣٠ دقيقة',
    intensity: 'عالٍ جدًا',
    price: '٣٤ ر.س',
    availability: 'coming-soon',
    accent: '#d0552f',
    beats: ['قسّموا المؤن سرًّا', 'افتحوا البوابة لواحد فقط', 'الجوع يكشف من خان الحصار'],
  },
  {
    id: 'blackout',
    name: 'العتمة',
    codename: 'BLACKOUT',
    premise: 'انطفأت المدينة، وكل قرار في الظلام قد يضيء الهدف الخطأ.',
    brief: 'انقطعت الكهرباء، ومعها كل وسيلة للتأكد. لديكم مولّد واحد وقرارات لا رجعة فيها. ما تفعله في العتمة لا يراه أحد… حتى تعود الأنوار.',
    hook: 'في الظلام، الجميع بريء. عند الضوء، يظهر أثر واحد.',
    players: '٥ لاعبين',
    duration: '١٨ دقيقة',
    intensity: 'متوسط',
    price: '٢٤ ر.س',
    availability: 'waitlist',
    accent: '#e0e0dc',
    beats: ['تحرّكوا وأنتم في العتمة', 'وجّهوا المولّد لغرفة واحدة', 'الضوء يفضح ما جرى في الظلام'],
  },
  {
    id: 'orbit',
    name: 'المدار',
    codename: 'ORBIT',
    premise: 'المحطة تتهاوى، والأكسجين لا يكفي الجميع — من تُنقذ؟',
    brief: 'المحطة تفقد مدارها، والوحدات تُغلق واحدة تلو الأخرى. كل طاقم يخفي عطلًا يخصّه وحلًّا يخص غيره. القرار جماعي، والهبوط فردي.',
    hook: 'كل وحدة تُغلقها لإنقاذ نفسك تحبس أحدهم بالداخل.',
    players: '٦ لاعبين',
    duration: '٢٥ دقيقة',
    intensity: 'عالٍ',
    price: '٣٩ ر.س',
    availability: 'coming-soon',
    accent: '#7f97a6',
    beats: ['شخّصوا الأعطال سرًّا', 'أغلقوا وحدة لإنقاذ المدار', 'المحطة تتذكّر من ضحّى بمن'],
  },
  {
    id: 'hotel',
    name: 'النزيل',
    codename: 'THE GUEST',
    premise: 'فندق بلا خروج، ونزيل واحد ليس كما يدّعي.',
    brief: 'الليل طويل، والغرف كلها محجوزة، والمفاتيح تنتقل بين الأيدي. كل نزيل يحمل قصة غطاء وسببًا للبقاء مستيقظًا. باب واحد موارب يكفي ليقلب الليلة كلها.',
    hook: 'أحد النزلاء لا يملك غرفة… لكنه يملك مفتاحك.',
    players: '٥–٧ لاعبين',
    duration: '٢٢ دقيقة',
    intensity: 'متوسط',
    price: '٢٩ ر.س',
    availability: 'coming-soon',
    accent: '#8a2f44',
    beats: ['بدّلوا المفاتيح في الممر', 'اطرقوا بابًا واحدًا في الليل', 'الصباح يكشف من لم يكن نزيلًا'],
  },
];

export function modeById(id: string): GameMode | undefined {
  return MODES.find((mode) => mode.id === id);
}

export function availabilityLabel(availability: ModeAvailability): string {
  return { playable: 'متاح الآن', 'coming-soon': 'قريبًا', waitlist: 'قائمة الانتظار' }[availability];
}
