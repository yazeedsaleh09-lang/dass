import {
  COPY,
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

injectBase();
addStyle(siteCss());
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
const SPA = new Set(['/', '/create', '/join', '/how-to-play']);
function go(path: string): void {
  const clean = path.split('?')[0] ?? '/';
  if (SPA.has(clean)) {
    history.pushState({}, '', path);
    render();
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
  const path = location.pathname;
  if (path === '/create') create();
  else if (path === '/join') join();
  else if (path === '/how-to-play') howto();
  else home();
  bindMute();
}
// Defer the first route render until module-level scene data is initialized.
queueMicrotask(render);

// ---------------- shared chrome ----------------
function nav(active = ''): string {
  return `<nav class="nav">
    <a class="nav-logo" data-link="/">${mark(30)}<span class="wordmark g">${COPY.brand}</span></a>
    <div class="nav-links">
      <a data-link="/how-to-play" class="nav-a ${active === 'how' ? 'on' : ''}">كيف تلعب</a>
      <a data-link="/join" class="nav-a ${active === 'join' ? 'on' : ''}">انضم بكود</a>
      <button id="mute" class="icon-btn sm" aria-label="صوت">${uiIcon(sfx.isMuted() ? 'soundOff' : 'soundOn', 18)}</button>
      <a data-link="/create" class="btn primary nav-cta">ابدأ لعبة</a>
    </div>
  </nav>`;
}
function footer(): string {
  return `<footer class="foot" data-reveal>
    <div class="foot-brand">${mark(26)}<span class="wordmark g">${COPY.brand}</span></div>
    <div class="foot-links">
      <a data-link="/how-to-play" class="foot-a">كيف تلعب</a>
      <a data-link="/join" class="foot-a">انضم بكود</a>
      <a data-link="/create" class="foot-a">سوّي غرفة</a>
    </div>
    <div class="foot-cap muted">دسّ · لعبة مجالس · نسخة ٠.١</div>
  </footer>`;
}
function bindMute(): void {
  qs('#mute')?.addEventListener('click', () => {
    sfx.toggle();
    if (!sfx.isMuted()) sfx.press();
    qs('#mute')!.innerHTML = uiIcon(sfx.isMuted() ? 'soundOff' : 'soundOn', 18);
  });
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
  <main class="site">
    <section class="hero" data-mood="calm">
      <div class="hero-bgart" id="heroart">${heroArt()}</div>
      <div class="hero-copy ${firstVisit ? 'intro' : ''}">
        <div class="hero-kicker" data-rc>لعبة مجالس · ٤ إلى ٨ لاعبين</div>
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
  <main class="page center-page">
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
  <main class="page center-page">
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
  app.innerHTML = `${nav('how')}
  <main class="page howto">
    <section class="howto-hero" data-reveal>
      <span class="eyebrow" data-rc>كيف تلعب</span>
      <h1 class="page-title big" data-rc>دسّ… باختصار</h1>
      <p class="muted page-sub" data-rc>لعبة سرية بسيطة: أعلن نيّتك للكل، ثم قرّر بالسر — تلتزم بوعدك أو تدسّها.</p>
    </section>
    <section class="howto-steps">
      ${[
        ['١', 'افتح الغرفة', 'ابدأ لعبة، تطلع الغرفة على الشاشة الكبيرة بكود وQR.'],
        ['٢', 'ادخلوا من الجوال', 'كل لاعب يصوّر الـQR أو يكتب الكود ويحط اسمه.'],
        ['٣', 'أعلن نيّتك', 'كل جولة تعلن: تدعم أحد، تضربه، أو تبيع نفسك.'],
        ['٤', 'دسّها بالسر', 'بعد الإعلان، تقرّر بالسر — نفس وعدك، أو عكسه.'],
        ['٥', 'شوف الأثر', 'الأسهم تتحرك على الشاشة، بدون ما ينكشف الفاعل.'],
        ['٦', 'الكشف النهائي', 'بالنهاية تنفضح كل دسّة، وأكبر خزنة تفوز.'],
      ]
        .map(
          (s) => `<div class="hstep" data-reveal><span class="hstep-n">${s[0]}</span><div><h3>${s[1]}</h3><p class="muted">${s[2]}</p></div></div>`,
        )
        .join('')}
    </section>
    <section class="howto-actions" data-reveal>
      <div class="ha-actions" data-rc>
        <div><b>دعم</b><span class="muted"> — ترفع سهم أحد.</span></div>
        <div><b>ضرب</b><span class="muted"> — توطّي سهم أحد.</span></div>
        <div><b>بيع</b><span class="muted"> — تثبّت مكسبك بالخزنة.</span></div>
      </div>
      <div class="howto-cta" data-rc><a data-link="/create" class="btn primary lg">يلا نبدأ</a><a data-link="/join" class="btn lg">انضم بكود</a></div>
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
    <path class="p-keep" d="M60 90 C160 90 200 120 300 120" stroke="var(--green)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path class="p-keep" d="M60 160 C170 160 210 175 320 175" stroke="var(--green)" stroke-width="5" fill="none" stroke-linecap="round" opacity=".65"/>
    <path class="p-break" d="M60 240 C150 240 190 250 250 250 L300 300 L360 240" stroke="var(--red)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g class="b-nodes"><circle cx="60" cy="90" r="11" fill="var(--surface-3)" stroke="var(--green)" stroke-width="2"/><circle cx="60" cy="160" r="11" fill="var(--surface-3)" stroke="var(--green)" stroke-width="2"/><circle cx="60" cy="240" r="11" fill="var(--surface-3)" stroke="var(--red)" stroke-width="2"/></g>
    <path class="b-crack" d="M280 250 L300 290 L288 300 L316 316" stroke="#fff" stroke-width="2.5" fill="none"/>
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
  .nav{position:sticky;top:0;z-index:var(--z-hud);display:flex;align-items:center;justify-content:space-between;gap:16px;
    padding:14px clamp(16px,4vw,48px);backdrop-filter:blur(12px);background:color-mix(in srgb,var(--bg) 70%,transparent);border-bottom:1px solid var(--line)}
  .nav-logo{display:flex;align-items:center;gap:8px;font-size:24px;text-decoration:none}
  .nav-links{display:flex;align-items:center;gap:clamp(10px,2vw,22px)}
  .nav-a{color:var(--text-2);text-decoration:none;font-weight:700;transition:color var(--t-micro)}
  .nav-a:hover,.nav-a.on{color:var(--text)}
  .nav-cta{min-height:44px;padding:10px 20px;text-decoration:none}
  .icon-btn.sm{width:40px;height:40px}
  @media(max-width:640px){ .nav-a{display:none} }

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

  .cycle{position:relative;height:340vh}
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
  .betray-line{font-size:var(--fs-h3);line-height:1.7;color:var(--text-2);margin-top:14px}

  .final{text-align:center;max-width:900px}
  .final-title{font-size:var(--fs-h1);font-weight:900;margin:0} .final-sub{font-size:var(--fs-h3);color:var(--text-2);margin:14px 0 30px}
  .final-cta{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}

  .foot{max-width:1180px;margin:0 auto;padding:40px clamp(20px,5vw,48px);display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;border-top:1px solid var(--line)}
  .foot-brand{display:flex;align-items:center;gap:8px;font-size:22px} .foot-links{display:flex;gap:20px} .foot-a{color:var(--text-2);text-decoration:none;font-weight:700} .foot-a:hover{color:var(--text)}

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

  @media(max-width:860px){
    .hero{min-height:auto;display:flex;flex-direction:column;text-align:center;padding:42px 18px 70px;gap:18px}
    .hero::after{inset:20px 10px 30px;border-radius:28px}
    .hero-copy{order:1;width:100%;padding:18px 8px 0;background:none;border:0;max-width:620px}
    .hero-bgart{order:2;position:relative;inset:auto;top:auto;transform:none;width:min(92vw,520px);margin-top:6px}
    .hero-sub{margin-inline:auto}.hero-cta{justify-content:center}.scroll-hint{display:none}
    .concept-grid,.betray,.steps-grid{grid-template-columns:1fr}
    .betray-art{order:-1}
  }
  @media(max-width:480px){
    .hero{padding-top:26px}.hero-kicker{margin-bottom:8px}.hero-tag{font-size:clamp(25px,8vw,34px)}
    .hero-sub{font-size:15px;line-height:1.72;margin-bottom:20px}.hero-cta{display:grid;grid-template-columns:1fr 1fr;gap:10px}.hero-cta .btn{padding-inline:12px}
    .hero-bgart{width:min(96vw,430px)}.scene{padding-block:72px}.cycle{height:280vh}
  }
  `;
}
