import { escapeHtml } from '@dass/ui';
import { isRoomCode, normalizeRoomCode } from '@dass/domain';
import { formatPrice, planById, PLANS, productById, PRODUCTS } from './catalog.js';
import { configuredPublicOrigin } from './config.js';
import { demoMode, platform } from './platform.js';
import type { CatalogProduct, MembershipPlan, Session } from './types.js';

export const PRODUCT_PATHS = new Set([
  '/store', '/pricing', '/login', '/signup', '/forgot-password',
  '/reset-password', '/verify-email', '/session-ended', '/store/product', '/checkout/result',
  '/account', '/account/profile', '/account/settings', '/account/inventory',
  '/account/history', '/account/history/match', '/account/achievements', '/account/billing', '/checkout',
  '/support', '/faq', '/contact', '/report-player', '/about', '/credits', '/status', '/changelog',
  '/invite',
  '/legal/privacy', '/legal/terms', '/legal/refunds', '/legal/cookies',
]);

export interface ProductPage {
  active?: string;
  title: string;
  description: string;
  html: string;
  bind?: (navigate: (path: string) => void, refresh: () => void) => void;
}

const h = escapeHtml;
const $ = <T extends Element = HTMLElement>(selector: string): T | null => document.querySelector<T>(selector);

function shell(kicker: string, title: string, copy: string, content: string, aside = ''): string {
  return `<main id="main-content" class="product-page" tabindex="-1">
    <header class="product-hero"><div><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${copy}</p></div>${aside}</header>
    ${demoMode ? demoBanner() : unavailableBanner()}
    ${content}
  </main>`;
}

function demoBanner(): string {
  return `<aside class="demo-banner" role="note"><span class="demo-dot"></span><div><b>وضع العرض المحلي</b><span>الحسابات والمشتريات محفوظة على هذا المتصفح فقط. لا يوجد دفع أو إرسال بريد حقيقي.</span></div></aside>`;
}

function unavailableBanner(): string {
  return `<aside class="demo-banner unavailable" role="alert"><span class="demo-dot"></span><div><b>الخدمات التجارية غير متصلة</b><span>التصفح متاح، لكن الحساب والدفع يحتاجان مزود إنتاج.</span></div></aside>`;
}

function notice(message: string, kind: 'ok' | 'error' = 'ok'): void {
  const box = $('#product-notice');
  if (!box) return;
  box.className = `product-notice ${kind}`;
  box.textContent = message;
  box.removeAttribute('hidden');
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'تعذر إكمال العملية.';
}

function setFormBusy(form: HTMLFormElement, busy: boolean): void {
  form.setAttribute('aria-busy', String(busy));
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!button) return;
  if (busy) { button.dataset.label = button.textContent ?? ''; button.textContent = 'جاري التنفيذ…'; }
  else if (button.dataset.label) button.textContent = button.dataset.label;
  button.disabled = busy;
}

function requireAccount(session: Session | null, next = ''): string | null {
  if (session) return null;
  const login = next ? `/login?next=${encodeURIComponent(next)}` : '/login';
  return `<section class="empty-state panel"><span class="empty-glyph">◇</span><h2>تحتاج حسابًا محليًا</h2><p>سجّل دخولك في وضع العرض أو تابع كضيف للوصول لهذه الصفحة.</p><a class="btn primary" data-link="${login}">دخول أو متابعة كضيف</a></section>`;
}

function loginNext(): string {
  const requested = new URLSearchParams(location.search).get('next') ?? '';
  const path = requested.split('?')[0] ?? '';
  return path.startsWith('/') && PRODUCT_PATHS.has(path) ? requested : '/account/profile';
}

function accountTabs(active: string): string {
  const tabs: Array<[string, string, string]> = [
    ['profile', '/account/profile', 'الملف'], ['inventory', '/account/inventory', 'المقتنيات'],
    ['history', '/account/history', 'المباريات'], ['achievements', '/account/achievements', 'الإنجازات'],
    ['billing', '/account/billing', 'الفوترة'], ['settings', '/account/settings', 'الإعدادات'],
  ];
  return `<nav class="account-tabs" aria-label="صفحات الحساب">${tabs.map(([id, path, label]) => `<a data-link="${path}" class="${active === id ? 'on' : ''}">${label}</a>`).join('')}</nav>`;
}

function field(name: string, label: string, type = 'text', value = '', attrs = ''): string {
  return `<label class="field"><span>${label}</span><input class="input" name="${name}" type="${type}" value="${h(value)}" ${attrs}></label>`;
}

function loginPage(): ProductPage {
  const session = platform.getSession();
  const html = session
    ? shell('الحساب', 'أهلًا ' + h(session.displayName), 'جلستك المحلية جاهزة.', `<section class="auth-card panel"><div id="product-notice" hidden></div><p class="muted">${session.mode === 'guest' ? 'أنت داخل كضيف.' : `الحساب التجريبي: ${h(session.email ?? '')}`}</p><a class="btn primary wide" data-link="/account/profile">افتح حسابي</a><button class="btn wide" id="logout">تسجيل الخروج</button></section>`)
    : shell('الحساب', 'ارجع للعبة', 'دخول تجريبي محلي لا يرسل بيانات إلى خادم.', `<section class="auth-layout"><form id="login-form" class="auth-card panel"><div id="product-notice" role="status" aria-live="polite" hidden></div>${field('email', 'البريد الإلكتروني', 'email', '', 'autocomplete="email" required')}${field('password', 'كلمة المرور', 'password', '', 'data-secret autocomplete="current-password" minlength="8" required')}<div class="demo-credential"><span>حساب العرض الجاهز</span><code dir="ltr">demo@backfire.local · demoPass8</code></div><div class="form-options"><label class="check-row"><input name="remember" type="checkbox" checked><span>تذكر الجلسة على هذا الجهاز</span></label><button class="secret-toggle" type="button">إظهار كلمة المرور</button></div><button class="btn primary wide" type="submit">دخول تجريبي</button><a data-link="/forgot-password" class="text-link">نسيت كلمة المرور؟</a></form><aside class="auth-side"><span class="auth-seal">BF</span><h2>ما عندك حساب؟</h2><p>أنشئ ملفًا محليًا، أو ادخل كضيف من دون بريد.</p><a class="btn" data-link="/signup">إنشاء حساب تجريبي</a><button id="guest-login" class="btn ghost">المتابعة كضيف</button></aside></section>`);
  return {
    active: 'account', title: 'تسجيل الدخول', description: 'الدخول إلى حساب BACKFIRE التجريبي.', html,
    bind(navigate) {
      bindSecretToggle();
      $('#logout')?.addEventListener('click', async () => { await platform.signOut(); navigate('/'); });
      $('#guest-login')?.addEventListener('click', async (event) => {
        (event.currentTarget as HTMLButtonElement).disabled = true;
        try { await platform.continueAsGuest(); navigate(loginNext()); } catch (error) { notice(errorMessage(error), 'error'); (event.currentTarget as HTMLButtonElement).disabled = false; }
      });
      $('#login-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement; setFormBusy(form, true);
        const data = new FormData(form);
        try {
          await platform.signIn(String(data.get('email') ?? ''), String(data.get('password') ?? ''));
          navigate(loginNext());
        } catch (error) { notice(errorMessage(error), 'error'); } finally { setFormBusy(form, false); }
      });
    },
  };
}

function signupPage(): ProductPage {
  return {
    active: 'account', title: 'إنشاء حساب', description: 'إنشاء حساب BACKFIRE تجريبي محلي.',
    html: shell('حساب جديد', 'سمّ نفسك', 'البيانات تبقى على هذا الجهاز في وضع العرض.', `<form id="signup-form" class="auth-card panel form-grid"><div id="product-notice" role="status" aria-live="polite" hidden></div>${field('displayName', 'الاسم الظاهر', 'text', '', 'maxlength="24" autocomplete="name" required aria-describedby="name-help"')}<small id="name-help" class="field-help">حتى ٢٤ حرفًا. لا نسمح بالترميز أو محارف التحكم.</small>${field('username', 'اسم المستخدم', 'text', '', 'maxlength="20" pattern="[a-zA-Z0-9_]{3,20}" dir="ltr" required aria-describedby="username-help"')}<small id="username-help" class="field-help">٣–٢٠ من الحروف الإنجليزية والأرقام والشرطة السفلية.</small>${field('email', 'البريد الإلكتروني', 'email', '', 'autocomplete="email" required')}${field('password', 'كلمة المرور', 'password', '', 'data-secret minlength="8" autocomplete="new-password" required aria-describedby="password-help"')}${field('confirmPassword', 'تأكيد كلمة المرور', 'password', '', 'data-secret minlength="8" autocomplete="new-password" required')}<small id="password-help" class="field-help">٨ خانات على الأقل، وتتضمن حرفًا ورقمًا.</small><button class="secret-toggle" type="button">إظهار كلمتي المرور</button><label class="check-row"><input name="terms" type="checkbox" required><span>أوافق على <a data-link="/legal/terms">الشروط</a> و<a data-link="/legal/privacy">الخصوصية</a>.</span></label><button class="btn primary wide" type="submit">أنشئ الحساب التجريبي</button><p class="form-foot">عندك حساب؟ <a data-link="/login">سجّل الدخول</a></p></form>`),
    bind(navigate) {
      bindSecretToggle();
      $('#signup-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement; setFormBusy(form, true);
        const data = new FormData(form);
        try {
          if (String(data.get('password') ?? '') !== String(data.get('confirmPassword') ?? '')) throw new Error('كلمتا المرور غير متطابقتين.');
          await platform.signUp({
            displayName: String(data.get('displayName') ?? ''), username: String(data.get('username') ?? ''),
            email: String(data.get('email') ?? ''), password: String(data.get('password') ?? ''),
            acceptedTerms: data.get('terms') === 'on',
          });
          navigate('/account/profile');
        } catch (error) { notice(errorMessage(error), 'error'); } finally { setFormBusy(form, false); }
      });
    },
  };
}

