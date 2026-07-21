// Original editorial-noir cover art for BACKFIRE game modes ("worlds").
// No AI, no stock, no photography. Pure SVG built from the same three motifs used
// across the site — the Return Line, Partial Windows, and the Misaligned Shadow —
// re-composed per world so each mode reads as a distinct place you step into.
//
// Every cover shares the black / graphite / paper base and carries ONE per-world
// accent, so the set feels like one system of doorways rather than six unrelated
// pictures. Covers are static (one drop-shadow at most) to stay cheap to paint.

const N = {
  black: '#080808', ink: '#0c0c0d', charcoal: '#151517', graphite: '#222226',
  lead: '#3a3a40', steel: '#66666d', gray: '#808088', muted: '#9a9a9f',
  paper: '#efece4', white: '#fafaf7',
} as const;

interface Pose { hr?: number; hx?: number; hy?: number; sw?: number; rise?: number; neck?: number }
function silhouette(fill: string, o: Pose = {}): string {
  const hr = o.hr ?? 24, hx = o.hx ?? 50, hy = o.hy ?? 62, sw = o.sw ?? 92, rise = o.rise ?? 0, neck = o.neck ?? 98;
  const l = 50 - sw / 2, r = 50 + sw / 2;
  const body = `M${l} 152 C${l} ${neck + 24 + rise} ${l + 20} ${neck + rise} ${hx} ${neck} C${r - 20} ${neck - rise} ${r} ${neck + 24 - rise} ${r} 152 Z`;
  return `<circle cx="${hx}" cy="${hy}" r="${hr}" fill="${fill}"/><path d="${body}" fill="${fill}"/>`;
}
function person(x: number, y: number, s: number, fill: string, o: Pose = {}): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">${silhouette(fill, o)}</g>`;
}
function frame(accent: string): string {
  // A thin inner keyline that reads as the edge of a doorway/portal.
  return `<rect x="14" y="14" width="472" height="572" fill="none" stroke="${accent}" stroke-width="1.4" opacity=".38"/>`;
}

// Shared <defs>: a soft cast shadow + a low vignette so covers sit in their own light.
function defs(accent: string, id: string): string {
  return `<defs>
    <linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${N.charcoal}"/><stop offset="1" stop-color="${N.black}"/></linearGradient>
    <radialGradient id="glow-${id}" cx="50%" cy="34%" r="62%"><stop offset="0" stop-color="${accent}" stop-opacity=".26"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <filter id="sh-${id}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#000" flood-opacity=".45"/></filter>
  </defs>`;
}

