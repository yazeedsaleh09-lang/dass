---
name: backfire-live-room-director
description: >-
  Evaluate and direct the BACKFIRE living-room experience — one shared TV plus five private phones
  — phase by phase. Use when reviewing, tuning, or building any BACKFIRE TV scene, phone screen,
  transition, reveal, countdown, waiting state, or replay flow, or when judging whether a change
  keeps the TV in command of the room. Not a generic UI skill: it encodes BACKFIRE's rules,
  secret-safety boundary, and the "The Broken Relay" round structure.
version: 1.0.0
---

# BACKFIRE — Live-Room Director

BACKFIRE is played on ONE television (the host/director) and FIVE private phones (controllers).
The TV is the room's narrator, referee, suspense engine, and public memory. The phones hold private
information and secret decisions. This skill is the lens for keeping the TV in command and every
phase purposeful.

## The three laws (never break these)

1. **Secret safety is absolute.** The TV and every other phone must never receive a player's intel,
   objective, tool, target, vote, side, or authorship before its intended reveal frame. Redaction
   lives on the server (`redactBackfireFor`); the TV shows COUNTS and OUTCOMES, never owners, until
   `FINAL_REVEAL`. Round-1 individual votes and Round-3 individual sides are never published at all.
2. **The TV directs; phones defer.** After a private action, the phone says "ارفع نظرك للشاشة" and
   goes quiet. Phones must not duplicate the TV or become a competing main screen.
3. **Server authority.** Phase, timer, tool, target legality, capacity (exactly 5), and replay
   (host/TV-only `restart`/`newCrew`) are decided server-side. The TV renders; it never invents.

## Per-phase evaluation matrix

Score every phase against all of these. If any cell is blank or accidental, it is a defect.

| Field | Question |
|---|---|
| Phase name | Which FSM phase (LOBBY, INTRO, R*_EVENT/INTEL/DISCUSSION/DECISION/RESOLUTION/AFTERSHOCK, FINAL_REVEAL, RESULTS)? |
| TV communicates | The one public situation the room reads in ≤3s from 3m away. |
| Phone communicates | The private task for THIS player only (or "look up"). |
| Required player action | Vote / use tool / pick side / read / discuss / wait. |
| Expected room conversation | What players say aloud here. |
| Expected emotion | Curiosity, pressure, suspicion, dread, release, laughter. |
| Reason to look at TV | The public stakes/consequence only the TV holds. |
| Reason to look at phone | The private thing only this phone holds (or none → look up). |
| Main visual focus | The single dominant element. |
| Main audio cue | One cue, from the right family (system/tension/confirm/threat/backfire/result). |
| Main motion cue | One motion at the right hierarchy level (see below). |
| Max acceptable dead time | Seconds before the scene loses energy. |
| Reveal / payoff | What the scene resolves or promises. |
| Spectator comprehension | Can a non-player at 3m follow it without a phone? |
| Failure conditions | Idle player, dropped phone, dropped TV, malformed input. |
| Recovery behavior | What happens on reconnect / timeout; state must never stall. |
| Accessibility | Semantic controls, contrast, non-colour-only state, caption for every critical sound. |
| Reduced-motion | Collapses to instant fade; no information hidden behind motion. |
| Network-delay behavior | Waiting must be distinguishable from a freeze (stateful motion / counts). |

## Motion hierarchy (reserve strength for meaning)

- **L0 Static** — routine text, stable layout. Default.
- **L1 Feedback** — press, ready, select, confirm. Immediate (~120–200ms).
- **L2 Transition** — phase change, player join, timer urgency. Fast (~200–360ms).
- **L3 Dramatic** — lock-in, interference, backfire, threat change. Earns ~500–900ms.
- **L4 Signature** — final reveal, results. The only place長 sequences are allowed.

Rules: transform/opacity only; no continuous full-screen loops; no dramatic loop; never hide
information behind a long transition; a reconnecting/late client renders the correct FINAL state
without replaying stale animation (guard cinematics with a phase/sequence token).

## Audio families (distinct, short, hierarchical)

system · tension · confirmation · threat · backfire · victory/result. Never one beep for everything.
Mute persists. Every critical cue has an on-screen text caption. Fail silently if audio is absent.

## Four questions every phase must answer on the TV

1. What is happening? 2. What should we do? 3. How much time remains? 4. What happens next?

## The two acceptance tests

- **3-second test:** a person who didn't build the game, 3m away, understands the broad situation
  and the group's job within ~3 seconds, without asking.
- **Eyes-up test:** at least once per match all five players naturally stop looking at their phones
  and focus on the same TV moment (target moments: the 3·2·1 countdown, the Echo landing/backfire,
  the final reveal).

## Rubric (score each 0–5; 0 absent, 3 adequate, 5 authored and distinctive)

Clarity · Tension · Social energy · Readability (3m) · Motion quality · Audio quality ·
Reveal satisfaction · Replay desire · TV authority · Phone confidence · Spectator comprehension ·
Reliability.

A phase passes only if Clarity ≥4, Readability ≥4, and no secret-safety or reliability defect.
The match passes only if the eyes-up test is met at least once and the reveal explains CAUSE and
CONSEQUENCE (not just a result).

## How to use

1. Walk every phase through the matrix using the REAL rendered TV and phones (browser at
   1280×720 / 1920×1080 and phones at 320/390/430), not source alone.
2. Rank defects Critical/High/Medium/Low with evidence, player impact, root cause, fix, and a
   verification method.
3. Fix presentation and safe pacing issues with hierarchy, timing, state feedback, and TV/phone
   responsibility — NOT by adding more text. Never weaken server validation to simplify UI.
4. Re-verify with fresh screenshots and the harnesses (`bfcheck`, `bfreplaycheck`, `bfbrowsercheck`,
   `bfshots`) before claiming a phase improved.
