import { addStyle, escapeHtml, injectBase, observeReveal, press, qs, qsa, rafScroll, reduced } from '@dass/ui';
import { backfireAudio } from './backfire-audio.js';
import { configuredPublicOrigin } from './product/config.js';
import { platform } from './product/platform.js';
import { PRODUCT_PATHS, renderProductPage } from './product/pages.js';
import { productCss } from './product/product-css.js';
import { MODES_PATHS, modesHomeSection, renderModesPage } from './modes/modes-page.js';
import { modesCss } from './modes/modes-css.js';
import { rebrandVisibleText, SITE_BRAND, SOCIAL_PREVIEW_PATH } from './site-brand.js';
import { GameScreenPreview, PhoneMockup, TvStage } from './site-product.js';
import { ConsequenceScene, FinalScene, HeroScene, IncompleteScene, PrivateScene } from './site-scenes.js';
import { SITE_CSS } from './site-theme.js';

injectBase();
document.documentElement.dataset.siteTheme = 'backfire';
document.body.classList.add('backfire-site');
addStyle(SITE_CSS);
addStyle(productCss());
addStyle(modesCss());

const app = document.getElementById('app')!;
const SPA = new Set(['/', '/create', '/join', '/how-to-play', ...MODES_PATHS, ...PRODUCT_PATHS]);
let cleanups: Array<() => void> = [];

const wordmark = '<span class="bf-word" dir="ltr">BACKFIRE</span>';

function go(target: string): void {
  const url = new URL(target, location.origin);
  if (!SPA.has(url.pathname)) {
    location.href = `${url.pathname}${url.search}${url.hash}`;
    return;
  }
  history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
  render();
  requestAnimationFrame(() => {
    if (url.hash) document.querySelector<HTMLElement>(url.hash)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
    else scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    qs<HTMLElement>('#main')?.focus({ preventScroll: true });
  });
}

addEventListener('click', (event) => {
  const mouse = event as MouseEvent;
  if (mouse.button !== 0 || mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.altKey) return;
  const link = (event.target as HTMLElement).closest<HTMLElement>('[data-link]');
  if (!link?.dataset.link) return;
  event.preventDefault();
  backfireAudio.tick();
  go(link.dataset.link);
});
addEventListener('popstate', render);

function teardown(): void {
  for (const cleanup of cleanups) cleanup();
  cleanups = [];
  delete document.body.dataset.route;
  document.body.classList.remove('menu-open');
}

