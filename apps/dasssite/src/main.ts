import {
  COPY,
  actionIcon,
  addStyle,
  dassIn,
  escapeHtml,
  injectBase,
  mark,
  mountBackground,
  observeReveal,
  pointerParallax,
  press,
  progressOf,
  qs,
  qsa,
  qrSvg,
  rafScroll,
  reduced,
  sfx,
  uiIcon,
  type Mood,
} from '@dass/ui';
import { platform } from './product/platform.js';
import { configuredPublicOrigin } from './product/config.js';
import { PRODUCT_PATHS, renderProductPage } from './product/pages.js';
import { productCss } from './product/product-css.js';
import { formatPrice, PLANS, PRODUCTS } from './product/catalog.js';

injectBase();
addStyle(siteCss());
addStyle(productCss());
const bg = mountBackground();
const app = document.getElementById('app')!;
let cleanups: Array<() => void> = [];
let unlocked = false;

addEventListener('pointerdown', () => {
  if (unlocked) return;
  unlocked = true;
  sfx.unlock();
  sfx.open();
}, { once: true });

// ---------------- router ----------------
const SPA = new Set(['/', '/create', '/join', '/how-to-play', ...PRODUCT_PATHS]);
function go(path: string): void {
  const clean = path.split('?')[0] ?? '/';
  if (SPA.has(clean)) {
    history.pushState({}, '', path);
    render();
    qs<HTMLElement>('#main-content')?.focus({ preventScroll: true });
    scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
  } else {
    location.href = path;
  }
}
addEventListener('popstate', render);
addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLElement>('[data-link]');
  if (!a) return;
  e.preventDefault();
  sfx.press();
  go(a.dataset.link!);
});

function teardown(): void {
  for (const c of cleanups) c();
  cleanups = [];
}

function render(): void {
  teardown();
  applyProductPreferences();
  const path = location.pathname;
  try {
    if (path === '/create') { updateMeta('إنشاء غرفة', 'افتح غرفة دسّ جديدة على الشاشة الكبيرة.'); create(); }
    else if (path === '/join') { updateMeta('الانضمام', 'انضم إلى غرفة دسّ بالكود.'); join(); }
    else if (path === '/how-to-play') { updateMeta('كيف تلعب', 'تعرف على جولات وقرارات لعبة دسّ.'); howto(); }
    else if (path === '/') { updateMeta('لعبة القرارات السرية والخيانات', 'دسّ لعبة مجالس عربية من ٤ إلى ٨ لاعبين.'); home(); }
    else productRoute(path);
  } catch {
    updateMeta('تعذر فتح الصفحة', 'حدث خطأ آمن أثناء عرض الصفحة.');
    app.innerHTML = `${nav()}<main id="main-content" class="page center-page"><section class="page-card panel"><span class="eyebrow">خطأ آمن</span><h1 class="page-title">ما قدرنا نفتح الصفحة</h1><p class="muted page-sub">بياناتك لم تُرسل. حدّث الصفحة أو ارجع للرئيسية.</p><button id="retry-render" class="btn primary wide">إعادة المحاولة</button><a data-link="/support" class="back-link">الدعم</a></section></main>`;
    qs('#retry-render')?.addEventListener('click', render);
  }
  bindMute();
  bindChrome();
  bindNetworkNotice();
}
function applyProductPreferences(): void {
  try {
    const settings = platform.getSettings();
    document.documentElement.classList.toggle('dass-high-contrast', settings.highContrast);
    document.documentElement.classList.toggle('dass-large-text', settings.textScale === 'large');
    document.documentElement.classList.toggle('dass-reduced-motion', settings.reducedMotion || !settings.animations);
  } catch {
    document.documentElement.classList.remove('dass-high-contrast', 'dass-large-text', 'dass-reduced-motion');
  }
}
// Defer the first route render until module-level scene data is initialized.
queueMicrotask(render);

