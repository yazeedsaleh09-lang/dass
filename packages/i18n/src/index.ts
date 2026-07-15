import en from './en.json';
import ar from './ar.json';

export type Locale = 'en' | 'ar';
export const LOCALES: Locale[] = ['en', 'ar'];
export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', ar: 'العربية' };

const DICTS: Record<Locale, Record<string, string>> = {
  en: en as Record<string, string>,
  ar: ar as Record<string, string>,
};

/** A locale-neutral narration entry produced by the engine and rendered client-side. */
export interface LogEntry {
  key: string;
  params?: Record<string, string | number>;
}

export function dir(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}

/** Pick a default locale: explicit pref → browser language → English. Arabic if it starts with "ar". */
export function detectLocale(pref?: string | null): Locale {
  const raw =
    pref ??
    (typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en') ??
    'en';
  return raw.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

function interpolate(s: string, params?: Record<string, string | number>): string {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (_m, k: string) => (k in params ? String(params[k]) : `{${k}}`));
}

/** Translate a key with optional params. Falls back to English, then to the raw key. */
export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const raw = DICTS[locale]?.[key] ?? DICTS.en[key] ?? key;
  return interpolate(raw, params);
}

/**
 * Render a structured log entry. Params whose name ends in "Key" hold i18n keys and are
 * translated first (so content references localize); numeric params interpolate as-is.
 */
export function renderLog(entry: LogEntry, locale: Locale): string {
  const p: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(entry.params ?? {})) {
    p[k] = typeof v === 'string' && k.endsWith('Key') ? t(locale, v) : v;
  }
  return t(locale, entry.key, p);
}
