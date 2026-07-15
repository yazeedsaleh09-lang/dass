# Deployment — Version 0.1

## The one thing to understand first
This game has **two runtime pieces**:
1. **Web client** — static files (`apps/web/public`) → *can* go on Netlify.
2. **Colyseus server** — a **persistent Node WebSocket** process holding live match state → **Netlify cannot run this** (Netlify only hosts static files / short serverless functions). It needs a real host that keeps a `wss://` connection open: **Render, Railway, Fly.io, or Colyseus Cloud.**

So "send friends one URL and they play" needs the server hosted somewhere with `wss://`. Two ways to do that:

---

## ✅ Option A — Single host (simplest, ONE URL). Recommended.
The server **also serves the client**, so you deploy **one** thing and get **one** URL. No Netlify, no mixed-content, no CORS. Verified locally by `npm run servecheck`.

**Deploy to Render (free):** — the `app/` folder is already a git repo with `render.yaml` at its root.
1. Create an **empty GitHub repo**, then push this folder to it (commands below).
2. Render → **New → Blueprint** → pick the repo → Render reads `render.yaml` and fills everything in. *(Or New → Web Service and set the commands from the table below.)*
3. Click **Apply / Create**. No Root Directory, no env vars needed (PORT is provided automatically).
4. Wait ~3–6 min. Your URL is e.g. `https://crisis-v01.onrender.com` — **that's the link you send friends.** Open it → Create room → share the room code → 4+ join → Ready → Start.

**Or any Docker host (Railway/Fly):** the included `Dockerfile` builds + serves everything. `railway up` or `fly launch` from `app/`.

*(No env vars required for Option A — the client auto-targets its own origin over `wss://`.)*

---

## Option B — Netlify client + separate server (as you requested)
Client on Netlify, server on Render. Two URLs; the client is told the server's address at build time.

**B1. Deploy the server** (Render, as in Option A steps 1–4). Note its URL, e.g. `https://crisis-v01.onrender.com`. Its WebSocket endpoint is `wss://crisis-v01.onrender.com`.

**B2. Deploy the client to Netlify:**
- Netlify → **Add new site → Import from Git** → pick the repo.
- **Base directory:** `app` (if repo root is `GameProject`)
- **Build command:** `npm install --include=dev && node apps/web/build.mjs`  *(from `netlify.toml`)*
- **Publish directory:** `apps/web/public`
- **Environment variable:** `CRISIS_SERVER_URL = wss://crisis-v01.onrender.com`  *(must be `wss://`)*
- Deploy. Your Netlify URL (e.g. `https://your-site.netlify.app`) is the link you send friends.

**Netlify CLI alternative (no Git):**
```bash
cd app
CRISIS_SERVER_URL="wss://crisis-v01.onrender.com" node apps/web/build.mjs
npx netlify deploy --dir=apps/web/public --prod   # first run prompts login
```

---

## Reference
| Item | Value |
|------|-------|
| **Build command** | `npm install --include=dev && node apps/web/build.mjs` |
| **Publish directory** (Netlify) | `apps/web/public` |
| **Server start** | `npm run server` (reads `PORT` from env; default 2567) |
| **Health check** | `GET /health` → `ok` |
| **Env var (Option B only)** | `CRISIS_SERVER_URL = wss://<server-host>` |
| **Env var (Option A)** | none |
| **Node** | 20+ |
| **Client server-URL precedence** | `?server=` query → `CRISIS_SERVER_URL` (build) → same-origin `wss` → `ws://localhost:2567` (dev) |

`--include=dev` is required because the build uses **esbuild** (a devDependency); hosts default to production installs which skip devDeps.

---

## Short deployment report (status)
- **Client:** production-built and verified (`npm run web:build`; typechecks; 333 KB bundle incl. colyseus.js). Server URL is configurable (query / env / same-origin).
- **Server:** production-ready; reads `PORT`; exposes `/health`; **serves the client on the same origin** (verified by `npm run servecheck`).
- **Deploy configs shipped:** `render.yaml`, `Dockerfile`, `.dockerignore` (server / single-host), `netlify.toml` (client). All build/start commands verified locally.
- **Not done by the studio (needs YOUR accounts — the one genuine blocker):** the actual publish. Deploying to Netlify and to a WS host both require authenticating with *your* accounts (no anonymous programmatic deploy exists, and the sandbox has no Netlify CLI/token). **You run the ~10-minute steps above** (Option A is one service and one URL).
- **Recommendation:** use **Option A** to get a single working URL fastest; switch to **Option B** later if you specifically want the client on Netlify's CDN.

Once the URL is live, send it to friends — they open it in any browser, one hosts, the rest join by code.
