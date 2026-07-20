import type { CatalogPrice, CatalogProduct, MembershipPlan } from './types.js';

const sar = (amountMinor: number, interval: CatalogPrice['interval'] = 'one-time'): CatalogPrice => ({
  amountMinor,
  currency: 'SAR',
  interval,
  taxInclusive: true,
});

export const PRODUCTS: CatalogProduct[] = [
  { id: 'theme-original', category: 'theme', name: 'الرجعة الأصلية', description: 'هوية BACKFIRE الأساسية: أسود عميق، قرمزي، وجمر دافئ.', price: sar(0), accent: '#E23A4F', glyph: 'BF', includedIn: 'free' },
  { id: 'theme-sadu', category: 'theme', name: 'نسيج الأثر', description: 'تأويل بصري هادئ مستلهم من السدو لجلسات اللعب الطويلة.', price: sar(1900), accent: '#B51F36', glyph: '◆', includedIn: 'majlis-plus' },
  { id: 'bg-desert', category: 'background', name: 'آخر الإرسال', description: 'خلفية تلفاز داكنة توحي بأثر بعيد من دون تشتيت.', price: sar(1200), accent: '#E85B3F', glyph: '☾' },
  { id: 'avatar-falcon', category: 'avatar', name: 'الصقر', description: 'صورة رمزية حادة وواضحة داخل جلسة اللعب.', price: sar(700), accent: '#FAF6F7', glyph: '♢' },
  { id: 'frame-gold', category: 'frame', name: 'إطار الارتداد', description: 'إطار قرمزي يبرز الملف من غير مبالغة.', price: sar(900), accent: '#B51F36', glyph: '◇', includedIn: 'majlis-plus' },
  { id: 'winner-spark', category: 'winner', name: 'نبضة الفوز', description: 'لحظة فوز قصيرة ومضبوطة على الشاشة الكبيرة.', price: sar(1500), accent: '#E85B3F', glyph: '✦' },
  { id: 'reveal-crack', category: 'reveal', name: 'ارتداد الأثر', description: 'مؤثر كشف يبرز عودة العاقبة إلى المشهد العام.', price: sar(1400), accent: '#E23A4F', glyph: '╱' },
  { id: 'season-eid', category: 'seasonal', name: 'حزمة العيد', description: 'حزمة موسمية قيد التجهيز — لا يمكن شراؤها الآن.', price: sar(2900), accent: '#4A0B18', glyph: '✺', comingSoon: true },
];

export const PLANS: MembershipPlan[] = [
  {
    id: 'free', name: 'الأساسية', description: 'اللعبة الأساسية كاملة لكل شلة.',
    features: ['إنشاء الغرف والانضمام بلا حد مدفوع', 'اللعبة الكاملة من ٤ إلى ٨ لاعبين', 'الإعدادات وميزات الوصول الأساسية'],
  },
  {
    id: 'majlis-plus', name: 'Backfire Plus', description: 'تخصيص أعمق للمضيف والملف الشخصي.',
    monthly: sar(1900, 'month'), yearly: sar(19000, 'year'), recommended: true,
    features: ['ثيمات وإطارات مختارة', 'حفظ إعدادات الجلسة', 'سجل مباريات ممتد مستقبلًا', 'مؤثرات تقديم إضافية بلا أفضلية لعب'],
  },
  {
    id: 'events', name: 'باقة مناسبات', description: 'تقديم مخصص للفعاليات والجلسات الكبيرة.',
    monthly: sar(5900, 'month'), yearly: sar(59000, 'year'),
    features: ['هوية غرفة قابلة للتخصيص', 'قوالب عرض للمناسبات', 'إعدادات مضيف متقدمة مستقبلًا', 'لا تتضمن أي عنصر ادفع لتفوز'],
  },
];

export function productById(id: string): CatalogProduct | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function planById(id: string): MembershipPlan | undefined {
  return PLANS.find((plan) => plan.id === id);
}

export function formatPrice(price: CatalogPrice): string {
  if (price.amountMinor === 0) return 'مجاني';
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: price.currency, maximumFractionDigits: 2 }).format(price.amountMinor / 100);
}
