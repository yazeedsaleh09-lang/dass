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

// A phone held by a player: a dark body with a lit screen. `glow` adds a soft halo so
// the secret/red phone reads as the live one. Screens are the only light the players hold.
function phone(cx: number, cy: number, s: number, rot: number, screen: string, glowId = ''): string {
  const w = 30;
  const h = 60;
  const halo = glowId ? `<ellipse cx="0" cy="0" rx="40" ry="58" fill="${screen}" opacity=".22" filter="url(#${glowId})"/>` : '';
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s})">${halo}<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="6" fill="${NOIR.charcoal}" stroke="${NOIR.lead}" stroke-width="1.4"/><rect x="${-w / 2 + 3.5}" y="${-h / 2 + 6}" width="${w - 7}" height="${h - 12}" rx="3" fill="${screen}"/></g>`;
}

// A small QR-ish glyph on the TV — "scan to join from your phone" without any UI chrome.
function joinGlyph(x: number, y: number, u: number, fill: string): string {
  const cells: Array<[number, number]> = [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2], [4, 0], [4, 2], [1, 4], [3, 4], [4, 4], [0, 4]];
  return cells.map(([cx, cy]) => rect(x + cx * u, y + cy * u, u * 0.8, u * 0.8, fill, 'opacity=".8"')).join('');
}

// ---------------------------------------------------------------- HERO ----
// The living room: five distinct people gathered around ONE lit TV, each holding a
// glowing phone. Faint lines carry every player's decision up to the shared screen; one
// RED decision leaves the central phone, lands on the TV, then loops back down as a
// consequence pointed at the player who sent it. Reads at a glance: group game, one TV,
// many phones, secret decisions, a consequence returning.
export function HeroScene(): string {
  return `<svg class="scene hero-scene" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid meet" role="img" aria-label="غرفة معيشة: خمسة أشخاص حول تلفزيون واحد مضاء، كل واحد يمسك جوالًا، وخط أحمر يخرج من جوال إلى الشاشة ثم يعود كعاقبة نحو صاحبه">
    <defs>
      <radialGradient id="hero-glow" cx="50%" cy="34%" r="60%"><stop offset="0" stop-color="${NOIR.red}" stop-opacity=".22"/><stop offset="1" stop-color="${NOIR.red}" stop-opacity="0"/></radialGradient>
      <linearGradient id="hero-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NOIR.graphite}"/><stop offset="1" stop-color="${NOIR.black}"/></linearGradient>
      <filter id="hero-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="hero-sh" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#000" flood-opacity=".5"/></filter>
      <clipPath id="hero-tv"><rect x="330" y="84" width="340" height="196" rx="6"/></clipPath>
    </defs>
    <!-- ambient light thrown by the TV -->
    <ellipse cx="500" cy="220" rx="380" ry="250" fill="url(#hero-glow)"/>
    <!-- TV: the one shared screen -->
    <rect x="486" y="290" width="28" height="34" fill="${NOIR.graphite}"/>
    <ellipse cx="500" cy="330" rx="78" ry="12" fill="${NOIR.ink}"/>
    <g filter="url(#hero-sh)"><rect x="314" y="70" width="372" height="224" rx="12" fill="${NOIR.charcoal}" stroke="${NOIR.lead}" stroke-width="2"/></g>
    <rect x="330" y="84" width="340" height="196" rx="6" fill="url(#hero-screen)"/>
    <g clip-path="url(#hero-tv)">
      <line x1="330" y1="214" x2="670" y2="214" stroke="${NOIR.steel}" stroke-width="1.4" opacity=".3"/>
      ${person(392, 118, 0.74, NOIR.steel, { hx: 54, sw: 96 })}
      ${person(488, 128, 0.66, NOIR.lead, { hx: 44, sw: 92 })}
      <rect x="470" y="196" width="40" height="22" rx="2" fill="${NOIR.red}" transform="rotate(-8 490 207)"/>
      <circle cx="352" cy="106" r="5" fill="${NOIR.red}"/>
      <rect x="364" y="102" width="26" height="7" rx="2" fill="${NOIR.steel}" opacity=".7"/>
      <rect x="396" y="102" width="16" height="7" rx="2" fill="${NOIR.steel}" opacity=".5"/>
      ${joinGlyph(600, 224, 9, NOIR.muted)}
    </g>
    <!-- the gathered players, seen from behind, facing the TV -->
    ${person(150, 300, 1.3, NOIR.lead, { hx: 52, sw: 88, hr: 22 })}
    ${person(770, 300, 1.3, NOIR.lead, { hx: 48, sw: 88, hr: 22 })}
    ${person(300, 336, 1.5, NOIR.steel, { sw: 96 })}
    ${person(625, 336, 1.5, NOIR.steel, { hx: 54, sw: 96 })}
    ${person(417, 356, 1.66, NOIR.muted, { sw: 100 })}
    <!-- every phone throws a faint decision line up to the shared screen -->
    <g stroke="${NOIR.steel}" stroke-width="1.4" fill="none" opacity=".32" stroke-linecap="round">
      <path d="M240 452 C 340 380 430 320 496 290"/>
      <path d="M362 500 C 410 420 460 340 500 292"/>
      <path d="M640 500 C 592 420 542 340 504 292"/>
      <path d="M760 452 C 660 380 570 320 504 290"/>
    </g>
    <!-- the five phones; the central one is the live red decision -->
    ${phone(240, 466, 0.62, -14, NOIR.muted)}
    ${phone(362, 516, 0.8, -8, NOIR.muted)}
    ${phone(640, 516, 0.8, 9, NOIR.muted)}
    ${phone(760, 466, 0.62, 13, NOIR.muted)}
    ${phone(500, 552, 0.98, 0, NOIR.red, 'hero-soft')}
    <!-- the Return Line: the red decision rises to the TV, then the consequence loops back onto its sender -->
    <path class="cs-shadow" d="M500 524 C 494 452 500 372 500 300 C 500 250 612 246 606 336 C 600 408 546 440 508 452" fill="none" stroke="${NOIR.graphite}" stroke-width="8" stroke-linecap="round" transform="translate(9 12)"/>
    <path class="return-line rl-draw" pathLength="1" d="M500 524 C 494 452 500 372 500 300 C 500 250 612 246 606 336 C 600 408 546 440 508 452" fill="none" stroke="${NOIR.red}" stroke-width="2.6" stroke-linecap="round"/>
    <circle class="rl-src" cx="500" cy="524" r="6" fill="${NOIR.redSoft}"/>
    <path class="rl-head" d="M508 452 l16 -10 4 20z" fill="${NOIR.red}"/>
  </svg>`;
}

