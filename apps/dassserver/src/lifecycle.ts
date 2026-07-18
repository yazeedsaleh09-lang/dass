import { randomBytes } from 'node:crypto';
import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH, isRoomCode, normalizeRoomCode } from '@dass/domain';

export type RoomLifecycleStatus = 'active' | 'closed' | 'expired' | 'invalid';

interface LifecycleEntry {
  status: Exclude<RoomLifecycleStatus, 'invalid'>;
  expiresAt?: number;
}

const statuses = new Map<string, LifecycleEntry>();
const TOMBSTONE_MS = 60 * 60 * 1000;

function pruneExpiredTombstone(code: string): void {
  const entry = statuses.get(code);
  if (entry?.expiresAt && entry.expiresAt <= Date.now()) statuses.delete(code);
}

export function makeRoomCode(): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    const bytes = randomBytes(ROOM_CODE_LENGTH);
    let code = '';
    for (const byte of bytes) code += ROOM_CODE_ALPHABET[byte % ROOM_CODE_ALPHABET.length];
    pruneExpiredTombstone(code);
    if (!statuses.has(code)) return code;
  }
  throw new Error('Unable to allocate a unique room code');
}

export function setRoomStatus(roomCode: string, status: Exclude<RoomLifecycleStatus, 'invalid'>): void {
  statuses.set(normalizeRoomCode(roomCode), {
    status,
    expiresAt: status === 'expired' ? Date.now() + TOMBSTONE_MS : undefined,
  });
}

export function getRoomStatus(rawCode: string): RoomLifecycleStatus {
  const code = normalizeRoomCode(rawCode);
  if (!isRoomCode(code)) return 'invalid';
  pruneExpiredTombstone(code);
  return statuses.get(code)?.status ?? 'invalid';
}
