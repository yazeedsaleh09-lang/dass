import { describe, expect, it } from 'vitest';
import { isRoomCode, normalizeRoomCode, validateNickname } from './join.js';

describe('room-code normalization', () => {
  it('trims spaces, removes visual separators and normalizes case', () => {
    expect(normalizeRoomCode('  abcd-2345  ')).toBe('ABCD2345');
  });

  it('accepts Arabic-Indic and Eastern Arabic numerals', () => {
    expect(normalizeRoomCode('ABCD٢٣٤٥')).toBe('ABCD2345');
    expect(normalizeRoomCode('ABCD۲۳۴۵')).toBe('ABCD2345');
  });

  it('rejects empty, malformed, ambiguous and incorrectly sized codes', () => {
    expect(isRoomCode('')).toBe(false);
    expect(isRoomCode('ABCD123')).toBe(false);
    expect(isRoomCode('ABCD10OI')).toBe(false);
    expect(isRoomCode('<script>')).toBe(false);
  });
});

describe('nickname validation', () => {
  it.each(['يزيد', 'Yazed', 'لاعب One', '🎮🔥'])('accepts supported Arabic, English and emoji: %s', (name) => {
    expect(validateNickname(name)).toEqual({ ok: true, value: name });
  });

  it('normalizes surrounding and repeated whitespace', () => {
    expect(validateNickname('  Yazed   Player  ')).toEqual({ ok: true, value: 'Yazed Player' });
  });

  it('rejects empty, overlong, markup, controls and bidi injection', () => {
    expect(validateNickname('   ')).toEqual({ ok: false, reason: 'EMPTY_NAME' });
    expect(validateNickname('a'.repeat(21))).toEqual({ ok: false, reason: 'NAME_TOO_LONG' });
    expect(validateNickname('<script>alert(1)</script>')).toEqual({ ok: false, reason: 'UNSUPPORTED_NAME' });
    expect(validateNickname('safe\u202Eevil')).toEqual({ ok: false, reason: 'UNSUPPORTED_NAME' });
  });

  it('counts emoji by Unicode code point and does not split surrogate pairs', () => {
    const twentyEmoji = '😀'.repeat(20);
    expect(validateNickname(twentyEmoji)).toEqual({ ok: true, value: twentyEmoji });
    expect(validateNickname(`${twentyEmoji}😀`)).toEqual({ ok: false, reason: 'NAME_TOO_LONG' });
  });
});
