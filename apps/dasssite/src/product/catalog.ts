import type { CatalogPrice, CatalogProduct, MembershipPlan } from './types.js';

const sar = (amountMinor: number, interval: CatalogPrice['interval'] = 'one-time'): CatalogPrice => ({
  amountMinor,
  currency: 'SAR',
  interval,
  taxInclusive: true,
});

export const PRODUCTS: CatalogProduct[] = [
  { id: 'theme-original', category: 'theme', name: 'المجلس الأصلي', description: 'هوية دسّ الأساسية: ذهب، بنفسج، وظلال ليلية.', price: sar(0), accent: '#EBB24C', glyph: 'دسّ', includedIn: 'free' },
  { id: 'theme-sadu', category: 'theme', name: 'ليلة السدو', description: 'نسيج نجدي هادئ للمجالس والسهرات الطويلة.', price: sar(1900), accent: '#D45F54', glyph: '◆', includedIn: 'majlis-plus' },
  { id: 'bg-desert', category: 'background', name: 'آخر الليل', description: 'خلفية تلفاز صحراوية داكنة بلا تشتيت.', price: sar(1200), accent: '#B98345', glyph: '☾' },
  { id: 'avatar-falcon', category: 'avatar', name: 'الصقر', description: 'صورة رمزية حادة وواضحة داخل المجلس.', price: sar(700), accent: '#F7CE72', glyph: '♢' },
  { id: 'frame-gold', category: 'frame', name: 'إطار الخزنة', description: 'إطار ذهبي يبرز الملف من غير مبالغة.', price: sar(900), accent: '#EBB24C', glyph: '◇', includedIn: 'majlis-plus' },
  { id: 'winner-spark', category: 'winner', name: 'شرارة الفوز', description: 'لحظة فوز قصيرة ومضبوطة على شاشة المجلس.', price: sar(1500), accent: '#35D6A0', glyph: '✦' },
  { id: 'reveal-crack', category: 'reveal', name: 'انكسار الوعد', description: 'مؤثر كشف يبرز الدسّة بعد انتهاء السر.', price: sar(1400), accent: '#FF4D5E', glyph: '╱' },
  { id: 'season-eid', category: 'seasonal', name: 'حزمة العيد', description: 'حزمة موسمية قيد التجهيز — لا يمكن شراؤها الآن.', price: sar(2900), accent: '#8B79F2', glyph: '✺', comingSoon: true },
];

export const PLANS: MembershipPlan[] = [
  {
    id: 'free', name: 'مجلس', description: 'اللعبة الأساسية كاملة لكل شلة.',
    features: ['إنشاء الغرف والانضمام بلا حد مدفوع', 'اللعبة الكاملة من ٤ إلى ٨ لاعبين', 'الإعدادات وميزات الوصول الأساسية'],
  },
  {
    id: 'majlis-plus', name: 'مجلس بلس', description: 'تخصيص أعمق للمضيف والملف الشخصي.',
    monthly: sar(1900, 'month'), yearly: sar(19000, 'year'), recommended: true,
    features: ['ثيمات وإطارات مختارة', 'حفظ إعدادات المجلس', 'سجل مباريات ممتد مستقبلًا', 'مؤثرات تقديم إضافية بلا أفضلية لعب'],
  },
  {
    id: 'events', name: 'باقة مناسبات', description: 'تقديم مخصص للفعاليات والمجالس الكبيرة.',
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