// ---------------- shared chrome ----------------
function nav(active = ''): string {
  const session = platform.getSession();
  const accountLabel = session ? escapeHtml(session.displayName) : 'الحساب';
  const initial = session ? escapeHtml(session.displayName.slice(0, 1)) : uiIcon('users', 17);
  return `<a class="skip-link" href="#main-content">تخطَّ إلى المحتوى</a><nav class="nav">
    <a class="nav-logo" data-link="/">${mark(30)}<span class="wordmark g">${COPY.brand}</span></a>
    <div class="nav-primary">
      <a data-link="/how-to-play" class="nav-a ${active === 'how' ? 'on' : ''}">كيف تلعب</a>
      <a data-link="/store" class="nav-a ${active === 'store' ? 'on' : ''}">المتجر</a>
      <a data-link="/pricing" class="nav-a ${active === 'pricing' ? 'on' : ''}">الأسعار</a>
      <a data-link="/support" class="nav-a ${active === 'support' ? 'on' : ''}">الدعم</a>
    </div>
    <div class="nav-links">
      <button id="mute" class="icon-btn sm" aria-label="صوت">${uiIcon(sfx.isMuted() ? 'soundOff' : 'soundOn', 18)}</button>
      <div class="account-menu">
        <button id="account-toggle" class="account-toggle ${active === 'account' ? 'on' : ''}" aria-expanded="false" aria-controls="account-panel"><span class="account-initial">${initial}</span><span>${accountLabel}</span></button>
        <div id="account-panel" class="account-panel" hidden>
          ${session ? `<a data-link="/account/profile">الملف الشخصي</a><a data-link="/account/history">سجل المباريات</a><a data-link="/account/achievements">الإنجازات</a><a data-link="/account/inventory">المقتنيات</a><a data-link="/account/billing">الاشتراك والفوترة</a><a data-link="/account/settings">الإعدادات</a><button id="nav-logout">تسجيل الخروج</button>` : `<a data-link="/login">تسجيل الدخول</a><a data-link="/signup">إنشاء حساب</a><button id="nav-guest">الاستمرار كضيف</button>`}
        </div>
      </div>
      <a data-link="/create" class="btn primary nav-cta">ابدأ لعبة</a>
      <button id="mobile-toggle" class="icon-btn sm mobile-toggle" aria-label="فتح القائمة" aria-expanded="false"><span aria-hidden="true">☰</span></button>
    </div>
    <div id="mobile-panel" class="mobile-panel" hidden>
      <a data-link="/how-to-play">كيف تلعب</a><a data-link="/join">انضم بكود</a><a data-link="/store">المتجر</a><a data-link="/pricing">الأسعار</a><a data-link="/support">الدعم</a><a data-link="${session ? '/account/profile' : '/login'}">${accountLabel}</a>
    </div>
  </nav>`;
}
function footer(): string {
  return `<footer class="foot" data-reveal>
    <div class="foot-brand">${mark(26)}<span class="wordmark g">${COPY.brand}</span></div>
    <div class="foot-map">
      <div><b>العب</b><a data-link="/create">سوّي غرفة</a><a data-link="/join">انضم بكود</a><a data-link="/invite">شارك دعوة</a><a data-link="/how-to-play">كيف تلعب</a></div>
      <div><b>المنتج</b><a data-link="/store">المتجر</a><a data-link="/pricing">الأسعار</a><a data-link="/changelog">التحديثات</a></div>
      <div><b>دسّ</b><a data-link="/about">عنّا</a><a data-link="/faq">الأسئلة الشائعة</a><a data-link="/support">الدعم</a><a data-link="/status">حالة الخدمة</a><a data-link="/credits">الاعتمادات</a></div>
      <div><b>قانوني</b><a data-link="/legal/privacy">الخصوصية</a><a data-link="/legal/terms">الشروط</a><a data-link="/legal/refunds">الاسترجاع</a><a data-link="/legal/cookies">ملفات الارتباط</a></div>
    </div>
    <div class="foot-cap muted">دسّ · لعبة مجالس سعودية · ٢٠٢٦</div>
  </footer>`;
}
function productRoute(path: string): void {
  bg.setMood('secret');
  const page = renderProductPage(path, location.search);
  updateMeta(page.title, page.description);
  app.innerHTML = `${nav(page.active)}${page.html}${footer()}`;
  page.bind?.(go, render);
}
function updateMeta(title: string, description: string): void {
  document.title = `دسّ — ${title}`;
  const descriptionEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (descriptionEl) descriptionEl.content = description;
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'canonical' }));
  canonical.href = new URL(location.pathname, configuredPublicOrigin || location.origin).href;
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', canonical.href);
  const preview = new URL('/og-preview.png', configuredPublicOrigin || location.origin).href;
  document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.setAttribute('content', preview);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.setAttribute('content', preview);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
}
function bindMute(): void {
  qs('#mute')?.addEventListener('click', () => {
    sfx.toggle();
    if (!sfx.isMuted()) sfx.press();
    qs('#mute')!.innerHTML = uiIcon(sfx.isMuted() ? 'soundOff' : 'soundOn', 18);
  });
}
function bindChrome(): void {
  const accountToggle = qs<HTMLButtonElement>('#account-toggle');
  const accountPanel = qs<HTMLElement>('#account-panel');
  const mobileToggle = qs<HTMLButtonElement>('#mobile-toggle');
  const mobilePanel = qs<HTMLElement>('#mobile-panel');
  const closeMenus = (): void => {
    if (accountPanel) accountPanel.hidden = true;
    if (accountToggle) accountToggle.setAttribute('aria-expanded', 'false');
    if (mobilePanel) mobilePanel.hidden = true;
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };
  accountToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!accountPanel) return;
    accountPanel.hidden = !accountPanel.hidden;
    accountToggle.setAttribute('aria-expanded', String(!accountPanel.hidden));
    if (!accountPanel.hidden) requestAnimationFrame(() => accountPanel.querySelector<HTMLElement>('a,button')?.focus());
  });
  mobileToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!mobilePanel) return;
    mobilePanel.hidden = !mobilePanel.hidden;
    mobileToggle.setAttribute('aria-expanded', String(!mobilePanel.hidden));
    document.body.classList.toggle('menu-open', !mobilePanel.hidden);
    if (!mobilePanel.hidden) requestAnimationFrame(() => mobilePanel.querySelector<HTMLElement>('a')?.focus());
  });
  const onClick = (event: Event): void => {
    const target = event.target as Node;
    if (!accountPanel?.contains(target) && !accountToggle?.contains(target) && !mobilePanel?.contains(target) && !mobileToggle?.contains(target)) closeMenus();
  };
  const onKey = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;
    const returnTo = !mobilePanel?.hidden ? mobileToggle : !accountPanel?.hidden ? accountToggle : null;
    closeMenus(); returnTo?.focus();
  };
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);
  cleanups.push(() => document.removeEventListener('click', onClick), () => document.removeEventListener('keydown', onKey), () => document.body.classList.remove('menu-open'));
  qs('#nav-logout')?.addEventListener('click', async () => { await platform.signOut(); go('/'); });
  qs('#nav-guest')?.addEventListener('click', async () => { await platform.continueAsGuest(); go('/account/profile'); });
}
function bindNetworkNotice(): void {
  const paint = (): void => {
    qs('#network-notice')?.remove();
    if (navigator.onLine) return;
    const banner = document.createElement('div');
    banner.id = 'network-notice'; banner.className = 'network-notice'; banner.setAttribute('role', 'status');
    banner.textContent = 'أنت غير متصل — صفحات الموقع قد تفتح، لكن إنشاء الغرف والانضمام يحتاجان إنترنت.';
    document.body.append(banner);
  };
  addEventListener('online', paint); addEventListener('offline', paint); paint();
  cleanups.push(() => { removeEventListener('online', paint); removeEventListener('offline', paint); qs('#network-notice')?.remove(); });
}
function moodObserver(): void {
  const io = new IntersectionObserver(
    (es) => {
      for (const e of es) if (e.isIntersecting) bg.setMood((e.target as HTMLElement).dataset.mood as Mood);
    },
    { threshold: 0.5 },
  );
  for (const s of qsa('[data-mood]')) io.observe(s);
  cleanups.push(() => io.disconnect());
}