// A phone held by a player: dark body, lit screen — the private device beside the TV.
function phone(cx: number, cy: number, s: number, rot: number, screen: string): string {
  const w = 26, h = 52;
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="5" fill="${N.charcoal}" stroke="${N.lead}" stroke-width="1.2"/><rect x="${-w / 2 + 3}" y="${-h / 2 + 5}" width="${w - 6}" height="${h - 10}" rx="2" fill="${screen}"/></g>`;
}

// A small QR-ish glyph on the TV — "scan to join from your phone."
function joinGlyph(x: number, y: number, u: number, fill: string): string {
  const cells: Array<[number, number]> = [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2], [4, 0], [4, 2], [1, 4], [3, 4], [4, 4], [0, 4]];
  return cells.map(([cx, cy]) => `<rect x="${x + cx * u}" y="${y + cy * u}" width="${u * 0.8}" height="${u * 0.8}" fill="${fill}" opacity=".8"/>`).join('');
}

// ---- THE ORIGINAL / المجلس — the living room: one TV, five phones, the return line ----
// Same art direction as the homepage hero, re-framed vertical for a mode cover: five
// people gathered around a single lit TV, each holding a phone, one decision leaving a
// phone for the shared screen and looping back on its sender.
function majlis(accent: string): string {
  const id = 'mode-majlis';
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="غرفة معيشة: خمسة أشخاص حول تلفزيون واحد مضاء، كل واحد يمسك جوالًا، وخط ملوّن يخرج من جوال إلى الشاشة ويعود إلى صاحبه">
    ${defs(accent, id)}
    <rect width="500" height="600" fill="url(#sky-${id})"/><rect width="500" height="600" fill="url(#glow-${id})"/>
    <!-- the one shared TV -->
    <rect x="118" y="290" width="24" height="30" fill="${N.graphite}"/>
    <ellipse cx="250" cy="322" rx="70" ry="11" fill="${N.ink}"/>
    <g filter="url(#sh-${id})"><rect x="112" y="64" width="276" height="168" rx="10" fill="${N.charcoal}" stroke="${N.lead}" stroke-width="2"/></g>
    <rect x="124" y="76" width="252" height="144" rx="6" fill="${N.ink}"/>
    <clipPath id="tv-${id}"><rect x="124" y="76" width="252" height="144" rx="6"/></clipPath>
    <g clip-path="url(#tv-${id})">
      ${person(176, 96, 0.6, N.steel, { hx: 54, sw: 96 })}
      ${person(250, 104, 0.54, N.lead, { hx: 44, sw: 92 })}
      <rect x="236" y="164" width="34" height="18" rx="2" fill="${accent}" transform="rotate(-8 253 173)"/>
      <circle cx="144" cy="96" r="4" fill="${accent}"/>
      <rect x="154" y="93" width="22" height="6" rx="2" fill="${N.steel}" opacity=".7"/>
      ${joinGlyph(322, 168, 8, N.muted)}
    </g>
    <!-- five people gathered around it, from behind -->
    ${person(60, 250, 0.95, N.lead, { hx: 46, sw: 84 })}
    ${person(345, 250, 0.95, N.lead, { hx: 54, sw: 84 })}
    ${person(30, 322, 1.16, N.steel, { sw: 94 })}
    ${person(355, 322, 1.16, N.steel, { hx: 54, sw: 94 })}
    ${person(178, 352, 1.36, N.muted, { sw: 96 })}
    <!-- each phone throws a faint decision line up to the screen -->
    <g stroke="${N.steel}" stroke-width="1.2" fill="none" opacity=".3" stroke-linecap="round">
      <path d="M140 342 C 190 300 230 262 250 232"/>
      <path d="M112 440 C 170 360 220 280 248 230"/>
      <path d="M388 440 C 330 360 280 280 252 230"/>
      <path d="M360 342 C 310 300 270 262 250 232"/>
    </g>
    <!-- the phones; the central one is the live decision -->
    ${phone(140, 352, 0.5, -12, N.muted)}
    ${phone(360, 352, 0.5, 12, N.muted)}
    ${phone(110, 456, 0.66, -10, N.muted)}
    ${phone(390, 456, 0.66, 10, N.muted)}
    ${phone(246, 500, 0.86, 0, accent)}
    <!-- the return line: decision rises to the TV, consequence loops back to its sender -->
    <path d="M246 478 C 244 400 250 300 250 232 C 250 190 330 190 326 270 C 322 340 290 372 258 384" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="246" cy="478" r="5" fill="${accent}"/>
    <path d="M258 384 l16 -10 4 20z" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}

// ---- THE CLASS / الصف — a tense classroom: a grid of desks, one marked, a monitor's slit ----
function classroom(accent: string): string {
  const id = 'mode-class';
  const slit = { x: 300, y: 150, w: 52, h: 300 };
  let desks = '';
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const x = 96 + c * 116, y = 300 + r * 96;
      const marked = r === 1 && c === 1;
      desks += person(x - 26, y - 128, 0.62, marked ? accent : N.lead, { sw: 88 });
      desks += `<rect x="${x - 34}" y="${y}" width="68" height="14" rx="2" fill="${marked ? accent : N.graphite}"/>`;
      desks += `<rect x="${x - 30}" y="${y + 14}" width="60" height="26" fill="${N.ink}"/>`;
    }
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="صفّ دراسي من طاولات وطلاب، أحدهم معلّم بالأحمر، يُرى جزء منه عبر شقّ مراقبة">
    ${defs(accent, id)}
    <rect width="500" height="600" fill="url(#sky-${id})"/><rect width="500" height="600" fill="url(#glow-${id})"/>
    <!-- chalkboard -->
    <rect x="70" y="70" width="360" height="150" rx="4" fill="${N.ink}" stroke="${N.lead}" stroke-width="2"/>
    <line x1="110" y1="120" x2="300" y2="120" stroke="${N.steel}" stroke-width="2" opacity=".6"/>
    <line x1="110" y1="150" x2="250" y2="150" stroke="${N.steel}" stroke-width="2" opacity=".45"/>
    <path d="M330 108 C 372 96 392 128 356 150" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M356 150 l10 -12 4 14z" fill="${accent}"/>
    <g filter="url(#sh-${id})">${desks}</g>
    <!-- the monitor's slit exposes one column brighter -->
    <g clip-path="url(#clip-${id})"><rect x="${slit.x}" y="${slit.y}" width="${slit.w}" height="${slit.h}" fill="${accent}" opacity=".08"/></g>
    <clipPath id="clip-${id}"><rect x="${slit.x}" y="${slit.y}" width="${slit.w}" height="${slit.h}"/></clipPath>
    <line x1="${slit.x}" y1="${slit.y}" x2="${slit.x}" y2="${slit.y + slit.h}" stroke="${N.paper}" stroke-width="1.6" opacity=".5"/>
    <line x1="${slit.x + slit.w}" y1="${slit.y}" x2="${slit.x + slit.w}" y2="${slit.y + slit.h}" stroke="${N.paper}" stroke-width="1.6" opacity=".5"/>
    ${frame(accent)}
  </svg>`;
}

