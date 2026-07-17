# Deploying دسّ

The production shape is one persistent Node web service:

- `/` serves the shared TV.
- `/play` serves phone controllers.
- `/health` is the health check.
- Colyseus matchmaking and WebSocket traffic use the same origin and `PORT`.

## Render Blueprint (recommended)

`render.yaml` is the source of truth:

- Build: `npm install --include=dev && npm run dassbuild`
- Start: `npm run dassserver`
- Health: `/health`
- Node: pinned by `package.json` to Node 20.x

Create a Render Blueprint from the repository. If the repository root is the parent `GameProject` folder, set the service root directory to `app`; if `app` itself is the repository root, no root directory is needed.

Render terminates public TLS and supports WebSockets on the service's single public port. The client automatically selects `wss://` when loaded over HTTPS.

## Docker

The repository `Dockerfile` builds both current clients and starts the current دسّ server:

```bash
docker build -t dass .
docker run --rm -p 8000:8000 -e PORT=8000 dass
```

Then verify `http://localhost:8000/health`, `/`, and `/play`.

## Optional split static hosting

`netlify.toml` publishes only the TV client. A second static site is required for the phone client. Set `DASS_SERVER_URL=wss://<server-host>` at build time for both static builds. Single-host deployment is simpler and avoids cross-origin configuration.

## Pre-deploy gate

```bash
npm ci
npm run typecheck
npm run typecheck:dasstv
npm run typecheck:dassplayer
npm test
npm run dassbuild
npm run dassservecheck
npm run dassnetcheck
npm run dassqacheck
```

## Operational limits

Room state is intentionally in memory. Use one server instance. A process restart or deployment ends active rooms; horizontal scaling requires shared Colyseus presence/driver plus durable room snapshots. Render's free service may cold-start after inactivity, so a paid always-on instance is recommended for scheduled play sessions.
