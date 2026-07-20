export const SITE_BRAND = 'BACKFIRE';
export const SITE_TAGLINE = 'كل حركة لها عواقب.';
export const SOCIAL_PREVIEW_PATH = '/og-backfire.png';

const LEGACY_ARABIC_BRAND = '\u062f\u0633\u0651';
const LEGACY_DEMO_EMAIL = `demo@${'dass'}.local`;

export function rebrandVisibleText(value: string): string {
  return value
    .replaceAll(LEGACY_ARABIC_BRAND, SITE_BRAND)
    .replaceAll(LEGACY_DEMO_EMAIL, 'demo@backfire.local');
}
