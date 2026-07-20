import { qrSvg } from '@dass/ui';

// Static, hand-composed recreations of the real dass TV + Player interface language,
// used ONLY in the product-reality and create/join scenes. Colours come from the
// site theme variables — never AI art, never raster screenshots.

export type PhoneState = 'secret' | 'decision' | 'waiting' | 'backfire' | 'join';
export type TvState = 'lobby' | 'round' | 'reveal' | 'consequence';

const demoJoinUrl = '/play?code=BF24X7';

// A restrained identity palette for player avatars (kept neutral/warm, no cold hues).
const AVATARS = ['#b3202d', '#7e151e', '#8a4a2e', '#5c5c60', '#a3a3a5', '#d24850'];
function avatar(seat: number): string {
  return AVATARS[seat % AVATARS.length] ?? '#b3202d';
}
function seatDot(initial: string, seat: number, cls = ''): string {
  return `<span class="p-av ${cls}" style="--av:${avatar(seat)}">${initial}</span>`;
}

const ICN = {
  support: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V7"/><path d="M6 13l6-6 6 6"/></svg>`,
  attack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v13"/><path d="M6 11l6 6 6-6"/></svg>`,
  vault: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2.5"/><circle cx="12" cy="12" r="3.4"/><path d="M12 12v3.6"/></svg>`,
} as const;

function ring(pct: number): string {
  return `<span class="gs-ring" style="--p:${pct}"></span>`;
}

export function secretBody(eyebrow: string, lead: string, note: string): string {
  return `<div class="scr scr-secret"><span class="scr-eyebrow">${eyebrow}</span><p class="scr-lead">${lead}</p><div class="scr-seal"><span class="seal-mark"></span><span>${note}</span></div></div>`;
}

