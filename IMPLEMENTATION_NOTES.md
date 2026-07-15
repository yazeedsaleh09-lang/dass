# Implementation Notes & v0.2 Backlog

Per the build rules: implementation frictions are **documented here, not solved by changing the locked design**. Nothing below is a mechanic change; items are either faithful-subset choices for v0.1 or content/tuning notes deferred to v0.2.

## v0.2 — Arabic Localization (implemented & verified)
Full i18n with **English + Arabic (first-class)**, RTL, instant switching. No mechanics changed.
- **Architecture:** new `@crisis/i18n` package (`en.json`, `ar.json`, `t()`, `renderLog()`, `detectLocale()`, `dir()`). **Every visible string is a KEY** — the server stays **locale-agnostic** (sends keys + a locale-neutral structured `log: LogEntry[]`), and the **client translates everything**. So language switch is **instant** (no refresh, no server round-trip).
- **Content keyed:** `crises.ts`/`goals.ts` text → i18n keys; the engine's narration/goal-notes/endings → structured keys (`log.*`, `goal.note.*`, `ending.*.text`). `MatchState.log` is now `LogEntry[]`; `GoalResult` carries `noteKey`+`noteParams`.
- **RTL:** `<html dir>` toggled per locale; CSS uses logical properties (`text-align:start`, flex); numbers/timer/room codes wrapped in `.ltr` (isolated LTR); Arabic font = **Cairo** (Google Fonts) with system-Arabic fallback.
- **Default language:** `detectLocale()` → Arabic if `navigator.language` starts with `ar`, else English; overridable via `?lang=` or the in-UI language selector (persisted to `localStorage`).
- **Arabic quality:** natural Modern Standard Arabic (not literal machine translation).
- **Verified (headless):** node+web typecheck, 23 unit tests, bilingual sim (`npm run sim -- 5 42 ar`), netcheck/nettests/servecheck green, web build with `charset:'utf8'` (both languages literally in the bundle).
- **Needs a human (browser) pass:** visual RTL mirroring on each screen + mobile — the mechanism is in place (dir/logical CSS/LTR isolation) but pixels can't be checked headlessly. Covered by the [QA matrix](../04_Testing/QA_Report.md#4).
- **v0.2 backlog for i18n:** bundle the Arabic font locally for offline; add more languages by dropping in another `<lang>.json`; per-player server-side locale is intentionally NOT used (client-side keeps switching instant).

## Deviations from the 3.1 spec (no design impact)
- **npm workspaces instead of pnpm.** The sandbox had no pnpm; used npm workspaces for the v0.1 scaffold. Structure is identical; can switch to pnpm later. *(Priority: trivial.)*
- **esbuild postinstall** blocked by the sandbox's script policy → `npm rebuild esbuild` restores it (documented in README). Not a code issue.

## Faithful-subset choices for v0.1 (match the locked design; fuller versions later)
- **Crisis selection = linear authored playlist + link-conditioned effects.** The locked [CrisisSystem §4](../01_Game_Design/CrisisSystem.md) weighted, state-conditioned selector is a superset; with a 4-crisis prototype library, a linear playlist that applies `onStartLinkEffects` is a faithful subset (authored order + consequence links surfacing). The full weighted selector arrives with a larger content library. **No mechanic change.**
- **Tie resolution is single-pass in the pure engine.** [CoreLoop §5](../01_Game_Design/CoreLoop.md) specifies a quick re-vote on ties, then the meter-based tiebreak. The pure resolver applies the *same* meter-based tiebreak deterministically (needed so the rules function is single-pass/testable). The **interactive re-vote round** is a client/round-flow concern to add in M4; the final fallback is identical. **No mechanic change.**
- **Discussion, Quick Signals, reveal-info actions, reconnect, host-migration, spectators** are not in the headless engine — they are the networking/client milestones (M2–M4), specified in Phase 2. The engine already models `revealedCardIds` and connection flags for them.

## Observations to feed v0.2 (content/tuning — NOT design changes)
- **Info thinning at high player counts.** With 4 info cards and 8 players, ~half receive no card (verified in the 8p sim). The design is faithful (asymmetric info), but for good discussion at 6–8 players, **author more info cards per crisis** or scale card count to player count. This is a **content-authoring guideline / tuning** matter, aligns with the [Phase 2.6 §8](../Phase2_6_Prototype_Playtest/02_Playtest_Protocol.md) hypothesis and [Phase 2.5](../Phase2_5_Product_Validation.md) risks. → v0.2 content pass.
- **Conservative-play attractor & goal salience** ([Phase 2.5](../Phase2_5_Product_Validation.md) DC-1/BA-2) remain the key things to watch in real playtests of the built client — the engine faithfully enables them; whether they harm fun is an empirical question for M5 testing, not an engine fix.
- **Timer lengths, reconnect grace window, below-minimum threshold** — Phase-3 tunables the design deferred; set as constants when M2 adds the room loop.

## M2–M4 (networking + client) decisions — faithful, documented
- **Colyseus state sync = per-client redacted `state` messages, not `@colyseus/schema`.** Simpler and correct at 4–8 players; avoids decorators/build friction. **Crucially it enforces the fog**: each client only ever receives its own goal/cards. Schema-based delta compression is a **v0.2 optimization** (v0.1 ignores optimization). No design impact.
- **v0.1 client = a thin web client (plain TS + colyseus.js, esbuild).** Rationale: the sandbox can't run/verify an Expo build (no browser/emulator), and the priority is "playable ASAP, ugly fine." The web client is buildable/verifiable now and lets real players open a URL. **The approved Expo RN + RN-Web client remains the committed cross-platform target (M4b)** — a direct port reusing the identical server + rules + `ClientView` protocol. This is a client-shell sequencing tactic, **not** a design or stack change (server/rules unchanged). Flagged for owner review.
- **Option effects are hidden from players in v0.1 (titles only).** Matches the Phase 2.6 facilitator approach (players discuss without seeing the numbers). [Match §11.5](../02_Product_Design/Screens/Match.md) mentions showing "known effects (+ uncertain marks)" — how much to surface is a **v0.2 UX decision**, not a mechanic. No design change.
- **Networked integration test is a standalone script (`netcheck`), not a vitest test.** A live WS server inside vitest's worker pool crashes its IPC serialization (msgpack Buffer over `postMessage`). `netcheck` boots a real server + 4 real clients and asserts + exits 0/1 — same rigor, correct harness.
- **`msgpackr-extract` native build blocked by the sandbox** → msgpackr's pure-JS fallback is used (functionally fine). `esbuild` postinstall likewise needs `npm rebuild esbuild`.

## Ideas discovered during dev → parked for v0.2 (do NOT implement in v0.1)
- Scale info-card count to player count automatically.
- Deterministic **replay from seed + input log** (the engine is already pure/seeded — this is nearly free and great for debugging playtests).
- A tiny **content-lint CLI** (`tools/`) run in CI to gate new crises against authoring rules (the `lintContent` fn already exists).
- Weighted/intensity voting experiment (locked as post-MVP; the OptionButton slot is designed to swap).
