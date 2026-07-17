// دسّ — living background. Faint drifting dust (canvas) + a mood glow (CSS) that reacts to game state.
// Light: ~36 motes, transform/opacity only, pauses when hidden or reduced-motion.
import { addStyle, el } from './dom.js';
import { reduced } from './motion.js';

export type Mood = 'calm' | 'tension' | 'attack' | 'support' | 'secret' | 'win';

const MOODS: Record<Mood, { a: string; a2: string; i: number }> = {
  calm: { a: '139,121,242', a2: '235,178,76', i: 0.16 },
  tension: { a: '235,178,76', a2: '235,178,76', i: 0.3 },
  attack: { a: '255,77,94', a2: '139,121,242', i: 0.42 },
  support: { a: '53,214,160', a2: '235,178,76', i: 0.34 },
  secret: { a: '139,121,242', a2: '20,16,30', i: 0.12 },
  win: { a: '247,206,114', a2: '235,178,76', i: 0.5 },
};

const bgCss = `
.dass-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:
  radial-gradient(120% 90% at 50% -10%, var(--bg-2), var(--bg) 60%)}
.dass-bg canvas{position:absolute;inset:0;width:100%;height:100%}
.dass-bg .glow{position:absolute;inset:-20%;transition:opacity 1.2s var(--e-out),background 1.2s var(--e-out);
  opacity:var(--bgi,.18);background:
    radial-gradient(45% 40% at 22% 18%, rgba(var(--bga,139,121,242),.5), transparent 70%),
    radial-gradient(50% 45% at 82% 78%, rgba(var(--bgb,235,178,76),.4), transparent 72%)}
.dass-bg .grain{position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;
  background-image:radial-gradient(circle at 1px 1px, #fff 1px, transparent 0);background-size:3px 3px}
`;

export function mountBackground(): { setMood: (m: Mood) => void; flash: (m: Mood) => void } {
  addStyle(bgCss);
  const root = el('div', 'dass-bg');
  const canvas = el('canvas');
  const glow = el('div', 'glow');
  const grain = el('div', 'grain');
  root.append(glow, grain, canvas);
  document.body.prepend(root);

  const ctx = canvas.getContext('2d');
  let motes: { x: number; y: number; vy: number; r: number; a: number }[] = [];
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  function resize(): void {
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    const count = Math.min(40, Math.round((innerWidth * innerHeight) / 42000));
    motes = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vy: -(0.1 + Math.random() * 0.25) * dpr,
      r: (0.6 + Math.random() * 1.6) * dpr,
      a: 0.06 + Math.random() * 0.14,
    }));
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  function frame(): void {
    if (!ctx) return;
    if (!document.hidden && !reduced()) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const m of motes) {
        m.y += m.vy;
        if (m.y < -4) {
          m.y = canvas.height + 4;
          m.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, 7);
        ctx.fillStyle = `rgba(245,239,228,${m.a})`;
        ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function apply(m: Mood): void {
    const c = MOODS[m];
    root.style.setProperty('--bga', c.a);
    root.style.setProperty('--bgb', c.a2);
    root.style.setProperty('--bgi', String(c.i));
  }
  apply('calm');

  return {
    setMood: apply,
    flash(m: Mood): void {
      const c = MOODS[m];
      root.style.setProperty('--bga', c.a);
      root.style.setProperty('--bgi', String(Math.min(0.6, c.i + 0.2)));
      window.setTimeout(() => root.style.setProperty('--bgi', String(c.i)), 420);
    },
  };
}
