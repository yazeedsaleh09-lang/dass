import type { BfPublicPlayer } from '@backfire/domain';
import { escapeHtml, seatGlyph } from '@backfire/ui';

/** Stage geometry. One coordinate system shared by the markup and every animation. */
export const VIEW_W = 1000;
export const VIEW_H = 460;
export const NODE_Y = 200;
export const FLOOR_Y = 430;
const FIRST_X = 130;
const GAP_X = 185;

export function nodeX(index: number): number {
  return FIRST_X + index * GAP_X;
}

/**
 * The relay: one thin line, five positions on it, and two effect layers.
 * Support arcs rise from the floor of the stage — never from a player's position — so the
 * picture can show that support arrived without ever showing who sent it.
 */
export function relayStage(players: BfPublicPlayer[]): string {
  const nodes = players
    .slice(0, 5)
    .map((p, i) => {
      const x = nodeX(i);
      return `
      <g class="rnode" data-id="${escapeHtml(p.id)}" transform="translate(${x} ${NODE_Y})">
        <rect class="rn-shield" x="-38" y="-38" width="76" height="76" rx="3"/>
        <circle class="rn-echo echo-ring" r="40"/>
        <rect class="rn-box" x="-27" y="-27" width="54" height="54" rx="2"/>
        <text class="rn-glyph" text-anchor="middle" dy="8">${seatGlyph(p.seat)}</text>
        <text class="rn-name" text-anchor="middle" y="76">${escapeHtml(p.nickname)}</text>
        <text class="rn-tag" text-anchor="middle" y="102"></text>
      </g>`;
    })
    .join('');

  return `
  <svg class="relay-svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="المُرحِّل">
    <g id="arcs" class="layer-arcs"></g>
    <path id="relayline" class="relay-line" d="M40 ${NODE_Y} L${VIEW_W - 40} ${NODE_Y}"/>
    <path id="fracture" class="fracture" d="M470 ${NODE_Y - 34} L500 ${NODE_Y} L478 ${NODE_Y + 12} L532 ${NODE_Y + 46}"/>
    <g class="layer-nodes">${nodes}</g>
    <g id="returns" class="layer-returns"></g>
  </svg>`;
}
