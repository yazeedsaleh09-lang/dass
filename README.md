# Version 0.1 — First Playable (build)

Faithful implementation of the **locked** social-crisis design (`../01_Game_Design`, `../02_Product_Design`, `../03_Development/`). No redesign, no new mechanics. Improvements → `IMPLEMENTATION_NOTES.md` (v0.2 backlog).

## Stack (per approved 3.1 architecture)
TypeScript monorepo (npm workspaces). One source of truth for the rules; server-authoritative; per-client redacted state (the fog stays private server-side).
- `@crisis/shared` — pure, deterministic rules engine + Zod content schema (5-phase FSM, simple-majority vote, meters, consequence links, endings, non-scored goal eval, `redactStateFor`).
- `@crisis/content` — authored crises + goals (validated).
- `@crisis/server` — **Colyseus** authoritative room (lobby, create/join, timers, vote, reveal, chat, quick-signals, reconnect).
- `@crisis/web` — ugly-but-functional **web client** (plain TS + colyseus.js) = the v0.1 first-playable UI. *(Expo RN + RN-Web is the committed cross-platform client — M4b; it reuses this same server + rules.)*
- `@crisis/sim` — headless full-match runner (dev/debug).

## Setup
Node LTS (dev machine: portable Node at `C:\Users\yazed\tools\nodejs` — prepend to PATH).
```bash
npm install
npm rebuild esbuild   # if the sandbox blocked postinstall scripts
```

## Verify (all green)
```bash
npm run typecheck        # tsc strict — shared/content/server/sim
npm run typecheck:web    # tsc strict — web client (DOM)
npm test                 # vitest — 21 engine tests
npm run netcheck         # boots server + 4 clients, plays a full match, checks privacy
npm run sim -- 5 42      # headless transcript: <players> <seed>
```

## ▶ Play it (real players)
Two terminals:
```bash
# terminal 1 — authoritative server (ws://localhost:2567)
npm run server
# terminal 2 — web client (http://localhost:8080)
npm run web:dev
```
Then open **http://localhost:8080** in **4+ tabs/devices**. One tab **Create room** → share the room code → others **Join** with it → everyone **Ready** → host **Start**.
- **Same machine:** open 4 tabs.
- **LAN (phones/laptops in a room):** serve from the host and have others open `http://<HOST-IP>:8080` — the client auto-targets `ws://<HOST-IP>:2567` (ensure ports 8080 & 2567 are reachable). Override with `?server=ws://<HOST-IP>:2567` if needed.
- Needs **4 players** to start (locked minimum). Default phase timers: briefing 8s · deliberation 90s · decision 25s · resolution 6s · interlude 8s.

## Milestone status (Phase 3 build)
- **M1 Verified core loop** ✅ — engine + content + sim; 21 tests; full matches 4–8p.
- **M2 Networking** ✅ — Colyseus authoritative room; verified by `netcheck` (server + 4 clients → ending; fog held over the wire).
- **M3 Lobby + room create/join** ✅ — create/join-by-code, ready system, host start, reconnect (no elimination).
- **M4 Client** ✅ (web) — lobby + full match UI (meters, crisis, private info, options/vote, chat, quick signals, reveal, results). Typechecked + bundled. *(M4b: Expo RN+RN-Web port.)*
- **M5 Playable build for real testers** ✅ ready — run the two commands above. The actual human playtest is the next real-world step.

## Layout
```
packages/shared/src   types · engine (pure FSM+rules+redaction) · schema (Zod) · engine.test
packages/content/src  crises · goals · index (validated bundle)
apps/server/src       room.ts (Colyseus MatchRoom) · index.ts · netcheck.ts
apps/web/src|public   main.ts (client) · index.html · build.mjs (esbuild)
apps/sim/src          run.ts (headless transcript)
```
