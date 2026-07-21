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
  // ── متاح الآن ─────────────────────────────────────────────────────────────
  {
    id: 'majlis',
    name: 'المجلس',
    codename: 'THE ORIGINAL',
    premise: 'طاولة وحدة، ووعود تنقلب في السرّ.',
    brief: 'الطور الأساسي وأول ما تلعبونه. كل واحد يجلس على الطاولة ويعلن نيّته قدّام الكل، بس القرار الحقيقي يُقفل على جواله. اللي تكشفه الشاشة آخر الجولة هو الفرق بين اللي قيل واللي انسوّى.',
    hook: 'وعدك مسموع للكل، وقرارك ما يشوفه أحد.',
    players: '٤–٨ لاعبين',
    duration: '١٥–٢٥ دقيقة',
    intensity: 'متوسط',
    price: 'مجاني',
    priceNote: 'ضمن اللعبة',
    availability: 'playable',
    accent: '#b72e38',
    playRoute: '/create',
    beats: ['أعلنوا نيّاتكم على الطاولة', 'اقفلوا قراركم الحقيقي بسرّه', 'الشاشة تكشف من التزم ومن انقلب'],
  },

  // ── أطوار BACKFIRE الأصلية — عوالم أصلية على الطريق ───────────────────────
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

  // ── مستوحى من الأنمي — قريبًا ─────────────────────────────────────────────
  // Concept labels only: anime *titles* as inspiration for a BACKFIRE world.
  // No characters, logos, screenshots, or affiliation. Disabled, no checkout,
  // no numeric price, no play route — marketing previews only.
  {
    id: 'attack-on-titan',
    name: 'هجوم العمالقة',
    codename: 'THE LAST WALL',
    premise: 'جدار واحد يحميكم، وواحد فيكم يقدر يفتح فيه ثغرة.',
    brief: 'تهديد يجي على الكل من برّه، والحماية ما تكفي كل الجهات. تتفقون بصوت عالي وين تحصّنون، وكل واحد يرسل قوّته بسرّه. اللي يقصّر في جهة يفتح ثغرة — والكسر يضل بارز للجولة الجاية.',
    hook: 'اللي تحميه الليلة، يمكن يطيّح الجدار بكرة.',
    players: '٤–٨ لاعبين',
    duration: '٣٠ دقيقة',
    intensity: 'عالٍ جدًا',
    price: 'قريبًا',
    availability: 'coming-soon',
    accent: '#c0392b',
    beats: ['اتفقوا بصوت عالي وين تحمون', 'كل واحد يرسل قوّته بسرّه', 'الشاشة تكشف من وين جت الثغرة'],
  },
  {
    id: 'tomodachi-game',
    name: 'لعبة الأصدقاء',
    codename: 'THE TRUST GAME',
    premise: 'كلكم أصحاب… بس كل واحد معه دَين يخبّيه عن البقية.',
    brief: 'تقعدون كلكم تحت المراقبة، والثقة بينكم هي رأس المال. قرار واحد عام قدّام الكل، وقرار سري على جوالك يخالفه. تقدر تحمي الجماعة أو تسدّد دَينك على حسابهم — والفرق ينكشف قدّام الكل.',
    hook: 'وعدك سمعوه كلهم، وقرارك ما يشوفه أحد.',
    players: '٤–٦ لاعبين',
    duration: '٢٥ دقيقة',
    intensity: 'عالٍ',
    price: 'قريبًا',
    availability: 'coming-soon',
    accent: '#6f9a6f',
    beats: ['كل واحد ياخذ دَينه بسرّه', 'اتفقوا على وعد قدّام الكل', 'الشاشة تقارن الوعد بالفعل'],
  },
  {
    id: 'kaiji',
    name: 'كايجي',
    codename: 'THE GAMBLE',
    premise: 'كل جولة ترفع الرهان، والطريق يضيق، واللي يطمع يخسر كل شي.',
    brief: 'رهان يكبر جولة بعد جولة، وكل واحد يقرّر بسرّه: يثبت، يرفع، أو ينسحب. تشوفون مجموع الخطر بس ما تشوفون قرار كل واحد. اللي يطمع بزيادة يمكن يطيح لحاله.',
    hook: 'الطمع يورّطك… والانسحاب يفضحك.',
    players: '٤–٨ لاعبين',
    duration: '٢٥ دقيقة',
    intensity: 'عالٍ جدًا',
    price: 'قريبًا',
    availability: 'coming-soon',
    accent: '#c79a2e',
    beats: ['الطاولة ترفع الرهان', 'كل واحد يقرّر بسرّه: يثبت أو يرفع', 'العدّاد يكشف من طمع'],
  },
  {
    id: 'code-geass',
    name: 'كود غياس',
    codename: 'THE COMMAND',
    premise: 'أمر واحد مخفي يقلب الولاء… وبعدها ما تدري مين معك.',
    brief: 'تعلنون تحالفاتكم قدّام الكل، وكل واحد معه أمر واحد يخبّيه. الأمر يجبر دعم، أو يحوّل عاقبة، أو يكسر تحالف. الأوامر تتصادم، والسيطرة تنتقل من يد ليد.',
    hook: 'الأمر يعطيك السيطرة الحين… ويكشفك بعدين.',
    players: '٤–٨ لاعبين',
    duration: '٢٨ دقيقة',
    intensity: 'عالٍ',
    price: 'قريبًا',
    availability: 'coming-soon',
    accent: '#7b52a8',
    beats: ['أعلنوا تحالفاتكم قدّام الكل', 'كل واحد يخبّي أمره الواحد', 'الشاشة تكشف الأمر اللي رجع على صاحبه'],
  },
  {
    id: 'jujutsu-kaisen',
    name: 'جوجوتسو كايسن',
    codename: 'THE CURSE',
    premise: 'القوة تنقذك الحين… بس أثرها يمشي وراك.',
    brief: 'لعنة وحدة في الغرفة يشوفها الكل، وكل واحد يقرّر بسرّه: يمتصّها، يحوّلها، أو يستخدمها. القرار القوي يعطيك فايدة فورية، بس أثره يضل شايفينه، ويعرف طريق الرجوع لصاحبه.',
    hook: 'الحماية ما تمحي الخطر… تأخّره.',
    players: '٤–٧ لاعبين',
    duration: '٢٢ دقيقة',
    intensity: 'عالٍ',
    price: 'قريبًا',
    availability: 'coming-soon',
    accent: '#3f9aa8',
    beats: ['اللعنة تظهر للكل', 'كل واحد يقرّر بسرّه: يمتص أو يحوّل', 'الأثر يرجع لمن استخدمه أول'],
  },
];

/** IDs of the anime-inspired concept modes — separate records from the original BACKFIRE worlds. */
export const ANIME_MODE_IDS = new Set([
  'attack-on-titan', 'tomodachi-game', 'kaiji', 'code-geass', 'jujutsu-kaisen',
]);

export type ModeFamily = 'live' | 'original' | 'anime';

/** Which section of the modes page a world belongs to. */
export function modeFamily(mode: GameMode): ModeFamily {
  if (mode.availability === 'playable') return 'live';
  return ANIME_MODE_IDS.has(mode.id) ? 'anime' : 'original';
}

export function modeById(id: string): GameMode | undefined {
  return MODES.find((mode) => mode.id === id);
}

export function availabilityLabel(availability: ModeAvailability): string {
  return { playable: 'متاح الآن', 'coming-soon': 'قريبًا', waitlist: 'قائمة الانتظار' }[availability];
}
