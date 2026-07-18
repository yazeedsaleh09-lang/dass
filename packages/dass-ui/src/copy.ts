// دسّ — all player-facing copy in one place. Natural Saudi, no فصحى. Mischievous, bold, premium.
import type { Phase } from '@dass/domain';

export const COPY = {
  brand: 'دسّ',
  tagline: 'قدّامهم شي… ووراهم شي.',
  subtitle: 'أعلن نيّتك… ثم دسّها بالسر.',

  // join / lobby
  namePlaceholder: 'وش اسمك؟',
  codePlaceholder: 'كود الغرفة',
  join: 'خشّ',
  create: 'سوّي غرفة',
  scanToJoin: 'صوّر الرمز بجوالك',
  orType: 'أو اكتب الكود بصفحة',
  waiting: 'ننتظر البقية…',
  emptySeat: 'مقعد فاضي',
  ready: 'جاهز',
  unready: 'رجعت مو جاهز',
  imReady: 'جاهز، يلا',
  start: 'ابدأ اللعبة',
  needMore: 'باقي لاعبين',
  needFour: 'لازم ٤ على الأقل',
  hostStarts: 'الهوست يبدأ من الشاشة',
  everyoneReady: 'الكل جاهز — يلا نبدأ',
  youAreHost: 'أنت الهوست',
  waitingHost: 'بانتظار الهوست',
  hostReconnecting: 'الهوست يعيد الاتصال…',
  players: 'اللاعبين',
  host: 'الهوست',
  you: 'أنت',
  lookUp: 'ارفع راسك للشاشة',
  ofN: (a: number, b: number) => `${a} من ${b}`,

  // actions
  support: 'أدعمه',
  attack: 'أضربه',
  sell: 'أبيع',
  supportShort: 'دعم',
  attackShort: 'ضرب',
  sellShort: 'بيع',
  pickTarget: 'اختر لاعب',
  declareTitle: 'أعلن نيّتك — بصوت عالي',
  declareSub: 'مين ترفعه، مين توطّيه؟ ولا تبيع وتثبّت؟',
  declared: 'أعلنتها',
  reactionTitle: 'شوفوا نيّات بعض',
  reactionSub: 'تقدر تغيّر إعلانك مرة وحدة… لو ودك تلعبها.',
  changeOnce: 'غيّر إعلاني',
  changedAlready: 'غيّرتها — خلاص',
  lockTitle: 'الحين… بالسر',
  lockSub: 'الفعل الحقيقي. تلتزم بوعدك، أو تدسّها عليهم.',
  keepPromise: 'ألتزم بكلامي',
  betrayIt: 'أدسّها 🔪',
  locked: 'قفلت السر',
  sellSelf: 'تبيع نفسك — تثبّت وضعك بالخزنة، وترجع من تحت.',

  // waiting / reveal
  sentWaiting: 'أرسلت قرارك',
  waitOthers: 'ننتظر البقية يقررون…',
  watchScreen: 'الحركة على الشاشة الكبيرة',
  yourMoveHidden: 'قرارك محفوظ… ومخفي.',

  // vault / results
  vault: 'الخزنة',
  yourVault: 'خزنتك',
  round: 'جولة',
  roundOf: (a: number, b: number) => `جولة ${a} من ${b}`,
  marketClose: 'إغلاق السوق',

  // end / winner
  finalTitle: 'الكشف الكامل',
  finalSub: 'كل وعد… ووش صار فيه.',
  dassa: 'دسّة',
  kept: 'التزم',
  promised: 'وعد',
  truth: 'الحقيقة',
  winner: 'الفايز',
  coChamps: 'تعادل على القمة',
  biggestVault: 'أكبر خزنة',
  playAgain: 'نفس الشلة، مرة ثانية',
  newCrew: 'شلة جديدة',
  playedIt: 'خلصنا 😮‍💨',
  yourResult: 'نتيجتك',

  // system / connection / errors (all Saudi)
  booting: 'نجهّز المسرح…',
  connecting: 'نربط الاتصال…',
  reconnecting: 'رجعنالك… ثانية',
  disconnected: 'انقطع الاتصال — نحاول نرجّعك',
  reconnected: 'رجع الاتصال',
  sessionRestored: 'تم استعادة جلستك',
  recoveryExpired: 'انتهت صلاحية الاستعادة',
  playerReconnecting: 'اللاعب يعيد الاتصال',
  timedOut: 'فاتتك! عدّينا الجولة.',
  roomNotFound: 'الغرفة مو موجودة — تأكد من الكود',
  roomFull: 'الغرفة كاملة (٨ لاعبين)',
  nameTaken: 'الاسم مكرر — عدّلناه لك',
  genericError: 'صار خلل بسيط — جرّب مرة ثانية',
  loading: 'لحظة…',
  skip: 'تخطّي',
  copied: 'اننسخ ✓',
  muteOn: 'الصوت شغّال',
  muteOff: 'الصوت مكتوم',
} as const;

export function phaseLabel(phase: Phase): string {
  switch (phase) {
    case 'LOBBY':
      return 'اللوبي';
    case 'DECLARE':
      return 'الإعلان';
    case 'REACTION_WINDOW':
      return 'التفاعل';
    case 'LOCK':
      return 'القفل السري';
    case 'REVEAL':
      return 'التحريك';
    case 'VAULT_UPDATE':
      return 'الخزنة';
    case 'GAME_END':
      return 'الكشف';
    default:
      return '';
  }
}

// "الوسيط" — sarcastic, Saudi, text-only. Distributed by moment.
export const WASEET = {
  lobby: ['يا هلا بالشلة… مين فيكم بيغدر اليوم؟', 'ابتسموا لبعض… بينكشف كل شي بالأخير.'],
  declare: ['أعلنوا نياتكم… واللي بقلبه غير، الله يعينه.', 'كلكم صادقين، أكيد. 🙂'],
  reaction: ['تقدرون تغيّرون… بس الكل يشوف.', 'فيه أحد بيبدّل رأيه؟ عيونهم عليك.'],
  lock: ['الحين اللعب الحقيقي… بالسر.', 'وش بتسوي فعلاً؟ محد يدري… لسّه.'],
  dassa: ['دسّها! قال شي وسوّى ثاني. 🔪', 'شفتوا؟ الوجه غير القفا.', 'صاحبنا يلعبها من تحت لتحت.'],
  firstVault: ['أول واحد يثبّت… يعرف متى يوقف.', 'ثبّتها بالخزنة، والباقي يتمنون.'],
  final: ['الحين… نكشف كل دسّة صارت.', 'ولا وعد بيسلم اليوم.'],
  winner: ['أكبر خزنة… وأذكى دسّة.', 'هذا اللي عرف متى يبيع، ومتى يخون.'],
} as const;

export function pick<T>(arr: readonly T[], seed: number): T {
  return arr[Math.abs(Math.floor(seed)) % arr.length]!;
}
