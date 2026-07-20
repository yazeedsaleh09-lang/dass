# BACKFIRE — Verified Baseline (Phase 0)

Captured before editing, this TV-first pass. Repo: `C:\Users\yazed\GameProject\app`.

## Git
- Branch: `feat/backfire-vertical-slice` (expected — match).
- Pre-existing uncommitted work preserved: `apps/dassserver/src/servecheck.ts`, `apps/dassserver/src/static.ts` (add the `/modes` route), plus session-1 work (the replay-critical fix in `apps/bftv/src/main.ts` + `tv-css.ts`, `apps/bftv/src/tv-replay.test.ts`, `apps/dassserver/src/backfirereplaycheck.ts`, `package.json` script). Untracked: `.claude/`, `.codex/`, `artifacts/prelaunch-review/`.
- No commit, no push, no branch switch, no destructive git.

## Run commands (from package.json)
- Build: `npm run bfbuild` (site + bftv + bfplayer).
- Server: `npm run dassserver` (PORT env, default 8000; used 8092). Routes: `/` site, `/tv` TV=host, `/play` phone.
- Unit tests: `npx vitest run`. Typecheck: `npx tsc --noEmit -p <tsconfig>`.
- Integration: `npm run bfcheck` (5 phones + TV, real WS). Replay: `npm run bfreplaycheck`.
  Browser (real chromium/CDP): `npm run bfbrowsercheck`. Routes/security: `npm run dassservecheck`.
  Screenshots (new tool): `npm run bfshots -- <outDir>`.

## Baseline verification (before edits)
- `npx vitest run` → 96 passed / 0 failed (10 files).
- Typechecks (root, bftv, bfplayer, dasssite) → all clean **except** `typecheck:bftv` failed on
  `tv-replay.test.ts` importing `node:fs` (the bftv tsconfig had `"types": []`). Classification:
  test-infrastructure gap introduced when the session-1 test was added; the app's other tsconfig
  (dasssite) already sets `"types": ["node"]` for the same reason. FIXED this pass (aligned bftv).
- `bfcheck` PASSED · `bfreplaycheck` PASSED · `bfbrowsercheck` PASSED · `dassservecheck` exit 0.
- Full match runs LOBBY→…→RESULTS→replay; no page threw; secrets never leaked (harness-asserted).

## Environment limitations (honest)
- The in-app Browser pane's `screenshot` action TIMES OUT on the TV/site pages — the TV runs a
  permanent `requestAnimationFrame` loop, which keeps the pane's stability wait from resolving. This
  is an environment limitation of that tool, NOT a page fault (no console errors; real chromium
  renders fine). Visual evidence was therefore captured with a **CDP screenshot harness**
  (`backfireshots.ts`) driving real headless Chrome — same mechanism as `bfbrowsercheck`.
- Headless Chrome reports `prefers-reduced-motion: reduce`; combined with `?fast=` (compressed phase
  clock) this fast-forwards the reduced-motion cinematic. Relevant to the reverted `beat()` change
  (see council doc).

## Screenshots
- BEFORE: `artifacts/backfire-pre-friends/before/` (TV lobby/decision/route/return/reveal/results at
  1280/1366/1920; phones at 320/390/430).
- AFTER: `artifacts/backfire-pre-friends/after/` (same states + the new countdown + crew-complete).
