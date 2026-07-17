// دسّ — all player-facing copy in one place (§12 i18n-ready). Natural Saudi, no فصحى.
import type { Phase } from '@dass/domain';

export const COPY = {
  brand: 'دسّ',
  tagline: 'قدّامهم شي… ووراهم شي.',

  // join / lobby
  namePlaceholder: 'اسمك هنا',
  join: 'ادخل',
  roomHint: 'افتحوا الرابط أو اكتبوا الكود',
  codeLabel: 'كود الغرفة',
  waiting: 'ننتظر الباقي…',
  ready: 'جاهز',
  notReady: 'مو جاهز',
  start: 'ابدأ اللعبة',
  needFour: 'لازم ٤ على الأقل',
  lookUp: 'ارفع راسك للشاشة 👆',

  // actions
  support: 'أدعمه',
  attack: 'أضربه',
  sell: 'أبيع',
  pickTarget: 'اختر لاعب',
  declareTitle: 'أعلن نيّتك',
  declareSub: 'مين بترفعه، ومين بتوطّيه؟ ولا تبيع وتثبّت؟',
  declared: 'أعلنت ✅',
  reactionTitle: 'الكل أعلن',
  reactionSub: 'تكلموا… اتّفقوا، أو اتّهموا.',
  lockTitle: 'اقفلها بالسر 🤫',
  lockSub: 'الحين الفعل الحقيقي — تلتزم بوعدك، أو تدسّها.',
  locked: 'قفلت 🔒',
  changeToBetray: 'غيّرها لو ودك تدسّ',

  // reveal / vault
  revealTitle: 'الكشف',
  dassaTag: 'دسّة!',
  promised: 'وعد',
  truth: 'الحقيقة',
  vaultTitle: 'ثبّتوا بالخزنة',
  yourVault: 'خزنتك',

  // end
  finalTitle: 'الكشف النهائي',
  winner: 'الفايز',
  coChamps: 'تعادل على القمة',
  playAgain: 'لعبة جديدة',
  newCrew: 'شلة جديدة',
  playedIt: 'لعبناها 😮‍💨',

  // system / errors (Saudi)
  connecting: 'نربط الاتصال…',
  reconnecting: 'رجّعنا لك الاتصال…',
  disconnected: 'انقطع الاتصال — نحاول نرجّعك',
  timedOut: 'فاتتك! عدّيت هالجولة.',
  roomNotFound: 'الغرفة مو موجودة — تأكد من الكود',
  full: 'الغرفة كاملة',
  genericError: 'صار خلل بسيط — جرّب مرة ثانية',
} as const;

export function phaseLabel(phase: Phase): string {
  switch (phase) {
    case 'LOBBY':
      return 'اللوبي';
    case 'DECLARE':
      return 'الإعلان العلني';
    case 'REACTION_WINDOW':
      return 'نافذة التفاعل';
    case 'LOCK':
      return 'القفل السري';
    case 'REVEAL':
      return 'الكشف';
    case 'VAULT_UPDATE':
      return 'الخزنة';
    case 'GAME_END':
      return 'النهاية';
    default:
      return '';
  }
}

// "الوسيط" — 8 lines, by trigger. Sarcastic, Saudi. Text only (phase 1).
export const WASEET = {
  declare: ['أعلنوا نياتكم… واللي بقلبه غير، الله يعينه.', 'كلكم صادقين، أكيد. 🙂'],
  dassa: ['دسّها! قال كلام وسوّى ثاني. 🔪', 'شفتوا؟ الوجه غير القفا.', 'طلع صاحبنا يلعبها من تحت لتحت.'],
  firstVault: ['أول واحد يثبّت… يعرف متى يوقف.', 'ثبّتها بالخزنة، والباقي يتمنون.'],
  final: ['الحين نكشف كل دسّة صارت… ولا وعد بيسلم.'],
} as const;

export function pick<T>(arr: readonly T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]!;
}
