# BACKFIRE — Pre-Playtest Council Transcript

Question: Is the BACKFIRE vertical slice GO for a first living-room playtest with friends?
Run after: finding + fixing the replay dead-end (CRITICAL), full evidence gathering. Draft verdict under test: CONDITIONAL GO.

## Advisor responses

### The Contrarian
Fatal flaw isn't the code (coverage is strong) — it's the one thing no unit test catches: five first-timers parsing intricate secret-role rules in a noisy room with zero onboarding. Party games die in the first 90 seconds of confusion, and this is more cognitively loaded than Codenames/Werewolf. "EXACTLY 5" is a hard gate: the night someone cancels or a 6th wanders in, the session is dead on arrival — not a copy nit. TV-as-sole-host adds friction. But none of this is a correctness failure, so NOT NO-GO — a playtest exists to observe humans hitting these. CONDITIONAL GO holds; binding condition: recruit exactly 5 and explain the round structure aloud before phones light up. Don't trust the game to teach itself.

### The First Principles Thinker
A first playtest is an experiment, not a release gate — "GO/CONDITIONAL/NO-GO" is release language smuggled into a learning activity. The real question is "can five people complete one match without a technical failure hijacking the room's attention?" — verified yes. That's a met precondition, not "conditional." The 4–8 vs 5 copy bug is a pre-brief sentence ("bring exactly five"), not a shipping-ledger item; a first playtest is a facilitated event. The trap in "CONDITIONAL GO" is that it invites you to keep hardening scaffolding instead of learning whether the emotional loop lands. Run it this weekend; fix the copy in ten minutes first if it bugs you.

### The Expansionist
GO — and know what you're holding: the first Arabic-first, TV-anchored social format with a signature emotional beat (the backfire) built around what Arab living rooms already run on — reputation, hidden intent, public consequence. The undervalued asset is the 5-card causal reveal that NAMES who caused what — inherently screenshot-shareable; five phones + one TV = a five-person distribution event per session. It's a platform (four more worlds) not a title. CAPTURE from the first playtest: film the ROOM not the screen; mark the exact laugh/gasp second and which mechanic fired; log quotable Arabic TV lines; time the "one more round?" reflex; record what players explain to newcomers (that's your onboarding, written for free).

### The Outsider (zero context)
Got lost in specific places: (1) "Influence" — you score/win by it but nobody said what earns it; without "that move just cost me," it's a slot machine. (2) What Operator/tool/Echo actually DO to me — redirect vs shield, I'd just guess. (3) "Backfire" is the scariest word — if my Echo can bounce onto me I'll freeze, which is the opposite of fun. (4) The reveal cards are where you save or lose me: if they show only WHAT happened, not WHY it mattered, I won't know if I played well. Every round the host will have to lean over and explain. The secret-info-and-reveals bones are genuinely fun, but I need to understand my choices as I make them and my score when I see it.

### The Executor
GO — with one hard constraint and a runbook. Setup: same wifi; `npm run bfbuild` then `npm run dassserver`; open site at `http://<LAN-IP>:PORT` on the laptop, HDMI to TV, fullscreen; sanity check `npm run bfcheck` (green = sound). Host says: "everyone on my wifi, scan/type the code, name + Ready; I control the game — I start it." Host taps Start ON THE TV; same for Play Again. Failures: phone drops → reconnect restores seat (rejoin same name); 6th shows → refused, make them scorekeeper; only 4 → hard stop, won't start under 5; wifi → keep laptop on ethernet. Biggest bite: copy says 4–8 but it's exactly 5 — invite exactly 5 + a backup willing to watch. No blocker.

## Chairman synthesis

**Agreement (high confidence):** No NO-GO blocker — the slice is correct, secrets are safe, and it completes AND replays end-to-end. The dominant remaining risk is HUMAN comprehension, not software. "Exactly 5" is a real facilitation gate. The copy fix is trivial and should be done. The team must capture the emotional/social signal, since that is the only thing this playtest can actually teach.

**Clash:** GO vs CONDITIONAL GO. First-Principles/Expansionist/Executor say the technical precondition is met, so just run it. The Contrarian and Outsider say a first-timer is currently under-served on in-the-moment choice comprehension and scoring legibility, so it must not be run *unfacilitated*. Resolution: these aren't in conflict — the honest verdict is CONDITIONAL GO where the condition is a FACILITATION plan (host briefing + exactly-5 recruiting + copy fix), NOT more engineering. Re-reviewing the code shows the game already does more than the summary-only Outsider assumed — each tool ships an in-the-moment rule on the phone, and the final summary is explicitly causal ("… لأن …"). Whether that is *enough* for real first-timers is exactly the hypothesis the playtest exists to test.

**Blind spot caught in review:** Everyone except the Outsider assumed players understand what earns "Influence." Even though objectives are shown on each phone, the *link* between a hidden objective and the score is the most likely comprehension gap — worth watching explicitly.

**Recommendation:** CONDITIONAL GO. Conditions are facilitation, not code: (1) recruit exactly 5 (+ a willing spectator backup); (2) host briefs the premise + round shape aloud before phones light up and does not over-explain secrets; (3) fix the "4–8" copy to "5". Then run it and film the room.

**One thing first:** Recruit exactly five people for a specific night and tell them "bring nothing, it's exactly five of us" — the session cannot happen otherwise.
