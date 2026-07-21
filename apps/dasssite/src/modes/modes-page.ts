import { escapeHtml } from '@dass/ui';
import { availabilityLabel, type GameMode, MODES, modeById, modeFamily } from './catalog.js';
import { modeCover } from './covers.js';

export interface ModesPage {
  active: string;
  title: string;
  description: string;
  html: string;
  bind?: (navigate: (path: string) => void, refresh: () => void) => void;
}

const h = escapeHtml;

const ICON = {
  players: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M16 6.2a3 3 0 0 1 0 5.6"/><path d="M18 14.5c1.9.5 3.5 2.2 3.5 4.5"/></svg>',
  duration: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2"/><path d="M9 2h6"/></svg>',
  intensity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
} as const;

function availabilityTag(mode: GameMode): string {
  return `<span class="mode-flag ${mode.availability}">${availabilityLabel(mode.availability)}</span>`;
}

function metaRow(mode: GameMode): string {
  return `<ul class="mode-meta" aria-label="مواصفات الطور">
    <li>${ICON.players}<span>${h(mode.players)}</span></li>
    <li>${ICON.duration}<span>${h(mode.duration)}</span></li>
    <li>${ICON.intensity}<span>${h(mode.intensity)}</span></li>
  </ul>`;
}

function primaryAction(mode: GameMode): string {
  if (mode.availability === 'playable') return `<a class="btn primary" data-link="${mode.playRoute}">ابدأ لعبة</a>`;
  if (mode.availability === 'waitlist') return `<button class="btn primary mode-waitlist" type="button" data-mode="${mode.id}">أضفني لقائمة الانتظار</button>`;
  return '<button class="btn primary" type="button" disabled>قريبًا</button>';
}

/**
 * Mode-detail CTA. Payment only ever appears AFTER a mode is selected and only for a
 * mode that is really playable + priced. Coming-soon / anime concepts never reach checkout.
 * All current modes are either free (majlis) or coming-soon, so the "اشتر الطور" branch is
 * wired but dormant until a real paid+playable mode ships — no fake charge, no fake ownership.
 */
function detailAction(mode: GameMode): string {
  if (mode.availability !== 'playable') return primaryAction(mode);
  const paid = mode.price !== '' && mode.price !== 'مجاني' && !mode.priceNote;
  if (paid) return `<a class="btn primary" data-link="/checkout?kind=mode&id=${mode.id}">اشتر الطور</a>`;
  return `<a class="btn primary" data-link="${mode.playRoute}">ابدأ بهذا الطور</a>`;
}

function featuredCard(mode: GameMode): string {
  return `<article class="mode-featured" style="--accent:${mode.accent}">
    <a class="mode-featured-art" data-link="/modes/mode?id=${mode.id}" aria-label="استعرض ${h(mode.name)}">${modeCover(mode.id, mode.accent)}</a>
    <div class="mode-featured-copy">
      <div class="mode-flags">${availabilityTag(mode)}<span class="mode-code" dir="ltr">${h(mode.codename)}</span></div>
      <h2>${h(mode.name)}</h2>
      <p class="mode-premise">${h(mode.premise)}</p>
      ${metaRow(mode)}
      <p class="mode-hook"><span>الخبيئة</span>${h(mode.hook)}</p>
      <div class="mode-actions">${primaryAction(mode)}<a class="btn ghost" data-link="/modes/mode?id=${mode.id}">استعرض الطور</a></div>
    </div>
  </article>`;
}

function portalCard(mode: GameMode): string {
  const anime = modeFamily(mode) === 'anime';
  // Anime concepts are pure previews: no numeric price, no active start button — just the pressure.
  const foot = anime
    ? `<p class="mode-hook mode-hook-sm"><span>الضغط</span>${h(mode.hook)}</p><button class="btn primary" type="button" disabled>قريبًا</button>`
    : `<div class="mode-card-foot"><div class="mode-price">${mode.availability === 'playable'
        ? `<b>${h(mode.price)}</b>${mode.priceNote ? `<span>${h(mode.priceNote)}</span>` : ''}`
        : `<b>${h(mode.price)}</b><span>${availabilityLabel(mode.availability)}</span>`}</div>${primaryAction(mode)}</div>`;
  return `<article class="mode-card ${mode.availability}${anime ? ' anime' : ''}" style="--accent:${mode.accent}" data-mode="${mode.id}">
    <a class="mode-card-art" data-link="/modes/mode?id=${mode.id}" aria-label="استعرض ${h(mode.name)}">
      ${modeCover(mode.id, mode.accent)}
      <span class="mode-enter">استعرض الطور</span>
    </a>
    <div class="mode-card-body">
      <div class="mode-flags">${availabilityTag(mode)}<span class="mode-code" dir="ltr">${h(mode.codename)}</span></div>
      <h3><a data-link="/modes/mode?id=${mode.id}">${h(mode.name)}</a></h3>
      <p class="mode-premise">${h(mode.premise)}</p>
      ${metaRow(mode)}
      ${foot}
    </div>
  </article>`;
}

