import { Room, type Client } from 'colyseus';
import {
  beginMatch, content, initMatch, nextPhase, redactStateFor, revealInfo, setCommit,
  type ClientView, type MatchState, type PlayerInput, type Phase,
} from '@crisis/v2';

interface LobbyPlayer { id: string; seat: number; nickname: string; ready: boolean; connected: boolean }
type PhaseMs = Partial<Record<Phase, number>>;

const DEFAULT_PHASE_MS: Record<string, number> = {
  briefing: 12000, discussion: 120000, commit: 15000, reveal: 6000, challenge: 20000, resolution: 8000, interlude: 8000,
};
const MIN_PLAYERS = 4;

export interface V2RoomOptions { seed?: number; phaseMs?: PhaseMs; minPlayers?: number }

/** Authoritative V2 room. Server owns the phase FSM + timers; clients send intents; each
 *  client receives a redacted view (roles public, own info private, commits hidden until reveal). */
export class V2Room extends Room {
  override maxClients = 8;
  private lobby: LobbyPlayer[] = [];
  private match: MatchState | null = null;
  private hostId?: string;
  private seatCounter = 0;
  private phaseMs: Record<string, number> = { ...DEFAULT_PHASE_MS };
  private minPlayers = MIN_PLAYERS;
  private seed = 1;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private phaseEndsAt?: number;
  private continues = new Set<string>();

  override onCreate(options: V2RoomOptions = {}): void {
    this.phaseMs = { ...DEFAULT_PHASE_MS };
    for (const [k, v] of Object.entries(options.phaseMs ?? {})) if (typeof v === 'number') this.phaseMs[k] = v;
    this.minPlayers = options.minPlayers ?? MIN_PLAYERS;
    this.seed = options.seed ?? Math.floor(Math.random() * 1_000_000_000);

    this.onMessage('setNickname', (c, m: { name?: string }) => {
      const name = String(m?.name ?? '').slice(0, 20) || 'Player';
      const lp = this.lobby.find((p) => p.id === c.sessionId);
      if (lp) lp.nickname = name;
      const ps = this.match?.players.find((p) => p.id === c.sessionId);
      if (ps) ps.nickname = name;
      this.push();
    });
    this.onMessage('ready', (c, m: { ready?: boolean }) => {
      if (this.match) return;
      const lp = this.lobby.find((p) => p.id === c.sessionId);
      if (lp) lp.ready = m?.ready ?? !lp.ready;
      this.push();
    });
    this.onMessage('start', (c) => {
      if (this.match || c.sessionId !== this.hostId) return;
      if (this.lobby.length < this.minPlayers || this.lobby.filter((p) => p.ready && p.connected).length < this.minPlayers) return;
      this.startMatch();
    });
    this.onMessage('commit', (c, m: { optionId?: string | null }) => {
      if (!this.match || (this.match.phase !== 'commit' && this.match.phase !== 'challenge')) return;
      this.match = setCommit(this.match, c.sessionId, m?.optionId ?? undefined);
      this.push();
    });
    this.onMessage('reveal', (c, m: { infoId?: string }) => {
      if (!this.match || !m?.infoId) return;
      if (this.match.phase !== 'discussion' && this.match.phase !== 'commit') return;
      this.match = revealInfo(this.match, c.sessionId, m.infoId, content);
      this.push();
    });
    this.onMessage('continue', (c) => {
      if (!this.match) return;
      const ph = this.match.phase;
      if (ph !== 'briefing' && ph !== 'discussion' && ph !== 'interlude' && ph !== 'reveal') return;
      this.continues.add(c.sessionId);
      const connected = this.match.players.filter((p) => p.connected).length;
      if (this.continues.size >= connected) this.advance();
      else this.push();
    });
  }

