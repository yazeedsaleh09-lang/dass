export const ROOM_CODE_LENGTH = 8;
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
const EASTERN_ARABIC = '۰۱۲۳۴۵۶۷۸۹';

/** Normalize copy/paste and Arabic keyboards without changing the code's identity. */
export function normalizeRoomCode(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/[\s-]+/g, '')
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_INDIC.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(EASTERN_ARABIC.indexOf(digit)))
    .toUpperCase();
}

export function isRoomCode(value: unknown): boolean {
  const code = normalizeRoomCode(value);
  return code.length === ROOM_CODE_LENGTH && [...code].every((char) => ROOM_CODE_ALPHABET.includes(char));
}

export type NicknameResult =
  | { ok: true; value: string }
  | { ok: false; reason: 'EMPTY_NAME' | 'NAME_TOO_LONG' | 'UNSUPPORTED_NAME' };

/**
 * Server-authoritative nickname validation. Emoji are supported; markup, bidi controls,
 * invisible format characters and control characters are rejected rather than rendered.
 */
export function validateNickname(value: unknown, maxCodePoints = 20): NicknameResult {
  const normalized = String(value ?? '').normalize('NFKC').trim().replace(/\s+/gu, ' ');
  if (!normalized) return { ok: false, reason: 'EMPTY_NAME' };
  if (/[<>&\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/u.test(normalized)) {
    return { ok: false, reason: 'UNSUPPORTED_NAME' };
  }
  if ([...normalized].length > maxCodePoints) return { ok: false, reason: 'NAME_TOO_LONG' };
  return { ok: true, value: normalized };
}
