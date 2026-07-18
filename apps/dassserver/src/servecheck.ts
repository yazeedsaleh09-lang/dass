// Production-shaped single-host check: three separate apps (site / TV / player) + health +
// SPA fallback (refresh) + path safety + matchmaking/WebSocket on the same port.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client } from 'colyseus.js';
import { DassRoom } from './room.js';
import { createDassHttpServer } from './static.js';

const port = 2603;
const origin = `http://localhost:${port}`;
const endpoint = `ws://localhost:${port}`;
const dirname = path.dirname(fileURLToPath(import.meta.url));
const httpServer = createDassHttpServer(
  path.resolve(dirname, '../../dasstv/public'),
  path.resolve(dirname, '../../dassplayer/public'),
  path.resolve(dirname, '../../dasssite/public'),
);
const server = new Server({ transport: new WebSocketTransport({ server: httpServer }), greet: false });
server.define('dass', DassRoom);

let failed = false;
function check(ok: boolean, message: string): void {
  console.log(`${ok ? '  ok   ✓' : '  FAIL ✗'} ${message}`);
  if (!ok) failed = true;
}

async function main(): Promise<void> {
  await server.listen(port, '127.0.0.1');
  try {
    const [health, site, tv, player, create, howto, siteBundle, tvBundle, playerBundle, missing, traversal] = await Promise.all([
      fetch(`${origin}/health`),
      fetch(`${origin}/`),
      fetch(`${origin}/tv`),
      fetch(`${origin}/play`),
      fetch(`${origin}/create`),
      fetch(`${origin}/how-to-play`),
      fetch(`${origin}/bundle.js`),
      fetch(`${origin}/tv/bundle.js`),
      fetch(`${origin}/play/bundle.js`),
      fetch(`${origin}/missing.js`),
      fetch(`${origin}/..%2Fpackage.json`),
    ]);
    const siteHtml = await site.text();
    const tvHtml = await tv.text();
    const playerHtml = await player.text();

    check(health.status === 200 && (await health.text()) === 'ok', 'health endpoint responds');
    check(site.status === 200 && siteHtml.includes('<title>دسّ — لعبة'), '/ serves the SITE (not the game)');
    check(tv.status === 200 && tvHtml.includes('<title>دسّ — TV</title>'), '/tv serves the TV app');
    check(player.status === 200 && playerHtml.includes('<title>دسّ</title>') && !playerHtml.includes('— TV'), '/play serves the Player app');
    check(create.status === 200 && (await create.text()).includes('<title>دسّ — لعبة'), '/create refresh works (SPA fallback → site)');
    check(howto.status === 200 && (await howto.text()).includes('<title>دسّ — لعبة'), '/how-to-play refresh works (SPA fallback → site)');
    check(siteHtml.includes('src="/bundle.js?v='), 'site loads /bundle.js (its own) with a cache-busting build id');
    check(tvHtml.includes('src="/tv/bundle.js?v=') && playerHtml.includes('src="/play/bundle.js?v='), 'TV and Player load their own versioned bundles, never cross-load');
    check(siteBundle.status === 200 && tvBundle.status === 200 && playerBundle.status === 200, 'each app serves a distinct bundle');
    check(site.headers.get('cache-control') === 'no-store', 'HTML cannot be served from a stale production cache');
    check(tvBundle.headers.get('cache-control') === 'no-cache' && playerBundle.headers.get('cache-control') === 'no-cache', 'stable bundle paths revalidate on every production load');
    check(missing.status === 404, 'missing assets return 404 instead of HTML');
    check(traversal.status === 404, 'encoded path traversal is rejected');
    check(site.headers.get('content-security-policy')?.includes("default-src 'self'") === true, 'security headers are attached');

    const productPaths = ['/store', '/store/product', '/pricing', '/login', '/signup', '/account/settings', '/checkout', '/faq', '/support', '/legal/privacy', '/legal/refunds', '/not-a-real-route'];
    const productResponses = await Promise.all(productPaths.map((route) => fetch(origin + route)));
    const productBodies = await Promise.all(productResponses.map((response) => response.text()));
    check(productResponses.every((response) => response.status === 200) && productBodies.every((body) => body.includes('<div id="app">')), 'all commercial routes and the client 404 refresh through the site shell');
    const [manifest, preview, sitemap, robots] = await Promise.all([
      fetch(`${origin}/site.webmanifest`), fetch(`${origin}/og-preview.png`), fetch(`${origin}/sitemap.xml`), fetch(`${origin}/robots.txt`),
    ]);
    check(manifest.status === 200 && manifest.headers.get('content-type')?.includes('manifest') === true, 'installable web manifest is served');
    check(preview.status === 200 && preview.headers.get('content-type') === 'image/png', 'social preview image is served');
    check(sitemap.status === 200 && (await sitemap.text()).includes(`${origin}/store`), 'sitemap derives its origin from the request host');
    check(robots.status === 200 && (await robots.text()).includes(`${origin}/sitemap.xml`), 'robots advertises the same-origin sitemap');

    const room = await new Client(endpoint).create<unknown>('dass', { role: 'tv' });
    room.onMessage('state', () => {});
    room.onMessage('host', () => {});
    room.onMessage('sessionlog', () => {});
    check(room.roomId.length > 0, 'matchmaking and WebSocket upgrade work on the same port');
    const activeStatus = await fetch(`${origin}/api/rooms/${room.roomId}`);
    const invalidStatus = await fetch(`${origin}/api/rooms/not-a-code`);
    check(activeStatus.status === 200 && (await activeStatus.json() as { status?: string }).status === 'active', 'room-status endpoint identifies an active room');
    check(invalidStatus.status === 404 && (await invalidStatus.json() as { status?: string }).status === 'invalid', 'room-status endpoint distinguishes malformed/unknown codes');
    await room.leave();
  } finally {
    await server.gracefullyShutdown(false);
  }
}

main()
  .then(() => {
    process.exitCode = failed ? 1 : 0;
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
