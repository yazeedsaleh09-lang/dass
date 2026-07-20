# BACKFIRE — Specialist Council (Phase 12)

Six independent reviewers evaluated the ACTUAL rendered game (real-chromium screenshots at 1280×720
and 1920×1080, source, and the passing harnesses). Each judged only its lens, cited evidence, named
weaknesses, and scored. Below: each verdict, then the chairman synthesis and what was implemented vs
deferred.

---

## 1. Party Game Director (Fun / Social / Replay / Arc)
Scores: Fun 3 · Social 4 · Replayability 2 · Emotional arc 4
- **Strongest:** a real hidden-information engine (secret simultaneous decisions during open
  discussion, server-redacted); per-round asymmetric objectives over a shared-collapse stake; a
  legible 5-card causal payoff.
- **Weaknesses:** (1) FIXED content deck — only 15 intel + 15 objective templates, identical every
  match; replay dies after ~3–4 plays. (2) exactly-5 fragility. (3) thin scoring (max 3 Influence;
  ties resolved by opaque tiebreakers). (4) low agency density (~8 min, only 4 real decisions/player).
  (5) rules load on the conditional backfire.
- **Challenge:** the backfire may read as "punished for a rule I half-understood" rather than
  "outplayed by a person" — schadenfreude needs a human culprit. (Speculation — needs real faces.)

## 2. TV Broadcast Director (Composition / Readability / Hierarchy / Reveal)
Scores: Composition 4 · Distance readability 3 · Moment hierarchy 3 · Reveal staging 3
- **Strongest:** the lobby triptych (code/QR/seats) with the new "الطاقم مكتمل" line + single next
  action; the results hero with scannable ranked rows + causal one-liner; the reveal-hit beat.
- **Weaknesses:** (1) **reveal card text clipped off the bottom frame** — highest-priority defect.
  (2) decision dead-space; the relay floats small. (3) the threat meter is a tiny top-center element,
  invisible at 3m. (4) **results replay buttons clipped at the 720 bottom edge.** (5) the mute chip
  breaks the full-frame countdown blackout.
- **Challenge:** the horizontal 5-node relay may be under-scaled for its role as the decision-phase
  primary object.

## 3. Motion Director (Timing / Easing / Continuity / Restraint / Performance)
Scores: Timing 4 · Easing 4 · Continuity 4 · Restraint 4 · Performance 3
- **Strongest:** sequenceToken abort (a resyncing TV drops stale narration and snaps to the correct
  final state); Threat moves LAST, after every cause is on screen; the Backfire literally reverses
  its own drawn stroke — the motion *is* the mechanic.
- **Weaknesses:** (1) `tick()` is a permanent 60fps rAF doing querySelector + setProperty every frame
  all match. (2) **reduced-motion caps every beat at 220ms → narration blasts past unreadably.**
  (3) inline cinematic beziers bypass the M.* tokens (half-adopted). (4) `reveal()` animates blur on
  the largest type — jank risk on weak hardware. (5) orphaned setTimeouts in the return-path aren't
  token-gated.
- **Challenge:** "no continuous loops" is true on screen but false on the main thread (perpetual rAF).

## 4. Audio / Game-Feel (Cue hierarchy / Tension / Confirmation / Impact)
Scores: Cue hierarchy 3 · Tension 4 · Confirmation 4 · Impact 3
- **Strongest:** the Backfire is the only three-movement, travels-out/returns-heavier cue (a real
  reserved signature); function-encoded cues (redirect/backfire sweep the field, disrupt cuts,
  shield lands dense); Threat as a continuous pitch-dropping bed + captions + persisted mute.
- **Weaknesses:** (1) no master gain/limiter → bed + simultaneous cues + backfire/collapse (both peak
  0.2) can clip, muddying the biggest moments. (2) `event()` overloaded (generic + countdown-go +
  crew-complete) → flattened hierarchy. (3) bed pitch reads current value each call → cumulative
  drift. (4) backfire timing via wall-clock setTimeout can smear. (5) no bed-ducking under backfire.
- **Challenge:** louder ≠ bigger — impact is contrast (ducking/limiting), not amplitude.

## 5. Multiplayer QA & Security (Sync / Reconnect / Replay / Secrets / Invalid)
Scores: State sync 4.5 · Reconnect 4 · Replay 4 · Secret safety 4.5 · Invalid-action 4.5
- **Strongest:** single redaction boundary with correct phase gates; layered invalid-action defense
  (parseDecision → legalTargets → submitDecision); decision buffer cleared every phase (no bleed).
- **Weaknesses (mostly UNTESTED gaps):** (1) **host is a single point of failure** — reclaim needs
  the exact hostToken; if the TV loses sessionStorage or a new device opens post-match, restart/
  newCrew are unreachable (room stuck at RESULTS); no host handoff. (2) `bindHost` never evicts a
  prior host session → two TV tabs both think they're host (stale-tab replay race). (3) rate-limit
  keys on sessionId; reconnect mints a fresh one → a reconnect loop resets the throttle. (4) a
  decision phase can early-resolve on a reduced electorate if a seat disconnects mid-vote (robustness
  vs fairness conflated). (5) recovery-timeout mid-R2_TIEBREAK → settleTiebreak with a missing vote.
