// Room codes and nickname rules are product-wide infrastructure, not game rules: the same
// validation already guards the existing room implementation. Re-exported here so BACKFIRE
// clients have one import surface, rather than forking a second copy of the rules.
export {
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  isRoomCode,
  normalizeRoomCode,
  validateNickname,
  type NicknameResult,
} from '@dass/domain';
