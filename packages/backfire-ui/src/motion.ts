// BACKFIRE motion language. Editorial and controlled: lines draw, text settles, consequence
// travels along a path and returns. No bounce anywhere except the Backfire itself.

export const M = {
  instant: 120,
  micro: 200,
  comp: 360,
  scene: 700,
  cine: 1500,
  out: 'cubic-bezier(.22,1,.36,1)',
  inOut: 'cubic-bezier(.65,0,.35,1)',
  sharp: 'cubic-bezier(.9,.03,.2,1)',
  pull: 'cubic-bezier(.16,1,.3,1)',
} as const;

export const reduced = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

type Frames = Keyframe[] | PropertyIndexedKeyframes;

/** Under reduced motion every animation collapses to a near-instant fade (§32). */
export function anim(node: Element, frames: Frames, opts: KeyframeAnimationOptions): Animation {
  if (reduced()) {
    return node.animate({ opacity: [0.001, 1] } as PropertyIndexedKeyframes, { duration: 1, fill: 'both' });
  }
  return node.animate(frames, { fill: 'both', ...opts });
}

/** Text settles into place from below — the standard editorial entrance. */
export function settle(node: Element, delay = 0): Animation {
  return anim(
    node,
    { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0)'] },
    { duration: M.comp, easing: M.out, delay },
  );
}

/** A heavier reveal for scene titles. */
export function reveal(node: Element, delay = 0): Animation {
  return anim(
    node,
    { opacity: [0, 1], transform: ['translateY(26px) scale(.985)', 'translateY(0) scale(1)'], filter: ['blur(9px)', 'blur(0)'] },
    { duration: M.scene, easing: M.pull, delay },
  );
}

/** A hard cut-in used for events and interference. */
export function cut(node: Element, delay = 0): Animation {
  return anim(node, { opacity: [0, 1], transform: ['scale(1.03)', 'scale(1)'] }, { duration: M.micro, easing: M.sharp, delay });
}

/** A short directional strike (disruption). */
export function strike(node: Element, dir: 1 | -1 = 1): Animation {
  const d = dir * 8;
  return anim(
    node,
    { transform: [`translateX(${-d}px)`, `translateX(${d * 0.4}px)`, 'translateX(0)'] },
    { duration: M.micro, easing: M.sharp },
  );
}

export function press(node: Element): Animation {
  return anim(node, { transform: ['scale(1)', 'scale(.96)', 'scale(1)'] }, { duration: M.instant, easing: M.out });
}

export function stagger(nodes: Iterable<Element>, step = 70, enter: (n: Element, d: number) => Animation = settle): void {
  let i = 0;
  for (const n of nodes) enter(n, i++ * (reduced() ? 0 : step));
}

export function countTo(node: HTMLElement, to: number, dur = M.scene): void {
  const from = Number(node.textContent?.replace(/[^\d-]/g, '')) || 0;
  if (reduced() || from === to) {
    node.textContent = String(to);
    return;
  }
  const start = performance.now();
  const step = (t: number): void => {
    const k = Math.min(1, (t - start) / dur);
    node.textContent = String(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