// ---------------------------------------------------------------- POSTER 01 ----
// "No one sees the full picture." ONE complete situation exists — a group over a table
// with a red clue — but it is only ever ghosted behind. The lit truth is sliced across
// THREE phones, each held by a different player, with dark gaps between them. Each
// person holds a bright fragment; only one phone carries the red clue; the whole is
// never assembled. The apertures are the Partial Windows motif, distributed by device.
export function IncompleteScene(): string {
  // The single underlying scene, drawn once so every phone fragment aligns to it.
  const truth =
    person(-8, 44, 2.9, NOIR.steel, { hx: 58, sw: 98 }) +
    person(360, 96, 2.6, NOIR.lead, { hx: 42, sw: 92 }) +
    rect(20, 456, 620, 16, NOIR.lead) +
    rect(150, 402, 96, 54, NOIR.muted) +
    rect(300, 406, 84, 50, NOIR.steel) +
    rect(472, 300, 66, 74, NOIR.red);
  // Three device-windows onto that scene. Gaps between them are the missing information.
  const holders = [
    { id: 'a', x: 48, y: 150, w: 150, h: 250, head: 118 },   // ← a person fragment
    { id: 'b', x: 250, y: 250, w: 150, h: 250, head: 220 },  // ← the table + decision
    { id: 'c', x: 452, y: 168, w: 150, h: 250, head: 136 },  // ← the red clue + a person
  ];
  const phoneFragment = (p: (typeof holders)[number]): string => `
    ${person(p.x + p.w / 2 - 42, p.head - 26, 0.84, NOIR.graphite, { sw: 96 })}
    <rect x="${p.x - 9}" y="${p.y - 9}" width="${p.w + 18}" height="${p.h + 18}" rx="15" fill="${NOIR.ink}" stroke="${NOIR.lead}" stroke-width="1.6"/>
    <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="6" fill="${NOIR.black}"/>
    <clipPath id="frag-${p.id}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="6"/></clipPath>
    <g clip-path="url(#frag-${p.id})">${truth}</g>
    <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="6" fill="none" stroke="${NOIR.steel}" stroke-width="1" opacity=".55"/>
    <rect x="${p.x + p.w / 2 - 15}" y="${p.y - 5}" width="30" height="3.4" rx="1.7" fill="${NOIR.lead}"/>`;
  return `<svg class="scene incomplete-scene" viewBox="0 0 660 560" preserveAspectRatio="xMidYMid meet" role="img" aria-label="مشهد واحد كامل مخفيّ في الخلفية، وأجزاؤه موزّعة على ثلاثة جوالات يمسكها ثلاثة لاعبين، بينها فجوات مظلمة، ولا أحد يرى الصورة كاملة">
    <defs>
      <filter id="inc-sh" x="-15%" y="-15%" width="130%" height="140%"><feDropShadow dx="0" dy="9" stdDeviation="7" flood-color="#0c0c0d" flood-opacity=".34"/></filter>
    </defs>
    <rect width="660" height="560" fill="${NOIR.black}"/>
    <!-- the whole truth, present but unlit -->
    <g opacity=".12">${truth}</g>
    <g filter="url(#inc-sh)">${holders.map(phoneFragment).join('')}</g>
    <!-- the picture line that the fragments never fully rebuild -->
    <path d="M52 500 L 240 500" stroke="${NOIR.lead}" stroke-width="2" stroke-dasharray="4 8" opacity=".5"/>
    <path d="M266 500 L 442 500" stroke="${NOIR.lead}" stroke-width="2" stroke-dasharray="4 8" opacity=".5"/>
    <path d="M468 500 L 610 500" stroke="${NOIR.red}" stroke-width="2.4"/>
  </svg>`;
}