  override onJoin(client: Client, options: { nickname?: string } = {}): void {
    const nickname = String(options?.nickname ?? '').slice(0, 20) || `Player ${this.seatCounter + 1}`;
    if (!this.hostId) this.hostId = client.sessionId;
    if (this.match) { client.send('state', this.spectate(client.sessionId)); return; }
    this.lobby.push({ id: client.sessionId, seat: this.seatCounter++, nickname, ready: false, connected: true });
    this.push();
  }

  override async onLeave(client: Client, consented: boolean): Promise<void> {
    this.setConnected(client.sessionId, false);
    this.migrateHost(client.sessionId);
    if (consented) { this.dropLobby(client.sessionId); this.migrateHost(client.sessionId); this.push(); return; }
    this.push();
    try { await this.allowReconnection(client, 30); this.setConnected(client.sessionId, true); this.push(); }
    catch { this.dropLobby(client.sessionId); this.migrateHost(client.sessionId); this.push(); }
  }

  override onDispose(): void { if (this.timer) clearTimeout(this.timer); }

  private startMatch(): void {
    const players: PlayerInput[] = this.lobby.slice().sort((a, b) => a.seat - b.seat).map((p) => ({ id: p.id, nickname: p.nickname }));
    let s = initMatch(players, content, this.seed);
    s = beginMatch(s, content);
    for (const ps of s.players) ps.connected = this.lobby.find((l) => l.id === ps.id)?.connected ?? true;
    this.match = s;
    this.schedule();
    this.push();
  }
  private schedule(): void {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    this.continues.clear();
    if (!this.match || this.match.ended) { this.phaseEndsAt = undefined; return; }
    const dur = this.phaseMs[this.match.phase] ?? 10000;
    this.phaseEndsAt = Date.now() + dur;
    this.timer = setTimeout(() => this.advance(), dur);
  }
  private advance(): void {
    if (!this.match || this.match.ended) return;
    this.match = nextPhase(this.match, content);
    if (this.match.ended) { this.phaseEndsAt = undefined; if (this.timer) { clearTimeout(this.timer); this.timer = null; } this.push(); return; }
    this.schedule();
    this.push();
  }

  private setConnected(id: string, v: boolean): void {
    const lp = this.lobby.find((p) => p.id === id); if (lp) lp.connected = v;
    const ps = this.match?.players.find((p) => p.id === id); if (ps) ps.connected = v;
  }
  private migrateHost(leaving: string): void {
    if (this.hostId !== leaving) return;
    const pool = this.match ? this.match.players : this.lobby;
    this.hostId = pool.find((p) => p.connected && p.id !== leaving)?.id;
  }
  private dropLobby(id: string): void { if (!this.match) this.lobby = this.lobby.filter((p) => p.id !== id); }

  private push(): void { for (const c of this.clients) c.send('state', this.viewFor(c.sessionId)); }
  private viewFor(id: string): ClientView {
    if (!this.match) return this.lobbyView(id);
    const v = redactStateFor(this.match, id, content, this.hostId);
    v.phaseEndsAt = this.match.ended ? undefined : this.phaseEndsAt;
    return v;
  }
  private lobbyView(id: string): ClientView {
    return {
      phase: 'lobby', crisisIndex: -1, total: content.playlist.length,
      cityBands: { infrastructure: 'stable', trust: 'stable', economy: 'stable', health: 'stable' },
      players: this.lobby.map((p) => ({ id: p.id, seat: p.seat, nickname: p.nickname, roleId: 'community', nameKey: '', connected: p.connected, ready: p.ready, hasCommitted: false, isHost: p.id === this.hostId })),
      you: { id, info: [] }, revealedInfo: [], timeline: [], ended: false,
    };
  }
  private spectate(id: string): ClientView {
    if (!this.match) return this.lobbyView(id);
    const v = redactStateFor(this.match, '__spectator__', content, this.hostId);
    v.you = { id, info: [] };
    v.phaseEndsAt = this.match.ended ? undefined : this.phaseEndsAt;
    return v;
  }
}
