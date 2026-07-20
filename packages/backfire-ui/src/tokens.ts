// BACKFIRE — shared token layer for the TV and phone clients (§31).
// Black, graphite, lead, warm white, and one restricted red. No neon, no cyberpunk, no
// permanent glitch. Red is a signal, never decoration: it appears only where a consequence is.

export const baseCss = String.raw`
:root{
  --black:#080808; --ink:#0c0c0d; --charcoal:#151517; --graphite:#222226; --lead:#3a3a40;
  --steel:#66666d; --gray:#7c7c83; --muted:#9a9a9f; --paper:#f0efea; --white:#fafaf7;
  --red:#b72e38; --red-dark:#811c25; --red-soft:#c8454d;
  --line:rgba(250,250,247,.12); --line-2:rgba(250,250,247,.2); --line-3:rgba(250,250,247,.3);
  --shadow:0 30px 90px rgba(0,0,0,.6); --shadow-1:0 14px 40px rgba(0,0,0,.5);
  --r-1:4px; --r-2:8px; --r-3:12px; --r-pill:999px;
  --t-instant:120ms; --t-micro:200ms; --t-comp:360ms; --t-scene:700ms;
  --e-out:cubic-bezier(.22,1,.36,1); --e-sharp:cubic-bezier(.9,.03,.2,1); --e-pull:cubic-bezier(.16,1,.3,1);
  --safe-t:env(safe-area-inset-top,0px); --safe-b:env(safe-area-inset-bottom,0px);
  --safe-l:env(safe-area-inset-left,0px); --safe-r:env(safe-area-inset-right,0px);
  --font:'Tajawal','Segoe UI',Tahoma,system-ui,sans-serif;
  --font-latin:'Arial Black','Segoe UI',sans-serif;
  /* Readable from across a room: the TV type scale is deliberately large (§32). */
  --fs-display:clamp(52px,9vw,150px); --fs-h1:clamp(34px,5.4vw,76px); --fs-h2:clamp(24px,3.6vw,44px);
  --fs-h3:clamp(19px,2.3vw,28px); --fs-body:clamp(16px,1.5vw,20px); --fs-label:13px;
}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--black)}
body{
  color:var(--white); font-family:var(--font); font-weight:500;
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
  overscroll-behavior-y:none; -webkit-tap-highlight-color:transparent;
}
/* One quiet film-grain layer, matching the site's finish. Not a glitch effect. */
body::after{content:'';position:fixed;inset:0;z-index:200;pointer-events:none;opacity:.045;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
button{font-family:inherit;color:inherit;background:none;border:0;cursor:pointer;touch-action:manipulation}
input{font-family:inherit}
:focus{outline:none}
:focus-visible{outline:2px solid var(--red-soft);outline-offset:3px;border-radius:4px}
::selection{background:var(--red);color:var(--white)}
.mono{font-variant-numeric:tabular-nums;letter-spacing:.02em}
.muted{color:var(--muted)} .dim{color:var(--gray)}
.bf-word{font:900 1em/1 var(--font-latin);letter-spacing:.03em;direction:ltr;display:inline-block}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}

/* --- eyebrow / editorial framing --- */
.eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:var(--fs-label);font-weight:800;letter-spacing:.14em;color:var(--red-soft)}
.eyebrow::before{content:'';width:26px;height:2px;background:currentColor}

/* --- buttons --- */
.btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;
  padding-inline:24px;border:1px solid transparent;border-radius:var(--r-1);font-weight:800;font-size:16px;
  transition:transform var(--t-micro) var(--e-out),background var(--t-micro),border-color var(--t-micro),color var(--t-micro)}
.btn.primary{background:var(--red);color:var(--white)}
.btn.primary:hover{background:var(--red-soft)}
.btn.ghost{background:transparent;border-color:var(--line-2);color:var(--white)}
.btn.ghost:hover{border-color:var(--white)}
.btn.wide{width:100%}
.btn.lg{min-height:58px;font-size:18px}
.btn:active{transform:scale(.985)}
.btn[disabled]{opacity:.4;pointer-events:none}
.icon-btn{width:44px;height:44px;border-radius:var(--r-1);display:grid;place-items:center;
  border:1px solid var(--line);color:var(--muted);transition:color var(--t-micro),border-color var(--t-micro)}
.icon-btn:hover{color:var(--white);border-color:var(--line-3)}

/* --- input --- */
.input{width:100%;padding:16px 18px;font-size:clamp(17px,4.5vw,21px);font-weight:700;text-align:center;
  color:var(--white);background:var(--charcoal);border:1px solid var(--line-2);border-radius:var(--r-1)}
.input::placeholder{color:var(--gray);font-weight:600}
.input:focus{border-color:var(--red-soft)}
.input.err{border-color:var(--red)}

/* --- seat marker: a player's identity is a number + a shape, never colour alone (§32) --- */
.seat{position:relative;display:inline-grid;place-items:center;width:42px;height:42px;flex:0 0 auto;
  border:1px solid var(--line-2);border-radius:var(--r-1);font-weight:900;font-size:16px;color:var(--white);
  background:var(--charcoal)}
.seat.sm{width:32px;height:32px;font-size:13px;border-radius:3px}
.seat.lg{width:64px;height:64px;font-size:26px}
.seat[data-echo="1"]{border-color:var(--red);box-shadow:inset 0 0 0 1px var(--red-dark)}

/* --- threat meter --- */
.threat{display:flex;align-items:center;gap:10px}
.threat-bars{display:flex;gap:5px}
.threat-bar{width:26px;height:10px;background:var(--graphite);border:1px solid var(--line);transition:background var(--t-comp) var(--e-out)}
.threat-bar.on{background:var(--steel)}
.threat-bar.hot{background:var(--red)}
.threat-label{font-size:var(--fs-label);font-weight:800;letter-spacing:.1em;color:var(--muted)}

/* --- world states: composition tightens, red persists, motion never turns into noise --- */
.world-unstable .stage-frame{border-color:rgba(183,46,56,.22)}
.world-critical .stage-frame{border-color:rgba(183,46,56,.5)}
.world-critical{animation:tighten 6s ease-in-out infinite}
.world-collapse .stage-frame{border-color:var(--red)}
@keyframes tighten{0%,100%{letter-spacing:0}50%{letter-spacing:.004em}}
@media (prefers-reduced-motion:reduce){
  .world-critical{animation:none}
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
}
`;

export function injectBase(): void {
  const style = document.createElement('style');
  style.textContent = baseCss;
  document.head.appendChild(style);
}

/** Seat glyphs: a shape per seat so identity survives greyscale and colour-blindness. */
export const SEAT_GLYPH = ['◆', '■', '▲', '●', '⬟'];

export function seatGlyph(seat: number): string {
  return SEAT_GLYPH[seat % SEAT_GLYPH.length] ?? '◆';
}

export const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
export function arNum(n: number): string {
  return String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)] ?? d);
}
