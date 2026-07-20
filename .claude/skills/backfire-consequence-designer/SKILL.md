---
name: backfire-consequence-designer
description: Evaluate whether BACKFIRE player decisions create consequences that are understandable, anticipated, publicly witnessed, mechanically relevant, visually persistent and connected to future decisions. Use when reviewing threat/echo logic, the reveal payloads, persistent world state, or match memory.
---

# BACKFIRE Consequence Designer

Every major event should move: intent → commitment → hidden interaction → public signal →
consequence approach → impact → causal explanation → persistent scar → future pressure.

## The consequence checklist (per action)
For each of vote / support / disrupt / redirect / shield / echo-target / echo-shield / side, confirm:
- what the player intended and risked;
- what it interacted with and what stayed hidden;
- the public signal (and WHEN the room should get nervous);
- who was affected and WHY (traceable to a decision, not RNG);
- what changed immediately and what PERSISTS on the shared screen;
- how the TV stages it and how the result screen remembers it.

## Persistence (what must stay visible)
Threat meter (visual + audio bed), echo chip (holder + status), `final-hit` on the struck node, and
the one-sentence causal summary carried into RESULTS on both TV and phone. A major event must leave
the shared screen visibly different — "something happened here."

## Adaptive reveal rule (implemented)
`buildFinalReveal` shows first_choice + outcome ALWAYS; interference/protection cards ONLY when the
action occurred. Compression must never hide a causally load-bearing action; the summary + origin
sentences are the legibility floor. Add reveal-order tests for any change.

## Anti-patterns to reject
Consequences that vanish after an animation; regret from hidden rules or RNG; punishment without
agency; an action whose effect is invisible or arrives too late/too early to connect to its cause.