// ---------------- HOME ----------------
function home(): void {
  const firstVisit = !sessionStorage.getItem('dass_seen');
  sessionStorage.setItem('dass_seen', '1');
  app.innerHTML = `${nav()}
  <main id="main-content" class="site" tabindex="-1">
    <section class="hero" data-mood="calm">
      <div class="hero-bgart" id="heroart">${heroArt()}</div>
      <div class="hero-copy ${firstVisit ? 'intro' : ''}">
        <div class="hero-kicker" data-rc>لعبة مجالس · من ٤ إلى ٨ لاعبين</div>
        <h1 class="hero-title wordmark">${COPY.brand}</h1>
        <p class="hero-tag" data-rc>اختياراتكم سرية… لكن كل الدسّات تنفضح.</p>
        <p class="hero-sub" data-rc>أعلن نيّتك بصوت عالي، وسوّي عكسها بالسر. الشاشة الكبيرة مسرحكم، وجوالك أداة القرار — وبالنهاية ينكشف مين دعم، مين ضرب، ومين دسّها على الكل.</p>
        <div class="hero-cta" data-rc>
          <a data-link="/create" class="btn primary lg">ابدأ لعبة</a>
          <a data-link="/join" class="btn lg">انضم بكود</a>
        </div>
      </div>
      <div class="scroll-hint" aria-hidden="true"><span>مرّر</span><i></i></div>
    </section>

    <section class="scene concept" data-mood="secret" data-reveal>
      <div class="scene-head"><span class="eyebrow" data-rc>الفكرة</span><h2 class="scene-title" data-rc>مجلس واحد… ونوايا مخفية</h2></div>
      <div class="concept-grid">
        <div class="concept-art" data-rc>${conceptArt()}</div>
        <ul class="concept-list">
          <li data-rc><b>الشاشة الكبيرة</b> هي المسرح — الكل يشوفها.</li>
          <li data-rc><b>جوالك</b> أداة قرارك السري، ما أحد يشوف وش اخترت.</li>
          <li data-rc><b>ادعم</b> صاحبك، <b>اضرب</b> خصمك، أو <b>بيع</b> وثبّت مكسبك.</li>
          <li data-rc>تحالفات، شك، وخيانات… <b>والنهاية تكشف كل شي.</b></li>
        </ul>
      </div>
    </section>

    <section class="scene steps" data-mood="calm" data-reveal>
      <div class="scene-head"><span class="eyebrow" data-rc>ثلاث خطوات</span><h2 class="scene-title" data-rc>تبدأون خلال ثوانٍ</h2></div>
      <div class="steps-grid">
        <div class="step" data-rc><span class="step-n">١</span><div class="step-mock">${mockTv()}</div><h3>افتح الغرفة على الشاشة</h3><p class="muted">تطلع لك غرفة وكود وQR.</p></div>
        <div class="step" data-rc><span class="step-n">٢</span><div class="step-mock">${mockPhones()}</div><h3>يدخل الكل من جوالاتهم</h3><p class="muted">يصوّرون الـQR أو يكتبون الكود.</p></div>
        <div class="step" data-rc><span class="step-n">٣</span><div class="step-mock">${mockReveal()}</div><h3>قرّروا… وانتظروا الكشف</h3><p class="muted">كل جولة قرار سري، وبالنهاية الفضيحة.</p></div>
      </div>
      <div class="steps-cta" data-rc><a data-link="/how-to-play" class="btn">اشرحها لي بالتفصيل</a></div>
    </section>

    <section class="scene features" data-mood="secret" data-reveal>
      <div class="scene-head center"><span class="eyebrow" data-rc>ليش دسّ؟</span><h2 class="scene-title" data-rc>مصمّمة للمجلس</h2></div>
      <div class="feat-grid">
        <div class="feat" data-rc><span class="feat-ic">${uiIcon('users', 24)}</span><h3>شاشة وحدة، والكل يلعب</h3><p class="muted">التلفاز هو المسرح، وكل واحد يتحكم من جواله.</p></div>
        <div class="feat" data-rc><span class="feat-ic gold">${uiIcon('lock', 24)}</span><h3>قراراتك تبقى بجوالك</h3><p class="muted">نيّتك وفعلك السري ما يوصلون لأحد قبل الكشف.</p></div>
        <div class="feat" data-rc><span class="feat-ic">${uiIcon('bolt', 24)}</span><h3>بدون تحميل تطبيق</h3><p class="muted">رابط + اسم، وخلاص — تدخلون بثوانٍ.</p></div>
        <div class="feat" data-rc><span class="feat-ic">${mark(26)}</span><h3>عربي من جد</h3><p class="muted">واجهة ونصوص بعامية طبيعية، مو ترجمة.</p></div>
        <div class="feat" data-rc><span class="feat-ic">${uiIcon('refresh', 24)}</span><h3>جولة ورا جولة</h3><p class="muted">تعيدونها بنفس الشلة أو شلة جديدة بضغطة.</p></div>
        <div class="feat" data-rc><span class="feat-ic">${uiIcon('users', 24)}</span><h3>من ٤ إلى ٨ لاعبين</h3><p class="muted">تكفي لسهرة صغيرة أو مجلس كامل.</p></div>
      </div>
    </section>

    <section class="cycle" data-mood="tension" id="cycle">
      <div class="cycle-pin">
        <span class="eyebrow">دورة المباراة</span>
        <div class="cycle-stage" id="cyclestage"></div>
        <div class="cycle-rail" id="cyclerail"></div>
      </div>
    </section>

    <section class="scene betray" data-mood="attack" data-reveal id="betray">
      <div class="betray-art">${betrayArt()}</div>
      <div class="betray-copy">
        <span class="eyebrow" data-rc>اللحظة</span>
        <h2 class="scene-title" data-rc>وعد… ثم دسّة</h2>
        <p class="betray-line" data-rc>مسار الدعم يبان ثابت… لين تنكسر الثقة أمام الجميع. هنا تعرف مين كان معك فعلاً، ومين كان يلعبها من تحت لتحت.</p>
      </div>
    </section>

    <section class="scene atmos" data-mood="attack" data-reveal>
      <div class="atmos-inner">
        <span class="eyebrow" data-rc>الجو</span>
        <blockquote class="atmos-q" data-rc>«لا واللهِ… أنا كنت أدعمك!»</blockquote>
        <p class="atmos-p" data-rc>ضحك، اتهامات، وتحالفات تنهار بثانية. دسّ مو بس لعبة — هي قصص تتناقلونها بعد المجلس. مين خان مين؟ ومين صدّق الغلط؟ كل جولة تطلّع بطل… وضحيّة.</p>
      </div>
    </section>

    <section class="scene home-commerce" data-mood="secret" data-reveal>
      <div class="scene-head"><span class="eyebrow" data-rc>خلّها مجلسكم</span><h2 class="scene-title" data-rc>اللعبة كاملة… والمظهر على ذوقكم</h2><p class="muted commerce-intro" data-rc>الثيمات والمؤثرات تجميلية فقط. لا نقاط مدفوعة، ولا أفضلية لعب، ولا شراء عشوائي.</p></div>
      <div class="home-store-grid">${PRODUCTS.slice(1, 4).map((product) => `<a data-link="/store/product?id=${product.id}" class="home-store-item" style="--accent:${product.accent}"><span>${escapeHtml(product.glyph)}</span><div><b>${escapeHtml(product.name)}</b><small>${formatPrice(product.price)}</small></div></a>`).join('')}</div>
      <div class="home-plan-strip"><div><span class="eyebrow">الباقات</span><h3>ابدأ مجانًا، وطوّر التخصيص إذا احتجت</h3></div><div class="home-plan-names">${PLANS.map((plan) => `<span>${escapeHtml(plan.name)}</span>`).join('')}</div><a class="btn" data-link="/pricing">قارن الباقات</a></div>
      <div class="home-device-row"><p><b>بدون تحميل</b><span>متصفح حديث على التلفاز والجوال.</span></p><p><b>من ٤ إلى ٨</b><span>شاشة واحدة، وقرار سري لكل لاعب.</span></p><p><b>وضع عرض صريح</b><span>الحساب والدفع محليان حتى توصيل المزود.</span></p></div>
    </section>

    <section class="scene final" data-mood="win" data-reveal>
      <h2 class="final-title" data-rc>مجلسكم… ناقص دسّة</h2>
      <p class="final-sub" data-rc>اجمعوا الشلة، افتحوا الشاشة، وشوفوا مين يطلع أذكى واحد.</p>
      <div class="final-cta" data-rc>
        <a data-link="/create" class="btn primary lg">ابدأ لعبة</a>
        <a data-link="/join" class="btn lg">انضم بكود</a>
      </div>
    </section>
    ${footer()}
  </main>`;

  const heroart = qs<HTMLElement>('#heroart');
  if (heroart) cleanups.push(pointerParallax(heroart, 16));
  const io = observeReveal();
  cleanups.push(() => io.disconnect());
  moodObserver();
  initCycle();
  if (firstVisit && !reduced()) {
    const t = qs('.hero-title');
    if (t) t.animate({ opacity: [0, 1], filter: ['blur(16px)', 'blur(0)'], transform: ['scale(.92)', 'scale(1)'] }, { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
  }
}

const CYCLE = [
  { t: 'اللوبي', d: 'الكل يدخل ويستعد', c: 'var(--violet)' },
  { t: 'العد التنازلي', d: 'يبدأ الضغط', c: 'var(--gold)' },
  { t: 'القرار السري', d: 'تختار… بلا ما أحد يدري', c: 'var(--text)' },
  { t: 'التوتر', d: 'قبل ما ينكشف شي', c: 'var(--violet)' },
  { t: 'نتيجة الجولة', d: 'الأسهم تتحرك', c: 'var(--green)' },
  { t: 'الكشف', d: 'كل دسّة تنفضح', c: 'var(--red)' },
  { t: 'الفائز', d: 'أكبر خزنة تكسب', c: 'var(--gold)' },
];
function initCycle(): void {
  const stage = qs<HTMLElement>('#cyclestage');
  const rail = qs<HTMLElement>('#cyclerail');
  const section = qs<HTMLElement>('#cycle');
  if (!stage || !rail || !section) return;
  rail.innerHTML = CYCLE.map((s, i) => `<span class="rail-dot" data-i="${i}"><i></i><b>${s.t}</b></span>`).join('');
  let active = -1;
  const paint = (i: number): void => {
    if (i === active) return;
    active = i;
    const s = CYCLE[i]!;
    stage.style.setProperty('--c', s.c);
    stage.innerHTML = `<div class="cy-num">${i + 1}<span>/ ${CYCLE.length}</span></div><div class="cy-t">${s.t}</div><div class="cy-d muted">${s.d}</div><div class="cy-bars">${CYCLE.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>`;
    dassIn(qs('.cy-t', stage)!);
    for (const d of qsa('.rail-dot', rail)) d.classList.toggle('on', Number(d.dataset.i) <= i);
    if (unlocked) sfx.revealEvent();
  };
  paint(0);
  const off = rafScroll(() => {
    const p = progressOf(section);
    const idx = Math.min(CYCLE.length - 1, Math.max(0, Math.floor(p * CYCLE.length)));
    paint(idx);
  });
  cleanups.push(off);
}

// ---------------- CREATE ----------------
function create(): void {
  bg.setMood('secret');
  app.innerHTML = `${nav()}
  <main id="main-content" class="page center-page" tabindex="-1">
    <div class="page-card panel" data-reveal>
      <span class="eyebrow" data-rc>غرفة جديدة</span>
      <h1 class="page-title" data-rc>افتح المسرح</h1>
      <p class="muted page-sub" data-rc>بننقلك لشاشة التلفاز، بتطلع غرفة بكود وQR — حطّها على شاشة كبيرة، وخلّ الشلة يدخلون من جوالاتهم.</p>
      <div class="create-tips" data-rc>
        <div class="tip">${uiIcon('users', 20)} ٤ إلى ٨ لاعبين</div>
        <div class="tip">${uiIcon('link', 20)} انضمام بالـQR أو الكود</div>
      </div>
      <button id="startbtn" class="btn primary lg wide" data-rc>افتح الغرفة على الشاشة</button>
      <a data-link="/" class="back-link" data-rc>رجوع للرئيسية</a>
    </div>
  </main>`;
  const io = observeReveal();
  cleanups.push(() => io.disconnect());
  qs('#startbtn')?.addEventListener('click', (e) => {
    const b = e.currentTarget as HTMLElement;
    press(b);
    sfx.roundStart();
    b.innerHTML = '<span class="spinner"></span>';
    setTimeout(() => (location.href = '/tv'), 260);
  });
}

// ---------------- JOIN ----------------
function join(): void {
  bg.setMood('calm');
  const code = new URLSearchParams(location.search).get('code') ?? '';
  app.innerHTML = `${nav('join')}
  <main id="main-content" class="page center-page" tabindex="-1">
    <div class="page-card panel" data-reveal>
      <span class="eyebrow" data-rc>انضمام</span>
      <h1 class="page-title" data-rc>خشّ المجلس</h1>
      <div class="join-form" data-rc>
        <input id="code" class="input mono" placeholder="${COPY.codePlaceholder}" value="${escapeHtml(code)}" maxlength="12" autocapitalize="characters" autocorrect="off" autocomplete="off" inputmode="text" />
        <input id="name" class="input" placeholder="${COPY.namePlaceholder}" maxlength="20" autocomplete="off" />
        <button id="joinbtn" class="btn primary lg wide">${COPY.join}</button>
        <div id="jerr" class="j-err"></div>
      </div>
      <a data-link="/" class="back-link" data-rc>رجوع للرئيسية</a>
    </div>
  </main>`;
  const io = observeReveal();
  cleanups.push(() => io.disconnect());
  const codeEl = qs<HTMLInputElement>('#code')!;
  const nameEl = qs<HTMLInputElement>('#name')!;
  (code ? nameEl : codeEl).focus();
  const submit = (): void => {
    const c = codeEl.value.trim();
    const n = nameEl.value.trim();
    if (!c) return fieldErr(codeEl, 'اكتب كود الغرفة');
    if (!n) return fieldErr(nameEl, 'اكتب اسمك');
    sfx.submit();
    location.href = `/play?code=${encodeURIComponent(c)}&name=${encodeURIComponent(n)}`;
  };
  qs('#joinbtn')?.addEventListener('click', submit);
  nameEl.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') submit();
  });
}
function fieldErr(el: HTMLElement, msg: string): void {
  el.classList.add('err');
  const box = qs('#jerr');
  if (box) box.textContent = msg;
  sfx.inputErr();
  el.animate({ transform: ['translateX(-6px)', 'translateX(5px)', 'translateX(0)'] }, { duration: 180 });
  setTimeout(() => el.classList.remove('err'), 700);
}

