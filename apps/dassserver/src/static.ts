import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getRoomStatus } from './lifecycle.js';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.xml': 'application/xml; charset=utf-8',
};

const SECURITY_HEADERS: Record<string, string> = {
  'content-security-policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' ws: wss:; base-uri 'none'; frame-ancestors 'none'",
  'cross-origin-resource-policy': 'same-origin',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
};

function headers(contentType: string, cacheControl = 'no-store'): Record<string, string> {
  return { ...SECURITY_HEADERS, 'content-type': contentType, 'cache-control': cacheControl };
}

/**
 * One host, three separate apps — no cross-loading:
 *   /tv , /tv/*      → TV app        (bundle at /tv/bundle.js)
 *   /play , /play/*  → Player app    (bundle at /play/bundle.js)
 *   everything else  → Site app      (/, /create, /join, /how-to-play — SPA fallback; bundle at /bundle.js)
 */
export function createDassHttpServer(tvDir: string, playerDir: string, siteDir: string): http.Server {
  return http.createServer((req, res) => {
    void (async () => {
      try {
        const url = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
        if (url === '/health') {
          res.writeHead(200, headers('text/plain; charset=utf-8'));
          res.end('ok');
          return;
        }
        if (url === '/sitemap.xml') {
          const forwardedHost = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? '').split(',')[0]!.trim();
          if (!/^[a-z0-9.-]+(?::\d+)?$/i.test(forwardedHost)) {
            res.writeHead(400, headers('text/plain; charset=utf-8'));
            res.end('bad host');
            return;
          }
          const forwardedProto = String(req.headers['x-forwarded-proto'] ?? '').split(',')[0]!.trim();
          const protocol = forwardedProto === 'https' ? 'https' : 'http';
          const origin = `${protocol}://${forwardedHost}`;
          const routes = ['/', '/how-to-play', '/store', '/pricing', '/about', '/faq', '/support', '/status', '/changelog', '/legal/privacy', '/legal/terms', '/legal/refunds', '/legal/cookies'];
          const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `\n  <url><loc>${origin}${route}</loc></url>`).join('')}\n</urlset>\n`;
          res.writeHead(200, headers(MIME['.xml']!, 'public, max-age=300'));
          res.end(body);
          return;
        }
        if (url === '/robots.txt') {
          const forwardedHost = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? '').split(',')[0]!.trim();
          if (!/^[a-z0-9.-]+(?::\d+)?$/i.test(forwardedHost)) {
            res.writeHead(400, headers('text/plain; charset=utf-8'));
            res.end('bad host');
            return;
          }
          const forwardedProto = String(req.headers['x-forwarded-proto'] ?? '').split(',')[0]!.trim();
          const protocol = forwardedProto === 'https' ? 'https' : 'http';
          res.writeHead(200, headers('text/plain; charset=utf-8', 'public, max-age=300'));
          res.end(`User-agent: *\nAllow: /\nSitemap: ${protocol}://${forwardedHost}/sitemap.xml\n`);
          return;
        }
        if (url.startsWith('/api/rooms/')) {
          const code = url.slice('/api/rooms/'.length);
          const status = getRoomStatus(code);
          res.writeHead(status === 'active' ? 200 : status === 'closed' ? 409 : 404, headers('application/json; charset=utf-8'));
          res.end(JSON.stringify({ status }));
          return;
        }
        let dir = siteDir;
        let rel = url;
        if (url === '/tv' || url.startsWith('/tv/')) {
          dir = tvDir;
          rel = url.slice(3) || '/';
        } else if (url === '/play' || url.startsWith('/play/')) {
          dir = playerDir;
          rel = url.slice(5) || '/';
        }
        if (rel === '' || rel === '/') rel = '/index.html';
        const requestedPath = rel.replace(/^[/\\]+/, '');
        const filePath = path.resolve(dir, requestedPath);
        const relativePath = path.relative(dir, filePath);
        if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
          res.writeHead(404, headers('text/plain; charset=utf-8'));
          res.end('not found');
          return;
        }
        const serveIndex = async (): Promise<void> => {
          const idx = path.join(dir, 'index.html');
          if (existsSync(idx)) {
            res.writeHead(200, headers(MIME['.html']!));
            res.end(await readFile(idx));
          } else {
            res.writeHead(404, headers('text/plain; charset=utf-8'));
            res.end('not built — run `npm run dassbuild`');
          }
        };
        if (!existsSync(filePath)) {
          // asset (has extension) missing → 404; route (no extension) → SPA fallback to that app's index
          if (path.extname(filePath)) {
            res.writeHead(404, headers('text/plain; charset=utf-8'));
            res.end('not found');
            return;
          }
          await serveIndex();
          return;
        }
        const ext = path.extname(filePath);
        // Bundles keep stable filenames, so they must revalidate after every deploy.
        // Long-lived caching is safe only once filenames are content-hashed.
        const cacheControl = ext === '.html' ? 'no-store' : ext === '.js' || ext === '.map' || ext === '.css' ? 'no-cache' : 'public, max-age=300';
        res.writeHead(200, headers(MIME[ext] ?? 'application/octet-stream', cacheControl));
        res.end(await readFile(filePath));
      } catch (error: unknown) {
        if (!res.headersSent) res.writeHead(error instanceof URIError ? 400 : 500, headers('text/plain; charset=utf-8'));
        if (!res.writableEnded) res.end(error instanceof URIError ? 'bad request' : 'server error');
      }
    })();
  });
}