// ---------------------------------------------------------------- TV screens ----
export function GameScreenPreview(state: TvState = 'round'): string {
  if (state === 'lobby') {
    return `<div class="game-screen tv-lobby-screen" data-product-screen="tv-lobby">
      <header class="gs-hud"><span class="gs-brand">BACKFIRE</span><span class="gs-chip live">غرفة مفتوحة</span></header>
      <div class="lobby-body">
        <div class="lobby-qr">${qrSvg(demoJoinUrl, '#0d0d0e', '#f1f0ec', 2)}</div>
        <div class="lobby-join"><small>امسح الرمز من جوالك أو اكتبه</small><strong dir="ltr">BF24X7</strong><span class="lobby-count">٤ / ٨ جاهزين</span></div>
      </div>
      <div class="lobby-roster">${seatDot('ي', 0)}${seatDot('ن', 1)}${seatDot('س', 2)}${seatDot('ر', 3)}${seatDot('٥', 4, 'ghost')}${seatDot('٦', 5, 'ghost')}</div>
    </div>`;
  }
  if (state === 'reveal') {
    return `<div class="game-screen tv-reveal-screen" data-product-screen="tv-reveal">
      <header class="gs-hud"><span class="gs-brand">BACKFIRE</span><span class="gs-phase">الكشف</span><span class="gs-round mono" dir="ltr">4 / 8</span></header>
      <div class="reveal-list">
        <article class="rv dassa">${seatDot('ن', 1)}<div class="rv-copy"><small>نورة وعدت أن تدعم يزيد</small><b>غيّرت قرارها في السر</b></div><em class="rv-tag dassa">دسّة</em></article>
        <article class="rv kept">${seatDot('ي', 0)}<div class="rv-copy"><small>يزيد ثبّت قراره</small><b>التزم بوعده للمجلس</b></div><em class="rv-tag kept">التزم</em></article>
      </div>
      <footer class="reveal-foot"><span>الأثر التالي</span><strong>المسار رجع إلى نورة</strong></footer>
    </div>`;
  }
  if (state === 'consequence') {
    return `<div class="game-screen tv-conseq-screen" data-product-screen="tv-consequence">
      <header class="gs-hud"><span class="gs-brand">BACKFIRE</span><span class="gs-phase">النتيجة العامة</span><span class="gs-round mono" dir="ltr">4 / 8</span></header>
      <div class="conseq-body"><span class="conseq-eyebrow">تغيّر إيقاع الغرفة</span><h3>سقطت خزنة راكان،<br><em>وارتفع رصيد نورة.</em></h3></div>
      <div class="conseq-bars">
        <span class="cb up" style="--h:78%">${seatDot('ن', 1)}<i>+٦</i></span>
        <span class="cb up" style="--h:54%">${seatDot('ي', 0)}<i>+٢</i></span>
        <span class="cb flat" style="--h:40%">${seatDot('س', 2)}<i>٠</i></span>
        <span class="cb down" style="--h:22%">${seatDot('ر', 3)}<i>−٤</i></span>
      </div>
    </div>`;
  }
  return `<div class="game-screen tv-round-screen" data-product-screen="tv-round">
    <header class="gs-hud"><span class="gs-brand">BACKFIRE</span><span class="gs-phase">الإعلان</span><span class="gs-round mono" dir="ltr">3 / 8</span>${ring(0.62)}</header>
    <div class="round-prompt"><small>أعلنوا نيّاتكم على جوالاتكم</small><strong class="round-count" dir="ltr">12</strong></div>
    <div class="round-floor">
      <span class="rf-col"><i class="rf-intent up">${ICN.support}</i><span class="rf-bar" style="--h:70%"></span>${seatDot('ي', 0)}</span>
      <span class="rf-col"><i class="rf-intent"></i><span class="rf-bar" style="--h:48%"></span>${seatDot('ن', 1)}</span>
      <span class="rf-col"><i class="rf-intent dn">${ICN.attack}</i><span class="rf-bar" style="--h:86%"></span>${seatDot('ر', 3)}</span>
      <span class="rf-col"><i class="rf-intent"></i><span class="rf-bar" style="--h:34%"></span>${seatDot('س', 2)}</span>
      <span class="rf-col wait"><i class="rf-intent">◌</i><span class="rf-bar" style="--h:58%"></span>${seatDot('ح', 4)}</span>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- phone screens ----
function phoneChip(state: PhoneState): string {
  const chips: Record<PhoneState, string> = { secret: 'الجولة ٣', decision: 'الإعلان', waiting: 'قُفل', backfire: 'الكشف', join: '' };
  return chips[state] ? `<span class="app-chip">${chips[state]}</span>` : `<span class="app-chip ghost">جوّالك</span>`;
}

function phoneScreen(state: PhoneState): string {
  switch (state) {
    case 'secret':
      return secretBody('معلومة تخصّك وحدك', 'راكان يقدر يغيّر اتجاه القرار بعد ما تُقفلونه.', 'لا أحد غيرك يعرف هذا الآن');
    case 'decision':
      return `<div class="scr scr-pick">
        <span class="scr-eyebrow">أعلن نيّتك</span>
        <div class="pick-acts"><span class="pa up on">${ICN.support}<b>دعم</b></span><span class="pa dn">${ICN.attack}<b>هجوم</b></span><span class="pa gd">${ICN.vault}<b>خزنة</b></span></div>
        <span class="pick-label">أدعم مين؟</span>
        <div class="pick-chips"><span class="pchip on">${seatDot('ي', 0, 'sm')}يزيد</span><span class="pchip">${seatDot('ر', 3, 'sm')}راكان</span><span class="pchip">${seatDot('س', 2, 'sm')}سارة</span></div>
        <span class="scr-confirm">اقفل الفعل</span>
      </div>`;
    case 'waiting':
      return `<div class="scr scr-wait"><span class="wait-seal">${ICN.vault}</span><p class="scr-lead">أقفلت فعلك</p><span class="scr-note">ارفع عينك للتلفاز</span><div class="wait-dots"><i class="on"></i><i class="on"></i><i></i><i class="on"></i></div></div>`;
    case 'backfire':
      return `<div class="scr scr-result"><span class="scr-eyebrow warn">رجع عليك</span><span class="result-arrow" aria-hidden="true">↩</span><p class="scr-lead">المسار الذي عطّلته صار طريقك الوحيد.</p><span class="result-delta" dir="ltr">−4</span><span class="scr-note">الجولة القادمة تغيّرت</span></div>`;
    case 'join':
      return `<div class="scr scr-join"><span class="scr-eyebrow">انضمام</span><b class="scr-title">خشّ المجلس</b><span class="join-field mono" dir="ltr">BF24X7</span><span class="join-field ghost">اسمك</span><span class="scr-confirm">انضم</span></div>`;
  }
}

export function PhoneMockup(state: PhoneState, label?: string, extraClass = '', body?: string): string {
  return `<div class="phone-unit ${state} ${extraClass}" data-product-screen="player-${state}">${label ? `<span class="device-label">${label}</span>` : ''}<div class="phone-shell">
    <span class="phone-island"></span><span class="phone-btn vol"></span><span class="phone-btn pow"></span>
    <div class="phone-screen">
      <div class="app-top"><span class="app-brand"><span class="app-mark"></span><b>BACKFIRE</b></span>${phoneChip(state)}</div>
      <div class="app-body">${body ?? phoneScreen(state)}</div>
    </div>
    <span class="home-ind"></span>
  </div></div>`;
}

export function TvStage(state: TvState = 'round', className = ''): string {
  return `<div class="tv-stage ${className}"><div class="tv-frame"><div class="tv-bezel">${GameScreenPreview(state)}<span class="tv-glare" aria-hidden="true"></span></div><span class="tv-led"></span></div><div class="tv-neck"></div><div class="tv-foot"></div></div>`;
}
