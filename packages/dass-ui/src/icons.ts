// دسّ — line-icons (unified sharp family, currentColor-driven). No emoji as the final asset.
import type { ActionKind } from '@dass/domain';

const A = 'fill="none" stroke="currentColor" stroke-width="2.25" stroke-linejoin="miter" stroke-linecap="square"';

/** 📈 back / 📉 dump / 💰 sell — open pair vs. a closed "lock into a shelf". */
export function actionIcon(kind: ActionKind, size = 28): string {
  const head = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${A} aria-hidden="true">`;
  if (kind === 'back') return `${head}<path d="M12 3 L12 21"/><path d="M5 11 L12 3 L19 11"/></svg>`;
  if (kind === 'dump') return `${head}<path d="M12 3 L12 21"/><path d="M5 13 L12 21 L19 13"/></svg>`;
  return `${head}<path d="M12 3 L12 12"/><path d="M8 9 L12 13 L16 9"/><path d="M4 20 L20 20"/><path d="M9 20 L9 16.5 A3 3 0 0 1 15 16.5 L15 20"/></svg>`;
}

/** The sting mark (shadda-as-needle) — the logo's reusable icon / favicon. */
export function sting(size = 40, color = '#F2B33D'): string {
  return `<svg width="${size * 0.5}" height="${size}" viewBox="0 0 20 40" aria-hidden="true"><path d="M10 1 L14 24 L10 31 L6 24 Z" fill="${color}"/><path d="M10 24 L7 29 M10 24 L13 28" stroke="#FFFFFF" stroke-width="1.2" fill="none"/></svg>`;
}

/** "الوسيط" silhouette — sarcastic, glasses + crooked tie. */
export function waseetMark(size = 44): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 58 58" aria-hidden="true"><circle cx="29" cy="29" r="28" fill="#1C1C25" stroke="rgba(245,240,232,.18)"/><path d="M29 16 a8 8 0 0 1 8 8 v3 a8 8 0 0 1 -16 0 v-3 a8 8 0 0 1 8 -8Z" fill="#0c0c12"/><path d="M14 46 a15 13 0 0 1 30 0Z" fill="#0c0c12"/><rect x="20" y="22" width="7" height="4" fill="#8A8A94"/><rect x="31" y="22" width="7" height="4" fill="#8A8A94"/><path d="M29 40 L27 47 L31 47 Z" fill="#FF2E43"/></svg>`;
}

export function actionColorVar(kind: ActionKind): string {
  return kind === 'back' ? 'var(--up)' : kind === 'dump' ? 'var(--down)' : 'var(--gold)';
}
