// V2 headless playable — drives the redesigned loop (roles, hidden bands, commit -> reveal
// -> challenge -> lock, credibility, consequence threads, documentary ending).
//   npm run v2sim -- [players] [seed] [ar|en]
import {
  availableOptions, beginMatch, bandFor, content, getCrisis, getRole, initMatch, makeRng,
  nextPhase, revealInfo, setCommit, STATE_VARS, type MatchState, type PlayerInput,
} from '@crisis/v2';
import { renderLog, t, type Locale } from '@crisis/i18n';

const count = Math.max(4, Math.min(6, Number(process.argv[2] ?? '6') || 6));
const seed = Number(process.argv[3] ?? '7') || 7;
const L: Locale = process.argv[4] === 'en' ? 'en' : 'ar';

const players: PlayerInput[] = Array.from({ length: count }, (_, i) => ({ id: `p${i + 1}`, nickname: `لاعب ${i + 1}` }));

let printed = 0;
const flush = (s: MatchState) => { for (; printed < s.timeline.length; printed++) console.log('  ' + renderLog(s.timeline[printed]!, L)); };
const bands = (s: MatchState) => STATE_VARS.map((v) => `${t(L, `v2.var.${v}`)}: ${t(L, `v2.band.${bandFor(s.city[v])}`)}`).join(' · ');

console.log('=========================================================');
console.log(` V2 — ${count} players, seed ${seed}, lang ${L}`);
console.log('=========================================================');

let s = initMatch(players, content, seed);
flush(s);
console.log('\n' + t(L, 'v2.ui.yourRole') + ':');
for (const p of s.players) console.log(`  ${p.nickname} → ${t(L, getRole(content, p.roleId).nameKey)}`);

s = beginMatch(s, content);

while (!s.ended) {
  if (s.phase === 'briefing') {
    console.log('\n---------------------------------------------------------');
    flush(s);
    console.log('  ' + t(L, 'v2.ui.cityStatus') + ' — ' + bands(s));
    const crisis = getCrisis(content, s.currentCrisisId!);
    // players share their held info (exercises credibility + rumor reveal)
    for (const p of s.players) for (const id of [...p.heldInfoIds]) s = revealInfo(s, p.id, id, content);
    for (const ri of s.revealedInfo) {
      const who = s.players.find((p) => p.revealedInfoIds.includes(ri.infoId))!;
      console.log(`    ${who.nickname} [${t(L, `v2.conf.${ri.confidence}`)}]: ${t(L, ri.textKey)}`);
    }
    void crisis;
  }

  if (s.phase === 'commit') {
    const crisis = getCrisis(content, s.currentCrisisId!);
    const opts = availableOptions(crisis);
    const rng = makeRng(seed + s.crisisIndex * 31 + 5);
    for (const p of s.players) {
      const stake = getRole(content, p.roleId).stake;
      const best = opts.map((o) => ({ o, v: (o.effects[stake] ?? 0) + rng() * 4 })).sort((a, b) => b.v - a.v)[0]!.o;
      s = setCommit(s, p.id, best.id);
    }
  }

  if (s.phase === 'reveal') {
    console.log('  ' + t(L, 'v2.ui.whereTheyStand') + ':');
    const crisis = getCrisis(content, s.currentCrisisId!);
    for (const p of s.players) {
      const oid = s.revealSnapshot?.[p.id];
      const label = oid ? t(L, crisis.options.find((o) => o.id === oid)!.titleKey) : t(L, 'v2.ui.undecided');
      console.log(`    ${p.nickname}: ${label}`);
    }
  }

  s = nextPhase(s, content);
  flush(s);
}

console.log('\n=========================================================');
console.log(' ' + t(L, 'v2.ui.cityStatus') + ' — ' + bands(s));
console.log(' ' + t(L, 'v2.ui.roleOutcomes') + ':');
for (const ro of s.roleOutcomes ?? []) {
  const note = t(L, ro.noteKey, { role: t(L, getRole(content, ro.roleId).nameKey) });
  const cred = ro.credibilityKey ? '  ‹' + t(L, ro.credibilityKey) + '›' : '';
  console.log(`   ${ro.nickname}: ${note}${cred}`);
}
console.log('=========================================================');
