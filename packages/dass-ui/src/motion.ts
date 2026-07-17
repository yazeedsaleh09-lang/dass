// دسّ — the central motion language. One reusable system; screens never hand-roll keyframes.
// Identity verbs: دسّ (emerge from under a layer) · سحب/كشف (pull to light) · شدّ (tension) ·
// ضربة (strike) · دعم (warm gather) · خيانة (broken path). Overshoot spring is RESERVED for the
// final reveal + the win only.

export const M = {
  // durations (ms), layered per the brief
  instant: 110,
  micro: 190,
  comp: 340,
  scene: 680,
  cine: 1600,
  // easing curves (original, consistent)
  out: 'cubic-bezier(.2,.85,.25,1)',
  inOut: 'cubic-bezier(.65,0,.35,1)',
  sharp: 'cubic-bezier(.9,.03,.2,1)', // ضربة
  pull: 'cubic-bezier(.16,1,.3,1)', // كشف
  spring: 'cubic-bezier(.34,1.56,.64,1)', // RESERVED: reveal + win
} as const;

export const reduced = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

type Frames = Keyframe[] | PropertyIndexedKeyframes;

/** WAAPI wrapper. Under reduced-motion, collapses to a near-instant fade so identity survives. */
export function anim(node: Element, frames: Frames, opts: KeyframeAnimationOptions): Animation {
  if (reduced()) {
    return node.animate({ opacity: [0.001, 1] } as PropertyIndexedKeyframes, {
      duration: 1,
      fill: 'both',
    });
  }
  return node.animate(frames, { fill: 'both', ...opts });
}

/** دسّ — slides up out from under a layer, with a brief blur, as if surfacing. */
export function dassIn(node: Element, delay = 0): Animation {
  return anim(
    node,
    { opacity: [0, 1], transform: ['translateY(16px) scale(.985)', 'translateY(0) scale(1)'], filter: ['blur(7px)', 'blur(0)'] },
    { duration: M.comp, easing: M.pull, delay },
  );
}

/** كشف — a heavier pull into the light (scene reveals). */
export function pullReveal(node: Element, delay = 0): Animation {
  return anim(
    node,
    { opacity: [0, 1], transform: ['translateY(26px) scale(.97)', 'translateY(0) scale(1)'], filter: ['blur(10px)', 'blur(0)'] },
    { duration: M.scene, easing: M.pull, delay },
  );
}

/** pop — spring entrance. RESERVED for reveal beats + winner. */
export function pop(node: Element, delay = 0): Animation {
  return anim(
    node,
    { opacity: [0, 1, 1], transform: ['scale(.86)', 'scale(1.05)', 'scale(1)'] },
    { duration: M.comp, easing: M.spring, delay },
  );
}

/** ضربة — a short directional strike with a controlled settle (attack / betrayal). */
export function strike(node: Element, dir: 1 | -1 = 1): Animation {
  const d = dir * 9;
  return anim(
    node,
    { transform: [`translateX(${-d}px)`, `translateX(${d * 0.45}px)`, 'translateX(0)'] },
    { duration: M.micro, easing: M.sharp },
  );
}

/** دعم — a warm gather pulse (support). */
export function supportPulse(node: Element): Animation {
  return anim(
    node,
    { boxShadow: ['0 0 0 0 rgba(51,214,159,0)', '0 0 0 12px rgba(51,214,159,.16)', '0 0 0 0 rgba(51,214,159,0)'] },
    { duration: M.scene, easing: M.out },
  );
}

/** press — micro tactile feedback. */
export function press(node: Element): Animation {
  return anim(node, { transform: ['scale(1)', 'scale(.955)', 'scale(1)'] }, { duration: M.instant, easing: M.out });
}

/** staggered entrance for a list of nodes. */
export function stagger(nodes: Iterable<Element>, step = 60, enter: (n: Element, delay: number) => Animation = dassIn): void {
  let i = 0;
  for (const n of nodes) enter(n, i++ * (reduced() ? 0 : step));
}

/** Tween a numeric text node (Vault counts). Cancels cleanly. */
export function countTo(node: HTMLElement, to: number, dur = M.scene): void {
  const from = Number(node.textContent?.replace(/[^\d-]/g, '')) || 0;
  if (reduced() || from === to) {
    node.textContent = String(to);
    return;
  }
  const start = performance.now();
  const step = (t: number): void => {
    const k = Math.min(1, (t - start) / dur);
    const eased = 1 - Math.pow(1 - k, 3);
    node.textContent = String(Math.round(from + (to - from) * eased));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
