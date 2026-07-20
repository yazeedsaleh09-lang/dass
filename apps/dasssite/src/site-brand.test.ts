import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCT_PATHS, renderProductPage } from './product/pages.js';
import { rebrandVisibleText, SOCIAL_PREVIEW_PATH, SITE_BRAND, SITE_TAGLINE } from './site-brand.js';
import { PhoneMockup } from './site-product.js';

const readPublic = (name: string): string => readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8');
const readSource = (name: string): string => readFileSync(new URL(name, import.meta.url), 'utf8');
const legacyBrand = '\u062f\u0633\u0651';

describe('BACKFIRE public identity', () => {
  it('ships complete metadata and the dedicated social asset', () => {
    const index = readPublic('index.html');
    const manifest = readPublic('site.webmanifest');
    expect(index).toContain(`<title>${SITE_BRAND} — كل حركة لها عواقب</title>`);
    expect(index).toContain(`content="${SOCIAL_PREVIEW_PATH}"`);
    expect(index).toContain('content="1200"');
    expect(index).toContain('content="630"');
    expect(index).toContain('ملصق BACKFIRE');
    expect(manifest).toContain(SITE_BRAND);
    expect(manifest).toContain(SITE_TAGLINE.slice(0, -1));
    expect(index + manifest).not.toContain(legacyBrand);
  });

  it('keeps every commercial route free of the legacy visible brand', () => {
    for (const path of PRODUCT_PATHS) {
      const page = renderProductPage(path);
      const visible = rebrandVisibleText(`${page.title} ${page.description} ${page.html}`);
      expect(visible, path).toContain('<main');
      expect(visible, path).not.toContain(legacyBrand);
    }
  });

  it('ships the crimson identity without legacy yellow, cyan, or purple accents', () => {
    const identity = [readPublic('index.html'), readPublic('site.webmanifest'), readPublic('app-icon.svg')].join('\n');
    expect(identity).not.toMatch(/#(?:EBB24C|F7CE72|A9762A|8D5CFF|28E1E8)/i);
    expect(identity).toMatch(/#(?:B3202D|7E151E|D24850)/i);
  });

  it('keeps the cinematic site layer separate from the verified room entry redirects', () => {
    const main = readSource('./main.ts');
    expect(main).toContain("location.href = '/tv'");
    expect(main).toContain('location.href = `/play?code=${encodeURIComponent(roomCode)}&name=${encodeURIComponent(name)}`');
    expect(main).toContain('كل واحد يعرف شيئًا');
    expect(main).toContain('نظام السيناريو الجديد قيد التطوير');
  });

  it('ships original editorial-noir social art with pure DOM/SVG scenes and no raster/AI imagery', () => {
    const preview = readFileSync(new URL('../public/og-backfire.png', import.meta.url));
    const main = readSource('./main.ts');
    const theme = readSource('./site-theme.ts');
    const product = readSource('./site-product.ts');
    const scenes = readSource('./site-scenes.ts');
    expect(preview.readUInt32BE(16)).toBe(1200);
    expect(preview.readUInt32BE(20)).toBe(630);
    expect(preview.byteLength).toBeLessThan(1_500_000);
    expect(main + theme + product + scenes).not.toMatch(/\.jpg|\.jpeg|<img\b|<picture/i);
    // the product-reality section still recreates the real interfaces from DOM
    expect(product).toContain('data-product-screen="tv-lobby"');
    expect(PhoneMockup('secret')).toContain('data-product-screen="player-secret"');
    // the return-line motif that carries the "backfire" idea now lives in the scene layer
    expect(scenes).toContain('class="return-line');
    expect(scenes).toMatch(/ConsequenceScene|FinalScene/);
  });
});
