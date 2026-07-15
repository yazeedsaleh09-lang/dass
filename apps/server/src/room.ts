import { Room, type Client } from 'colyseus';
import { content } from '@crisis/content';
import {
  beginMatch,
  castVote,
  initMatch,
  nextPhase,
  redactStateFor,
  revealInfo,
  type ClientView,
  type MatchState,
  type PlayerInput,
  type PublicPlayer,
} from '@crisis/shared';

interface LobbyPlayer {
  id: string;
  seat: number;
  nickname: string;
  ready: boolean;
  connected: boolean;
}

type PhaseMs = Record<string, number>;

// Real durations for play; overridable per-room (tests use tiny values).
const DEFAULT_PHASE_MS: PhaseMs = {
  briefing: 8000,
  deliberation: 90000,
  decision: 25000,
  resolution: 6000,
  interlude: 8000,
};
const MIN_PLAYERS = 4;

export interface MatchRoomOptions {
  seed?: number;
  phaseMs?: Partial<PhaseMs>;
  minPlayers?: number;
}

/**
 * Authoritative room = one match. Wraps the pure @crisis/shared engine.
 * The server owns all timers, vote resolution, and per-client REDACTED state
 * (never leaks another player's private goal/cards — the Fog of Crisis).
 */
export class MatchRoom extends Room {
  override maxClients = 8;

  private lobby: LobbyPlayer[] = [];
  private matchState: MatchState | null = null;
  private hostId?: string;
  private seatCounter = 0;
  private phaseMs: PhaseMs = { ...DEFAULT_PHASE_MS };
  private minPlayers = MIN_PLAYERS;
  private seed = 1;
  private phaseTimer: ReturnType<typeof setTimeout> | null = null;
  private phaseEndsAt?: number;
  private continueVotes = new Set<string>();

  override onCreate(options: MatchRoomOptions = {}): void {
    this.phaseMs = { ...DEFAULT_PHASE_MS };
    for (const [k, v] of Object.entries(options.phaseMs ?? {})) {
      if (typeof v === 'number') this.phaseMs[k] = v;
    }
    this.minPlayers = options.minPlayers ?? MIN_PLAYERS;
    this.seed = options.seed ?? Math.floor(Math.random() * 1_000_000_000);

    this.onMessage('setNickname', (client, msg: { name?: string }) => {
      const name = String(msg?.name ?? '').slice(0, 20) || 'Player';
      const lp = this.lobby.find((p) => p.id === client.sessionId);
      if (lp) lp.nickname = name;
      const ps = this.matchState?.players.find((p) => p.id === client.sessionId);
      if (ps) ps.nickname = name;
      this.pushState();
    });

    this.onMessage('ready', (client, msg: { ready?: boolean }) => {
      if (this.matchState) return; // ready only in lobby
      const lp = this.lobby.find((p) => p.id === client.sessionId);
      if (lp) lp.ready = msg?.ready ?? !lp.ready;
      this.pushState();
    });

    this.onMessage('start', (client) => {
      if (this.matchState) return;
      if (client.sessionId !== this.hostId) return; // host-only
      const readyCount = this.lobby.filter((p) => p.ready && p.connected).length;
      if (this.lobby.length < this.minPlayers || readyCount < this.minPlayers) return;
      this.startMatch();
    });

    this.onMessage('vote', (client, msg: { optionId?: string }) => {
      if (!this.matchState || this.matchState.crisisPhase !== 'decision') return;
      if (!msg?.optionId) return;
      this.matchState = castVote(this.matchState, client.sessionId, msg.optionId);
      this.pushState();
    });

    this.onMessage('reveal', (client, msg: { cardId?: string }) => {
      if (!this.matchState || this.matchState.crisisPhase !== 'deliberation') return;
      if (!msg?.cardId) return;
      this.matchState = revealInfo(this.matchState, client.sessionId, msg.cardId, content);
      this.pushState();
    });

    this.onMessage('chat', (client, msg: { text?: string }) => {
      const text = String(msg?.text ?? '').slice(0, 300);
      if (text) this.broadcast('chat', { from: client.sessionId, name: this.nameOf(client.sessionId), text });
    });

    this.onMessage('signal', (client, msg: { kind?: string }) => {
      const allowed = ['agree', 'disagree', 'warning', 'need_info'];
      const kind = String(msg?.kind ?? '');
      if (allowed.includes(kind)) {
        this.broadcast('signal', { from: client.sessionId, name: this.nameOf(client.sessionId), kind });
      }
    });

    this.onMessage('continue', (client) => {
      if (!this.matchState) return;
      const ph = this.matchState.crisisPhase;
      if (ph !== 'briefing' && ph !== 'interlude') return;
      this.continueVotes.add(client.sessionId);
      const connected = this.matchState.players.filter((p) => p.connected).length;
      if (this.continueVotes.size >= connected) this.advancePhase();
      else this.pushState();
    });
  }

