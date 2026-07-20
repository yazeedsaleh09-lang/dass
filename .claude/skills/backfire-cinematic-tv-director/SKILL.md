---
name: backfire-cinematic-tv-director
description: Treat the BACKFIRE television as the live director of the room. Use when reviewing or building any TV scene, transition, reveal, countdown, waiting state, threat meter, or replay in apps/bftv. Judges focal point, pacing, staging, silence, causal presentation, distance readability and persistent visual memory.
---

# BACKFIRE Cinematic TV Director

The TV stages CONSEQUENCES; it does not display information. Source: `apps/bftv/src/main.ts`,
`tv-css.ts`, `relay.ts`. The relay stage is persistent — the room watches ONE world change, not a
slideshow.

## Visual grammar you must keep distinct (readable from 3 meters, never colour alone)
- current event · pending danger · confirmed consequence · hidden cause · revealed cause ·
  persistent scar · recovery · **backfire**. Use composition, scale, direction, rhythm, typography,
  motion and silence — not just hue. (§32: world state is always spelled out in text too.)

## Scene grammar (already implemented — protect it)
remove distraction → establish subject → create expectation → hold → impact → explain → let it land
→ leave a scar. See `round3Resolution` (freeze → direction → balance → protection → silence → return)
and the layered `round2Resolution` (what, never who).

## Impact hierarchy
Reserve the strongest scale/motion/sound/silence for Level 4 (backfire) and Level 5 (final reveal).
Routine beats (waiting, lock counts) stay restrained so major beats land. Contrast is the rule.

## Non-negotiables
- **Secret safety**: the TV payload carries NO actor identity for secret actions before FINAL_REVEAL
  (proven by `bfcheck`). Never render anything the redacted view doesn't contain.
- **Abort on phase change**: every cinematic checks `sequenceToken`; a reconnect must not replay a
  stale dramatic event as if live.
- **Reduced motion + mute** must still be emotionally paced (`beat()` clamps, cue captions exist).
- **Adaptive reveal**: `finalRevealScene` renders a VARIABLE number of cards — never hard-code 5.

## Verification honesty
The in-app browser screenshot TIMES OUT on the TV (permanent rAF loop). Use the CDP harness
`npm run bfshots -- <dir>` for visual evidence. NEVER claim the TV "feels" better without human eyes.