// ---------------- HOW TO PLAY ----------------
function howto(): void {
  bg.setMood('calm');
  const ar = (n: number): string => n.toLocaleString('ar-EG');
  const setup: [string, string][] = [
    ['افتح دسّ على الشاشة', 'شغّل الموقع على تلفاز أو شاشة كبيرة يشوفها الكل.'],
    ['سوّي غرفة', 'اضغط «ابدأ لعبة» — يطلع كود وQR على الشاشة.'],
    ['ادخلوا من الجوال', 'كل لاعب يصوّر الـQR، أو يكتب الكود بصفحة الانضمام.'],
    ['حطّوا الأسماء', 'كل واحد يكتب اسمه ويضغط «جاهز».'],
    ['ابدأوا', 'لما الكل يجهز (٤ لاعبين على الأقل) الهوست يبدأ المباراة.'],
  ];
  const phases: [string, string, string][] = [
    ['var(--green)', 'الإعلان', 'كل جولة تعلن للكل: تدعم لاعب، تضربه، أو تبيع نفسك.'],
    ['var(--violet)', 'نافذة التفاعل', 'تشوفون إعلانات بعض… وتقدر تغيّر إعلانك مرة وحدة.'],
    ['var(--violet)', 'القفل السري', 'على جوالك بس، تختار فعلك الحقيقي — تلتزم بوعدك، أو تدسّها وتسوّي العكس. محد يشوف.'],
    ['var(--red)', 'التحريك', 'الأسهم تتحرك على الشاشة… بس بدون ما ينكشف مين سوّى وش.'],
    ['var(--gold)', 'الخزنة', 'لما سهمك يطلع فوق، بيع وثبّته بالخزنة — رقم مقفول ما ينزل.'],
  ];
  app.innerHTML = `${nav('how')}
  <main id="main-content" class="page howto" tabindex="-1">
    <section class="howto-hero" data-reveal>
      <span class="eyebrow" data-rc>كيف تلعب</span>
      <h1 class="page-title big" data-rc>دسّ… من الصفر</h1>
      <p class="muted page-sub" data-rc>لعبة سرّية بسيطة: تعلن نيّتك قدّام الكل، وبعدين تقرّر بالسر — إما تلتزم بوعدك، أو <b class="gold">تدسّها</b> وتسوّي العكس. وبالنهاية كل الدسّات تنفضح.</p>
    </section>

    <section class="ht-block" data-reveal>
      <div class="ht-head"><span class="eyebrow" data-rc>أولاً · التجهيز</span><h2 class="scene-title" data-rc>من الرابط للّعب بأقل من دقيقة</h2></div>
      <div class="howto-steps">
        ${setup.map((s, i) => `<div class="hstep" data-rc><span class="hstep-n">${ar(i + 1)}</span><div><h3>${s[0]}</h3><p class="muted">${s[1]}</p></div></div>`).join('')}
      </div>
    </section>

    <section class="ht-block" data-reveal>
      <div class="ht-head"><span class="eyebrow" data-rc>ثانياً · الجولة</span><h2 class="scene-title" data-rc>دورة كل جولة</h2></div>
      <div class="hphases">
        ${phases.map((p, i) => `<div class="hphase" data-rc style="--c:${p[0]}"><span class="hp-n">${ar(i + 1)}</span><div><h3>${p[1]}</h3><p class="muted">${p[2]}</p></div></div>`).join('')}
      </div>
    </section>

    <section class="ht-block" data-reveal>
      <div class="ht-head"><span class="eyebrow" data-rc>السر مقابل العلن</span><h2 class="scene-title" data-rc>جوالك يخفي… الشاشة تكشف</h2></div>
      <div class="ht-split">
        <div class="ht-side secret" data-rc><div class="hs-badge">جوالك · سري 🔒</div><ul><li>قرارك ونيّتك.</li><li>فعلك الحقيقي (الدسّة).</li><li>محد من اللاعبين يشوفه.</li></ul></div>
        <div class="ht-side public" data-rc><div class="hs-badge gold">الشاشة · علني</div><ul><li>الإعلانات وحركة الأسهم.</li><li>الخزنات والترتيب.</li><li>الكشف النهائي للجميع.</li></ul></div>
      </div>
    </section>

    <section class="ht-block" data-reveal>
      <div class="ht-head"><span class="eyebrow" data-rc>النهاية</span><h2 class="scene-title" data-rc>الكشف… ثم مين يكسب</h2></div>
      <p class="ht-p" data-rc>بعد آخر جولة، الشاشة تكشف كل إعلان مقابل الفعل الحقيقي — كل دسّة تطلع للنور، وتشوفون مين خان مين. <b class="gold">صاحب أكبر خزنة يفوز.</b> وبعدها تعيدونها بنفس الشلة، أو تبدأون شلة جديدة.</p>
    </section>

    <section class="ht-block" data-reveal>
      <div class="ht-head"><span class="eyebrow" data-rc>الأفعال الثلاثة</span></div>
      <div class="actcards">
        <div class="actcard" data-rc style="--c:var(--green)"><span class="ac-ic">${actionIcon('back', 34)}</span><b>دعم</b><span class="muted">ترفع سهم لاعب ثاني.</span></div>
        <div class="actcard" data-rc style="--c:var(--red)"><span class="ac-ic">${actionIcon('dump', 34)}</span><b>ضرب</b><span class="muted">توطّي سهم لاعب ثاني.</span></div>
        <div class="actcard" data-rc style="--c:var(--gold)"><span class="ac-ic">${actionIcon('sell', 34)}</span><b>بيع</b><span class="muted">تثبّت سهمك بالخزنة.</span></div>
      </div>
    </section>

    <section class="ht-cta-final" data-reveal>
      <h2 class="scene-title" data-rc>جاهزين؟</h2>
      <div class="howto-cta" data-rc><a data-link="/create" class="btn primary lg">ابدأ لعبة</a><a data-link="/join" class="btn lg">انضم بكود</a></div>
    </section>
    ${footer()}
  </main>`;
  const io = observeReveal();
  cleanups.push(() => io.disconnect());
}

