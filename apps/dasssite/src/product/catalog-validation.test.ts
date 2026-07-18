import { describe, expect, it } from 'vitest';
import { PLANS, PRODUCTS, productById } from './catalog.js';
import { validateDisplayName, validateEmail, validatePassword, validateUsername } from './validation.js';

describe('commercial catalog invariants', () => {
  it('has unique stable ids and SAR non-negative prices', () => {
    expect(new Set(PRODUCTS.map((product) => product.id)).size).toBe(PRODUCTS.length);
    expect(new Set(PLANS.map((plan) => plan.id)).size).toBe(PLANS.length);
    for (const product of PRODUCTS) {
      expect(product.price.currency).toBe('SAR');
      expect(product.price.amountMinor).toBeGreaterThanOrEqual(0);
      expect(product.price.taxInclusive).toBe(true);
      expect(productById(product.id)).toBe(product);
    }
  });

  it('keeps the full base game free and avoids pay-to-win claims', () => {
    const free = PLANS.find((plan) => plan.id === 'free')!;
    expect(free.features.join(' ')).toContain('اللعبة الكاملة');
    expect(PLANS.flatMap((plan) => plan.features).join(' ')).not.toMatch(/نقاط إضافية|قوة إضافية|فرصة فوز أكبر/);
  });
});

describe('account field validation', () => {
  it('accepts normalized Arabic and English display names', () => {
    expect(validateDisplayName('  يزيد   Player  ')).toEqual({ ok: true, value: 'يزيد Player' });
  });

  it('rejects empty, overlong, control, bidi, and markup display names', () => {
    for (const value of ['', 'x'.repeat(25), 'safe\u202Eevil', '<b>name</b>', 'a\u0000b']) {
      expect(validateDisplayName(value).ok).toBe(false);
    }
  });

  it('normalizes usernames and email while enforcing password strength', () => {
    expect(validateUsername('  DASS_7 ')).toEqual({ ok: true, value: 'dass_7' });
    expect(validateUsername('لاعب').ok).toBe(false);
    expect(validateEmail(' TEST@Example.com ')).toEqual({ ok: true, value: 'test@example.com' });
    expect(validatePassword('onlyletters').ok).toBe(false);
    expect(validatePassword('safePass8').ok).toBe(true);
  });
});
