// Motion tokens (ms) — the single source for JS-timed sequences; mirrors the CSS vars in tokens.ts.
// Overshoot is reserved for TWO moments only (the dassة crack, the final winner) — see tokens.ts easings.

export const T = {
  instant: 90, // press/touch
  quick: 180, // mobile transition
  base: 300, // standard TV transition, icon settle
  declare: 460, // declaration bloom / lock seal
  stock: 640, // live bar movement (no overshoot)
  reveal: 700, // round-end beat
  vault: 520, // gold Vault snap
  stab: 200, // the الدسّة strike
  dramatic: 1400, // final-reveal segments
} as const;

/** Player-side timings are ~half the TV (the "tool, not a stage" rule). */
export const half = (ms: number): number => Math.round(ms / 2);

export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