// ---------------- SVG art ----------------
function heroArt(): string {
  return `<svg viewBox="0 0 680 520" class="art hero-network" aria-hidden="true">
    <defs>
      <linearGradient id="table-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--gold-2)"/><stop offset="1" stop-color="var(--gold-deep)"/></linearGradient>
      <linearGradient id="table-dark" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--surface-3)"/><stop offset="1" stop-color="var(--surface)"/></linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>
    <ellipse cx="340" cy="276" rx="238" ry="166" fill="rgba(139,121,242,.08)" filter="url(#soft)" data-px=".2"/>
    <g class="whispers" fill="none" stroke="var(--line-2)" stroke-width="1.5" stroke-dasharray="4 10" data-px=".25">
      <path d="M104 176 Q340 18 576 176"/><path d="M88 340 Q340 510 592 340"/>
    </g>
    <g class="alliances" fill="none" stroke-linecap="round" stroke-width="4" data-px=".65">
      <path class="route support" d="M132 182 C210 126 255 136 302 218"/>
      <path class="route support delay" d="M548 176 C466 122 416 142 378 218"/>
      <path class="route attack" d="M116 342 C210 388 264 354 294 306"/>
      <path class="route betrayal" d="M564 346 C482 390 434 352 404 318 L448 278 L416 244"/>
    </g>
    <g class="table" data-px="1">
      <path d="M340 164 L454 230 L430 354 L250 354 L226 230 Z" fill="url(#table-dark)" stroke="var(--line-3)" stroke-width="2"/>
      <path d="M340 196 L402 232 L390 310 L290 310 L278 232 Z" fill="rgba(9,8,14,.72)" stroke="var(--line-2)"/>
      <path d="M340 218 L370 282 L340 316 L310 282 Z" fill="url(#table-gold)"/>
      <circle cx="340" cy="278" r="5" fill="#fff"/>
      <text x="340" y="342" text-anchor="middle" fill="var(--muted)" font-size="13" font-weight="800">القرار الحقيقي تحت الطاولة</text>
    </g>
    <g class="cards" data-px="1.25">
      <g transform="translate(170 224) rotate(-12)"><rect width="58" height="78" rx="10" fill="var(--surface-2)" stroke="var(--green)"/><path d="M18 39h22M29 28v22" stroke="var(--green)" stroke-width="3"/></g>
      <g transform="translate(456 230) rotate(13)"><rect width="58" height="78" rx="10" fill="var(--surface-2)" stroke="var(--red)"/><path d="M17 28l24 24M41 28L17 52" stroke="var(--red)" stroke-width="3"/></g>
      <g transform="translate(316 376)"><rect width="54" height="70" rx="10" fill="var(--surface-2)" stroke="var(--gold)"/><path d="M18 35h18" stroke="var(--gold)" stroke-width="3"/></g>
    </g>
    <g class="players" data-px="1.5">
      ${[
        [116, 166, 'ف', 'green'], [340, 76, 'س', 'gold'], [564, 166, 'ع', 'green'],
        [580, 360, 'ن', 'red'], [340, 470, 'م', 'gold'], [100, 360, 'ر', 'red'],
      ].map(([x, y, initial, tone]) => `<g transform="translate(${x} ${y})" class="player ${tone}"><circle r="30" fill="var(--surface-2)" stroke="currentColor" stroke-width="2"/><circle r="22" fill="var(--bg-1)"/><text y="7" text-anchor="middle" fill="var(--text)" font-size="20" font-weight="900">${initial}</text><circle class="pulse" r="36" fill="none" stroke="currentColor"/></g>`).join('')}
    </g>
    <g class="secret-seal" transform="translate(340 278)" data-px="1.8"><circle r="54" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-dasharray="3 8"/><path d="M0-18L14 10 0 24-14 10Z" fill="var(--gold)" opacity=".9"/></g>
  </svg>`;
}
function conceptArt(): string {
  return `<svg viewBox="0 0 420 300" class="art" aria-hidden="true">
    ${[...Array(5)].map((_, i) => {
      const x = 60 + i * 75;
      return `<g><circle cx="${x}" cy="70" r="20" fill="var(--surface-3)" stroke="var(--line-3)" stroke-width="2"/><text x="${x}" y="77" text-anchor="middle" fill="var(--text-2)" font-size="18" font-weight="800">${['ف', 'س', 'ع', 'ن', 'م'][i]}</text></g>`;
    }).join('')}
    <path d="M60 90 L135 210" stroke="var(--green)" stroke-width="3" fill="none"/>
    <path d="M135 90 L210 210" stroke="var(--green)" stroke-width="3" fill="none" opacity=".7"/>
    <path d="M285 90 L210 210" stroke="var(--red)" stroke-width="3" fill="none"/>
    <path d="M360 90 L285 210 L330 240" stroke="var(--red)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="30" y="210" width="360" height="60" rx="10" fill="var(--surface)" stroke="var(--line-2)"/>
    <text x="210" y="248" text-anchor="middle" fill="var(--muted)" font-size="16" font-weight="700">القرارات السرية… تحت الطبقة</text>
  </svg>`;
}
function betrayArt(): string {
  return `<svg viewBox="0 0 480 340" class="art betray-svg" aria-hidden="true">
    <g stroke="var(--line-2)" stroke-width="1.4" opacity=".45" stroke-linecap="round">
      <line x1="54" y1="36" x2="54" y2="302"/>
      <line x1="54" y1="302" x2="446" y2="302"/>
    </g>
    <g class="b-nodes" fill="var(--surface-3)"><circle cx="54" cy="222" r="8" stroke="var(--green)" stroke-width="2.4"/><circle cx="54" cy="250" r="8" stroke="var(--green)" stroke-width="2.4" opacity=".7"/><circle cx="54" cy="240" r="8" stroke="var(--gold)" stroke-width="2.4"/></g>
    <path class="p-keep" d="M54 222 C150 216 250 150 424 92" stroke="var(--green)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path class="p-keep" d="M54 250 C150 246 250 208 424 164" stroke="var(--green)" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>
    <path class="p-keep" d="M54 240 C132 236 194 214 252 194" stroke="var(--gold)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path class="p-break" d="M252 194 L288 302 L332 250 L432 322" stroke="var(--red)" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="b-crack" d="M252 194 L244 170 M252 194 L276 180 M252 194 L236 208" stroke="var(--red)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <g class="b-ends"><circle cx="424" cy="92" r="9" fill="var(--surface-3)" stroke="var(--green)" stroke-width="2.4"/><circle cx="424" cy="164" r="9" fill="var(--surface-3)" stroke="var(--green)" stroke-width="2.4" opacity=".7"/><circle cx="252" cy="194" r="6" fill="var(--red)"/><circle cx="432" cy="322" r="9" fill="var(--surface-3)" stroke="var(--red)" stroke-width="2.4"/></g>
  </svg>`;
}
function mockTv(): string {
  return `<div class="m-tv"><div class="m-tv-top"><span class="m-code mono">A·B·C</span><span class="m-qr">${qrSvg('https://dass', '#0b0a0f', '#f4eee3', 1)}</span></div><div class="m-bars">${[60, 90, 40, 75].map((h) => `<i style="height:${h}%"></i>`).join('')}</div></div>`;
}
function mockPhones(): string {
  return `<div class="m-phones">${['back', 'dump', 'sell'].map((k, i) => `<div class="m-phone p${i}"><div class="m-ph-ic" style="color:${k === 'back' ? 'var(--green)' : k === 'dump' ? 'var(--red)' : 'var(--gold)'}">${uiIcon('check', 18)}</div></div>`).join('')}</div>`;
}
function mockReveal(): string {
  return `<div class="m-reveal"><span class="m-dassa">دسّة</span><div class="m-vault">١٤٨٠</div></div>`;
}

