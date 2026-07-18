// دسّ — original iconography. Line family shares stroke weight + sharp joins with the logo mark.
import type { ActionKind } from '@dass/domain';

const L = 'fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"';

/** The logo mark: a blade slipping through a seam — bright above the "table", dim below it. */
export function mark(size = 40): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <line x1="7" y1="27" x2="41" y2="27" stroke="var(--line-2)" stroke-width="2"/>
    <path d="M24 5 L30.5 23.5 L24 27 L17.5 23.5 Z" fill="var(--gold)"/>
    <path d="M24 27 L28 40 L24 44 L20 40 Z" fill="var(--gold-deep)" opacity=".5"/>
    <circle cx="24" cy="25.5" r="1.5" fill="#fff"/>
  </svg>`;
}

/** 📈 back (gather + rise) / 📉 dump (sharp down strike) / 💰 sell (lock into the vault). */
export function actionIcon(kind: ActionKind, size = 30): string {
  const head = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${L} aria-hidden="true">`;
  if (kind === 'back') return `${head}<path d="M12 20 V6"/><path d="M6.5 11 L12 5.5 L17.5 11"/><path d="M8.5 16.5 L12 13 L15.5 16.5" opacity=".55"/></svg>`;
  if (kind === 'dump') return `${head}<path d="M12 4 V16"/><path d="M6.5 11 L12 16.5 L17.5 11"/><path d="M8.5 5.5 L12 9 L15.5 5.5" opacity=".55"/></svg>`;
  return `${head}<path d="M12 3 V10.5"/><path d="M8.5 8 L12 11.5 L15.5 8"/><rect x="4.5" y="14" width="15" height="6" rx="1.4"/><path d="M9.5 14 V12.4 A2.5 2.5 0 0 1 14.5 12.4 V14"/></svg>`;
}

export function actionColor(kind: ActionKind): string {
  return kind === 'back' ? 'var(--green)' : kind === 'dump' ? 'var(--red)' : 'var(--gold)';
}

export type UiIcon = 'soundOn' | 'soundOff' | 'copy' | 'check' | 'refresh' | 'users' | 'link' | 'skip' | 'lock' | 'bolt';

export function uiIcon(name: UiIcon, size = 22): string {
  const h = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${L} aria-hidden="true">`;
  const paths: Record<UiIcon, string> = {
    soundOn: '<path d="M4 9 V15 H8 L13 19 V5 L8 9 Z"/><path d="M16.5 8.5 A5 5 0 0 1 16.5 15.5"/><path d="M19 6 A8.5 8.5 0 0 1 19 18" opacity=".55"/>',
    soundOff: '<path d="M4 9 V15 H8 L13 19 V5 L8 9 Z"/><path d="M17 9 L21 15 M21 9 L17 15"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8 V6 A2 2 0 0 0 14 4 H6 A2 2 0 0 0 4 6 V14 A2 2 0 0 0 6 16 H8"/>',
    check: '<path d="M4 12.5 L9.5 18 L20 6.5"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11 V8 A4 4 0 0 1 16 8 V11"/><circle cx="12" cy="15.5" r="1.3"/>',
    bolt: '<path d="M13 3 L5 13 H11 L10 21 L19 10 H12 Z"/>',
    refresh: '<path d="M20 11 A8 8 0 1 0 19 15"/><path d="M20 5 V11 H14"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20 A6 6 0 0 1 14.5 20"/><path d="M16 5.5 A3 3 0 0 1 16 11.4"/><path d="M17 14.5 A6 6 0 0 1 20.5 20" opacity=".6"/>',
    link: '<path d="M9 15 L15 9"/><path d="M11 6 L13 4 A4 4 0 0 1 19 10 L17 12"/><path d="M13 18 L11 20 A4 4 0 0 1 5 14 L7 12"/>',
    skip: '<path d="M6 5 L15 12 L6 19 Z"/><path d="M18 5 V19"/>',
  };
  return `${h}${paths[name]}</svg>`;
}