function modesGallery(): ModesPage {
  const live = MODES.filter((mode) => modeFamily(mode) === 'live');
  const original = MODES.filter((mode) => modeFamily(mode) === 'original');
  const anime = MODES.filter((mode) => modeFamily(mode) === 'anime');
  const featured = live[0] ?? MODES[0]!;
  const extraLive = live.slice(1);
  const html = `<main id="main-content" class="product-page modes-page" tabindex="-1">
    <header class="product-hero"><div>
      <span class="eyebrow">أطوار BACKFIRE</span>
      <h1>عوالم تُلعب،<br>لا تُشترى.</h1>
      <p>كل طور عالم بقواعده وتوتره، بس القلب واحد: معلومة مخبّأة، قرار سرّي، وعاقبة ترجع.</p>
    </div></header>
    <aside class="modes-note" role="note"><span class="demo-dot"></span><div><b>طور واحد يُلعب الحين، والباقي معاينة</b><span>الأطوار القادمة أفكار بصرية — بلا شراء ولا تفعيل، وبلا زر «ابدأ». نبيّنها عشان تشوف وين رايحة اللعبة.</span></div></aside>

    <section class="modes-section modes-section-live" aria-labelledby="sec-live">
      <div class="modes-section-head"><span class="modes-section-tag live">متاح الآن</span><h2 id="sec-live">ابدأ من هنا</h2><p>الطور الأساسي — أول ما تلعبونه، ومجاني ضمن اللعبة.</p></div>
      ${featuredCard(featured)}
      ${extraLive.length ? `<section class="modes-grid">${extraLive.map(portalCard).join('')}</section>` : ''}
    </section>

    <section class="modes-section modes-section-original" aria-labelledby="sec-original">
      <div class="modes-section-head"><span class="modes-section-tag">قريبًا</span><h2 id="sec-original">أطوار BACKFIRE الأصلية</h2><p>عوالم أصلية من صميم اللعبة — كل واحد يقلب قاعدة ويرفع التوتر.</p></div>
      <section class="modes-grid">${original.map(portalCard).join('')}</section>
    </section>

    <section class="modes-section modes-section-anime" aria-labelledby="sec-anime">
      <div class="modes-section-head"><span class="modes-section-tag anime">مستوحى من الأنمي — قريبًا</span><h2 id="sec-anime">عوالم مستوحاة من الأنمي</h2><p>أفكار طور نأخذ إلهامها من أجواء أنميات معروفة، ونحوّلها لضغط BACKFIRE. معاينة فقط — بلا شراء.</p></div>
      <section class="modes-grid">${anime.map(portalCard).join('')}</section>
    </section>

    <section class="modes-store-link">
      <div><span class="eyebrow">تخصيص</span><h2>تبغى تغيّر شكل الجلسة؟</h2><p>مظاهر وإطارات ومؤثرات عرض اختيارية — تجميلية بس، بلا أي أفضلية باللعب.</p></div>
    </section>
  </main>`;
  return {
    active: 'modes', title: 'الأطوار', description: 'عوالم BACKFIRE — طور متاح الآن، أطوار أصلية قادمة، وعوالم مستوحاة من الأنمي.', html,
    bind: bindWaitlist,
  };
}

function beatList(mode: GameMode): string {
  return `<ol class="mode-beats">${mode.beats.map((beat) => `<li><b class="beat-mark" aria-hidden="true"></b><span>${h(beat)}</span></li>`).join('')}</ol>`;
}

