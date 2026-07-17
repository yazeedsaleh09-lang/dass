import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { DassRoom } from './room.js';
import { createDassHttpServer } from './static.js';

const port = Number(process.env.PORT ?? 2600);

// Single host: TV client at `/`, Player at `/play`, WS on the same origin (no CORS/mixed-content).
// If a client isn't built, its route 404s and the WS server still runs.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tvDir = path.resolve(__dirname, '../../dasstv/public');
const playerDir = path.resolve(__dirname, '../../dassplayer/public');
const httpServer = createDassHttpServer(tvDir, playerDir);

const gameServer = new Server({ transport: new WebSocketTransport({ server: httpServer }) });
gameServer.define('dass', DassRoom);

gameServer
  .listen(port)
  .then(() => console.log(`[dass] TV(/) + Player(/play) + ws on http://localhost:${port}`))
  .catch((err: unknown) => {
    console.error('[dass] failed to start:', err);
    process.exit(1);
  });
