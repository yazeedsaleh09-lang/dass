// دسّ — scroll storytelling helpers (native + IntersectionObserver; no heavy deps).
import { reduced } from './motion.js';

/** Reveals [data-reveal] elements as they enter view (adds .in). Children with [data-rc] stagger. */
export function observeReveal(root: ParentNode = document): IntersectionObserver {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
  );
  for (const el of Array.from(root.querySelectorAll('[data-reveal]'))) {
    if (reduced()) el.classList.add('in');
    else io.observe(el);
  }
  return io;
}

/** rAF-throttled scroll/resize callback. Returns a cleanup fn. */
export function rafScroll(cb: () => void): () => void {
  let ticking = false;
  const on = (): void => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      cb();
      ticking = false;
    });
  };
  addEventListener('scroll', on, { passive: true });
  addEventListener('resize', on, { passive: true });
  cb();
  return () => {
    removeEventListener('scroll', on);
    removeEventListener('resize', on);
  };
}

/** 0 → 1 progress of an element travelling through the viewport (for pinned/parallax scenes). */
export function progressOf(el: Element): number {
  const r = el.getBoundingClientRect();
  const total = r.height + innerHeight;
  const seen = innerHeight - r.top;
  return Math.min(1, Math.max(0, seen / total));
}

/** Pointer-parallax on desktop: moves [data-px] children by a factor of pointer offset. */
export function pointerParallax(root: HTMLElement, strength = 14): () => void {
  if (reduced() || matchMedia('(pointer:coarse)').matches) return () => {};
  const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-px]'));
  const on = (e: PointerEvent): void => {
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    for (const l of layers) {
      const f = Number(l.dataset.px || 1);
      l.style.transform = `translate3d(${x * strength * f}px,${y * strength * f}px,0)`;
    }
  };
  root.addEventListener('pointermove', on);
  return () => root.removeEventListener('pointermove', on);
}
