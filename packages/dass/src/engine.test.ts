import { describe, it, expect } from 'vitest';
import {
  initGame,
  startGame,
  applyDeclare,
  applyLock,
  resolveRound,
  endGame,
  computeWinner,
  redactDassStateFor,
} from './engine.js';
import { DEFAULT_CONFIG as cfg } from './config.js';
import type { PlayerInput } from './types.js';

function four(): PlayerInput[] {
  return [
    { id: 'a', nickname: 'A', seat: 0 },
    { id: 'b', nickname: 'B', seat: 1 },
    { id: 'c', nickname: 'C', seat: 2 },
    { id: 'd', nickname: 'D', seat: 3 },
  ];
}
const get = (s: ReturnType<typeof initGame>, id: string) => s.players.find((p) => p.id === id)!;

describe('init', () => {
  it('baseline live, empty vault, rounds by player count', () => {
    const s = initGame(four(), cfg);
    expect(s.players.every((p) => p.liveStock === cfg.baselineLive)).toBe(true);
    expect(s.players.every((p) => p.vault === 0)).toBe(true);
    expect(s.totalRounds).toBe(8); // 4 players → 8
  });
});

describe('action validation', () => {
  it('rejects self-target / missing target; accepts sell and a valid back', () => {
    const s = startGame(initGame(four(), cfg));
    expect(applyDeclare(s, 'a', { kind: 'back', target: 'a' })).toBe(false);
    expect(applyDeclare(s, 'a', { kind: 'back', target: 'z' })).toBe(false);
    expect(applyDeclare(s, 'a', { kind: 'back', target: 'b' })).toBe(true);
    expect(applyDeclare(s, 'a', { kind: 'sell' })).toBe(true);
  });
  it('lock requires the LOCK phase and a prior declare', () => {
    const s = startGame(initGame(four(), cfg));
    s.phase = 'LOCK';
    expect(applyLock(s, 'a', { kind: 'dump', target: 'b' })).toBe(false); // no declare
    s.declares['a'] = { kind: 'back', target: 'b' };
    expect(applyLock(s, 'a', { kind: 'dump', target: 'b' })).toBe(true);
  });
});

describe('resolveRound', () => {
  it('back raises, dump lowers; a dassة is flagged when locked != declared, honored otherwise', () => {
    const s = startGame(initGame(four(), cfg));
    s.declares['a'] = { kind: 'back', target: 'b' };
    s.declares['b'] = { kind: 'back', target: 'c' };
    s.phase = 'LOCK';
    applyLock(s, 'a', { kind: 'dump', target: 'b' }); // a betrays: said back, does dump
    s.phase = 'REVEAL';
    const rec = resolveRound(s, cfg);
    expect(get(s, 'b').liveStock).toBe(cfg.baselineLive - cfg.dumpAmount);
    expect(get(s, 'c').liveStock).toBe(cfg.baselineLive + cfg.backAmount);
    expect(rec.reveal.entries.find((e) => e.playerId === 'a')!.isDassa).toBe(true);
    expect(rec.reveal.entries.find((e) => e.playerId === 'b')!.isDassa).toBe(false);
  });

  it('sell snapshots AFTER this round movement, then resets to baseline', () => {
    const s = startGame(initGame(four(), cfg));
    s.declares['a'] = { kind: 'sell' };
    s.declares['b'] = { kind: 'dump', target: 'a' };
    s.phase = 'REVEAL';
    resolveRound(s, cfg);
    expect(get(s, 'a').vault).toBe(cfg.baselineLive - cfg.dumpAmount); // banked post-dump
    expect(get(s, 'a').liveStock).toBe(cfg.baselineLive); // reset
  });
});

describe('endGame', () => {
  it('market-close banks unsold live at the haircut and picks the biggest Vault', () => {
    const s = startGame(initGame(four(), cfg));
    get(s, 'a').vault = 20;
    get(s, 'a').liveStock = 10;
    get(s, 'b').vault = 22;
    get(s, 'b').liveStock = 0;
    endGame(s, cfg); // a: 20 + floor(10*0.5) = 25 ; b: 22
    expect(get(s, 'a').vault).toBe(25);
    expect(s.winnerIds).toEqual(['a']);
    expect(s.ended).toBe(true);
  });

  it('tiebreak: equal Vault → more vaultLeaderRounds wins', () => {
    const s = startGame(initGame(four(), cfg));
    get(s, 'a').vault = 30;
    get(s, 'a').vaultLeaderRounds = 5;
    get(s, 'b').vault = 30;
    get(s, 'b').vaultLeaderRounds = 2;
    expect(computeWinner(s)).toEqual(['a']);
  });
});

describe('security: redactDassStateFor', () => {
  it("never leaks another player's locked action before REVEAL", () => {
    const s = startGame(initGame(four(), cfg));
    s.declares['a'] = { kind: 'back', target: 'b' }; // a's PUBLIC promise
    s.declares['b'] = { kind: 'back', target: 'c' };
    s.phase = 'LOCK';
    applyLock(s, 'a', { kind: 'dump', target: 'b' }); // a's SECRET betrayal
    applyLock(s, 'b', { kind: 'sell' });

    const bView = redactDassStateFor(s, 'b');
    expect(bView.you.locked).toEqual({ kind: 'sell' }); // b sees its OWN lock
    expect(bView.declares['a']).toEqual({ kind: 'back', target: 'b' }); // only a's PUBLIC declare
    expect(bView.reveal).toBeUndefined(); // not revealed yet
    // a's secret is the only 'dump' anywhere this round; it must not appear in b's frame:
    expect(JSON.stringify(bView).includes('dump')).toBe(false);
  });

  it('reveals actual actions (and dassة) at REVEAL', () => {
    const s = startGame(initGame(four(), cfg));
    s.declares['a'] = { kind: 'back', target: 'b' };
    s.phase = 'LOCK';
    applyLock(s, 'a', { kind: 'dump', target: 'b' });
    s.phase = 'REVEAL';
    resolveRound(s, cfg);
    const bView = redactDassStateFor(s, 'b');
    const aEntry = bView.reveal?.entries.find((e) => e.playerId === 'a');
    expect(aEntry?.actual).toEqual({ kind: 'dump', target: 'b' });
    expect(aEntry?.isDassa).toBe(true);
  });
});