// ---- SIEGE / الحصار — a city as vertical bars, a red perimeter arc closing in ----
function siege(accent: string): string {
  const id = 'mode-siege';
  const heights = [210, 300, 160, 360, 250, 420, 300, 190, 340, 240, 300];
  let city = '';
  heights.forEach((h, i) => {
    const x = 60 + i * 38, lit = i === 5;
    city += `<rect x="${x}" y="${520 - h}" width="30" height="${h}" fill="${lit ? N.graphite : N.ink}" stroke="${N.lead}" stroke-width="1"/>`;
    // a few lit windows
    for (let wy = 520 - h + 16; wy < 500; wy += 34) {
      const on = lit && wy < 520 - h + 120;
      city += `<rect x="${x + 8}" y="${wy}" width="6" height="10" fill="${on ? accent : N.steel}" opacity="${on ? '.9' : '.35'}"/>`;
      city += `<rect x="${x + 18}" y="${wy}" width="6" height="10" fill="${N.steel}" opacity=".28"/>`;
    }
  });
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="أفق مدينة من أبراج مظلمة، برج واحد مضاء، وقوس أحمر يطبق حول المدينة">
    ${defs(accent, id)}
    <rect width="500" height="600" fill="url(#sky-${id})"/><rect width="500" height="600" fill="url(#glow-${id})"/>
    <g filter="url(#sh-${id})">${city}</g>
    <rect x="0" y="518" width="500" height="82" fill="${N.black}"/>
    <!-- the closing perimeter -->
    <path d="M-20 470 C 120 430 260 520 640 430" fill="none" stroke="${accent}" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>
    <path d="M-10 520 C 150 500 320 560 520 500" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" opacity=".4"/>
    <circle cx="250" cy="497" r="5" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}

// ---- BLACKOUT / العتمة — a grid of windows mostly dark, one red, a failing line ----
function blackout(accent: string): string {
  const id = 'mode-blackout';
  let grid = '';
  const litR = 2, litC = 3;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 5; c++) {
      const x = 66 + c * 78, y = 92 + r * 74, lit = r === litR && c === litC;
      grid += `<rect x="${x}" y="${y}" width="56" height="52" fill="${lit ? accent : N.ink}" opacity="${lit ? '.92' : '1'}" stroke="${N.lead}" stroke-width="1"/>`;
      if (lit) grid += person(x + 6, y - 6, 0.4, N.black, { sw: 96 });
      else if ((r + c) % 3 === 0) grid += `<rect x="${x + 10}" y="${y + 12}" width="36" height="4" fill="${N.steel}" opacity=".22"/>`;
    }
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="واجهة مبنى من نوافذ مظلمة، نافذة واحدة مضاءة بالأحمر، وخط طاقة ينقطع">
    ${defs(accent, id)}
    <rect width="500" height="600" fill="${N.black}"/><rect width="500" height="600" fill="url(#glow-${id})"/>
    <g filter="url(#sh-${id})">${grid}</g>
    <!-- the failing power line: a jagged return that snaps toward the one lit room -->
    <path d="M40 60 L 120 60 L 150 96 L 210 96 L 236 150" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="40" cy="60" r="5" fill="${accent}"/>
    <path d="M236 150 l-12 -4 2 14z" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}