function render(): void {
  teardown();
  applyProductPreferences();
  try {
    switch (location.pathname) {
      case '/':
        updateMeta('لعبة جماعية عن الشك والعواقب', 'كل لاعب يرى جزءًا مختلفًا. القرار سري، والنتيجة أمام الجميع.');
        home();
        break;
      case '/create':
        updateMeta('ابدأ لعبة', 'افتح غرفة BACKFIRE على الشاشة الكبيرة، ثم أدخل الشلة من جوالاتهم.');
        createRoom();
        break;
      case '/join':
        updateMeta('انضم بكود', 'أدخل رمز الغرفة واسمك للانضمام إلى BACKFIRE من جوالك.');
        joinRoom();
        break;
      case '/how-to-play':
        updateMeta('كيف تلعب', 'الشاشة تحكي، والجوالات تخبّي. خمس خطوات للبدء.');
        howToPlay();
        break;
      default:
        if (MODES_PATHS.has(location.pathname)) modesRoute(location.pathname);
        else productRoute(location.pathname);
    }
  } catch (error) {
    console.error('[BACKFIRE site] route render failed', error);
    updateMeta('تعذّر فتح الصفحة', 'حدث خطأ آمن أثناء عرض الصفحة.');
    app.innerHTML = `${header()}<main id="main" class="cinema-page" tabindex="-1"><section class="door-card"><span class="eyebrow">خطأ آمن</span><h1>المشهد ما اكتمل.</h1><p>لم نرسل أي بيانات. حدّث الصفحة أو ارجع للرئيسية.</p><button id="retry" class="btn primary wide">إعادة المحاولة</button><a data-link="/" class="text-link">العودة للرئيسية</a></section></main>`;
    qs('#retry')?.addEventListener('click', render);
  }
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

function header(active = ''): string {
  return `<a class="skip-link" href="#main">تخطَّ إلى المحتوى</a>
    <header class="site-head" id="site-head">
      <a class="nav-logo" data-link="/" aria-label="BACKFIRE — الرئيسية">${wordmark}</a>
      <nav class="head-nav" aria-label="التنقل الرئيسي"><a data-link="/modes" class="${active === 'modes' || active === 'store' ? 'on' : ''}">الأطوار</a><a data-link="/how-to-play" class="${active === 'how' ? 'on' : ''}">كيف تلعب</a><a data-link="/join">انضم بكود</a></nav>
      <div class="head-actions"><a data-link="/create" class="head-cta">ابدأ لعبة</a><button id="menu" class="head-menu" type="button" aria-label="القائمة" aria-expanded="false" aria-controls="mpanel"><span></span><span></span></button></div>
      <div id="mpanel" class="mobile-panel" hidden><a data-link="/modes">الأطوار</a><a data-link="/how-to-play">كيف تلعب</a><a data-link="/join">انضم بكود</a><a data-link="/create">ابدأ لعبة</a></div>
    </header>`;
}

function footer(): string {
  return `<footer class="foot-noir" data-reveal>
    <div class="foot-inner">
      <div class="foot-brand">${wordmark}<p>كل حركة لها عواقب. لعبة جماعية على شاشة واحدة وجوالات اللاعبين.</p></div>
      <div class="foot-links">
        <div><b>اللعب</b><a data-link="/create">ابدأ لعبة</a><a data-link="/join">انضم بكود</a><a data-link="/how-to-play">كيف تلعب</a></div>
        <div><b>العوالم</b><a data-link="/modes">الأطوار</a><a data-link="/pricing">الأسعار</a></div>
        <div><b>الموقع</b><a data-link="/about">عن اللعبة</a><a data-link="/faq">الأسئلة</a><a data-link="/support">الدعم</a></div>
        <div><b>قانوني</b><a data-link="/legal/privacy">الخصوصية</a><a data-link="/legal/terms">الشروط</a><a data-link="/legal/refunds">الاسترجاع</a></div>
      </div>
    </div>
    <div class="foot-cap"><span>BACKFIRE — كل حركة لها عواقب.</span><span>٢٠٢٦</span></div>
  </footer>`;
}

function home(): void {
  document.body.dataset.route = 'home';
  app.innerHTML = `${header()}<main id="main" tabindex="-1">
    <section class="hero-noir">
      <div class="hero-inner"><div class="hero-copy" data-reveal>
        <span class="eyebrow">لعبة جماعية للشاشة والجوال</span>
        <h1>كل حركة<br>لها <em>عواقب.</em></h1>
        <p class="hero-lead">كل لاعب يرى جزءًا مختلفًا. القرار سري، والنتيجة أمام الجميع.</p>
        <ul class="hero-facts" aria-label="مواصفات سريعة"><li>٥ لاعبين</li><li>شاشة واحدة</li><li>جوال لكل لاعب</li><li>بلا تحميل</li></ul>
        <div class="hero-cta"><a data-link="/create" class="btn primary lg">ابدأ لعبة</a><a data-link="/join" class="btn ghost lg">انضم بكود</a></div>
        <div class="hero-note"><i></i><span>نسخة تجريبية — نظام السيناريو الجديد قيد التطوير.</span></div>
      </div></div>
      <div class="hero-art" data-reveal>${HeroScene()}</div>
      <a class="scroll-cue" data-link="/#poster01"><span>انزل</span><i></i></a>
    </section>

    <section id="poster01" class="poster poster-incomplete on-paper" data-reveal>
      <div class="poster-inner">
        <div class="poster-copy"><span class="sec-index">01</span><h2>لا أحد يرى<br>الصورة كاملة.</h2><p>المعلومة موزّعة. والثقة قرار.</p></div>
        <div class="poster-art">${IncompleteScene()}</div>
      </div>
    </section>

    <section class="poster poster-private on-dark" data-reveal>
      <div class="poster-inner">
        <div class="poster-copy"><span class="sec-index">02</span><h2>ما تعرفه<br>يغيّر كل شيء.</h2><p>كل واحد يعرف شيئًا، ولا أحد يعرف كل شيء. على جوالك جزء لا يراه غيرك.</p></div>
        <div class="poster-art">${PrivateScene()}</div>
      </div>
    </section>

    <section class="social-noir on-dark" data-reveal>
      <div class="social-inner">
        <div class="social-copy">
          <span class="eyebrow">اللعبة الحقيقية بينكم</span>
          <h2 class="social-head">المشكلة مو في المعلومة.<br>المشكلة: <em>مين تصدّق؟</em></h2>
          <p class="social-note">الكذب، ونصف الحقيقة، والثقة المؤقتة، والاتهام المتأخر — هذي اللعبة الحقيقية بين اللاعبين، مو داخل جوالك.</p>
        </div>
        <div class="social-lines" aria-hidden="true">
          <span class="sl sl-1">«مين عطّل المسار؟»</span>
          <span class="sl sl-2">«أنت كنت تعرف من البداية.»</span>
          <span class="sl sl-3">«قلت لكم لا ترسلونها له.»</span>
          <span class="sl sl-4">«خطتك قلبت عليك.»</span>
        </div>
      </div>
    </section>

    <section class="poster poster-consequence on-dark" data-reveal>
      <div class="poster-inner">
        <div class="poster-copy"><span class="sec-index">03</span><h2>القرار يخرج منك.<br>والعاقبة <em>تعود إليك.</em></h2><p>كل جولة تتذكّر ما فعلتموه قبلها.</p></div>
        <div class="poster-art">${ConsequenceScene()}</div>
      </div>
    </section>

    <section class="product-noir on-paper" data-reveal>
      <div class="product-inner">
        <div class="product-head"><span class="eyebrow">المنتج</span><h2>شاشة واحدة.<br>أسرار مختلفة.</h2><p>التلفزيون يعرض ما يعرفه الجميع. هاتفك يحتفظ بما يخصك.</p></div>
        <div class="product-stage">
          <figure class="stage-tv">${TvStage('reveal')}<figcaption><b>التلفزيون</b><span>المشهد العام الذي يراه الجميع.</span></figcaption></figure>
          <div class="stage-phones"><figure>${PhoneMockup('secret', 'معلومة خاصة')}</figure><figure>${PhoneMockup('decision', 'قرار سري')}</figure></div>
        </div>
        <ol class="product-steps"><li><b>01</b><span>افتح غرفة</span></li><li><b>02</b><span>امسح الرمز</span></li><li><b>03</b><span>اختر بسرية</span></li></ol>
      </div>
    </section>

    ${modesHomeSection()}

    <section class="final-noir" data-reveal>
      <div class="final-art">${FinalScene()}</div>
      <div class="final-inner"><span class="eyebrow">BACKFIRE</span><h2>ابدأ قبل أن<br>تكتمل الصورة.</h2><p>ضع الشاشة أمام الجميع، وادخلوا من جوالاتكم.</p><div class="hero-cta"><a data-link="/create" class="btn primary lg">ابدأ لعبة</a><a data-link="/join" class="btn ghost lg">انضم بكود</a></div></div>
    </section>
  </main>${footer()}`;
  bindPageMotion();
}

function createRoom(): void {
  document.body.dataset.route = 'create';
  app.innerHTML = `${header()}<main id="main" class="door" tabindex="-1">
    <section class="door-form" data-reveal>
      <span class="eyebrow">غرفة جديدة</span>
      <h1>افتح الشاشة.<br>واجمع الشلة.</h1>
      <p>سننقلك إلى شاشة التلفزيون الحالية. هناك يظهر رمز الغرفة ليدخل اللاعبون من جوالاتهم.</p>
      <div class="door-specs"><span><b>٥</b>لاعبين</span><span><b>رمز</b>أو كود</span><span><b>بلا</b>تحميل</span></div>
      <button id="startbtn" class="btn primary lg wide">افتح الغرفة على التلفاز</button>
      <a data-link="/" class="text-link">العودة للرئيسية</a>
    </section>
    <aside class="door-aside">${TvStage('lobby')}<div class="door-caption"><span>شاشة واحدة</span><b>رمز الدخول وحالة اللاعبين.</b></div></aside>
  </main>${footer()}`;
  revealPage();
  qs('#startbtn')?.addEventListener('click', (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    press(button);
    backfireAudio.cta();
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span><span>جاري فتح الشاشة…</span>';
    window.setTimeout(() => { location.href = '/tv'; }, 260);
  });
}

function joinRoom(): void {
  document.body.dataset.route = 'join';
  const code = new URLSearchParams(location.search).get('code') ?? '';
  app.innerHTML = `${header()}<main id="main" class="door join-door" tabindex="-1">
    <section class="door-form" data-reveal>
      <span class="eyebrow">انضمام من الجوال</span>
      <h1>ادخل الغرفة.<br>ولا تكشف شيئًا.</h1>
      <p>اكتب الرمز الظاهر على التلفزيون، ثم الاسم الذي سيراه بقية اللاعبين.</p>
      <label class="field"><span>رمز الغرفة</span><input id="code" class="input mono" placeholder="AB12CD" value="${escapeHtml(code)}" maxlength="12" autocapitalize="characters" autocorrect="off" autocomplete="off" inputmode="text"></label>
      <label class="field"><span>اسم اللاعب</span><input id="name" class="input" placeholder="اسمك" maxlength="20" autocomplete="off"></label>
      <button id="joinbtn" class="btn primary lg wide">انضم إلى الغرفة</button>
      <div id="jerr" class="j-err" role="alert" aria-live="polite"></div>
      <a data-link="/" class="text-link">العودة للرئيسية</a>
    </section>
    <aside class="door-aside">${PhoneMockup('secret')}<div class="door-caption"><span>لك وحدك</span><b>ما تعرفه لا يظهر على الشاشة العامة.</b></div></aside>
  </main>${footer()}`;
  revealPage();
  const codeElement = qs<HTMLInputElement>('#code')!;
  const nameElement = qs<HTMLInputElement>('#name')!;
  (code ? nameElement : codeElement).focus();
  const submit = (): void => {
    const roomCode = codeElement.value.trim();
    const name = nameElement.value.trim();
    if (!roomCode) return fieldError(codeElement, 'اكتب رمز الغرفة');
    if (!name) return fieldError(nameElement, 'اكتب اسمك');
    backfireAudio.cta();
    location.href = `/play?code=${encodeURIComponent(roomCode)}&name=${encodeURIComponent(name)}`;
  };
  qs('#joinbtn')?.addEventListener('click', submit);
  nameElement.addEventListener('keydown', (event) => { if (event.key === 'Enter') submit(); });
  codeElement.addEventListener('keydown', (event) => { if (event.key === 'Enter') nameElement.focus(); });
}

function howToPlay(): void {
  document.body.dataset.route = 'how';
  app.innerHTML = `${header('how')}<main id="main" class="how-noir" tabindex="-1">
    <header class="how-hero" data-reveal>
      <span class="eyebrow">كيف تلعب</span>
      <h1>الشاشة تحكي.<br>الجوالات تخبّي.</h1>
      <p>شاشة واحدة أمام الجميع، وجوال في يد كل لاعب. الشاشة تروي المشهد العام، والجوال يحفظ ما يخصك وحدك. هذي رحلة جولة كاملة من الفتح حتى العاقبة.</p>
    </header>

    <section class="how-needs" data-reveal>
      <div class="how-needs-copy"><span class="eyebrow">ما تحتاجونه</span><h2>تجهيز بسيط،<br>بلا تحميل.</h2><p>شاشة كبيرة يراها الجميع، وجوال لكل لاعب على نفس الشبكة. لا حسابات ولا تطبيقات.</p></div>
      <ul class="how-need-list">
        <li><b>١</b><span>شاشة أو تلفاز</span><small>تعرض المشهد العام ورمز الدخول.</small></li>
        <li><b>٤–٨</b><span>جوالات اللاعبين</span><small>كل جوال يحمل معلومة وقرارًا سريًّا.</small></li>
        <li><b>١٥–٢٥</b><span>دقيقة للمباراة</span><small>ثلاث جولات، وكل جولة تتذكّر ما قبلها.</small></li>
      </ul>
    </section>

    <div class="how-steps">
      <article class="how-step" data-reveal><span class="n">01</span><div><h3>افتح الغرفة على الشاشة</h3><p>أنشئ الغرفة من تلفاز أو متصفح كبير يراه الجميع، فيظهر رمز الغرفة و QR.</p></div>${stepArt('room')}</article>
      <article class="how-step" data-reveal><span class="n">02</span><div><h3>ادخلوا بمسح الرمز</h3><p>كل لاعب يمسح رمز QR أو يكتب الكود من جواله — بلا تسجيل ولا انتظار.</p></div>${stepArt('scan')}</article>
      <article class="how-step" data-reveal><span class="n">03</span><div><h3>استلم معلوماتك السرية</h3><p>تصل لكل جوال بطاقة خاصة لا يراها غيره: دور، أو معلومة، أو ورقة ضغط.</p></div>${stepArt('secret')}</article>
      <article class="how-step" data-reveal><span class="n">04</span><div><h3>ناقشوا وتشاوروا</h3><p>الكلام على الطاولة: وعود، وتحالفات، ونصف حقائق. اللعبة الحقيقية بينكم لا في جوالكم.</p></div>${stepArt('discuss')}</article>
      <article class="how-step" data-reveal><span class="n">05</span><div><h3>اتخذ قرارك سرًّا</h3><p>تقفل حركتك على جوالك بعيدًا عن العيون، وتبقى مخفية حتى تكشفها الشاشة.</p></div>${stepArt('decide')}</article>
      <article class="how-step" data-reveal><span class="n">06</span><div><h3>واجه العاقبة… ثم تذكّرها</h3><p>النتيجة تظهر أمام الجميع على الشاشة، وقرارك يُحفظ ليعود ضدك أو لك في جولة قادمة.</p></div>${stepArt('return')}</article>
    </div>

    <section class="how-endgame on-dark" data-reveal>
      <div class="how-endgame-inner">
        <div class="he-copy"><span class="eyebrow">النهاية</span><h2>كل شيء مترابط.<br><em>وكل قرار يُحسب.</em></h2><p>بعد ثلاث جولات، تجمع الشاشة كل ما فعلتموه: من التزم بوعده، ومن انقلب، ومن نجا لأن قرارًا قديمًا عاد في اللحظة الصح. الفائز ليس الأذكى في جولة، بل من قرأ العواقب قبل أن تقع.</p></div>
        <ul class="he-facts">
          <li><b>٣</b><span>جولات متصلة</span></li>
          <li><b>سري</b><span>القرار حتى الكشف</span></li>
          <li><b>يعود</b><span>أثر كل قرار</span></li>
        </ul>
      </div>
    </section>

    <section class="how-tips" data-reveal>
      <span class="eyebrow">لأفضل جلسة</span>
      <div class="how-tips-grid">
        <article><b>اجلسوا بحيث الشاشة أمام الجميع</b><p>المشهد العام هو مرجعكم المشترك — خلّوه واضحًا لكل اللاعبين.</p></article>
        <article><b>احموا جوالكم</b><p>ما على جوالك يخصك وحدك. نظرة واحدة تكفي لتكشف سرًّا يقلب الجولة.</p></article>
        <article><b>تكلّموا… واكذبوا بذكاء</b><p>النقاش سلاح. الوعد والاتهام والصمت كلها قرارات لها عواقب.</p></article>
      </div>
    </section>

    <section class="how-faq" data-reveal>
      <div class="faq-list wide">
        <h2>أسئلة سريعة</h2>
        <details open><summary>كم لاعبًا نحتاج؟</summary><p>من ٤ إلى ٨ لاعبين، وكل لاعب على جواله. أفضل توتر يبدأ من ٥ لاعبين.</p></details>
        <details><summary>هل نحتاج تحميل تطبيق أو حساب؟</summary><p>لا. اللعبة تعمل من المتصفح على الشاشة والجوال، بلا تسجيل دخول.</p></details>
        <details><summary>كم تستغرق المباراة؟</summary><p>غالبًا ١٥–٢٥ دقيقة على ثلاث جولات. تقدرون تلعبون أكثر من جولة متتالية.</p></details>
        <details><summary>وش يصير لو انقطع اتصال أحدهم؟</summary><p>يقدر يرجع لنفس المقعد بنفس معلوماته السرية عبر إعادة الاتصال، من غير خلط الأوراق.</p></details>
      </div>
    </section>

    <div class="how-cta" data-reveal><h2>والباقي عليكم.</h2><div class="hero-cta"><a data-link="/create" class="btn primary lg">ابدأ لعبة</a><a data-link="/join" class="btn ghost lg">انضم بكود</a></div></div>
  </main>${footer()}`;
  bindPageMotion();
}

function stepArt(kind: string): string {
  const s = (inner: string): string => `<svg class="step-art" viewBox="0 0 120 78" aria-hidden="true">${inner}</svg>`;
  const R = '#b3202d';
  const G = '#707075';
  const L = '#38383d';
  switch (kind) {
    case 'room': return s(`<rect x="16" y="12" width="88" height="48" rx="4" fill="none" stroke="${G}" stroke-width="2"/><rect x="52" y="62" width="16" height="4" fill="${L}"/><rect x="44" y="66" width="32" height="3" fill="${L}"/>`);
    case 'scan': return s(`<path d="M22 30 V20 H32 M88 20 H98 V30 M98 48 V58 H88 M32 58 H22 V48" fill="none" stroke="${G}" stroke-width="2"/><line x1="32" y1="39" x2="88" y2="39" stroke="${R}" stroke-width="2"/>`);
    case 'secret': return s(`<rect x="34" y="12" width="52" height="54" fill="${L}"/><rect x="44" y="32" width="32" height="8" fill="${R}"/><rect x="44" y="46" width="20" height="5" fill="${G}"/>`);
    case 'discuss': return s(`<rect x="18" y="20" width="42" height="28" rx="5" fill="none" stroke="${G}" stroke-width="2"/><path d="M30 48 l0 8 8 -8z" fill="${G}"/><rect x="62" y="34" width="40" height="26" rx="5" fill="none" stroke="${R}" stroke-width="2"/><path d="M90 60 l0 7 -7 -7z" fill="${R}"/><line x1="26" y1="30" x2="50" y2="30" stroke="${G}" stroke-width="2"/><line x1="70" y1="44" x2="94" y2="44" stroke="${R}" stroke-width="2"/>`);
    case 'decide': return s(`<rect x="36" y="14" width="48" height="50" rx="6" fill="none" stroke="${G}" stroke-width="2"/><rect x="44" y="24" width="14" height="12" rx="2" fill="none" stroke="${G}" stroke-width="1.6"/><rect x="62" y="24" width="14" height="12" rx="2" fill="${R}"/><rect x="44" y="46" width="32" height="8" rx="2" fill="${R}"/>`);
    case 'return': return s(`<path d="M28 42 C 50 18 80 20 92 38 C 99 48 90 58 78 52" fill="none" stroke="${R}" stroke-width="2.4" stroke-linecap="round"/><path d="M78 52 l11 -2 -3 10z" fill="${R}"/><circle cx="28" cy="42" r="3.4" fill="${R}"/>`);
    default: return s('');
  }
}

function fieldError(element: HTMLElement, message: string): void {
  element.classList.add('err');
  const error = qs('#jerr');
  if (error) error.textContent = message;
  backfireAudio.error();
  if (!reduced()) element.animate({ transform: ['translateX(-6px)', 'translateX(5px)', 'translateX(0)'] }, { duration: 180 });
  window.setTimeout(() => element.classList.remove('err'), 700);
}

function bindPageMotion(): void {
  revealPage();
  qsa<HTMLElement>('.btn.primary').forEach((button) => button.addEventListener('pointerenter', () => backfireAudio.cta(), { once: true }));
}

function revealPage(): void {
  const observer = observeReveal();
  cleanups.push(() => observer.disconnect());
}

function modesRoute(path: string): void {
  document.body.dataset.route = 'modes';
  const page = renderModesPage(path, location.search);
  updateMeta(page.title, page.description);
  app.innerHTML = `${header(page.active)}${page.html}${footer()}`;
  page.bind?.(go, render);
  bindPageMotion();
}

function productRoute(path: string): void {
  document.body.dataset.route = 'product';
  const page = renderProductPage(path, location.search);
  updateMeta(rebrandVisibleText(page.title), rebrandVisibleText(page.description));
  app.innerHTML = `${header(page.active)}${rebrandVisibleText(page.html)}${footer()}`;
  page.bind?.(go, render);
  revealPage();
}

function updateMeta(title: string, description: string): void {
  document.title = `${SITE_BRAND} — ${title}`;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'canonical' }));
  canonical.href = new URL(location.pathname, configuredPublicOrigin || location.origin).href;
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', canonical.href);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  const preview = new URL(SOCIAL_PREVIEW_PATH, configuredPublicOrigin || location.origin).href;
  document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.setAttribute('content', preview);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.setAttribute('content', preview);
}

