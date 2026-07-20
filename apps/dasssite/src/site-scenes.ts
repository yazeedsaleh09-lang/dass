// Original editorial-noir artwork for BACKFIRE. No AI, no stock, no photography, no
// device mockups. Pure SVG built from three recurring motifs:
//   1. The Return Line  — a decision leaves, travels, and comes back to its source.
//   2. Partial Windows  — apertures that reveal only fragments of a larger scene.
//   3. Misaligned Shadow — an offset echo: a consequence larger than the act.

export const NOIR = {
  black: '#080808', ink: '#0c0c0d', charcoal: '#151517', graphite: '#222226',
  lead: '#3a3a40', steel: '#66666d', gray: '#808088', muted: '#9a9a9f',
  paper: '#f0efea', paperShadow: '#d8d6d0', white: '#fafaf7',
  red: '#b72e38', redDark: '#811c25', redSoft: '#c8454d',
} as const;

// A faceless cut-paper bust (used by the locked Consequence/Final scenes).
function bust(fill: string): string {
  return `<circle cx="50" cy="62" r="26" fill="${fill}"/><path d="M4 150 C4 110 27 96 50 96 C73 96 96 110 96 150 Z" fill="${fill}"/>`;
}
function place(x: number, y: number, s: number, inner: string): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
}
function rect(x: number, y: number, w: number, h: number, fill: string, extra = ''): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra ? ' ' + extra : ''}/>`;
}

// A varied faceless silhouette — head size, turn, shoulder width and lean all change,
// so a group reads as distinct people rather than repeated user icons.
interface Pose { hr?: number; hx?: number; hy?: number; sw?: number; rise?: number; neck?: number }
function silhouette(fill: string, o: Pose = {}): string {
  const hr = o.hr ?? 24;
  const hx = o.hx ?? 50;
  const hy = o.hy ?? 62;
  const sw = o.sw ?? 92;
  const rise = o.rise ?? 0;
  const neck = o.neck ?? 98;
  const l = 50 - sw / 2;
  const r = 50 + sw / 2;
  const body = `M${l} 152 C${l} ${neck + 24 + rise} ${l + 20} ${neck + rise} ${hx} ${neck} C${r - 20} ${neck - rise} ${r} ${neck + 24 - rise} ${r} 152 Z`;
  return `<circle cx="${hx}" cy="${hy}" r="${hr}" fill="${fill}"/><path d="${body}" fill="${fill}"/>`;
}
function person(x: number, y: number, s: number, fill: string, o: Pose = {}): string {
  return place(x, y, s, silhouette(fill, o));
}

// ---------------------------------------------------------------- HERO ----
// One unified scene: a council of distinct people around a single lit table. The lit
// player (muted, not white) lays a red decision on the table; a thin red line leaves
// it, crosses the table, and returns to its source.
export function HeroScene(): string {
  return `<svg class="scene hero-scene" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid meet" role="img" aria-label="مجلس من أشخاص مختلفين حول طاولة مضاءة، أحدهم يضع قرارًا أحمر وخط أحمر يخرج منه عبر الطاولة ويعود إليه">
    <!-- far players first, then the table occludes their lower bodies -->
    ${person(258, 250, 0.94, NOIR.lead, { hx: 44, sw: 82, hr: 22 })}
    ${person(420, 236, 0.98, NOIR.steel, { hr: 25, sw: 98, rise: -6 })}
    ${person(586, 240, 0.94, NOIR.lead, { hx: 57, sw: 88 })}
    ${person(732, 254, 0.9, NOIR.steel, { rise: 10, sw: 84 })}
    <!-- table -->
    <ellipse cx="492" cy="452" rx="384" ry="108" fill="${NOIR.ink}"/>
    <ellipse cx="492" cy="444" rx="368" ry="98" fill="${NOIR.charcoal}"/>
    <ellipse cx="492" cy="432" rx="300" ry="66" fill="none" stroke="${NOIR.lead}" stroke-width="1.4" opacity=".55"/>
    <!-- near players in front of the table -->
    ${person(666, 372, 1.3, NOIR.steel, { sw: 108, hr: 26, rise: 6 })}
    ${person(300, 388, 1.42, NOIR.muted, { rise: 16, hx: 58, sw: 96 })}
    <!-- the lit player's decision on the table + the return line -->
    <rect x="398" y="452" width="38" height="20" rx="2" fill="${NOIR.red}" transform="rotate(-9 417 462)"/>
    <path class="return-line rl-draw" pathLength="1" d="M414 452 C 548 378 690 380 742 424 C 790 466 742 392 656 396 C 552 400 476 432 398 470" fill="none" stroke="${NOIR.red}" stroke-width="2.2" stroke-linecap="round"/>
    <circle class="rl-src" cx="414" cy="452" r="5.5" fill="${NOIR.red}"/>
    <path class="rl-head" d="M398 470 l30 -14 -2 30z" fill="${NOIR.red}"/>
  </svg>`;
}

// ---------------------------------------------------------------- POSTER 01 ----
// One continuous scene — two people over a decision on a table, and a red clue — seen
// through THREE separate openings (a vertical slit on one person, a horizontal band on
// the table, a small window on the other person + the clue). The fragments belong to
// the same picture, so "no one sees it whole" reads even without the text.
export function IncompleteScene(): string {
  const win = [
    { x: 78, y: 104, w: 148, h: 286 },   // vertical → person A
    { x: 150, y: 398, w: 402, h: 96 },   // horizontal → the table + decision
    { x: 452, y: 208, w: 150, h: 158 },  // small → person B + red clue
  ];
  return `<svg class="scene incomplete-scene" viewBox="0 0 660 560" preserveAspectRatio="xMidYMid meet" role="img" aria-label="مشهد واحد بين شخصين وقرار على طاولة ودليل أحمر، لا يظهر إلا عبر ثلاث فتحات منفصلة تكشف أجزاءً من الصورة نفسها">
    <defs>
      <mask id="inc-mask"><rect width="660" height="560" fill="#000"/>${win.map((w) => rect(w.x, w.y, w.w, w.h, '#fff')).join('')}</mask>
      <filter id="inc-sh" x="-15%" y="-15%" width="130%" height="140%"><feDropShadow dx="0" dy="9" stdDeviation="7" flood-color="#0c0c0d" flood-opacity=".34"/></filter>
    </defs>
    <g filter="url(#inc-sh)"><g mask="url(#inc-mask)">
      <rect width="660" height="560" fill="${NOIR.black}"/>
      ${person(40, 92, 2.42, NOIR.steel, { hx: 56, sw: 96, rise: 8 })}
      ${person(392, 150, 2.0, NOIR.lead, { hx: 44, sw: 90 })}
      ${rect(36, 452, 592, 13, NOIR.lead)}
      ${rect(228, 410, 84, 44, NOIR.muted)}
      ${rect(318, 412, 72, 42, NOIR.steel)}
      ${rect(486, 300, 56, 62, NOIR.red)}
    </g></g>
    ${win.map((w) => `<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="none" stroke="${NOIR.ink}" stroke-width="2"/>`).join('')}
    <line x1="452" y1="184" x2="602" y2="184" stroke="${NOIR.red}" stroke-width="3"/>
  </svg>`;
}

// ---------------------------------------------------------------- POSTER 02 ----
// One public scene — a row of distinct players all seeing the same thing — with a
// single narrow slit cut over one player that exposes a small red private detail. No
// scan rectangle, no UI; an editorial reveal.
export function PrivateScene(): string {
  const slit = { x: 286, y: 214, w: 46, h: 214 };
  return `<svg class="scene private-scene" viewBox="0 0 640 520" preserveAspectRatio="xMidYMid meet" role="img" aria-label="صفّ من لاعبين مختلفين يرون المشهد نفسه، وشقّ ضيّق فوق أحدهم يكشف تفصيلًا أحمر خاصًّا لا يراه الباقون">
    <defs><clipPath id="pv-slit"><rect x="${slit.x}" y="${slit.y}" width="${slit.w}" height="${slit.h}"/></clipPath></defs>
    <rect x="34" y="430" width="572" height="30" fill="${NOIR.ink}"/>
    ${person(70, 230, 1.34, NOIR.steel, { sw: 100, hr: 26 })}
    ${person(240, 224, 1.4, NOIR.steel, { sw: 92, hr: 24, rise: 6 })}
    ${person(414, 232, 1.3, NOIR.steel, { hx: 57, sw: 96 })}
    ${person(548, 244, 1.12, NOIR.lead, { sw: 84, rise: -6 })}
    <!-- the slit: exposes the second player's private red mark -->
    <g clip-path="url(#pv-slit)">
      ${person(240, 224, 1.4, NOIR.muted, { sw: 92, hr: 24, rise: 6 })}
      <rect class="pv-secret" x="${slit.x}" y="352" width="${slit.w}" height="58" fill="${NOIR.red}"/>
      <rect class="pv-secret" x="${slit.x}" y="340" width="${slit.w}" height="10" fill="${NOIR.redSoft}"/>
    </g>
    <line x1="${slit.x}" y1="${slit.y}" x2="${slit.x}" y2="${slit.y + slit.h}" stroke="${NOIR.paper}" stroke-width="2" opacity=".85"/>
    <line x1="${slit.x + slit.w}" y1="${slit.y}" x2="${slit.x + slit.w}" y2="${slit.y + slit.h}" stroke="${NOIR.paper}" stroke-width="2" opacity=".85"/>
  </svg>`;
}

// ---------------------------------------------------------------- CONSEQUENCE (locked) ----
export function ConsequenceScene(): string {
  return `<svg class="scene consequence-scene" viewBox="0 0 1000 580" preserveAspectRatio="xMidYMid meet" role="img" aria-label="ظل يمثل صاحب القرار، خط أحمر يخرج منه ويضرب شخصًا آخر، ثم يعود ليقع عليه كظل أثقل ومنحرف">
    ${place(70, 214, 2.02, bust(NOIR.graphite))}
    ${place(120, 250, 1.78, bust(NOIR.steel))}
    <rect x="150" y="262" width="42" height="8" rx="1" fill="${NOIR.paper}" opacity=".85"/>
    ${place(560, 300, 1.5, bust(NOIR.lead))}
    <circle class="cs-impact" cx="632" cy="392" r="12" fill="${NOIR.red}"/>
    <path class="cs-shadow" d="M250 358 C 420 316 520 340 632 392 C 770 456 856 356 762 300 C 700 264 560 300 250 452" fill="none" stroke="${NOIR.graphite}" stroke-width="12" stroke-linecap="round" transform="translate(14 16)"/>
    <path class="cs-line rl-draw" pathLength="1" d="M250 358 C 420 316 520 340 632 392 C 770 456 856 356 762 300 C 700 264 560 300 250 452" fill="none" stroke="${NOIR.red}" stroke-width="2.8" stroke-linecap="round"/>
    <path class="cs-return" d="M300 430 C 270 442 250 448 234 452" fill="none" stroke="${NOIR.red}" stroke-width="5.4" stroke-linecap="round"/>
    <circle class="cs-src" cx="250" cy="358" r="8" fill="${NOIR.redSoft}"/>
    <path class="cs-head" d="M234 452 l30 -20 3 32z" fill="${NOIR.red}"/>
  </svg>`;
}

// ---------------------------------------------------------------- FINAL (locked) ----
export function FinalScene(): string {
  return `<svg class="scene final-scene" viewBox="0 0 900 520" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <path class="fs-shadow" d="M452 120 C 690 120 760 300 620 400 C 470 508 250 470 220 320 C 196 200 320 150 470 176" fill="none" stroke="${NOIR.graphite}" stroke-width="12" stroke-linecap="round" transform="translate(14 16)"/>
    <path class="fs-line rl-draw" pathLength="1" d="M450 108 C 690 108 762 292 620 392 C 466 502 244 462 216 312 C 194 196 322 142 470 168" fill="none" stroke="${NOIR.red}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="450" cy="108" r="7" fill="${NOIR.redSoft}"/>
    <path class="fs-head" d="M470 168 l-30 -14 2 30z" fill="${NOIR.red}"/>
  </svg>`;
}