// ---------------- CSS ----------------
function siteCss(): string {
  return `
  .site,.page{position:relative;z-index:var(--z-content)}
  .skip-link{position:fixed;z-index:9999;top:8px;inset-inline-start:8px;transform:translateY(-160%);padding:10px 14px;border-radius:10px;background:var(--gold);color:var(--bg);font-weight:900;text-decoration:none}.skip-link:focus{transform:none}
  .network-notice{position:fixed;z-index:9998;bottom:12px;left:50%;transform:translateX(-50%);width:min(620px,calc(100% - 24px));padding:13px 16px;border:1px solid color-mix(in srgb,var(--red) 45%,transparent);border-radius:12px;background:color-mix(in srgb,var(--bg-1) 94%,transparent);backdrop-filter:blur(12px);box-shadow:var(--shadow-3);color:var(--text);font-weight:800;text-align:center}
  .nav{position:sticky;top:0;z-index:var(--z-hud);display:flex;align-items:center;justify-content:space-between;gap:16px;
    padding:14px clamp(16px,4vw,48px);backdrop-filter:blur(12px);background:color-mix(in srgb,var(--bg) 70%,transparent);border-bottom:1px solid var(--line)}
  .nav-logo{display:flex;align-items:center;gap:8px;font-size:24px;text-decoration:none}
  .nav-primary,.nav-links{display:flex;align-items:center;gap:clamp(10px,2vw,22px)}
  .nav-a{color:var(--text-2);text-decoration:none;font-weight:700;transition:color var(--t-micro)}
  .nav-a:hover,.nav-a.on{color:var(--text)}
  .nav-cta{min-height:44px;padding:10px 20px;text-decoration:none}
  .icon-btn.sm{width:40px;height:40px}
  .account-menu{position:relative}.account-toggle{min-height:42px;border:1px solid var(--line-2);background:var(--surface);color:var(--text-2);border-radius:var(--r-pill);font:inherit;font-weight:800;padding:5px 10px 5px 13px;display:flex;align-items:center;gap:8px;cursor:pointer}.account-toggle:hover,.account-toggle.on{border-color:var(--line-3);color:var(--text)}
  .account-initial{width:29px;height:29px;border-radius:50%;display:grid;place-items:center;background:var(--surface-3);color:var(--gold);font-weight:900}.account-panel{position:absolute;top:calc(100% + 10px);inset-inline-end:0;min-width:190px;padding:7px;border:1px solid var(--line-2);border-radius:14px;background:color-mix(in srgb,var(--bg-1) 94%,transparent);backdrop-filter:blur(16px);box-shadow:var(--shadow-3)}.account-panel a,.account-panel button{display:block;width:100%;padding:11px 12px;border:0;border-radius:9px;background:transparent;color:var(--text-2);text-align:start;text-decoration:none;font:inherit;font-weight:700;cursor:pointer}.account-panel a:hover,.account-panel button:hover{background:var(--surface-3);color:var(--text)}
  .mobile-toggle,.mobile-panel{display:none}.mobile-toggle span{font-size:20px;line-height:1}.mobile-panel{position:absolute;top:100%;inset-inline:12px;padding:10px;border:1px solid var(--line-2);border-radius:0 0 16px 16px;background:color-mix(in srgb,var(--bg-1) 96%,transparent);backdrop-filter:blur(16px);box-shadow:var(--shadow-3)}.mobile-panel a{display:block;padding:13px 12px;border-bottom:1px solid var(--line);color:var(--text-2);text-decoration:none;font-weight:800}.mobile-panel a:last-child{border:0}
  body.menu-open{overflow:hidden}

  .btn.lg{padding:17px 34px;font-size:clamp(17px,2vw,21px);min-height:58px;text-decoration:none}
  .eyebrow{display:inline-block;font-size:var(--fs-label);font-weight:800;letter-spacing:.14em;color:var(--gold);text-transform:uppercase}

  .hero{min-height:calc(100dvh - 73px);display:flex;align-items:center;padding:clamp(64px,8vh,110px) clamp(20px,6vw,90px);position:relative;overflow:hidden}
  .hero::after{content:"";position:absolute;inset:10% 7% 8%;border:1px solid var(--line);border-radius:48% 52% 44% 56%/58% 42% 58% 42%;opacity:.55;pointer-events:none}
  .hero-copy{max-width:680px;width:min(58%,680px);position:relative;z-index:2;padding:clamp(20px,3vw,44px);background:linear-gradient(90deg,color-mix(in srgb,var(--bg) 92%,transparent) 62%,transparent);border-inline-start:2px solid color-mix(in srgb,var(--gold) 55%,transparent)}
  .hero-kicker{color:var(--text-2);font-weight:800;margin-bottom:14px}
  .hero-title{font-size:var(--fs-display);margin:0 0 6px}
  .hero-tag{font-size:clamp(22px,3.2vw,38px);font-weight:900;line-height:1.25;margin:0 0 14px}
  .hero-sub{font-size:var(--fs-body);color:var(--text-2);line-height:1.8;max-width:52ch;margin:0 0 28px}
  .hero-cta{display:flex;gap:14px;flex-wrap:wrap}
  .hero-bgart{position:absolute;z-index:1;inset-inline-end:clamp(-70px,1vw,20px);top:50%;transform:translateY(-50%);width:min(58vw,760px);aspect-ratio:680/520}
  .art{width:100%;height:100%;overflow:visible}
  .hero-network .player{color:var(--gold)} .hero-network .player.green{color:var(--green)} .hero-network .player.red{color:var(--red)}
  .hero-network .route{stroke-dasharray:420;stroke-dashoffset:420;animation:routeDraw 2.4s var(--e-pull) .35s forwards}
  .hero-network .route.support{stroke:var(--green)} .hero-network .route.attack,.hero-network .route.betrayal{stroke:var(--red)}
  .hero-network .route.delay{animation-delay:.8s}.hero-network .route.betrayal{animation-delay:1.15s}
  .hero-network .pulse{opacity:0;animation:playerPulse 3.6s ease-out infinite}.hero-network .player:nth-child(2n) .pulse{animation-delay:1.2s}
  .hero-network .secret-seal{transform-box:fill-box;transform-origin:center;animation:sealTurn 18s linear infinite}
  @keyframes routeDraw{to{stroke-dashoffset:0}}@keyframes playerPulse{0%,55%{opacity:0;r:30px}70%{opacity:.45}100%{opacity:0;r:48px}}@keyframes sealTurn{to{rotate:360deg}}
  .hero-copy.intro>*{opacity:0;animation:heroUp .7s var(--e-pull) forwards}
  .hero-copy.intro .hero-kicker{animation-delay:.1s} .hero-copy.intro .hero-tag{animation-delay:.35s} .hero-copy.intro .hero-sub{animation-delay:.5s} .hero-copy.intro .hero-cta{animation-delay:.65s}
  @keyframes heroUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
  .scroll-hint{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--muted);font-size:12px}
  .scroll-hint i{width:1px;height:26px;background:linear-gradient(var(--muted),transparent);animation:breathe 1.8s ease-in-out infinite}

  .scene{max-width:1180px;margin:0 auto;padding:clamp(70px,12vh,150px) clamp(20px,5vw,48px)}
  .scene-head{margin-bottom:clamp(28px,5vh,56px)}
  .scene-title{font-size:var(--fs-h1);font-weight:900;margin:10px 0 0;text-wrap:balance}
  .concept-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,60px);align-items:center}
  .concept-art{background:var(--surface);border:1px solid var(--line-2);border-radius:var(--r-3);padding:20px}
  .concept-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:18px}
  .concept-list li{font-size:var(--fs-h3);line-height:1.6;padding-inline-start:20px;border-inline-start:2px solid var(--line-2)}
  .concept-list b{color:var(--gold)}

  .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .step{background:linear-gradient(180deg,var(--surface-2),var(--surface));border:1px solid var(--line-2);border-radius:var(--r-3);padding:24px;display:flex;flex-direction:column;gap:12px}
  .step-n{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-weight:900;background:var(--surface-3);color:var(--gold);font-size:20px}
  .step-mock{height:150px;border-radius:var(--r-2);background:var(--bg-1);border:1px solid var(--line);display:grid;place-items:center;overflow:hidden}
  .step h3{margin:0;font-size:var(--fs-h3)}
  .steps-cta{margin-top:28px;text-align:center}

  .m-tv{width:80%;height:80%;background:var(--surface);border:1px solid var(--line-2);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px}
  .m-tv-top{display:flex;justify-content:space-between;align-items:center} .m-code{color:var(--gold);font-weight:900}
  .m-qr{width:34px;height:34px;background:#f4eee3;border-radius:4px;padding:2px} .m-qr svg{width:100%;height:100%}
  .m-bars{flex:1;display:flex;align-items:flex-end;gap:6px}
  .m-bars i{flex:1;background:linear-gradient(180deg,var(--green),transparent);border-radius:3px}
  .m-phones{display:flex;gap:8px} .m-phone{width:38px;height:74px;border-radius:9px;background:var(--surface);border:1px solid var(--line-2);display:grid;place-items:center}
  .m-phone.p1{transform:translateY(-8px)} .m-phone.p2{transform:translateY(4px)}
  .m-reveal{text-align:center} .m-dassa{color:var(--red);font-weight:900;font-size:20px} .m-vault{color:var(--gold);font-weight:900;font-size:30px;font-variant-numeric:tabular-nums}

  .cycle{position:relative;height:220vh}
  .cycle-pin{position:sticky;top:0;height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center;padding:20px}
  .cycle-stage{--c:var(--gold);display:flex;flex-direction:column;align-items:center;gap:10px}
  .cy-num{font-size:clamp(60px,12vw,150px);font-weight:900;color:var(--c);line-height:1}
  .cy-num span{font-size:.3em;color:var(--muted);margin-inline-start:8px}
  .cy-t{font-size:var(--fs-h1);font-weight:900} .cy-d{font-size:var(--fs-h3)}
  .cy-bars{display:flex;gap:6px;margin-top:10px} .cy-bars i{width:34px;height:5px;border-radius:3px;background:var(--surface-3);transition:background .4s} .cy-bars i.on{background:var(--c)}
  .cycle-rail{display:flex;gap:clamp(8px,2vw,22px);flex-wrap:wrap;justify-content:center;max-width:900px}
  .rail-dot{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:13px;font-weight:700;transition:color .3s}
  .rail-dot i{width:8px;height:8px;border-radius:50%;background:var(--surface-3);transition:background .3s}
  .rail-dot.on{color:var(--text-2)} .rail-dot.on i{background:var(--gold)}
  @media(max-width:640px){ .rail-dot b{display:none} }

  .betray{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,60px);align-items:center}
  .betray-art{background:radial-gradient(circle at 60% 40%,color-mix(in srgb,var(--red) 10%,transparent),transparent 70%);border-radius:var(--r-3)}
  .betray-svg .p-keep,.betray-svg .p-break{stroke-dasharray:600;stroke-dashoffset:600}
  .betray.in .betray-svg .p-keep{animation:crackDraw 1s var(--e-pull) forwards}
  .betray.in .betray-svg .p-break{animation:crackDraw .8s var(--e-sharp) .8s forwards}
  .betray-svg .b-crack{stroke-dasharray:120;stroke-dashoffset:120} .betray.in .betray-svg .b-crack{animation:crackDraw .3s var(--e-sharp) 1.5s forwards}
  .betray-svg .b-ends{opacity:0} .betray.in .betray-svg .b-ends{opacity:1;transition:opacity .5s ease 1.35s}
  .betray-line{font-size:var(--fs-h3);line-height:1.7;color:var(--text-2);margin-top:14px}
  .betray-art{min-height:300px;display:grid;place-items:center;padding:16px}
  .betray-svg{width:100%;max-width:460px}
  .scene-head.center{text-align:center}
  .features .scene-head{text-align:center}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .feat{padding:26px 22px;border-radius:var(--r-3);background:linear-gradient(180deg,var(--surface-2),var(--surface));border:1px solid var(--line-2);display:flex;flex-direction:column;gap:10px;transition:transform var(--t-comp) var(--e-out),border-color var(--t-comp) var(--e-out)}
  .feat:hover{transform:translateY(-4px);border-color:var(--line-3)}
  .feat-ic{width:50px;height:50px;border-radius:14px;display:grid;place-items:center;background:var(--surface-3);color:var(--text)}
  .feat-ic.gold{color:var(--gold);background:color-mix(in srgb,var(--gold) 14%,var(--surface-3))}
  .feat h3{margin:0;font-size:var(--fs-h3)} .feat p{margin:0;line-height:1.6}
  .atmos{display:flex;justify-content:center;text-align:center}
  .atmos-inner{max-width:780px}
  .atmos-q{font-size:clamp(28px,5.2vw,58px);font-weight:900;line-height:1.3;margin:14px 0 20px;background:linear-gradient(120deg,var(--red),var(--gold-2));-webkit-background-clip:text;background-clip:text;color:transparent;text-wrap:balance}
  .atmos-p{font-size:var(--fs-h3);line-height:1.9;color:var(--text-2)}
  .commerce-intro{font-size:var(--fs-h3);line-height:1.7;max-width:58ch}.home-store-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.home-store-item{display:flex;align-items:center;gap:14px;padding:18px;border:1px solid var(--line-2);border-radius:var(--r-2);background:var(--surface);color:var(--text);text-decoration:none;transition:transform var(--t-comp),border-color var(--t-comp)}.home-store-item:hover{transform:translateY(-3px);border-color:color-mix(in srgb,var(--accent) 45%,transparent)}.home-store-item>span{width:58px;height:58px;display:grid;place-items:center;border-radius:17px;background:color-mix(in srgb,var(--accent) 12%,var(--surface-3));color:var(--accent);font-size:20px;font-weight:900}.home-store-item>div{display:grid;gap:4px}.home-store-item small{color:var(--muted)}.home-plan-strip{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:18px;padding:24px;border:1px solid color-mix(in srgb,var(--gold) 32%,transparent);border-radius:var(--r-3);background:radial-gradient(circle at 80% 20%,color-mix(in srgb,var(--gold) 10%,transparent),transparent 45%),var(--surface)}.home-plan-strip h3{font-size:var(--fs-h3);margin:7px 0}.home-plan-names{display:flex;gap:7px;flex-wrap:wrap}.home-plan-names span{padding:7px 10px;border-radius:var(--r-pill);background:var(--surface-3);color:var(--text-2);font-size:13px;font-weight:800}.home-device-row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:18px}.home-device-row p{display:grid;gap:5px;margin:0;padding:18px;border-top:1px solid var(--line-2)}.home-device-row span{color:var(--muted);line-height:1.5}
  @media(min-width:861px) and (max-width:1100px){ .feat-grid{grid-template-columns:1fr 1fr} }

  .final{text-align:center;max-width:900px}
  .final-title{font-size:var(--fs-h1);font-weight:900;margin:0} .final-sub{font-size:var(--fs-h3);color:var(--text-2);margin:14px 0 30px}
  .final-cta{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}

  .foot{max-width:1180px;margin:0 auto;padding:48px clamp(20px,5vw,48px);display:grid;grid-template-columns:150px 1fr;align-items:start;gap:36px;border-top:1px solid var(--line)}
  .foot-brand{display:flex;align-items:center;gap:8px;font-size:22px}.foot-map{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.foot-map>div{display:grid;align-content:start;gap:9px}.foot-map b{color:var(--text);margin-bottom:3px}.foot-map a{color:var(--muted);text-decoration:none;font-weight:700}.foot-map a:hover{color:var(--gold)}.foot-cap{grid-column:1/-1;border-top:1px solid var(--line);padding-top:18px;font-size:13px}

  .page{min-height:100dvh} .center-page{display:grid;place-items:center;padding:90px 20px}
  .page-card{width:100%;max-width:440px;padding:clamp(26px,5vw,40px);display:flex;flex-direction:column;gap:14px;text-align:center}
  .page-title{font-size:var(--fs-h1);font-weight:900;margin:6px 0} .page-title.big{font-size:var(--fs-display)}
  .page-sub{line-height:1.7} .create-tips{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:6px 0}
  .tip{display:flex;align-items:center;gap:8px;font-weight:700;color:var(--text-2);background:var(--surface);border:1px solid var(--line-2);border-radius:var(--r-pill);padding:8px 14px}
  .back-link{color:var(--muted);text-decoration:none;font-weight:700;margin-top:4px}
  .join-form{display:flex;flex-direction:column;gap:12px} .j-err{color:var(--red);font-weight:800;min-height:20px}
  #code{direction:ltr;unicode-bidi:isolate;text-align:center}

  .howto{max-width:820px;margin:0 auto;padding:100px 20px 40px} .howto-hero{text-align:center;margin-bottom:40px}
  .howto-steps{display:flex;flex-direction:column;gap:14px}
  .hstep{display:flex;gap:16px;align-items:flex-start;padding:20px;border-radius:var(--r-2);background:var(--surface);border:1px solid var(--line-2)}
  .hstep-n{width:44px;height:44px;flex:0 0 auto;border-radius:12px;display:grid;place-items:center;font-weight:900;font-size:20px;background:var(--surface-3);color:var(--gold)}
  .hstep h3{margin:0 0 4px;font-size:var(--fs-h3)}
  .howto-actions{margin-top:36px;text-align:center;display:flex;flex-direction:column;gap:20px}
  .ha-actions{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;font-size:var(--fs-h3)}
  .howto-cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .ht-block{margin-bottom:clamp(48px,8vh,88px)}
  .ht-head{margin-bottom:22px} .ht-head .scene-title{margin-top:8px;font-size:var(--fs-h2)}
  .hphases{display:flex;flex-direction:column;gap:12px}
  .hphase{display:flex;gap:16px;align-items:center;padding:18px 20px;border-radius:var(--r-2);background:var(--surface);border:1px solid var(--line-2);border-inline-start:3px solid var(--c)}
  .hp-n{width:40px;height:40px;flex:0 0 auto;border-radius:12px;display:grid;place-items:center;font-weight:900;font-size:19px;background:color-mix(in srgb,var(--c) 16%,var(--surface-2));color:var(--c)}
  .hphase h3{margin:0 0 3px;font-size:var(--fs-h3)}
  .ht-split{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .ht-side{padding:22px;border-radius:var(--r-2);background:var(--surface);border:1px solid var(--line-2)}
  .ht-side.secret{border-color:color-mix(in srgb,var(--violet) 40%,transparent)}
  .ht-side.public{border-color:color-mix(in srgb,var(--gold) 40%,transparent)}
  .ht-side ul{margin:12px 0 0;padding-inline-start:18px;display:flex;flex-direction:column;gap:8px;color:var(--text-2);line-height:1.5}
  .hs-badge{display:inline-block;font-weight:800;font-size:13px;letter-spacing:.06em;color:var(--violet)} .hs-badge.gold{color:var(--gold)}
  .ht-p{font-size:var(--fs-h3);line-height:1.85;color:var(--text-2)}
  .actcards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .actcard{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:24px 14px;border-radius:var(--r-2);background:var(--surface);border:1px solid var(--line-2);border-top:3px solid var(--c)}
  .actcard .ac-ic{color:var(--c)} .actcard b{font-size:var(--fs-h3)}
  .ht-cta-final{text-align:center;padding:24px 0 8px} .ht-cta-final .scene-title{margin-bottom:20px}
  @media(max-width:640px){ .ht-split,.actcards{grid-template-columns:1fr} }

  @media(max-width:860px){
    .nav-primary{display:none}.mobile-toggle{display:grid}.mobile-panel:not([hidden]){display:block}.account-toggle>span:last-child{display:none}
    .hero{min-height:auto;display:flex;flex-direction:column;text-align:center;padding:42px 18px 70px;gap:18px}
    .hero::after{inset:20px 10px 30px;border-radius:28px}
    .hero-copy{order:1;width:100%;padding:18px 8px 0;background:none;border:0;max-width:620px}
    .hero-bgart{order:2;position:relative;inset:auto;top:auto;transform:none;width:min(92vw,520px);margin-top:6px}
    .hero-sub{margin-inline:auto}.hero-cta{justify-content:center}.scroll-hint{display:none}
    .concept-grid,.betray,.steps-grid,.feat-grid,.home-store-grid,.home-device-row{grid-template-columns:1fr}
    .home-plan-strip{align-items:flex-start;flex-direction:column}
    .betray-art{order:-1}
  }
  @media(max-width:480px){
    .nav{padding:10px 12px}.nav-logo .wordmark{display:none}.nav-cta{padding-inline:13px}.account-menu{display:none}.nav-links{gap:7px}
    .hero{padding-top:26px}.hero-kicker{margin-bottom:8px}.hero-tag{font-size:clamp(25px,8vw,34px)}
    .hero-sub{font-size:15px;line-height:1.72;margin-bottom:20px}.hero-cta{display:grid;grid-template-columns:1fr 1fr;gap:10px}.hero-cta .btn{padding-inline:12px}
    .hero-bgart{width:min(96vw,430px)}.scene{padding-block:72px}.cycle{height:280vh}
    .foot{grid-template-columns:1fr}.foot-map{grid-template-columns:1fr 1fr}.foot-cap{grid-column:auto}
  }
  `;
}