  override onJoin(client: Client, options: { nickname?: string } = {}): void {
    const nickname = String(options?.nickname ?? '').slice(0, 20) || `Player ${this.seatCounter + 1}`;
    if (!this.hostId) this.hostId = client.sessionId;
    if (this.matchState) {
      // Match already started: watch-only (v0.1 late-join = spectator, per MultiplayerUX §5).
      client.send('state', this.spectatorView(client.sessionId));
      return;
    }
    this.lobby.push({ id: client.sessionId, seat: this.seatCounter++, nickname, ready: false, connected: true });
    this.pushState();
  }

  override async onLeave(client: Client, consented: boolean): Promise<void> {
    this.setConnected(client.sessionId, false);
    this.migrateHostIfNeeded(client.sessionId);
    if (consented) {
      this.removeFromLobbyIfPresent(client.sessionId);
      this.migrateHostIfNeeded(client.sessionId);
      this.pushState();
      return;
    }
    this.pushState();
    try {
      await this.allowReconnection(client, 30); // no elimination (locked D2)
      this.setConnected(client.sessionId, true);
      this.pushState();
    } catch {
      // reconnection window lapsed: gone for good.
      this.removeFromLobbyIfPresent(client.sessionId);
      this.migrateHostIfNeeded(client.sessionId);
      this.pushState();
    }
  }

  /** If the host is gone, hand the crown to any connected player (fixes lobby-start deadlock). */
  private migrateHostIfNeeded(leavingId: string): void {
    if (this.hostId !== leavingId) return;
    const pool = this.matchState ? this.matchState.players : this.lobby;
    const next = pool.find((p) => p.connected && p.id !== leavingId);
    this.hostId = next?.id;
  }

  /** Pre-start only: drop a permanently-gone player from the lobby roster. */
  private removeFromLobbyIfPresent(id: string): void {
    if (this.matchState) return;
    this.lobby = this.lobby.filter((p) => p.id !== id);
  }

  override onDispose(): void {
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
  }

  // ---- flow ----
  private startMatch(): void {
    const players: PlayerInput[] = this.lobby
      .slice()
      .sort((a, b) => a.seat - b.seat)
      .map((p) => ({ id: p.id, nickname: p.nickname }));
    let s = initMatch(players, content, this.seed);
    s = beginMatch(s, content);
    // carry lobby connection state
    for (const ps of s.players) ps.connected = this.lobby.find((l) => l.id === ps.id)?.connected ?? true;
    this.matchState = s;
    this.schedulePhase();
    this.pushState();
  }

  private schedulePhase(): void {
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }
    this.continueVotes.clear();
    if (!this.matchState || this.matchState.ended) {
      this.phaseEndsAt = undefined;
      return;
    }
    const dur = this.phaseMs[this.matchState.crisisPhase] ?? 8000;
    this.phaseEndsAt = Date.now() + dur;
    this.phaseTimer = setTimeout(() => this.advancePhase(), dur);
  }

  private advancePhase(): void {
    if (!this.matchState || this.matchState.ended) return;
    this.matchState = nextPhase(this.matchState, content);
    if (this.matchState.ended) {
      this.phaseEndsAt = undefined;
      if (this.phaseTimer) {
        clearTimeout(this.phaseTimer);
        this.phaseTimer = null;
      }
      this.pushState();
      return;
    }
    this.schedulePhase();
    this.pushState();
  }

  // ---- helpers / views ----
  private setConnected(id: string, v: boolean): void {
    const lp = this.lobby.find((p) => p.id === id);
    if (lp) lp.connected = v;
    const ps = this.matchState?.players.find((p) => p.id === id);
    if (ps) ps.connected = v;
  }

  private nameOf(id: string): string {
    return (
      this.matchState?.players.find((p) => p.id === id)?.nickname ??
      this.lobby.find((p) => p.id === id)?.nickname ??
      'Someone'
    );
  }

  private pushState(): void {
    for (const client of this.clients) client.send('state', this.viewFor(client.sessionId));
  }

  private viewFor(sessionId: string): ClientView {
    if (!this.matchState) return this.lobbyView(sessionId);
    const v = redactStateFor(this.matchState, sessionId, content, this.hostId);
    v.phaseEndsAt = this.matchState.ended ? undefined : this.phaseEndsAt;
    return v;
  }

  private lobbyView(sessionId: string): ClientView {
    const players: PublicPlayer[] = this.lobby.map((p) => ({
      id: p.id,
      seat: p.seat,
      nickname: p.nickname,
      connected: p.connected,
      ready: p.ready,
      hasVoted: false,
      isHost: p.id === this.hostId,
    }));
    return {
      stage: 'lobby',
      crisisPhase: 'briefing',
      crisisIndex: -1,
      playlistLength: content.playlist.length,
      meters: { ...content.startMeters },
      players,
      you: { id: sessionId, cards: [] },
      revealedCards: [],
      log: [],
      ended: false,
    };
  }

  private spectatorView(sessionId: string): ClientView {
    if (!this.matchState) return this.lobbyView(sessionId);
    const v = redactStateFor(this.matchState, '__spectator__', content, this.hostId);
    v.you = { id: sessionId, cards: [] };
    v.phaseEndsAt = this.matchState.ended ? undefined : this.phaseEndsAt;
    return v;
  }
}
