import { describe, expect, it } from 'vitest';
import { PRODUCT_PATHS, renderProductPage } from './pages.js';

describe('commercial route registry', () => {
  it('renders every registered route with complete metadata and a main landmark', () => {
    for (const path of PRODUCT_PATHS) {
      const page = renderProductPage(path);
      expect(page.title, path).toBeTruthy();
      expect(page.description, path).toBeTruthy();
      expect(page.html, path).toContain('<main');
      expect(page.html, path).not.toContain('undefined');
      expect(page.html, path).not.toContain('lorem ipsum');
    }
  });

  it('renders a branded safe 404 for malformed routes and item ids', () => {
    expect(renderProductPage('/not-a-route').html).toContain('٤٠٤');
    expect(renderProductPage('/store/product', '?id=%3Cscript%3E').html).toContain('العنصر غير موجود');
  });

  it('never places card-number fields in checkout markup', () => {
    const html = renderProductPage('/checkout', '?kind=product&id=avatar-falcon').html;
    expect(html).not.toMatch(/card.?number|رقم البطاقة|cvv|cvc/i);
  });

  it('normalizes invitation codes without embedding a deployment host', () => {
    const html = renderProductPage('/invite', '?code=ABCD%D9%A2%D9%A3%D9%A4%D9%A5').html;
    expect(html).toContain('ABCD2345');
    expect(html).not.toContain('localhost');
    expect(html).not.toMatch(/hostToken|playerToken/);
  });
});