// ---- ORBIT / المدار — a station ring, a decaying orbit arc, one sealed module ----
function orbit(accent: string): string {
  const id = 'mode-orbit';
  let modules = '';
  const cx = 250, cy = 300, R = 150;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, sealed = i === 2;
    modules += `<rect x="${x - 20}" y="${y - 16}" width="40" height="32" rx="4" transform="rotate(${(a * 180) / Math.PI + 90} ${x} ${y})" fill="${sealed ? accent : N.graphite}" stroke="${N.steel}" stroke-width="1.4"/>`;
    if (!sealed) modules += `<circle cx="${x}" cy="${y}" r="3" fill="${N.muted}"/>`;
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="محطة فضائية على شكل حلقة، وحدة واحدة مغلقة بالأحمر، ومدار متهاوٍ">
    ${defs(accent, id)}
    <rect width="500" height="600" fill="url(#sky-${id})"/><rect width="500" height="600" fill="url(#glow-${id})"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${N.lead}" stroke-width="18"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${N.steel}" stroke-width="1.4" opacity=".5"/>
    <circle cx="${cx}" cy="${cy}" r="58" fill="${N.ink}" stroke="${N.lead}" stroke-width="2"/>
    <g filter="url(#sh-${id})">${modules}</g>
    <!-- decaying orbit: a red arc spiralling outward and breaking -->
    <path d="M250 300 m0 -${R + 34} a ${R + 34} ${R + 34} 0 1 1 -2 0" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="6 10" opacity=".85"/>
    <circle cx="${cx}" cy="${cy - R - 34}" r="5" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}

