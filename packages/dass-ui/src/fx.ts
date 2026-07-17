// دسّ — one-shot celebration shards (elegant, not cheap confetti) + haptics.
import { reduced } from './motion.js';

/** Light haptic on supporting devices; safely ignored otherwise. */
export function haptic(pattern: number | number[] = 12): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

/** A single graceful burst of gold/cream shards from the center-top. Auto-cleans. */
export function celebrate(durationMs = 2600): void {
  if (reduced() || typeof document === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:41';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  const colors = ['#F7CE72', '#EBB24C', '#F5EFE4', '#A9762A'];
  const N = Math.min(120, Math.round(innerWidth / 9));
  const shards = Array.from({ length: N }, () => ({
    x: canvas.width * (0.3 + Math.random() * 0.4),
    y: -20,
    vx: (Math.random() - 0.5) * 6 * dpr,
    vy: (2 + Math.random() * 4) * dpr,
    g: 0.06 * dpr,
    rot: Math.random() * 7,
    vr: (Math.random() - 0.5) * 0.3,
    w: (3 + Math.random() * 5) * dpr,
    h: (7 + Math.random() * 12) * dpr,
    c: colors[(Math.random() * colors.length) | 0]!,
    life: 1,
  }));
  const start = performance.now();
  function frame(t: number): void {
    if (!ctx) return;
    const k = (t - start) / durationMs;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of shards) {
      s.vy += s.g;
      s.x += s.vx;
      s.y += s.vy;
      s.rot += s.vr;
      s.life = Math.max(0, 1 - k);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.globalAlpha = s.life;
      ctx.fillStyle = s.c;
      ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
      ctx.restore();
    }
    if (k < 1) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}