function modeDetail(search: string): ModesPage {
  const mode = modeById(new URLSearchParams(search).get('id') ?? '');
  if (!mode) {
    return {
      active: 'modes', title: 'الطور غير موجود', description: 'لم نجد هذا الطور.',
      html: `<main id="main-content" class="product-page" tabindex="-1"><section class="empty-state panel"><span class="empty-glyph">؟</span><h2>هذا الطور غير موجود</h2><p>يمكن أن الرابط تغيّر. ارجع لصفحة الأطوار واختر عالمًا.</p><a class="btn primary" data-link="/modes">كل الأطوار</a></section></main>`,
    };
  }
  const html = `<main id="main-content" class="product-page mode-detail-page" tabindex="-1" style="--accent:${mode.accent}">
    <a class="mode-back" data-link="/modes">← كل الأطوار</a>
    <section class="mode-detail">
      <div class="mode-detail-art panel">${modeCover(mode.id, mode.accent)}<div class="mode-detail-art-cap">${availabilityTag(mode)}<span class="mode-code" dir="ltr">${h(mode.codename)}</span></div></div>
      <div class="mode-detail-copy">
        <h1>${h(mode.name)}</h1>
        <p class="mode-detail-premise">${h(mode.premise)}</p>
        <p class="mode-hook"><span>الخبيئة</span>${h(mode.hook)}</p>
        <p class="mode-brief">${h(mode.brief)}</p>
        <dl class="mode-detail-meta">
          <div><dt>اللاعبون</dt><dd>${h(mode.players)}</dd></div>
          <div><dt>المدة</dt><dd>${h(mode.duration)}</dd></div>
          <div><dt>التوتر</dt><dd>${h(mode.intensity)}</dd></div>
          <div><dt>الحالة</dt><dd>${availabilityLabel(mode.availability)}</dd></div>
        </dl>
        <div class="mode-detail-price"><b>${h(mode.price)}</b>${mode.priceNote ? `<span>${h(mode.priceNote)}</span>` : mode.availability !== 'playable' ? '<span>لا شراء فعلي بعد</span>' : ''}</div>
        <div class="mode-actions">${detailAction(mode)}<a class="btn ghost" data-link="/how-to-play">كيف تُلعب الأطوار</a></div>
        <p class="mode-waitlist-note" hidden role="status"></p>
      </div>
    </section>
    <section class="mode-round">
      <div class="mode-round-head"><span class="eyebrow">كيف تمرّ الجولة</span><h2>ثلاث لحظات في ${h(mode.name)}</h2><p>معاينة إيقاع — الطور لسه ما نزل.</p></div>
      ${beatList(mode)}
    </section>
  </main>`;
  return { active: 'modes', title: mode.name, description: mode.premise, html, bind: bindWaitlist };
}

function bindWaitlist(): void {
  document.querySelectorAll<HTMLButtonElement>('.mode-waitlist').forEach((button) => {
    button.addEventListener('click', () => {
      button.disabled = true;
      button.classList.add('on');
      button.textContent = 'في قائمة انتظارك ✓';
      const note = document.querySelector<HTMLElement>('.mode-waitlist-note');
      if (note) { note.hidden = false; note.textContent = 'هذه معاينة محلية — التسجيل الفعلي في قائمة الانتظار يبدأ عند إطلاق الطور. لم نرسل أي بيانات.'; }
    });
  });
}

/** A featured-modes band for the home page — a rail of portals into /modes. */
export function modesHomeSection(): string {
  const live = MODES.filter((mode) => modeFamily(mode) === 'live');
  const original = MODES.filter((mode) => modeFamily(mode) === 'original');
  const anime = MODES.filter((mode) => modeFamily(mode) === 'anime');
  const featured = [...live.slice(0, 1), ...original.slice(0, 2), ...anime.slice(0, 2)];
  return `<section class="home-modes on-dark" data-reveal>
    <div class="home-modes-head">
      <span class="eyebrow">عوالم BACKFIRE</span>
      <h2>طور واحد يبدأ الليلة.<br><em>وعوالم كثيرة على الطريق.</em></h2>
      <p>نفس القلب — معلومة مخبّأة وقرار سرّي وعاقبة ترجع — بس كل عالم يغيّر القاعدة والتوتر: أطوار أصلية، وعوالم مستوحاة من الأنمي.</p>
    </div>
    <div class="home-modes-rail">
      ${featured.map((mode) => `<a class="home-mode" data-link="/modes/mode?id=${mode.id}" style="--accent:${mode.accent}" aria-label="استعرض ${h(mode.name)}">
        <span class="home-mode-art">${modeCover(mode.id, mode.accent)}</span>
        <span class="home-mode-cap"><span class="mode-flag ${mode.availability}">${availabilityLabel(mode.availability)}</span><b>${h(mode.name)}</b><small dir="ltr">${h(mode.codename)}</small></span>
      </a>`).join('')}
    </div>
    <div class="home-modes-cta"><a class="btn ghost lg" data-link="/modes">استكشف كل الأطوار</a></div>
  </section>`;
}

export const MODES_PATHS = new Set(['/modes', '/modes/mode']);

export function renderModesPage(path: string, search = ''): ModesPage {
  if (path === '/modes/mode') return modeDetail(search);
  return modesGallery();
}
