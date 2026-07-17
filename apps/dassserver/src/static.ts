import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

/** One host serves the TV client at `/` and the Player client at `/play` (+ `/health`). */
export function createDassHttpServer(tvDir: string, playerDir: string): http.Server {
  return http.createServer((req, res) => {
    void (async () => {
      try {
        const url = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
        if (url === '/health') {
          res.writeHead(200, { 'content-type': 'text/plain' });
          res.end('ok');
          return;
        }
        const isPlayer = url === '/play' || url.startsWith('/play/');
        const dir = isPlayer ? playerDir : tvDir;
        let rel = isPlayer ? url.replace(/^\/play/, '') : url;
        if (rel === '' || rel === '/') rel = '/index.html';
        const filePath = path.join(dir, path.normalize(rel));
        const serveIndex = async (): Promise<void> => {
          const idx = path.join(dir, 'index.html');
          if (existsSync(idx)) {
            res.writeHead(200, { 'content-type': MIME['.html']! });
            res.end(await readFile(idx));
          } else {
            res.writeHead(404, { 'content-type': 'text/plain' });
            res.end('client not built — run `npm run dassbuild`');
          }
        };
        if (!filePath.startsWith(dir) || !existsSync(filePath)) {
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