function bindSecretToggle(): void {
  $('.secret-toggle')?.addEventListener('click', (event) => {
    const secrets = document.querySelectorAll<HTMLInputElement>('[data-secret]');
    const show = [...secrets].some((input) => input.type === 'password');
    secrets.forEach((input) => { input.type = show ? 'text' : 'password'; });
    (event.currentTarget as HTMLButtonElement).textContent = show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور';
  });
}

function forgotPage(): ProductPage {
  return {
    active: 'account', title: 'استعادة كلمة المرور', description: 'توضيح استعادة كلمة المرور في النسخة التجريبية.',
    html: shell('استعادة الحساب', 'نسيت كلمة المرور؟', 'لن نرسل بريدًا وهميًا. مزود البريد غير موصول في وضع العرض.', `<form id="reset-form" class="auth-card panel"><div id="product-notice" hidden></div>${field('email', 'البريد الإلكتروني', 'email', '', 'required autocomplete="email"')}<button class="btn primary wide" type="submit">تحقق من الطلب</button><a class="text-link" data-link="/login">العودة للدخول</a></form>`),
    bind() {
      $('#reset-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement; setFormBusy(form, true);
        const data = new FormData(form);
        try {
          await platform.requestPasswordReset(String(data.get('email') ?? ''));
          notice('البريد صحيح، لكن لم يُرسل شيء لأن مزود البريد غير موصول في وضع العرض.');
        } catch (error) { notice(errorMessage(error), 'error'); } finally { setFormBusy(form, false); }
      });
    },
  };
}

function authStatePage(path: string): ProductPage {
  if (path === '/session-ended') return {
    active: 'account', title: 'انتهت الجلسة', description: 'انتهت جلسة حساب BACKFIRE.',
    html: shell('أمان الحساب', 'انتهت الجلسة', 'لم نحتفظ بعملية معلّقة. ادخل مرة ثانية للمتابعة.', `<section class="empty-state panel"><span class="empty-glyph">⌁</span><h2>سجّل دخولك من جديد</h2><p>في مزود الإنتاج ستنتهي الجلسة عند الإلغاء أو انتهاء صلاحية الرمز. وضع العرض المحلي لا يدّعي دورة رموز خادم.</p><a class="btn primary" data-link="/login">تسجيل الدخول</a></section>`),
  };
  if (path === '/verify-email') return {
    active: 'account', title: 'تأكيد البريد', description: 'حالة تأكيد بريد حساب BACKFIRE.',
    html: shell('تأكيد البريد', 'البريد غير موثّق', 'مزود البريد غير موصول، لذلك لن نرسل رسالة وهمية.', `<section class="empty-state panel"><span class="empty-glyph">✉</span><h2>التأكيد غير متاح في وضع العرض</h2><p>الحساب المحلي يبقى بعلامة «غير موثّق». عند توصيل مزود الهوية ستُرسل الروابط وتُتحقق على الخادم.</p><a class="btn" data-link="/account/profile">العودة للملف</a></section>`),
  };
  return {
    active: 'account', title: 'إعادة تعيين كلمة المرور', description: 'إعادة تعيين كلمة مرور BACKFIRE.',
    html: shell('استعادة الحساب', 'رابط إعادة التعيين غير نشط', 'هذه الشاشة موجودة لحالة الرابط، لكنها لن تغير كلمة مرور من دون مزود هوية.', `<section class="empty-state panel"><span class="empty-glyph">◇</span><h2>لا يوجد رمز استعادة صالح</h2><p>اطلب رابطًا بعد توصيل خدمة البريد والهوية. لم نقرأ أو نقبل أي رمز من الرابط في وضع العرض.</p><a class="btn primary" data-link="/forgot-password">العودة للاستعادة</a></section>`),
  };
}

function productCard(product: CatalogProduct, owned: Set<string>): string {
  const primaryAction = product.comingSoon
    ? '<button class="btn sm" disabled>قريبًا</button>'
    : owned.has(product.id)
      ? `<a class="btn sm" data-link="/account/inventory">${product.price.amountMinor === 0 ? 'ضمن حسابك' : 'مملوك'}</a>`
      : `<a class="btn primary sm" data-link="/checkout?kind=product&id=${product.id}">اقتناء</a>`;
  return `<article class="product-card" data-category="${product.category}" data-name="${h(product.name.toLowerCase())}" data-price="${product.price.amountMinor}"><a class="product-art" style="--accent:${product.accent}" data-link="/store/product?id=${product.id}" aria-label="معاينة ${h(product.name)}"><span>${h(product.glyph)}</span></a><div class="product-card-copy"><span class="product-type">${categoryLabel(product.category)}</span><h2><a data-link="/store/product?id=${product.id}">${h(product.name)}</a></h2><p>${h(product.description)}</p><div class="product-card-foot"><b>${formatPrice(product.price)}</b><div><a class="btn sm ghost" data-link="/store/product?id=${product.id}">معاينة</a>${primaryAction}</div></div></div></article>`;
}

function categoryLabel(category: CatalogProduct['category']): string {
  return ({ theme: 'ثيم', background: 'خلفية', avatar: 'صورة', frame: 'إطار', winner: 'فوز', reveal: 'كشف', seasonal: 'موسمي' })[category];
}

function storePage(): ProductPage {
  const owned = new Set(platform.getSession() ? platform.getInventory().ownedProductIds : ['theme-original']);
  return {
    active: 'store', title: 'المتجر', description: 'مظاهر وتجارب بصرية اختيارية للعبة BACKFIRE.',
    html: shell('متجر BACKFIRE', 'خلّ الجلسة تشبهكم', 'مظاهر ومؤثرات اختيارية فقط — لا أفضلية لعب ولا صناديق عشوائية.', `<section class="catalog-tools"><div class="filter-pills" role="group" aria-label="تصفية المتجر"><button class="on" data-filter="all">الكل</button><button data-filter="theme">الثيمات</button><button data-filter="avatar">الملف</button><button data-filter="winner">المؤثرات</button></div><div class="catalog-inputs"><label><span class="sr-only">ابحث في المتجر</span><input id="store-search" class="input" type="search" placeholder="ابحث بالاسم"></label><label><span class="sr-only">ترتيب المتجر</span><select id="store-sort" class="input"><option value="featured">الترتيب المقترح</option><option value="low">السعر: الأقل</option><option value="high">السعر: الأعلى</option></select></label></div><p class="catalog-note">الأسعار تشمل الضريبة · الدفع الحقيقي غير مفعّل</p></section><div id="store-empty" class="empty-state panel compact" hidden><h2>ما لقينا هذا العنصر</h2><p>غيّر البحث أو افتح فئة ثانية.</p></div><section class="product-grid" id="product-grid">${PRODUCTS.map((product) => productCard(product, owned)).join('')}</section>`),
    bind() {
      let category = 'all';
      const apply = (): void => {
        const query = ($<HTMLInputElement>('#store-search')?.value ?? '').trim().toLowerCase();
        let visible = 0;
        document.querySelectorAll<HTMLElement>('[data-category]').forEach((card) => {
          card.hidden = (category !== 'all' && card.dataset.category !== category) || !(card.dataset.name ?? '').includes(query);
          if (!card.hidden) visible += 1;
        });
        const empty = $('#store-empty'); if (empty) empty.toggleAttribute('hidden', visible !== 0);
      };
      document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => {
        document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('on', item === button));
        category = button.dataset.filter ?? 'all'; apply();
      }));
      $('#store-search')?.addEventListener('input', apply);
      $('#store-sort')?.addEventListener('change', (event) => {
        const grid = $('#product-grid'); if (!grid) return;
        const cards = [...grid.querySelectorAll<HTMLElement>('[data-price]')];
        const mode = (event.currentTarget as HTMLSelectElement).value;
        if (mode !== 'featured') cards.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price) || (a.dataset.name ?? '').localeCompare(b.dataset.name ?? '', 'ar'));
        if (mode === 'high') cards.reverse();
        cards.forEach((card) => grid.append(card));
      });
    },
  };
}

