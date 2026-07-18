import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type http from 'node:http';
import { createDassHttpServer } from './static.js';

let server: http.Server | undefined;
let root = '';

afterEach(async () => {
  if (server) await new Promise<void>((resolve) => server!.close(() => resolve()));
  if (root) await rm(root, { recursive: true, force: true });
  server = undefined;
  root = '';
});

describe('site discovery endpoints', () => {
  it('derives sitemap and robots origins from validated proxy headers', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'dass-static-'));
    const dirs = await Promise.all(['tv', 'player', 'site'].map(async (name) => {
      const dir = path.join(root, name); await mkdir(dir); await writeFile(path.join(dir, 'index.html'), name); return dir;
    }));
    server = createDassHttpServer(dirs[0]!, dirs[1]!, dirs[2]!);
    await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('missing test address');
    const options = { headers: { 'x-forwarded-host': 'game.example', 'x-forwarded-proto': 'https' } };
    const sitemap = await fetch(`http://127.0.0.1:${address.port}/sitemap.xml`, options);
    expect(sitemap.status).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain('<loc>https://game.example/store</loc>');
    expect(xml).not.toContain('localhost');
    const robots = await fetch(`http://127.0.0.1:${address.port}/robots.txt`, options);
    expect(await robots.text()).toContain('Sitemap: https://game.example/sitemap.xml');
    const rejected = await fetch(`http://127.0.0.1:${address.port}/sitemap.xml`, { headers: { 'x-forwarded-host': '<bad>' } });
    expect(rejected.status).toBe(400);
  });
});