function bindChrome(): void {
  const head = qs<HTMLElement>('#site-head');
  const onScroll = (): void => { head?.classList.toggle('scrolled', scrollY > 12); };
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
  cleanups.push(() => removeEventListener('scroll', onScroll));
  const menu = qs<HTMLButtonElement>('#menu');
  const panel = qs<HTMLElement>('#mpanel');
  const close = (): void => { if (panel) panel.hidden = true; menu?.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); };
  menu?.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!panel) return;
    panel.hidden = !panel.hidden;
    menu.setAttribute('aria-expanded', String(!panel.hidden));
    document.body.classList.toggle('menu-open', !panel.hidden);
  });
  const outside = (event: Event): void => { const target = event.target as Node; if (!panel?.contains(target) && !menu?.contains(target)) close(); };
  const escape = (event: KeyboardEvent): void => { if (event.key === 'Escape') { close(); menu?.focus(); } };
  document.addEventListener('click', outside);
  document.addEventListener('keydown', escape);
  cleanups.push(() => document.removeEventListener('click', outside), () => document.removeEventListener('keydown', escape));
}

function bindNetworkNotice(): void {
  const paint = (): void => {
    qs('#network-notice')?.remove();
    if (navigator.onLine) return;
    const banner = document.createElement('div');
    banner.id = 'network-notice';
    banner.className = 'network-notice';
    banner.setAttribute('role', 'status');
    banner.textContent = 'أنت غير متصل — إنشاء الغرف والانضمام يحتاجان اتصالًا بالإنترنت.';
    document.body.append(banner);
  };
  addEventListener('online', paint);
  addEventListener('offline', paint);
  paint();
  cleanups.push(() => { removeEventListener('online', paint); removeEventListener('offline', paint); qs('#network-notice')?.remove(); });
}

queueMicrotask(render);