function productDetailPage(params: URLSearchParams): ProductPage {
  const product = productById(params.get('id') ?? '');
  if (!product) return notFoundPage('العنصر غير موجود', 'ارجع للمتجر واختر عنصرًا من الكتالوج.');
  const inventory = platform.getSession() ? platform.getInventory() : null;
  const owned = inventory?.ownedProductIds.includes(product.id) ?? product.price.amountMinor === 0;
  const equipped = inventory?.equipped[product.category] === product.id;
  const action = product.comingSoon ? '<button class="btn primary" disabled>قريبًا</button>' : owned
    ? `<button id="detail-equip" class="btn primary" ${equipped ? 'disabled' : ''}>${equipped ? 'مفعّل الآن' : 'تفعيل العنصر'}</button>`
    : `<a class="btn primary" data-link="/checkout?kind=product&id=${product.id}">اقتناء تجريبي</a>`;
  return {
    active: 'store', title: product.name, description: product.description,
    html: shell('تفاصيل العنصر', h(product.name), h(product.description), `<section class="product-detail"><div class="product-detail-art panel" style="--accent:${product.accent}"><span>${h(product.glyph)}</span><i>معاينة بصرية تمثيلية</i></div><div class="product-detail-copy panel"><span class="product-type">${categoryLabel(product.category)}</span><h2>${formatPrice(product.price)}</h2><dl><div><dt>الحالة</dt><dd>${product.comingSoon ? 'قيد التجهيز' : owned ? 'مملوك' : 'متاح'}</dd></div><div><dt>الفئة</dt><dd>${categoryLabel(product.category)}</dd></div><div><dt>الأثر على اللعب</dt><dd>تجميلي فقط</dd></div></dl>${action}<p>لا يمنح العنصر نقاطًا أو قرارات أو فرصة فوز إضافية.</p><a class="text-link" data-link="/store">العودة للمتجر</a></div></section>`),
    bind(_navigate, refresh) {
      $('#detail-equip')?.addEventListener('click', async () => {
        try { await platform.equipProduct(product.id); refresh(); } catch (error) { notice(errorMessage(error), 'error'); }
      });
    },
  };
}

function planCard(plan: MembershipPlan): string {
  const current = platform.getSession()?.plan === plan.id;
  const monthly = plan.monthly ? formatPrice(plan.monthly) : 'مجاني';
  const yearly = plan.yearly ? formatPrice(plan.yearly) : 'مجاني';
  const action = current ? '<button class="btn wide" disabled>باقتك الحالية</button>' : plan.id === 'free' ? '<a class="btn wide" data-link="/create">ابدأ الآن</a>' : `<a class="btn ${plan.recommended ? 'primary' : ''} wide price-action" data-plan="${plan.id}" data-link="/checkout?kind=plan&id=${plan.id}&interval=month">اختر الباقة</a>`;
  return `<article class="plan-card ${plan.recommended ? 'recommended' : ''} ${current ? 'current' : ''}">${current ? '<span class="plan-badge current">الحالية</span>' : plan.recommended ? '<span class="plan-badge">الأوضح للمجالس</span>' : ''}<div><span class="product-type">${plan.id === 'free' ? 'الأساسي' : 'اشتراك'}</span><h2>${h(plan.name)}</h2><p>${h(plan.description)}</p></div><div class="plan-price"><b data-month="${monthly}" data-year="${yearly}">${monthly}</b><span class="plan-cycle">${plan.id === 'free' ? 'دائمًا' : 'شهريًا'}</span></div><ul>${plan.features.map((feature) => `<li>${h(feature)}</li>`).join('')}</ul>${action}</article>`;
}

function pricingPage(): ProductPage {
  return {
    active: 'pricing', title: 'الأسعار', description: 'باقات BACKFIRE الشفافة من دون أفضلية لعب.',
    html: shell('العضوية', 'اللعبة كاملة… والتخصيص اختياري', 'النسخة المجانية تشمل اللعب الأساسي كاملًا. العضوية تضيف مظهرًا وتنظيمًا فقط.', `<div class="billing-toggle" role="group" aria-label="دورة الفوترة"><button class="on" data-cycle="month">شهري</button><button data-cycle="year">سنوي <span>وفر شهرين</span></button></div><section class="plans-grid">${PLANS.map(planCard).join('')}</section><section class="pricing-trust"><h2>وعدنا التجاري</h2><div><p><b>لا ادفع لتفوز</b><span>كل القرارات والنتائج متساوية.</span></p><p><b>لا تجديد مخفي</b><span>السعر والدورة ظاهران قبل التأكيد.</span></p><p><b>لا شراء عشوائي</b><span>تعرف بالضبط وش تقتني.</span></p></div></section><section class="plan-compare panel"><h2>مقارنة سريعة</h2><div><span>اللعبة الأساسية</span><b>كل الباقات</b></div><div><span>ميزات الوصول</span><b>كل الباقات</b></div><div><span>الثيمات والإطارات</span><b>بلس والمناسبات</b></div><div><span>هوية مناسبة مخصصة</span><b>المناسبات</b></div></section><section class="faq-list"><h2>أسئلة الفوترة</h2><details><summary>هل يتم الخصم الآن؟</summary><p>لا. المزود الحالي محلي وتجريبي، ولا يطلب بطاقة أو يخصم مبلغًا.</p></details><details><summary>كيف ألغي أو أخفّض الباقة؟</summary><p>تظهر واجهة الإدارة في صفحة الفوترة، لكن الإلغاء والتجديد الحقيقيين يحتاجان بوابة مزود الدفع.</p></details><details><summary>هل السعر شامل الضريبة؟</summary><p>بيانات الكتالوج الحالية معنونة بأنها شاملة الضريبة. يجب تأكيد الفواتير والسياسة مع مزود الدفع قبل البيع.</p></details></section>`),
    bind() {
      document.querySelectorAll<HTMLButtonElement>('[data-cycle]').forEach((button) => button.addEventListener('click', () => {
        const cycle = button.dataset.cycle!;
        document.querySelectorAll('[data-cycle]').forEach((item) => item.classList.toggle('on', item === button));
        document.querySelectorAll<HTMLElement>('.plan-price b').forEach((price) => { price.textContent = price.dataset[cycle] ?? ''; });
        document.querySelectorAll<HTMLElement>('.plan-cycle').forEach((label) => { if (label.textContent !== 'دائمًا') label.textContent = cycle === 'year' ? 'سنويًا' : 'شهريًا'; });
        document.querySelectorAll<HTMLAnchorElement>('.price-action').forEach((link) => { link.dataset.link = `/checkout?kind=plan&id=${link.dataset.plan}&interval=${cycle}`; });
      }));
    },
  };
}

