import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Regression guard for the replay dead-end: in the create → /tv flow the TV holds the host token,
// so the phones never satisfy `hostId === you.id` and their Play Again / New Crew buttons never
// appear. If the TV results screen does not carry the host's replay controls, a finished match is
// stuck on RESULTS with no reachable way to start another round. See BackfireRoom `restart`/`newCrew`.
const tvMain = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');

describe('BACKFIRE TV replay controls', () => {
  it('lets the host restart the room from the TV results screen', () => {
    expect(tvMain).toContain("room?.send('restart'");
    expect(tvMain).toContain("room?.send('newCrew'");
    expect(tvMain).toMatch(/id="tv-again"/);
    expect(tvMain).toMatch(/id="tv-newcrew"/);
  });

  it('only exposes the controls once the server has confirmed this TV as host', () => {
    expect(tvMain).toMatch(/isHost\s*=\s*true/);
    // The controls must be gated on isHost, never rendered unconditionally.
    expect(tvMain).toMatch(/isHost\s*\n?\s*\?\s*`<div class="rs-actions">/);
  });
});
