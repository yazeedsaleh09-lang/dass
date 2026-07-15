import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

/** Minimal static-file HTTP server for the built web client (+ /health), SPA-fallback to index.html. */
export function createHttpServer(publicDir: string): http.Server {
  return http.createServer((req, res) => {
    void (async () => {
      try {
        if (req.url === '/health') {
          res.writeHead(200, { 'content-type': 'text/plain' });
          res.end('ok');
          return;
        }
        let urlPath = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
        if (urlPath === '/') urlPath = '/index.html';
        const filePath = path.join(publicDir, path.normalize(urlPath));
        const serveIndex = async () => {
          const idx = path.join(publicDir, 'index.html');
          if (existsSync(idx)) {
            res.writeHead(200, { 'content-type': MIME['.html']! });
            res.end(await readFile(idx));
          } else {
            res.writeHead(404, { 'content-type': 'text/plain' });
            res.end('client not built — run `npm run web:build`');
          }
        };
        if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
          await serveIndex();
          return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'content-type': MIME[ext] ?? 'application/octet-stream' });
        res.end(await readFile(filePath));
      } catch {
        res.writeHead(500, { 'content-type': 'text/plain' });
        res.end('server error');
      }
    })();
  });
}
