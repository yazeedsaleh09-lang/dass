import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { DassRoom } from './room.js';
import { createDassHttpServer } from './static.js';
import { serverLog } from './log.js';

const port = process.env.PORT || 8000;
const publicUrl =
  process.env.DASS_PUBLIC_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  (process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : `http://0.0.0.0:${port}`);

// Single host: TV client at `/`, Player at `/play`, WS on the same origin (no CORS/mixed-content).
// If a client isn't built, its route 404s and the WS server still runs.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tvDir = path.resolve(__dirname, '../../dasstv/public');
const playerDir = path.resolve(__dirname, '../../dassplayer/public');
const siteDir = path.resolve(__dirname, '../../dasssite/public');
const httpServer = createDassHttpServer(tvDir, playerDir, siteDir);

const gameServer = new Server({ transport: new WebSocketTransport({ server: httpServer }) });
gameServer.define('dass', DassRoom);

gameServer
  .listen(Number(port), '0.0.0.0')
  .then(() => serverLog('endpoint_selection', { listen: `0.0.0.0:${port}`, publicUrl, websocket: publicUrl.replace(/^http/, 'ws') }))
  .catch((err: unknown) => {
    console.error('[dass] failed to start:', err);
    process.exit(1);
  });