// ---- THE GUEST / النزيل — a hotel facade, one door ajar with red light, a key returning ----
function hotel(accent: string): string {
  const id = 'mode-hotel';
  let doors = '';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const x = 74 + c * 96, y = 96 + r * 108, ajar = r === 2 && c === 2;
      doors += `<rect x="${x}" y="${y}" width="64" height="86" rx="3" fill="${N.ink}" stroke="${N.lead}" stroke-width="1.4"/>`;
      if (ajar) {
        doors += `<rect x="${x}" y="${y}" width="30" height="86" rx="3" fill="${accent}" opacity=".85"/>`;
        doors += `<path d="M${x + 30} ${y} L ${x + 44} ${y + 10} L ${x + 44} ${y + 78} L ${x + 30} ${y + 86} Z" fill="${N.charcoal}"/>`;
      } else {
        doors += `<circle cx="${x + 52}" cy="${y + 46}" r="3" fill="${N.steel}"/>`;
        doors += `<rect x="${x + 12}" y="${y + 14}" width="40" height="3" fill="${N.steel}" opacity=".3"/>`;
      }
    }
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="واجهة فندق من أبواب مغلقة، باب واحد موارب يتسرب منه ضوء أحمر، ومفتاح يعود على خيط">
    ${defs(accent, id)}
    <rect width="500" height="600" fill="url(#sky-${id})"/><rect width="500" height="600" fill="url(#glow-${id})"/>
    <g filter="url(#sh-${id})">${doors}</g>
    <!-- a key on a return line, arriving back at the ajar door -->
    <path d="M420 70 C 300 40 150 70 300 300" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <circle cx="420" cy="70" r="8" fill="none" stroke="${accent}" stroke-width="3"/><rect x="416" y="78" width="8" height="20" fill="${accent}"/><rect x="416" y="92" width="14" height="4" fill="${accent}"/>
    <path d="M300 300 l-10 -8 -2 16z" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Anime-inspired concept covers. Same editorial-noir language (Return Line,
// Partial Windows, Misaligned Shadow) recomposed per concept. NO characters,
// logos, screenshots or copied symbols — only original abstract geometry.
// ═══════════════════════════════════════════════════════════════════════════

// ---- THE LAST WALL / هجوم العمالقة — a defensive wall, a looming threat, a red breach ----
function attackOnTitan(accent: string): string {
  const id = 'mode-aot';
  // brick courses across the lower half
  let wall = '';
  const wallTop = 322, courseH = 34, brickW = 66;
  for (let r = 0; r < 6; r++) {
    const y = wallTop + r * courseH;
    const off = r % 2 ? -brickW / 2 : 0;
    for (let c = -1; c < 9; c++) {
      const x = 30 + off + c * brickW;
      wall += `<rect x="${x}" y="${y}" width="${brickW - 5}" height="${courseH - 5}" rx="2" fill="${N.graphite}" stroke="${N.lead}" stroke-width="1"/>`;
    }
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="جدار حجري يحمي مجموعة، وكتلة تهديد ضخمة خلفه، وثغرة حمراء تكسر الجدار">
    ${defs(accent, id)}
    <rect width="500" height="600" fill="url(#sky-${id})"/><rect width="500" height="600" fill="url(#glow-${id})"/>
    <!-- the looming external threat: a vast dark mass rising behind the wall -->
    <path d="M40 322 C 90 150 180 70 250 70 C 320 70 410 150 460 322 Z" fill="${N.ink}" opacity=".92"/>
    <circle cx="214" cy="196" r="7" fill="${accent}" opacity=".8"/>
    <circle cx="286" cy="196" r="7" fill="${accent}" opacity=".8"/>
    <path d="M224 236 C 240 248 260 248 276 236" fill="none" stroke="${N.lead}" stroke-width="3" stroke-linecap="round"/>
    <!-- the wall -->
    <g filter="url(#sh-${id})">${wall}</g>
    <!-- structural damage: a black breach punched through the courses -->
    <path d="M236 322 L214 400 L246 452 L212 530 L296 530 L266 452 L294 400 L272 322 Z" fill="${N.black}"/>
    <path d="M236 322 L214 400 L246 452 L212 530" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M272 322 L294 400 L266 452 L296 530" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- tiny defenders on the wall top -->
    ${person(120, 268, 0.34, N.steel, { sw: 96 })}
    ${person(352, 268, 0.34, N.steel, { sw: 96 })}
    ${person(60, 300, 0.3, N.muted, { sw: 96 })}
    <!-- the red consequence line: the threat crosses the wall and reaches a defender -->
    <path d="M250 236 C 250 300 190 300 150 330 C 120 352 130 396 96 300" fill="none" stroke="${accent}" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="250" cy="236" r="5" fill="${accent}"/>
    <path d="M96 300 l-2 -18 12 8z" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}

// ---- THE TRUST GAME / لعبة الأصدقاء — a watched circle, trust lines, one broken ----
function tomodachiGame(accent: string): string {
  const id = 'mode-tomo';
  const cx = 250, cy = 360, R = 150;
  const n = 6, betrayer = 4;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + Math.PI / 2;
    return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * (R * 0.78), i };
  });
  // trust lines between neighbours around the circle
  let links = '';
  for (let i = 0; i < n; i++) {
    const a = pts[i]!, b = pts[(i + 1) % n]!;
    const broken = a.i === betrayer || b.i === betrayer;
    links += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${broken ? accent : N.steel}" stroke-width="${broken ? 2 : 1.2}" opacity="${broken ? '.9' : '.32'}" ${broken ? 'stroke-dasharray="5 7"' : ''}/>`;
  }
  const seats = pts.map((p) => p.i === betrayer
    ? person(p.x - 22, p.y - 40, 0.4, accent, { sw: 94 })
    : person(p.x - 22, p.y - 40, 0.4, N.lead, { sw: 94 })).join('');
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="حلقة أصدقاء تحت عين مراقبة، خطوط ثقة تربطهم، وخط واحد أحمر مقطوع لواحد يخفي قراره">
    ${defs(accent, id)}
    <rect width="500" height="600" fill="url(#sky-${id})"/><rect width="500" height="600" fill="url(#glow-${id})"/>
    <!-- the observing eye above, casting a cone over the circle -->
    <path d="M250 96 L120 300 L380 300 Z" fill="${accent}" opacity=".05"/>
    <ellipse cx="250" cy="96" rx="46" ry="24" fill="${N.ink}" stroke="${N.lead}" stroke-width="2"/>
    <circle cx="250" cy="96" r="12" fill="${N.charcoal}" stroke="${accent}" stroke-width="2"/>
    <circle cx="250" cy="96" r="4" fill="${accent}"/>
    <!-- trust lines, then the seated group -->
    <g>${links}</g>
    <g filter="url(#sh-${id})">${seats}</g>
    <!-- the private contradiction: a phone by the highlighted seat with a diverging mark -->
    ${phone(pts[betrayer]!.x + 30, pts[betrayer]!.y + 8, 0.6, 14, accent)}
    ${frame(accent)}
  </svg>`;
}

// ---- THE GAMBLE / كايجي — a rising staircase of stakes, a narrowing edge, a return drop ----
function kaiji(accent: string): string {
  const id = 'mode-kaiji';
  let steps = '';
  let tokens = '';
  const base = 470;
  for (let i = 0; i < 6; i++) {
    const x = 70 + i * 62, h = 60 + i * 46, w = 58;
    steps += `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="${i === 5 ? N.graphite : N.ink}" stroke="${N.lead}" stroke-width="1.4"/>`;
    // a growing stack of wager tokens on each step
    for (let t = 0; t <= i; t++) {
      tokens += `<ellipse cx="${x + w / 2}" cy="${base - h - 6 - t * 9}" rx="17" ry="5.5" fill="${t === i && i >= 3 ? accent : N.charcoal}" stroke="${N.steel}" stroke-width="1"/>`;
    }
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="درج صاعد من الرهانات المتزايدة ينتهي بحافة ضيقة، وخط أحمر يصعد ثم يرجع هابطًا إلى لاعب وحيد">
    ${defs(accent, id)}
    <rect width="500" height="600" fill="url(#sky-${id})"/><rect width="500" height="600" fill="url(#glow-${id})"/>
    <g filter="url(#sh-${id})">${steps}</g>
    ${tokens}
    <!-- the narrowing edge at the top -->
    <path d="M442 64 L470 64 L470 178 L442 200 Z" fill="${N.black}"/>
    <line x1="442" y1="64" x2="442" y2="200" stroke="${accent}" stroke-width="2" opacity=".7"/>
    <!-- lone player at the foot of the climb -->
    ${person(38, 372, 0.62, N.muted, { sw: 92 })}
    <!-- the risk line: climbs the stairs, narrows, then loops back down onto the player -->
    <path d="M92 462 L132 462 L154 416 L194 416 L216 370 L256 370 L278 300 L318 300 L340 236 L400 200
             C 470 168 470 300 300 320 C 150 338 120 392 92 452" fill="none" stroke="${accent}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="92" cy="462" r="5" fill="${accent}"/>
    <path d="M92 452 l-8 -12 16 -2z" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}

// ---- THE COMMAND / كود غياس — a commander node, directed order-paths, one reversing ----
function codeGeass(accent: string): string {
  const id = 'mode-geass';
  const cx = 250, cy = 300, R = 178;
  const n = 6;
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, i };
  });
  const reversed = 3;
  let paths = '';
  let dots = '';
  nodes.forEach((p) => {
    const rev = p.i === reversed;
    // command arrow from centre out to each ally (reversed one points back in)
    const from = rev ? p : { x: cx, y: cy };
    const to = rev ? { x: cx, y: cy } : p;
    const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.14;
    const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.14;
    paths += `<path d="M${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}" fill="none" stroke="${rev ? accent : N.steel}" stroke-width="${rev ? 2.4 : 1.4}" opacity="${rev ? '.9' : '.42'}" ${rev ? 'stroke-dasharray="6 6"' : ''}/>`;
    const ang = Math.atan2(to.y - my, to.x - mx);
    dots += `<path transform="translate(${to.x} ${to.y}) rotate(${(ang * 180) / Math.PI})" d="M0 0 l-11 -5 l0 10z" fill="${rev ? accent : N.steel}" opacity="${rev ? '.95' : '.5'}"/>`;
    dots += `<circle cx="${p.x}" cy="${p.y}" r="16" fill="${rev ? accent : N.graphite}" stroke="${N.lead}" stroke-width="1.6"/>`;
  });
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="عقدة قيادة مركزية تصدر أوامر لعقد حليفة حولها، وأمر واحد أحمر ينعكس راجعًا إلى المركز">
    ${defs(accent, id)}
    <rect width="500" height="600" fill="url(#sky-${id})"/><rect width="500" height="600" fill="url(#glow-${id})"/>
    <g>${paths}</g>
    <g filter="url(#sh-${id})">${dots}</g>
    <!-- the hidden order at the centre: a command sigil -->
    <circle cx="${cx}" cy="${cy}" r="42" fill="${N.ink}" stroke="${accent}" stroke-width="2.4"/>
    <circle cx="${cx}" cy="${cy}" r="24" fill="none" stroke="${accent}" stroke-width="1.6" opacity=".6"/>
    <path d="M${cx} ${cy - 30} L${cx} ${cy + 30} M${cx - 30} ${cy} L${cx + 30} ${cy}" stroke="${accent}" stroke-width="1.6" opacity=".7"/>
    <circle cx="${cx}" cy="${cy}" r="6" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}

// ---- THE CURSE / جوجوتسو كايسن — a persistent mark, energy absorbed then returning ----
function jujutsuKaisen(accent: string): string {
  const id = 'mode-jjk';
  const cx = 250, cy = 320;
  // converging absorption lines from the edges toward the centre
  let absorb = '';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = cx + Math.cos(a) * 210, y = cy + Math.sin(a) * 230;
    absorb += `<path d="M${x} ${y} Q ${cx + Math.cos(a) * 90} ${cy + Math.sin(a) * 90} ${cx} ${cy}" fill="none" stroke="${N.steel}" stroke-width="1.2" opacity=".3"/>`;
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="علامة لعنة ثابتة على شخص، طاقة تُمتصّ نحوه ثم تُحوّل وترجع إليه عبر قوس متأخّر">
    ${defs(accent, id)}
    <rect width="500" height="600" fill="url(#sky-${id})"/><rect width="500" height="600" fill="url(#glow-${id})"/>
    <!-- the cursed field: converging energy + concentric rings -->
    <g>${absorb}</g>
    <circle cx="${cx}" cy="${cy}" r="120" fill="none" stroke="${accent}" stroke-width="1.2" opacity=".24"/>
    <circle cx="${cx}" cy="${cy}" r="84" fill="none" stroke="${accent}" stroke-width="1.2" opacity=".34"/>
    <!-- the marked figure -->
    <g filter="url(#sh-${id})">${person(cx - 40, cy - 96, 0.72, N.charcoal, { sw: 92 })}</g>
    <!-- the persistent mark on its owner -->
    <path d="M${cx - 16} ${cy - 44} L${cx + 16} ${cy - 44} M${cx} ${cy - 60} L${cx} ${cy - 28} M${cx - 12} ${cy - 56} L${cx + 12} ${cy - 32} M${cx + 12} ${cy - 56} L${cx - 12} ${cy - 32}" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>
    <!-- the delayed return: power leaves, curves wide, and comes back to its owner -->
    <path d="M${cx} ${cy - 40} C ${cx + 150} ${cy - 120} ${cx + 200} ${cy + 120} ${cx + 40} ${cy + 150} C ${cx - 60} ${cy + 168} ${cx - 40} ${cy + 60} ${cx} ${cy + 14}" fill="none" stroke="${accent}" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy - 40}" r="5" fill="${accent}"/>
    <path d="M${cx} ${cy + 14} l-12 -8 -2 16z" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}

const COVERS: Record<string, (accent: string) => string> = {
  majlis, classroom, siege, blackout, orbit, hotel,
  'attack-on-titan': attackOnTitan,
  'tomodachi-game': tomodachiGame,
  kaiji,
  'code-geass': codeGeass,
  'jujutsu-kaisen': jujutsuKaisen,
};

export function modeCover(id: string, accent: string): string {
  return (COVERS[id] ?? majlis)(accent);
}
