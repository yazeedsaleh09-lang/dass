// Verifies the single-host setup: the SAME port serves the web client (HTTP) AND Colyseus (WS).
//   npm run servecheck   (build the client first: npm run web:build)
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client } from 'colyseus.js';
import { MatchRoom } from './room.js';
import { createHttpServer } from './static.js';

const PORT = 2602;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../../web/public');

let failures = 0;
const check = (ok: boolean, m: string): void => {
  if (ok) console.log('  ok  ✓ ' + m);
  else {
    failures++;
    console.error('  FAIL ✗ ' + m);
  }
};

function get(p: string): Promise<{ status: number; body: string; type: string }> {
  return new Promise((resolve, reject) => {
    http
      .get(`http://localhost:${PORT}${p}`, (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => resolve({ status: r.statusCode ?? 0, body: d, type: String(r.headers['content-type'] ?? '') }));
      })
      .on('error', reject);
  });
}

async function main(): Promise<void> {
  const httpServer = createHttpServer(publicDir);
  const gs = new Server({ transport: new WebSocketTransport({ server: httpServer }) });
  gs.define('match', MatchRoom);
  await gs.listen(PORT);
  try {
    const idx = await get('/');
    check(idx.status === 200 && idx.body.includes('Crisis'), 'GET / serves the client HTML');
    const js = await get('/bundle.js');
    check(js.status === 200 && js.type.includes('javascript'), 'GET /bundle.js serves JavaScript');
    const health = await get('/health');
    check(health.status === 200 && health.body === 'ok', 'GET /health → ok');

    const c = new Client(`ws://localhost:${PORT}`);
    const room = await c.create<unknown>('match', { nickname: 'x' });
    check(!!room.roomId, 'WebSocket create-room works on the SAME port');
    await room.leave(true);
  } finally {
    await gs.gracefullyShutdown(false);
  }
  console.log('\n' + (failures === 0 ? 'SERVE CHECK: PASSED (single-host client+ws works)' : `SERVE CHECK: ${failures} FAILURE(S)`));
}

main()
  .then(() => process.exit(failures === 0 ? 0 : 1))
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