function profilePage(): ProductPage {
  const session = platform.getSession();
  const gate = requireAccount(session);
  if (gate) return { active: 'account', title: 'الملف الشخصي', description: 'ملف حساب BACKFIRE.', html: shell('حسابي', 'الملف الشخصي', 'إدارة هويتك داخل BACKFIRE.', gate) };
  const profile = platform.getProfile();
  const joined = new Date(session!.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  return {
    active: 'account', title: 'الملف الشخصي', description: 'إدارة ملف حساب BACKFIRE.',
    html: shell('حسابي', 'الملف الشخصي', 'اسمك وهويتك أمام لاعبي المجلس.', `${accountTabs('profile')}<section class="account-grid"><aside class="profile-preview panel"><div class="profile-avatar">${h(profile.displayName.slice(0, 1))}</div><h2>${h(profile.displayName)}</h2><span>@${h(profile.username)}</span><div class="profile-badges"><i>${session!.mode === 'guest' ? 'ضيف محلي' : 'حساب تجريبي'}</i><i>${session!.plan === 'free' ? 'مجلس' : h(planById(session!.plan)?.name ?? '')}</i>${session!.verified ? '<i class="verified">موثّق</i>' : '<a data-link="/verify-email">غير موثّق</a>'}</div><small>منضم منذ ${joined}</small></aside><form id="profile-form" class="account-form panel"><div id="product-notice" role="status" aria-live="polite" hidden></div>${field('displayName', 'الاسم الظاهر', 'text', profile.displayName, 'maxlength="24" required')}${field('username', 'اسم المستخدم', 'text', profile.username, 'maxlength="20" dir="ltr" required')}<p class="field-help">وضع العرض يفحص التكرار داخل هذا المتصفح. الإنتاج يحتاج فحصًا مركزيًا وطبقة إشراف على الأسماء.</p><button class="btn primary" type="submit">حفظ التغييرات</button><a class="btn" data-link="/account/inventory">اختيار الصورة والإطار والمظهر</a><button class="btn danger-outline" id="logout" type="button">تسجيل الخروج</button></form></section><section class="profile-stats panel"><header><div><h2>الإحصاءات</h2><p>لا توجد مزامنة مباريات لهذا الحساب بعد.</p></div><a data-link="/account/history">سجل المباريات</a></header><div>${[['المباريات','٠'],['الفوز','٠'],['الخسارة','٠'],['نسبة الفوز','—'],['السلسلة الحالية','٠'],['أفضل سلسلة','٠']].map(([label,value]) => `<p><b>${value}</b><span>${label}</span></p>`).join('')}</div><footer>هذه أصفار حقيقية لحساب بلا سجل، وليست بيانات عيّنة.</footer></section>`),
    bind(navigate, refresh) {
      $('#profile-form')?.addEventListener('submit', async (event) => {
        event.preventDefault(); const form = event.currentTarget as HTMLFormElement; setFormBusy(form, true); const data = new FormData(form);
        try { await platform.updateProfile({ displayName: String(data.get('displayName') ?? ''), username: String(data.get('username') ?? '') }); notice('تم حفظ الملف.'); setTimeout(refresh, 350); } catch (error) { notice(errorMessage(error), 'error'); } finally { setFormBusy(form, false); }
      });
      $('#logout')?.addEventListener('click', async () => { await platform.signOut(); navigate('/'); });
    },
  };
}

function inventoryPage(): ProductPage {
  const session = platform.getSession(); const gate = requireAccount(session);
  if (gate) return { active: 'account', title: 'المقتنيات', description: 'مقتنيات حساب BACKFIRE.', html: shell('حسابي', 'المقتنيات', 'العناصر المملوكة والمفعّلة.', gate) };
  const inventory = platform.getInventory();
  const owned = PRODUCTS.filter((product) => inventory.ownedProductIds.includes(product.id));
  return {
    active: 'account', title: 'المقتنيات', description: 'إدارة مقتنيات BACKFIRE.',
    html: shell('حسابي', 'المقتنيات', 'فعّل مظهرًا واحدًا من كل فئة.', `${accountTabs('inventory')}<div id="product-notice" role="status" aria-live="polite" hidden></div><section class="inventory-grid">${owned.map((product) => { const active = inventory.equipped[product.category] === product.id; return `<article class="inventory-item panel"><div class="inventory-glyph" style="--accent:${product.accent}">${h(product.glyph)}</div><div><span>${categoryLabel(product.category)}</span><h2>${h(product.name)}</h2></div><button class="btn sm ${active ? 'unequip' : 'equip'}" data-product="${product.id}" ${product.id === 'theme-original' && active ? 'disabled' : ''}>${active ? product.id === 'theme-original' ? 'الأساسي' : 'إلغاء التفعيل' : 'تفعيل'}</button></article>`; }).join('')}</section>${owned.length < PRODUCTS.length ? '<div class="account-nudge"><p>تبغى خيارات أكثر للمجلس؟</p><a class="btn" data-link="/store">تصفح المتجر</a></div>' : ''}`),
    bind(_navigate, refresh) {
      document.querySelectorAll<HTMLButtonElement>('.equip').forEach((button) => button.addEventListener('click', async () => {
        try { await platform.equipProduct(button.dataset.product!); notice('تم تفعيل العنصر.'); setTimeout(refresh, 300); } catch (error) { notice(errorMessage(error), 'error'); }
      }));
      document.querySelectorAll<HTMLButtonElement>('.unequip').forEach((button) => button.addEventListener('click', async () => {
        try { await platform.unequipProduct(button.dataset.product!); notice('تم إلغاء تفعيل العنصر.'); setTimeout(refresh, 300); } catch (error) { notice(errorMessage(error), 'error'); }
      }));
    },
  };
}

function settingsPage(): ProductPage {
  const session = platform.getSession(); const gate = requireAccount(session);
  if (gate) return { active: 'account', title: 'الإعدادات', description: 'إعدادات حساب BACKFIRE.', html: shell('حسابي', 'الإعدادات', 'التحكم بالتجربة والخصوصية.', gate) };
  const settings = platform.getSettings();
  const toggle = (name: keyof typeof settings, label: string, description: string): string => `<label class="setting-row"><span><b>${label}</b><small>${description}</small></span><input type="checkbox" name="${name}" ${settings[name] === true || (name === 'textScale' && settings.textScale === 'large') ? 'checked' : ''}></label>`;
  return {
    active: 'account', title: 'الإعدادات', description: 'إعدادات تجربة وخصوصية BACKFIRE.',
    html: shell('حسابي', 'الإعدادات', 'كل إعداد واضح ويُحفظ على هذا الجهاز.', `${accountTabs('settings')}<form id="settings-form"><div id="product-notice" role="status" aria-live="polite" hidden></div><section class="settings-section panel"><h2>عام</h2><label class="select-row"><span><b>اللغة</b><small>واجهة عربية كاملة حاليًا.</small></span><select class="input" disabled><option>العربية</option></select></label><label class="select-row"><span><b>المظهر</b><small>هوية دسّ الليلية هي المظهر المصمم بالكامل.</small></span><select class="input" disabled><option>دسّ الأصلي</option></select></label>${toggle('highContrast', 'تباين مرتفع', 'زيادة وضوح الحدود والنصوص.')}${toggle('textScale', 'نص أكبر', 'تكبير نصوص صفحات المنتج.')}</section><section class="settings-section panel"><h2>الصوت والحركة</h2>${toggle('muted', 'كتم الصوت', 'إيقاف مؤثرات الموقع.')}${toggle('animations', 'الحركات', 'تشغيل انتقالات الواجهة.')}${toggle('reducedMotion', 'تقليل الحركة', 'تخفيف المؤثرات المستمرة.')}${toggle('haptics', 'الاهتزاز', 'ردود فعل لمسية على الجوال عند دعمها.')}<label class="range-row"><span>صوت المؤثرات <output>${settings.effectsVolume}%</output></span><input name="effectsVolume" type="range" min="0" max="100" value="${settings.effectsVolume}"></label><label class="range-row"><span>صوت الموسيقى <output>${settings.musicVolume}%</output></span><input name="musicVolume" type="range" min="0" max="100" value="${settings.musicVolume}"></label></section><section class="settings-section panel"><h2>اللعب</h2>${toggle('confirmCritical', 'تأكيد القرارات الحرجة', 'خطوة تأكيد قبل البيع أو القرار النهائي.')}${toggle('autoReady', 'استعداد تلقائي', 'غير مفعّل افتراضيًا حتى لا تبدأ بالغلط.')}<p class="field-help">تفضيلات المضيف والغرفة تحتاج ربط الحساب بالمضيف قبل تفعيلها.</p></section><section class="settings-section panel"><h2>التنبيهات</h2>${toggle('productUpdates', 'تحديثات المنتج', 'إشعارات محلية عن النسخ الجديدة.')}${toggle('matchInvites', 'دعوات المباريات', 'جاهزة لخدمة الدعوات المستقبلية.')}${toggle('friendInvites', 'دعوات اللاعبين السابقين', 'لا يوجد إرسال خارجي في وضع العرض.')}${toggle('purchaseReceipts', 'إيصالات الشراء', 'إيصالات العرض تظهر محليًا.')}${toggle('subscriptionReminders', 'تذكير الاشتراك', 'يتطلب خدمة اشتراك وتنبيهات.')}${toggle('marketing', 'رسائل تسويقية', 'غير مفعّلة افتراضيًا.')}</section><section class="settings-section panel"><h2>الخصوصية وملفات الارتباط</h2><label class="select-row"><span><b>ظهور الملف</b><small>اختيار محلي حتى تتوفر خدمة الملفات.</small></span><select class="input" name="profileVisibility"><option value="private" ${settings.profileVisibility === 'private' ? 'selected' : ''}>خاص</option><option value="players" ${settings.profileVisibility === 'players' ? 'selected' : ''}>لاعبو المجلس</option><option value="public" ${settings.profileVisibility === 'public' ? 'selected' : ''}>عام</option></select></label>${toggle('activityVisibility', 'إظهار النشاط', 'غير مفعّل افتراضيًا.')}${toggle('recentPlayerVisibility', 'الظهور للاعبين السابقين', 'جاهز لخدمة الدعوات المستقبلية.')}${toggle('analytics', 'تحليلات الاستخدام', 'غير مفعّلة في وضع العرض.')}${toggle('functionalCookies', 'تخزين وظيفي', 'يستخدم الموقع التخزين المحلي لتفضيلات العرض.')}</section><button class="btn primary" type="submit">حفظ الإعدادات</button></form><section class="settings-section account-actions panel"><h2>الحساب والبيانات</h2><div><span><b>تغيير البريد أو كلمة المرور</b><small>يتطلب مزود هوية موصولًا.</small></span><button class="btn sm" disabled>غير متاح</button></div><div><span><b>الحسابات المتصلة</b><small>لا توجد موفّرات خارجية.</small></span><button class="btn sm" disabled>لا يوجد</button></div><div><span><b>تصدير البيانات</b><small>البيانات التجريبية موجودة في المتصفح فقط.</small></span><button id="export-local" class="btn sm">تنزيل نسخة محلية</button></div><div><span><b>الخروج من كل الجلسات</b><small>لا توجد جلسات خادم في وضع العرض.</small></span><button class="btn sm" disabled>غير متاح</button></div></section><section class="danger-zone panel"><h2>حذف البيانات المحلية</h2><p>يمسح الحساب والمقتنيات والإعدادات التجريبية من هذا المتصفح فقط.</p>${field('delete-confirm', 'اكتب: احذف حسابي')}<div class="danger-actions"><button id="delete-account" class="btn danger-outline">حذف البيانات</button><button id="cancel-delete" class="btn ghost">إلغاء</button></div></section>`),
    bind(navigate) {
      document.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach((range) => range.addEventListener('input', () => { const output = range.closest('label')?.querySelector('output'); if (output) output.textContent = `${range.value}%`; }));
      $('#settings-form')?.addEventListener('submit', (event) => {
        event.preventDefault(); const form = event.currentTarget as HTMLFormElement; const data = new FormData(form);
        try {
          platform.updateSettings({
            muted: data.get('muted') === 'on', animations: data.get('animations') === 'on', reducedMotion: data.get('reducedMotion') === 'on',
            haptics: data.get('haptics') === 'on', confirmCritical: data.get('confirmCritical') === 'on', autoReady: data.get('autoReady') === 'on',
            productUpdates: data.get('productUpdates') === 'on', matchInvites: data.get('matchInvites') === 'on', friendInvites: data.get('friendInvites') === 'on',
            purchaseReceipts: data.get('purchaseReceipts') === 'on', subscriptionReminders: data.get('subscriptionReminders') === 'on', marketing: data.get('marketing') === 'on',
            activityVisibility: data.get('activityVisibility') === 'on', recentPlayerVisibility: data.get('recentPlayerVisibility') === 'on',
            analytics: data.get('analytics') === 'on', functionalCookies: data.get('functionalCookies') === 'on', effectsVolume: Number(data.get('effectsVolume')),
            musicVolume: Number(data.get('musicVolume')), highContrast: data.get('highContrast') === 'on', textScale: data.get('textScale') === 'on' ? 'large' : 'normal',
            profileVisibility: data.get('profileVisibility') as 'private' | 'players' | 'public',
          }); notice('تم حفظ الإعدادات.');
        } catch (error) { notice(errorMessage(error), 'error'); }
      });
      $('#export-local')?.addEventListener('click', () => {
        const payload = JSON.stringify({ exportedAt: new Date().toISOString(), demo: true, session: platform.getSession(), profile: platform.getProfile(), settings: platform.getSettings(), inventory: platform.getInventory(), receipts: platform.getPurchaseHistory() }, null, 2);
        const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' })); link.download = 'backfire-demo-data.json'; link.click(); URL.revokeObjectURL(link.href);
      });
      $('#delete-account')?.addEventListener('click', async () => {
        try { await platform.deleteLocalAccount(($<HTMLInputElement>('[name="delete-confirm"]')?.value ?? '')); navigate('/'); } catch (error) { notice(errorMessage(error), 'error'); }
      });
      $('#cancel-delete')?.addEventListener('click', () => { const input = $<HTMLInputElement>('[name="delete-confirm"]'); if (input) input.value = ''; notice('أُلغي الحذف ولم تتغير البيانات.'); });
    },
  };
}

function historyPage(): ProductPage {
  const session = platform.getSession(); const gate = requireAccount(session); const matches = session ? platform.getMatchHistory() : [];
  const content = gate ?? `${accountTabs('history')}${matches.length ? `<section class="history-list">${matches.map((match) => `<a class="panel" data-link="/account/history/match?id=${encodeURIComponent(match.id)}"><b>${h(match.roomLabel)}</b><span>${new Date(match.playedAt).toLocaleDateString('ar-SA')}</span></a>`).join('')}</section>` : '<section class="empty-state panel"><span class="empty-glyph">↗</span><h2>ما فيه مباريات محفوظة</h2><p>المباريات الحالية لا تُنسب إلى الحساب بعد. لن نعرض سجلًا مختلقًا.</p><a class="btn primary" data-link="/create">ابدأ مباراة</a></section><section class="history-empty-grid"><article class="panel"><h2>اللاعبون السابقون</h2><p>لا توجد بيانات موثوقة للدعوة أو الحظر. ستظهر هنا بعد ربط هوية اللاعب بالمباراة.</p></article><article class="panel"><h2>الغرف السابقة</h2><p>لا نحفظ أكواد الغرف المنتهية في المتصفح، ولا نعيد فتح غرفة مدمرة.</p></article></section>'}`;
  return { active: 'account', title: 'سجل المباريات', description: 'سجل مباريات حساب BACKFIRE.', html: shell('حسابي', 'سجل المباريات', 'نتائجك عندما تتوفر مزامنة الحساب.', content) };
}

function matchDetailPage(params: URLSearchParams): ProductPage {
  const session = platform.getSession(); const gate = requireAccount(session);
  if (gate) return { active: 'account', title: 'تفاصيل المباراة', description: 'تفاصيل مباراة BACKFIRE.', html: shell('حسابي', 'تفاصيل المباراة', 'ملخص آمن بعد نهاية اللعبة.', gate) };
  const id = params.get('id') ?? '';
  const match = platform.getMatchHistory().find((candidate) => candidate.id === id);
  if (!match) return { active: 'account', title: 'المباراة غير موجودة', description: 'لم نجد مباراة محفوظة.', html: shell('سجل المباريات', 'المباراة غير موجودة', 'لم نجد سجلًا موثوقًا بهذا المعرّف.', `<section class="empty-state panel"><span class="empty-glyph">؟</span><h2>لا نعرض تفاصيل مختلقة</h2><p>قد يكون السجل حُذف أو لم يُزامن أصلًا. الأسرار غير المكشوفة لا تُحفظ هنا.</p><a class="btn" data-link="/account/history">العودة للسجل</a></section>`) };
  return { active: 'account', title: match.roomLabel, description: 'ملخص مباراة محفوظة.', html: shell('سجل المباريات', h(match.roomLabel), 'أحداث عامة فقط، من دون أسرار غير مكشوفة.', `<section class="prose-page panel"><p>${new Date(match.playedAt).toLocaleString('ar-SA')}</p><p>اللاعبون: ${match.players} · الجولات: ${match.rounds} · المدة: ${match.durationMinutes} دقيقة</p><p>الفائز: ${h(match.winnerName)}</p></section>`) };
}

function achievementsPage(): ProductPage {
  const session = platform.getSession(); const gate = requireAccount(session);
  const content = gate ?? `${accountTabs('achievements')}<section class="empty-state panel"><span class="empty-glyph">✦</span><h2>الإنجازات تحت التجهيز</h2><p>لن نعرض شارات أو تقدمًا وهميًا. هذه الصفحة جاهزة لربطها بخدمة النتائج الموثوقة.</p><a class="btn" data-link="/how-to-play">راجع طريقة اللعب</a></section>`;
  return { active: 'account', title: 'الإنجازات', description: 'إنجازات BACKFIRE المستقبلية.', html: shell('حسابي', 'الإنجازات', 'إنجازات مرتبطة باللعب الحقيقي فقط.', content) };
}

function billingPage(): ProductPage {
  const session = platform.getSession(); const gate = requireAccount(session); const receipts = session ? platform.getPurchaseHistory() : [];
  const premium = session?.plan !== 'free';
  const content = gate ?? `${accountTabs('billing')}<div id="product-notice" role="status" aria-live="polite" hidden></div><section class="billing-summary panel"><div><span>الباقة الحالية</span><h2>${h(planById(session!.plan)?.name ?? 'مجلس')}</h2><small>${premium ? 'اشتراك عرض محلي · بلا تجديد أو خصم تلقائي' : 'الباقة الأساسية بلا رسوم'}</small></div><div class="billing-actions"><a class="btn" data-link="/pricing">${premium ? 'تغيير الباقة' : 'عرض الباقات'}</a>${premium ? '<button id="cancel-plan" class="btn danger-outline">إلغاء اشتراك العرض</button>' : ''}</div></section><h2 class="section-label">السجل المحلي</h2>${receipts.length ? `<section class="receipt-list">${receipts.map((receipt) => `<article class="panel"><div><b>${h(receipt.label)}</b><span>إيصال عرض · لم تُخصم أموال · ${new Date(receipt.createdAt).toLocaleDateString('ar-SA')}</span></div><strong>${formatPrice({ amountMinor: receipt.totalMinor, currency: 'SAR', interval: 'one-time', taxInclusive: true })}</strong></article>`).join('')}</section>` : '<section class="empty-state panel compact"><h2>لا توجد عمليات</h2><p>أي تجربة شراء ناجحة ستظهر هنا بإشارة واضحة أنها محلية.</p></section>'}`;
  return {
    active: 'account', title: 'الفوترة', description: 'باقة وفواتير حساب BACKFIRE.', html: shell('حسابي', 'الفوترة', 'الباقة وسجل تجارب الدفع المحلية.', content),
    bind(_navigate, refresh) {
      $('#cancel-plan')?.addEventListener('click', async (event) => {
        const button = event.currentTarget as HTMLButtonElement;
        if (button.dataset.confirmed !== 'true') {
          button.dataset.confirmed = 'true'; button.textContent = 'أكد إلغاء اشتراك العرض';
          notice('اضغط مرة ثانية للتأكيد. يمكنك مغادرة الصفحة للإلغاء.'); return;
        }
        try { await platform.cancelSubscription(); notice('أُلغي اشتراك العرض وعاد الحساب إلى الباقة المجانية.'); setTimeout(refresh, 450); } catch (error) { notice(errorMessage(error), 'error'); }
      });
    },
  };
}

function checkoutPage(params: URLSearchParams): ProductPage {
  const kind = params.get('kind') === 'plan' ? 'plan' : 'product';
  const referenceId = params.get('id') ?? '';
  const interval = params.get('interval') === 'year' ? 'year' : 'month';
  const product = kind === 'product' ? productById(referenceId) : undefined;
  const plan = kind === 'plan' ? planById(referenceId) : undefined;
  const item = product ?? plan;
  const price = product?.price ?? (interval === 'year' ? plan?.yearly : plan?.monthly);
  if (!item || !price || product?.comingSoon || plan?.id === 'free') return notFoundPage('الاختيار غير متاح', 'ارجع للمتجر واختر عنصرًا متاحًا.');
  const session = platform.getSession();
  const gate = requireAccount(session, `/checkout?kind=${kind}&id=${encodeURIComponent(referenceId)}&interval=${interval}`);
  const content = gate ?? `<section class="checkout-layout"><div class="checkout-main panel"><div id="product-notice" role="status" aria-live="polite" hidden></div><div class="checkout-demo-seal">تجربة دفع — لا خصم حقيقي</div><h2>راجع طلبك</h2><div class="checkout-item"><div class="checkout-glyph">${h(product?.glyph ?? '◇')}</div><div><b>${h(item.name)}</b><span>${kind === 'plan' ? `اشتراك ${interval === 'year' ? 'سنوي' : 'شهري'}` : categoryLabel(product!.category)}</span></div><strong>${formatPrice(price)}</strong></div><dl class="checkout-total"><div><dt>المجموع الفرعي</dt><dd>${formatPrice(price)}</dd></div><div><dt>الخصم</dt><dd>—</dd></div><div><dt>الضريبة</dt><dd>مشمولة</dd></div><div class="grand"><dt>الإجمالي</dt><dd>${formatPrice(price)}</dd></div></dl><label class="field"><span>رمز خصم — غير موصول</span><input class="input" value="" placeholder="لا توجد رموز نشطة" disabled></label><div class="sandbox-method"><span>◇</span><div><b>محاكي الدفع المحلي</b><small>لا بطاقة · لا تحويل · لا حفظ بيانات مالية</small></div></div><label class="check-row"><input id="checkout-consent" type="checkbox"><span>أفهم أن هذه تجربة محلية ولن يتم خصم أي مبلغ.</span></label><button id="start-checkout" class="btn primary wide">إنشاء جلسة العرض</button><div id="checkout-actions" class="checkout-actions" hidden><button class="btn primary" data-outcome="succeeded">محاكاة نجاح</button><button class="btn" data-outcome="failed">محاكاة فشل</button><button class="btn" data-outcome="timed-out">محاكاة انتهاء المهلة</button><button class="btn ghost" data-outcome="cancelled">إلغاء</button></div></div><aside class="checkout-aside panel"><h2>واضح من البداية</h2><ul><li>لا حقول بطاقة في وضع العرض.</li><li>السعر من كتالوج مركزي، لا من الرابط.</li><li>الفشل والإلغاء لا يمنحان العنصر.</li><li>النجاح ينشئ إيصال عرض محليًا.</li></ul><a data-link="/legal/refunds">سياسة الاسترجاع</a><a data-link="/legal/terms">شروط الشراء</a></aside></section>`;
  let checkoutId = '';
  return {
    active: 'store', title: 'إتمام الطلب', description: 'مراجعة طلب BACKFIRE في وضع العرض.',
    html: shell('الطلب', 'إتمام آمن وواضح', 'لن نطلب بيانات بطاقة ما دام مزود الدفع غير موصول.', content),
    bind(navigate) {
      $('#start-checkout')?.addEventListener('click', async () => {
        if (!$<HTMLInputElement>('#checkout-consent')?.checked) return notice('أكد فهمك أن العملية تجريبية.', 'error');
        try {
          const checkout = await platform.createCheckout(kind, referenceId, interval);
          checkoutId = checkout.id;
          $('#checkout-actions')?.removeAttribute('hidden');
          const button = $<HTMLButtonElement>('#start-checkout'); if (button) { button.disabled = true; button.textContent = 'تم إنشاء الجلسة'; }
          notice('جلسة العرض جاهزة. اختر نتيجة الاختبار.');
        } catch (error) { notice(errorMessage(error), 'error'); }
      });
      document.querySelectorAll<HTMLButtonElement>('[data-outcome]').forEach((button) => button.addEventListener('click', async () => {
        if (!checkoutId) return;
        try {
          const checkout = await platform.completeDemoCheckout(checkoutId, button.dataset.outcome as 'succeeded' | 'failed' | 'cancelled');
          navigate(`/checkout/result?status=${checkout.status}&kind=${kind}`);
        } catch (error) { notice(errorMessage(error), 'error'); }
      }));
    },
  };
}

function checkoutResultPage(params: URLSearchParams): ProductPage {
  const status = params.get('status');
  const success = status === 'succeeded';
  const labels: Record<string, [string, string]> = {
    failed: ['تعذرت تجربة الدفع', 'لم يُمنح عنصر أو اشتراك. يمكنك الرجوع والمحاولة مرة ثانية.'],
    cancelled: ['ألغيت العملية', 'لم يحدث خصم ولم يُمنح أي شيء.'],
    'timed-out': ['انتهت مهلة الجلسة', 'أغلقت جلسة العرض قبل التأكيد. أنشئ جلسة جديدة للمحاولة.'],
  };
  const [title, copy] = success ? ['نجحت تجربة الدفع', 'تم تحديث المقتنيات وإنشاء إيصال عرض محلي. لم يتم خصم أي مبلغ.'] : labels[status ?? ''] ?? ['حالة غير معروفة', 'لا توجد نتيجة دفع صالحة في الرابط.'];
  return {
    active: 'store', title, description: copy,
    html: shell('نتيجة العرض', title, copy, `<section class="empty-state panel checkout-result ${success ? 'success' : 'failure'}"><span class="empty-glyph">${success ? '✓' : '×'}</span><h2>${success ? 'عرض ناجح — بلا شحن مالي' : 'لم تكتمل العملية'}</h2><p>${copy}</p><div class="empty-actions">${success ? '<a class="btn primary" data-link="/account/billing">عرض إيصال العرض</a><a class="btn" data-link="/account/inventory">المقتنيات</a>' : '<a class="btn primary" data-link="/store">العودة للمتجر</a><a class="btn" data-link="/support">المساعدة</a>'}</div></section>`),
  };
}

function supportPage(path = '/support'): ProductPage {
  const email = platform.getSession()?.email ?? '';
  const report = path === '/report-player';
  const heading = report ? 'بلّغ عن لاعب' : path === '/contact' ? 'تواصل معنا' : 'وش نقدر نحل؟';
  return {
    active: 'support', title: 'الدعم', description: 'مركز مساعدة ودعم BACKFIRE.',
    html: shell('الدعم', heading, 'ابدأ بالحلول السريعة، أو احفظ طلبًا محليًا في وضع العرض.', `<section class="support-grid"><aside class="support-links"><a class="panel" data-link="/faq"><b>الأسئلة الشائعة</b><span>الحساب واللعب والدفع التجريبي.</span></a><a class="panel" data-link="/how-to-play"><b>شرح اللعبة</b><span>الجولات والقرارات والكشف.</span></a><article class="panel"><b>مشكلة دخول غرفة؟</b><span>تأكد من الكود، ثم حدّث الصفحة وحاول من نفس الرابط.</span></article><a class="panel" data-link="/status"><b>حالة الخدمة</b><span>ما هو موصول وما يزال تجريبيًا.</span></a></aside><form id="support-form" class="support-form panel"><div id="product-notice" role="status" aria-live="polite" hidden></div><label class="field"><span>نوع الطلب</span><select class="input" name="category"><option value="problem">مشكلة تقنية</option><option value="player-report" ${report ? 'selected' : ''}>بلاغ لاعب</option><option value="suggestion">اقتراح</option><option value="billing">فوترة</option></select></label>${field('subject', 'العنوان', 'text', report ? 'بلاغ عن سلوك لاعب' : '', 'maxlength="100" required')}${field('email', 'البريد للرجوع إليك — اختياري', 'email', email)}${field('roomCode', 'كود الغرفة — اختياري', 'text', '', 'maxlength="12" dir="ltr"')}<label class="field"><span>التفاصيل</span><textarea class="input" name="message" minlength="10" maxlength="2000" required></textarea></label><label class="check-row"><input name="technical" type="checkbox" checked><span>إرفاق إصدار المتصفح والمسار الحالي.</span></label><button class="btn primary" type="submit">حفظ الطلب محليًا</button><small class="muted">لن يصل الطلب إلى فريق دعم حتى يُوصل مزود التذاكر. لا تضف بيانات حساسة.</small></form></section>`),
    bind() {
      $('#support-form')?.addEventListener('submit', async (event) => {
        event.preventDefault(); const form = event.currentTarget as HTMLFormElement; setFormBusy(form, true); const data = new FormData(form);
        try {
          await platform.saveSupportRequest({
            category: data.get('category') as 'problem', subject: String(data.get('subject') ?? ''), message: String(data.get('message') ?? ''),
            email: String(data.get('email') ?? '') || undefined, roomCode: String(data.get('roomCode') ?? '') || undefined,
            technicalDetails: data.get('technical') === 'on' ? `${navigator.userAgent} · ${location.pathname}` : undefined,
          });
          form.reset(); notice('حُفظ الطلب على هذا المتصفح فقط. لم يُرسل إلى خادم.');
        } catch (error) { notice(errorMessage(error), 'error'); } finally { setFormBusy(form, false); }
      });
    },
  };
}

async function copyText(value: string): Promise<void> {
  try { await navigator.clipboard.writeText(value); return; } catch { /* use the DOM fallback */ }
  const area = document.createElement('textarea'); area.value = value; area.style.position = 'fixed'; area.style.opacity = '0';
  document.body.append(area); area.select(); const copied = document.execCommand('copy'); area.remove();
  if (!copied) throw new Error('تعذر النسخ. حدّد الرابط يدويًا.');
}

function invitePage(params: URLSearchParams): ProductPage {
  const initial = h(normalizeRoomCode(params.get('code') ?? ''));
  return {
    active: 'support', title: 'مشاركة دعوة', description: 'مشاركة رابط وكود غرفة BACKFIRE.',
    html: shell('دعوة المجلس', 'أرسل الكود… وخلك جاهز', 'الرابط يُبنى من نفس النطاق المفتوح الآن، بلا نطاق تطوير أو أسرار.', `<section class="invite-layout"><form id="invite-form" class="panel invite-form"><div id="product-notice" role="status" aria-live="polite" hidden></div>${field('code', 'كود الغرفة', 'text', initial, 'maxlength="12" dir="ltr" inputmode="text" autocapitalize="characters" required')}<button class="btn primary" type="submit">جهّز الدعوة</button></form><section id="invite-preview" class="panel invite-preview" hidden><span class="product-type">معاينة الدعوة</span><h2>تعالوا نلعب دسّ</h2><p id="invite-copy"></p><div class="invite-actions"><button id="copy-code" class="btn">نسخ الكود</button><button id="copy-link" class="btn">نسخ الرابط</button><button id="native-share" class="btn primary">مشاركة</button><a id="whatsapp-share" class="btn" target="_blank" rel="noopener noreferrer">واتساب</a></div><small>الرابط لا يحتوي رمز مضيف أو لاعب. الدعوة قد تنتهي إذا أُغلقت الغرفة أو امتلأت.</small></section></section>`),
    bind() {
      let code = ''; let link = ''; let message = '';
      $('#invite-form')?.addEventListener('submit', (event) => {
        event.preventDefault();
        code = normalizeRoomCode(new FormData(event.currentTarget as HTMLFormElement).get('code'));
        if (!isRoomCode(code)) return notice('اكتب كود غرفة صحيحًا من ٨ خانات.', 'error');
        link = new URL(`/join?code=${encodeURIComponent(code)}`, configuredPublicOrigin || location.origin).href;
        message = `تعالوا نلعب BACKFIRE 🎮\nكود الغرفة: ${code}\nادخل من هنا: ${link}`;
        const copy = $('#invite-copy'); if (copy) copy.textContent = message;
        const preview = $('#invite-preview'); if (preview) preview.hidden = false;
        const whatsapp = $<HTMLAnchorElement>('#whatsapp-share'); if (whatsapp) whatsapp.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
        const share = $<HTMLButtonElement>('#native-share'); if (share) share.hidden = !('share' in navigator);
        notice('الدعوة جاهزة. تحقق من الكود قبل الإرسال.');
      });
      $('#copy-code')?.addEventListener('click', async () => { try { await copyText(code); notice('نُسخ كود الغرفة.'); } catch (error) { notice(errorMessage(error), 'error'); } });
      $('#copy-link')?.addEventListener('click', async () => { try { await copyText(link); notice('نُسخ رابط الانضمام.'); } catch (error) { notice(errorMessage(error), 'error'); } });
      $('#native-share')?.addEventListener('click', async () => {
        try { if (navigator.share) await navigator.share({ title: 'دعوة BACKFIRE', text: message, url: link }); } catch (error) { if ((error as DOMException).name !== 'AbortError') notice(errorMessage(error), 'error'); }
      });
      if (initial) $<HTMLFormElement>('#invite-form')?.requestSubmit();
    },
  };
}

function staticPage(path: string): ProductPage {
  if (path === '/faq') return { active: 'support', title: 'الأسئلة الشائعة', description: 'إجابات واضحة عن لعبة وخدمات دسّ.', html: shell('المساعدة', 'الأسئلة الشائعة', 'إجابات هذه المرحلة من المنتج بلا وعود غير موصولة.', `<section class="faq-list wide"><details open><summary>كيف أبدأ لعبة؟</summary><p>افتح «إنشاء غرفة» على الشاشة الكبيرة، ثم يدخل اللاعبون بالكود أو QR من جوالاتهم.</p></details><details><summary>هل أحتاج تحميل تطبيق؟</summary><p>لا. تعمل اللعبة من المتصفح على الشاشة والجوال.</p></details><details><summary>هل الحساب مطلوب للعب؟</summary><p>لا. اللعب الأساسي والغرف لا يعتمدان على طبقة الحساب التجريبية.</p></details><details><summary>هل المشتريات حقيقية؟</summary><p>لا حاليًا. المتجر والدفع يعملان كمحاكاة محلية واضحة ولا يطلبان بطاقة.</p></details><details><summary>هل تتزامن بياناتي بين الأجهزة؟</summary><p>لا. الحساب والمقتنيات والإعدادات التجريبية محفوظة على المتصفح الحالي فقط.</p></details><details><summary>كيف أبلّغ عن لاعب؟</summary><p>استخدم نموذج البلاغ المحلي، مع العلم أنه لا يُرسل إلى فريق حتى توصيل خدمة الدعم.</p><a data-link="/report-player">فتح نموذج البلاغ</a></details><details><summary>وش المتصفحات المناسبة؟</summary><p>إصدار حديث من Chrome أو Safari أو Edge مع JavaScript واتصال ثابت. التلفاز يحتاج متصفحًا حديثًا أو جهاز بث يدعمه.</p></details></section>`) };
  if (path === '/credits') return { title: 'الاعتمادات', description: 'اعتمادات بناء BACKFIRE.', html: shell('BACKFIRE', 'الاعتمادات', 'المنتج مبني بهوية عربية أصلية وتقنيات ويب مفتوحة.', `<section class="prose-page panel"><h2>التصميم والمنتج</h2><p>هوية BACKFIRE ونظامها البصري ومحتواها العربي جزء من المنتج نفسه.</p><h2>التقنيات</h2><p>TypeScript وesbuild وواجهات الويب القياسية، مع توليد QR محليًا. الخط المستخدم هو Tajawal عبر Google Fonts.</p><h2>المحتوى البصري</h2><p>الرسوم الأساسية وواجهات اللعبة مبنية بالكود. صورة المشاركة الاجتماعية مولدة خصيصًا لهذا المشروع ومراجعة للاستخدام الحالي.</p></section>`) };
  if (path === '/about') return { title: 'عن BACKFIRE', description: 'عن لعبة BACKFIRE ورؤيتها.', html: shell('عن BACKFIRE', 'كل حركة لها عواقب', 'نبني لحظة جماعية حقيقية حول شاشة واحدة، مو عزلة داخل كل جوال.', `<section class="prose-page panel"><h2>الفكرة</h2><p>BACKFIRE تجربة سيناريوهات جماعية: التلفاز يعرض المشهد العام، وكل جوال يحمل معلومة أو حركة مختلفة. قرارات اللاعبين تغيّر ما يعود إلى الشاشة عبر الجولات.</p><h2>مبادئنا</h2><p>العربية أصل المنتج، والوضوح أهم من الإلحاح التجاري، واللعبة الأساسية لا تُباع على شكل أفضلية.</p><h2>هذه المرحلة</h2><p>إنشاء الغرف والانضمام وإعادة الاتصال تعمل، بينما نظام السيناريو والعواقب الجديد ما زال قيد التطوير. الحساب والمتجر والدفع معروضة الآن من خلال مزود محلي صريح إلى أن تُوصل خدمات الإنتاج.</p></section>`) };
  if (path === '/status') return { title: 'حالة الخدمة', description: 'حالة أنظمة BACKFIRE.', html: shell('الحالة', 'الأنظمة بوضوح', 'تحديث محلي يصف ما هو عامل وما يحتاج مزود إنتاج.', `<section class="status-list panel"><article><i class="ok"></i><div><b>إنشاء الغرف والانضمام</b><span>مسار الإنتاج الحالي — تتم مراقبته باختبارات المستودع.</span></div><strong>متاح</strong></article><article><i class="ok"></i><div><b>موقع BACKFIRE العام</b><span>الصفحات والملفات الثابتة.</span></div><strong>متاح</strong></article><article><i class="demo"></i><div><b>الحسابات والمقتنيات</b><span>مزود عرض محلي، بلا مزامنة أجهزة.</span></div><strong>عرض</strong></article><article><i class="demo"></i><div><b>الدفع والبريد والدعم</b><span>غير موصولة بمزودي إنتاج.</span></div><strong>غير موصول</strong></article></section>`) };
  if (path === '/changelog') return { title: 'سجل التغييرات', description: 'أحدث تغييرات منتج BACKFIRE.', html: shell('التحديثات', 'وش تغيّر؟', 'سجل مختصر لما وصل فعليًا، من غير وعود منجزة وهمية.', `<section class="timeline"><article class="panel"><time>يوليو ٢٠٢٦</time><h2>هوية BACKFIRE العامة</h2><ul><li>موقع تسويقي جديد مبني حول التلفاز والجوالات والعواقب المتغيرة.</li><li>هوية سينمائية قرمزية مستقلة عن واجهات اللعب الحالية.</li><li>شرح صريح لما يعمل وما يزال قيد التطوير.</li></ul></article><article class="panel"><time>الإصدار الأساسي</time><h2>تثبيت تدفق الغرف</h2><ul><li>إنشاء الغرفة والانضمام اليدوي والـQR.</li><li>استرجاع المضيف ومنع الانضمام المكرر.</li><li>إعادة اتصال اللاعب.</li></ul></article></section>`) };
  if (path === '/legal/privacy') return { title: 'سياسة الخصوصية', description: 'سياسة خصوصية دسّ الحالية.', html: legal('سياسة الخصوصية', `<h2>ملخص هذه النسخة</h2><p>صفحات الحساب والمتجر تستخدم تخزين المتصفح المحلي في وضع العرض. لا ترسل هذه الطبقة بيانات حساب أو دفع أو دعم إلى خادم.</p><h2>بيانات اللعب</h2><p>خدمة الغرف تعالج كود الغرفة واسم اللاعب والرموز اللازمة للاتصال وتشغيل المباراة. لا تعرض رمز المضيف داخل QR.</p><h2>التحكم</h2><p>يمكنك تنزيل نسخة من بيانات العرض أو حذفها من صفحة الإعدادات. مسح بيانات الموقع من المتصفح يزيلها أيضًا.</p><h2>قبل الإطلاق التجاري</h2><p>يلزم تحديد جهة التحكم بالبيانات، مدد الاحتفاظ، مزودي الاستضافة والدفع والبريد، وقناة طلبات الخصوصية قبل تفعيل خدمات الحساب الحقيقية.</p>`) };
  if (path === '/legal/refunds') return { title: 'سياسة الاسترجاع', description: 'حالة سياسة استرجاع دسّ.', html: legal('سياسة الاسترجاع', `<h2>لا توجد مبيعات فعلية الآن</h2><p>مسار الدفع الحالي عرض محلي ولا يخصم أموالًا، لذلك لا توجد عملية قابلة للاسترجاع.</p><h2>قبل تفعيل الدفع</h2><p>يجب نشر مدة طلب الاسترجاع، العناصر غير القابلة للاسترجاع، معالجة الاشتراكات، قناة التواصل، ومدة إعادة المبلغ وفق نظام الدفع والأنظمة المطبقة.</p><h2>إيصالات العرض</h2><p>الإيصال التجريبي يحمل علامة واضحة ولا يمثل مستندًا ضريبيًا أو إثبات دفع.</p>`) };
  if (path === '/legal/cookies') return { title: 'سياسة ملفات الارتباط', description: 'التخزين المحلي في دسّ.', html: legal('ملفات الارتباط والتخزين', `<h2>ما نستخدمه الآن</h2><p>طبقة المنتج التجريبية تستخدم localStorage لحفظ الجلسة المحلية والإعدادات والمقتنيات، وsessionStorage لتذكر زيارة الواجهة في الجلسة الحالية.</p><h2>التحليلات</h2><p>لا توجد خدمة تحليلات خارجية موصولة في هذه الطبقة، والموافقة غير مفعلة افتراضيًا.</p><h2>التحكم</h2><p>يمكنك تغيير تفضيلات التخزين الوظيفي والتحليلات من الإعدادات وحذف بيانات العرض بالكامل.</p>`) };
  return { title: 'الشروط', description: 'شروط استخدام دسّ الحالية.', html: legal('شروط الاستخدام والشراء', `<h2>اللعبة</h2><p>استخدم دسّ باحترام ومن دون إساءة أو تحايل أو محاولة الوصول إلى صلاحيات المضيف.</p><h2>وضع العرض</h2><p>الحسابات والإيصالات والمشتريات الظاهرة في وضع العرض محلية وتجريبية. لا تمثل عقد بيع ولا خصمًا ماليًا ولا اشتراكًا حقيقيًا.</p><h2>الأسعار</h2><p>الأسعار المعروضة بالريال السعودي وتشمل الضريبة على سبيل تصميم الكتالوج. لا تُقبل مدفوعات حتى يوصل مزود دفع إنتاجي وتُنشر سياسة استرداد نهائية.</p><h2>المحتوى والسلوك</h2><p>يمكن تقييد الوصول عند إساءة استخدام الخدمة أو محاولة تعطيلها. البلاغات في وضع العرض لا تُرسل إلى فريق دعم.</p>`) };
}

function legal(title: string, content: string): string {
  return shell('قانوني', title, 'نسخة تشغيلية واضحة لهذه المرحلة، وتحتاج مراجعة قانونية قبل البيع الفعلي.', `<article class="prose-page panel"><div class="legal-meta">آخر تحديث: ١٨ يوليو ٢٠٢٦ · نسخة قبل البيع الحقيقي</div>${content}<p class="legal-note">هذه الصياغة منتجية وليست بديلًا عن مراجعة مستشار قانوني في مناطق التشغيل.</p></article>`);
}

function accountLanding(): ProductPage {
  return profilePage();
}

function notFoundPage(title = 'الصفحة غير موجودة', copy = 'يمكن أن الرابط تغيّر أو أن الصفحة غير متاحة.'): ProductPage {
  return { title: 'غير موجود', description: copy, html: shell('٤٠٤', title, copy, `<section class="empty-state panel"><span class="empty-glyph">؟</span><h2>نرجعك للمجلس</h2><div class="empty-actions"><a class="btn primary" data-link="/">الرئيسية</a><a class="btn" data-link="/support">الدعم</a></div></section>`) };
}

export function renderProductPage(path: string, search = ''): ProductPage {
  if (path === '/store') return storePage();
  if (path === '/store/product') return productDetailPage(new URLSearchParams(search));
  if (path === '/pricing') return pricingPage();
  if (path === '/login') return loginPage();
  if (path === '/signup') return signupPage();
  if (path === '/forgot-password') return forgotPage();
  if (['/reset-password', '/verify-email', '/session-ended'].includes(path)) return authStatePage(path);
  if (path === '/account') return accountLanding();
  if (path === '/account/profile') return profilePage();
  if (path === '/account/settings') return settingsPage();
  if (path === '/account/inventory') return inventoryPage();
  if (path === '/account/history') return historyPage();
  if (path === '/account/history/match') return matchDetailPage(new URLSearchParams(search));
  if (path === '/account/achievements') return achievementsPage();
  if (path === '/account/billing') return billingPage();
  if (path === '/checkout') return checkoutPage(new URLSearchParams(search));
  if (path === '/checkout/result') return checkoutResultPage(new URLSearchParams(search));
  if (['/support', '/contact', '/report-player'].includes(path)) return supportPage(path);
  if (path === '/invite') return invitePage(new URLSearchParams(search));
  if (['/faq', '/about', '/credits', '/status', '/changelog', '/legal/privacy', '/legal/terms', '/legal/refunds', '/legal/cookies'].includes(path)) return staticPage(path);
  return notFoundPage();
}
