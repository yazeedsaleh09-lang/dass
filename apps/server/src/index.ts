import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { MatchRoom } from './room.js';
import { createHttpServer } from './static.js';

const port = Number(process.env.PORT ?? 2567);

// Serve the built web client (apps/web/public) from the SAME origin as the WS server:
// one host → one URL → no mixed-content / CORS. (Netlify + separate server also works —
// see DEPLOYMENT.md.) If the client isn't built, HTTP 404s and WS still runs.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../../web/public');
const httpServer = createHttpServer(publicDir);

const gameServer = new Server({ transport: new WebSocketTransport({ server: httpServer }) });
gameServer.define('match', MatchRoom);

gameServer
  .listen(port)
  .then(() => console.log(`[server] Crisis v0.1 — client + ws on http://localhost:${port}`))
  .catch((err: unknown) => {
    console.error('[server] failed to start:', err);
    process.exit(1);
  });
