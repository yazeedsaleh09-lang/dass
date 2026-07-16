import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { V2Room } from './room.js';
import { createHttpServer } from '../../server/src/static.js';

const port = Number(process.env.PORT ?? 2568);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../../v2web/public');
const httpServer = createHttpServer(publicDir);

const gs = new Server({ transport: new WebSocketTransport({ server: httpServer }) });
gs.define('match', V2Room);
gs.listen(port)
  .then(() => console.log(`[v2server] The Council — client + ws on http://localhost:${port}`))
  .catch((e: unknown) => { console.error('[v2server] failed:', e); process.exit(1); });
