// BACKFIRE — deterministic RNG. The engine never calls Math.random(), so a seed fully
// reproduces candidate selection, intel distribution and tool assignment (§34 QA seed).

export interface Rng {
  s: number;
}

export function makeRng(seed: number): Rng {
  return { s: (seed >>> 0) || 0x9e3779b9 };
}

export function nextFloat(r: Rng): number {
  r.s = (r.s + 0x6d2b79f5) >>> 0;
  let t = r.s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function nextInt(r: Rng, maxExclusive: number): number {
  return Math.floor(nextFloat(r) * maxExclusive) % Math.max(1, maxExclusive);
}

/** Fisher-Yates on a copy — deterministic for a given rng state. */
export function shuffled<T>(r: Rng, items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = nextInt(r, i + 1);
    const a = out[i]!;
    const b = out[j]!;
    out[i] = b;
    out[j] = a;
  }
  return out;
}
