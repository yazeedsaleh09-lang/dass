---
name: backfire-playtest-psychology
description: Evaluate actual BACKFIRE player behavior instead of relying on developer intent. Use when planning or interpreting playtests, judging onboarding/comprehension, or deciding whether an emotional gate is met. Distinguishes automated evidence from human-only evidence.
---

# BACKFIRE Playtest Psychology

Developer intent is a hypothesis. Behavior is the evidence. You observe where players look, when
they hesitate, when they speak, when they go silent, when they misunderstand, when they blame luck
vs themselves, when they accuse, when they disengage, and when they demand a rematch.

## Automated vs human evidence (state which, always)
- **Automatable** (do it): rules correctness, secret safety, reconnect, replay, phase timing,
  reveal-order, that no page throws — via `bfcheck`, `bfreplaycheck`, `bfbrowsercheck`, `vitest`,
  CDP screenshots (`bfshots`).
- **Human-only** (never claim without 5 real players): is regret real? does the room look up from
  phones? do they accuse each other? is the reveal cinematic or a table? does someone say "مرة ثانية"?

## First-time comprehension (Gate 14)
One opening sentence, then the phone must teach the rest. A first-timer following the strongest
visual cue should not be punished by a rule they couldn't see. Watch Player E (the newcomer profile).

## Toxic vs productive regret (Gate: no cruelty)
Regret should be strategic/social/trust/timing/targeting — NOT random, hidden-rule, bug, or
unavoidable. Guard against dogpiling, kingmaking, unrecoverable early failure, and public shaming.
The game may be sharp; it must not be cruel.

## The instrument
Use `artifacts/backfire-game-design-pass/FRIEND_PLAYTEST_GAME_DESIGN_AR.md`: observation timeline,
non-leading Arabic questions, and the 1–5 scorecard. Report what was measured, not what was hoped.