- **Challenge:** "idle players don't stall" hides that the same exclusion can silently shrink the
  electorate and alter balance.

## 6. Arabic UX (Naturalness / Concision / Typography / RTL / Room-distance)
Scores: Naturalness 4 · Concision 4 · Typography 3 · RTL 4 · Room-distance 3
- **Strongest:** deliberate nominal/gender-neutral generation (avoids misgendering free-text names);
  TV=MSA / phone=Gulf voice split; concise TV lines + consistent Arabic-Indic numerals on a heavy face.
- **Weaknesses:** (1) **terminology overload** — المُشغِّل/المحوِّل/المُرحِّل share the *muXaXXil*
  shape, near-homographs at 3m and muddy read aloud; المُرحِّل + المُشغِّل even co-occur in one
  reveal sentence. (2) register leaks inside the phone layer (Gulf beside MSA). (3) a five-noun
  metaphor stack (الصدى/النواة/الدرع/الشحنة/الحامل) with no on-TV glossary. (4) **"+١/−١" Latin signs
  before Arabic-Indic digits can visually flip in RTL.** (5) redirectHint too abstract/long for a
  timed glance.
- **Challenge:** the MSA/Gulf split may read as inconsistent polish, not intentional voice — test it.

---

## Chairman synthesis

**Where the council agrees (high confidence):**
- The engine, secret-safety, sync, reconnect, and replay are strong (all reviewers touching them
  scored ≥4). No reviewer found a secret leak or a match-completing/replay blocker.
- The two real, fixable presentation defects are **bottom-edge clipping** (reveal text + replay
  buttons) and **numeral/legibility inconsistencies** — both flagged independently.
- The biggest *non-blocking* limits are content-deck replay depth and first-timer rules load — real,
  but rule/content changes are explicitly out of scope before a human playtest.

**Where the council clashes:**
- Party-Game Director scores Replayability 2 (deck fatigue) while QA scores everything ≥4 — different
  lenses: one judges the 4th play, the other the 1st. For a FIRST playtest, the 1st-play lens governs.
- TV Director wants the relay enlarged and the threat meter promoted; Motion Director warns against
  more main-thread work. Resolution: promote via static hierarchy/size (cheap), not more animation.

**Blind spots caught in review:**
- Audio's cumulative bed-pitch drift and missing limiter (nobody else could hear it).
- QA's "reduced electorate early-resolve" — a fairness nuance hidden inside a robustness feature.
- Motion's reduced-motion 220ms cap making narration unreadable — an accessibility defect invisible
  to everyone reviewing at normal motion.

**Recommendation:** CONDITIONAL GO for a first playtest. Fix the clipping + numeral defects now
(done). Treat deck depth, exactly-5, host-handoff, audio limiter, and reduced-motion pacing as
documented follow-ups — none blocks a facilitated first session.

---

## Implemented from this council (verified with fresh screenshots + green harnesses)
- **TV Director #1 & #4 — clipping:** height-aware caps on the reveal card and results hero; the
  results rows region shrinks (`minmax(0,1fr)` + overflow) so the replay buttons never clip. Verified
  at 1280×720 and 1920×1080.
- **Arabic UX #4 — numeral flip:** "+١/−١" rewritten as "زائد واحد/ناقص واحد"; and all engine-
  generated reveal/summary strings now pass through `arDigits` so Latin tally digits render Arabic-
  Indic ("ليلى بـ ٥ مقابل ٠"). Verified on the reveal card.
- **Arabic UX #5 — redirectHint:** shortened to "ينفع فقط إذا كان المصدر مدعوماً".
- (From the earlier TV pass, pre-council) crew-complete lobby moment, readable readiness status,
  3·2·1 countdown, and wordmark/mute edge-safety — all verified.

## Deferred (documented, NOT changed before the human playtest)
- Motion #2 reduced-motion narration pacing: the correct fix is a beats refactor (separate title-
  holds from transition-waits) so reduced motion stays readable WITHOUT truncating cinematics under a
  compressed clock. A blanket change was tried and **reverted** because it truncated the R3 payoff
  under the `?fast=` test clock (headless reports reduced-motion). Needs the refactor to do safely.
- Party-Game #1 content-deck depth; #2 exactly-5; #3 scoring legibility — rule/content, playtest-first.
- QA host-handoff, rate-limit-by-pid, reduced-electorate guard — server changes to validate post-play.
- Audio master limiter + bed-ducking + de-overloading `event()` — real polish, low playtest risk.
- Motion `tick()` node caching — perf; needs care around scene rebuilds.