// ---------------------------------------------------------------- POSTER 02 ----
// "What you know changes everything." A group stands level, wired together by faint
// neutral ties — the shared, public state. One player's phone lights RED with a private
// message no one else can read; that knowledge lifts them out of the row (stepped
// forward, brighter), snaps their old tie to a neighbour, and redraws a new red line of
// intent across the group. The hidden detail visibly repositions one person.
export function PrivateScene(): string {
  const known = { x: 150, y: 214, s: 1.62 };          // the player who now knows
  const kcx = known.x + 50 * known.s;                 // their head centre-x
  return `<svg class="scene private-scene" viewBox="0 0 640 520" preserveAspectRatio="xMidYMid meet" role="img" aria-label="مجموعة لاعبين مربوطين بخيوط رمادية متساوية، جوال أحدهم يضيء بالأحمر بمعلومة خاصة، فيتقدّم عن الصف ويرسم خطًّا أحمر جديدًا نحو لاعب آخر بينما ينقطع خيطه القديم">
    <defs>
      <filter id="pv-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="8"/></filter>
    </defs>
    <rect x="30" y="452" width="580" height="20" fill="${NOIR.ink}"/>
    <!-- the public, neutral group -->
    ${person(46, 250, 1.12, NOIR.steel, { sw: 92 })}
    ${person(300, 246, 1.16, NOIR.steel, { hx: 52, sw: 94, rise: 4 })}
    ${person(430, 252, 1.12, NOIR.steel, { sw: 90 })}
    ${person(552, 258, 1.02, NOIR.lead, { sw: 84, rise: -6 })}
    <!-- the even ties everyone shares -->
    <g stroke="${NOIR.steel}" stroke-width="1.6" fill="none" opacity=".4" stroke-linecap="round">
      <path d="M103 300 C 180 268 250 268 358 300"/>
      <path d="M486 300 C 520 288 560 288 603 306"/>
    </g>
    <!-- the old tie from the knower to their neighbour — now snapped -->
    <path d="M${kcx} 300 C 300 262 340 262 358 300" fill="none" stroke="${NOIR.lead}" stroke-width="1.6" stroke-dasharray="5 9" opacity=".45"/>
    <!-- the knower steps forward, brighter -->
    ${person(known.x, known.y, known.s, NOIR.muted, { hx: 52, sw: 96 })}
    <!-- the private red info, on their phone only -->
    <ellipse class="pv-secret" cx="${kcx + 40}" cy="360" rx="34" ry="46" fill="${NOIR.red}" opacity=".2" filter="url(#pv-soft)"/>
    ${phoneReveal(kcx + 40, 360)}
    <!-- the new intent the knowledge creates: a red line redrawn across the group -->
    <path class="rl-draw" pathLength="1" d="M${kcx + 40} 348 C 360 300 470 300 560 320" fill="none" stroke="${NOIR.red}" stroke-width="2.6" stroke-linecap="round"/>
    <path class="rl-head" d="M560 320 l-18 -6 4 20z" fill="${NOIR.red}"/>
    <circle class="rl-src" cx="${kcx + 40}" cy="348" r="5" fill="${NOIR.redSoft}"/>
  </svg>`;
}

// A phone turned toward its owner, its screen showing a private red mark no one else sees.
function phoneReveal(cx: number, cy: number): string {
  return `<g transform="translate(${cx} ${cy}) rotate(-8)"><rect x="-19" y="-38" width="38" height="76" rx="7" fill="${NOIR.charcoal}" stroke="${NOIR.lead}" stroke-width="1.6"/><rect class="pv-secret" x="-14" y="-31" width="28" height="62" rx="3" fill="${NOIR.red}"/><rect class="pv-secret" x="-8" y="-18" width="16" height="6" rx="2" fill="${NOIR.white}" opacity=".85"/><rect class="pv-secret" x="-8" y="-6" width="24" height="5" rx="2" fill="${NOIR.white}" opacity=".6"/></g>`;
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
