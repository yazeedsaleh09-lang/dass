import { Room, type Client } from 'colyseus';
import {
  DEFAULT_CONFIG,
  applyDeclare,
  applyLock,
  endGame,
  initGame,
  isLastRound,
  nextRound,
  redactDassStateFor,
  resolveRound,
  startGame,
  type Action,
  type ClientView,
  type DassConfig,
  type GameState,
  type PlayerInput,
  type PublicPlayerView,
  type RoundRecord,
} from '@dass/domain';

interface LobbyPlayer {
  id: string;
  seat: number;
  nickname: string;
  ready: boolean;
  connected: boolean;
}

type LogEvent =
  | { t: 'sell'; round: number; playerId: string; height: number; voluntary: boolean }
  | { t: 'vaultLeader'; round: number; playerId: string }
  | { t: 'winner'; playerIds: string[] };

export interface DassRoomOptions {
  phaseMs?: Partial<DassConfig['phaseMs']>;
  minPlayers?: number;
  config?: Partial<Omit<DassConfig, 'phaseMs'>>;
}

/**
 * Authoritative room = one دسّ session. Server owns the FSM, all timers, and the
 * SECRET locked actions (kept in engine state.locked, never pushed pre-reveal — the
 * per-client `state` message is redacted by redactDassStateFor).
 */
export class DassRoom extends Room {
  override maxClients = 8;

  private lobby: LobbyPlayer[] = [];
  private game: GameState | null = null;
  private config: DassConfig = DEFAULT_CONFIG;
  private hostId?: string;
  private seatCounter = 0;
  private minPlayers = DEFAULT_CONFIG.minPlayers;
  private phaseTimer: ReturnType<typeof setTimeout> | null = null;
  private phaseEndsAt?: number;
  private sessionLog: LogEvent[] = []; // N1/N2 instrument
  private viewers = new Set<string>(); // TV clients: display role, not seated as players

  override onCreate(options: DassRoomOptions = {}): void {
    this.config = {
      ...DEFAULT_CONFIG,
      ...(options.config ?? {}),
      phaseMs: { ...DEFAULT_CONFIG.phaseMs, ...(options.phaseMs ?? {}) },
    };
    this.minPlayers = options.minPlayers ?? this.config.minPlayers;

    this.onMessage('setNickname', (client, msg: { name?: string }) => {
      const name = String(msg?.name ?? '').slice(0, 20) || 'Player';
      const lp = this.lobby.find((p) => p.id === client.sessionId);
      if (lp) lp.nickname = name;
      const ps = this.game?.players.find((p) => p.id === client.sessionId);
      if (ps) ps.nickname = name;
      this.pushState();
    });

    this.onMessage('ready', (client, msg: { ready?: boolean }) => {
      if (this.game) return;
      const lp = this.lobby.find((p) => p.id === client.sessionId);
      if (lp) lp.ready = msg?.ready ?? !lp.ready;
      this.pushState();
    });

    this.onMessage('start', (client) => {
      if (this.game) return;
      if (client.sessionId !== this.hostId) return;
      const ready = this.lobby.filter((p) => p.ready && p.connected).length;
      if (this.lobby.length < this.minPlayers || ready < this.minPlayers) return;
      this.startGame();
    });

    // PUBLIC declare — validated + broadcast (redacted push reveals it to all from REACTION_WINDOW).
    this.onMessage('declare', (client, msg: { kind?: string; target?: string }) => {
      if (!this.game) return;
      const action = parseAction(msg);
      if (action && applyDeclare(this.game, client.sessionId, action)) this.pushState();
    });

    // SECRET lock — validated, stored server-side; the redacted push never leaks it to others.
    this.onMessage('lock', (client, msg: { kind?: string; target?: string }) => {
      if (!this.game) return;
      const action = parseAction(msg);
      if (action && applyLock(this.game, client.sessionId, action)) this.pushState();
    });
  }

  override onJoin(client: Client, options: { nickname?: string; role?: string } = {}): void {
    if (options.role === 'tv') {
      this.viewers.add(client.sessionId); // display only — never a player, never host
      client.send('state', this.viewFor(client.sessionId));
      return;
    }
    const nickname = String(options?.nickname ?? '').slice(0, 20) || `Player ${this.seatCounter + 1}`;
    if (!this.hostId) this.hostId = client.sessionId;
    if (this.game) {
      client.send('state', this.spectatorView(client.sessionId));
      return;
    }
    this.lobby.push({ id: client.sessionId, seat: this.seatCounter++, nickname, ready: false, connected: true });
    this.pushState();
  }

  override async onLeave(client: Client, consented: boolean): Promise<void> {
    if (this.viewers.has(client.sessionId)) {
      this.viewers.delete(client.sessionId);
      return;
    }
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
      await this.allowReconnection(client, 30); // no elimination
      this.setConnected(client.sessionId, true);
      this.pushState();
    } catch {
      this.removeFromLobbyIfPresent(client.sessionId);
      this.migrateHostIfNeeded(client.sessionId);
      this.pushState();
    }
  }

  override onDispose(): void {
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
  }

  // ---- flow ----
  private startGame(): void {
    const players: PlayerInput[] = this.lobby
      .slice()
      .sort((a, b) => a.seat - b.seat)
      .map((p) => ({ id: p.id, nickname: p.nickname, seat: p.seat }));
    this.game = startGame(initGame(players, this.config, this.hostId));
    for (const ps of this.game.players) {
      ps.connected = this.lobby.find((l) => l.id === ps.id)?.connected ?? true;
    }
    this.schedulePhase();
    this.pushState();
  }

  private schedulePhase(): void {
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }
    if (!this.game || this.game.ended) {
      this.phaseEndsAt = undefined;
      return;
    }
    const phase = this.game.phase;
    const dur = phase === 'LOBBY' || phase === 'GAME_END' ? 0 : this.config.phaseMs[phase];
    this.phaseEndsAt = Date.now() + dur;
    this.phaseTimer = setTimeout(() => this.advancePhase(), dur);
  }

  /** The single server-authoritative FSM step. */
  private advancePhase(): void {
    const g = this.game;
    if (!g || g.ended) return;
    switch (g.phase) {
      case 'DECLARE':
        g.phase = 'REACTION_WINDOW';
        break;
      case 'REACTION_WINDOW':
        g.phase = 'LOCK';
        break;
      case 'LOCK': {
        const record = resolveRound(g, this.config); // secrets resolved → reveal becomes public
        this.logRound(record);
        g.phase = 'REVEAL';
        break;
      }
      case 'REVEAL':
        g.phase = 'VAULT_UPDATE';
        break;
      case 'VAULT_UPDATE':
        if (isLastRound(g)) {
          const autoSells = endGame(g, this.config);
          for (const s of autoSells) this.sessionLog.push({ t: 'sell', ...s });
          this.sessionLog.push({ t: 'winner', playerIds: g.winnerIds });
        } else {
          nextRound(g);
        }
        break;
      default:
        break;
    }
    if (g.ended) {
      if (this.phaseTimer) clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
      this.phaseEndsAt = undefined;
      this.broadcast('sessionlog', this.sessionLog);
      console.log('[dass] session log:', JSON.stringify(this.sessionLog));
      this.pushState();
      return;
    }
    this.schedulePhase();
    this.pushState();
  }

  private logRound(record: RoundRecord): void {
    for (const s of record.sells) this.sessionLog.push({ t: 'sell', ...s });
    if (record.vaultLeaderId) {
      this.sessionLog.push({ t: 'vaultLeader', round: record.round, playerId: record.vaultLeaderId });
    }
  }

  // ---- helpers / views ----
  private migrateHostIfNeeded(leavingId: string): void {
    if (this.hostId !== leavingId) return;
    const pool = this.game ? this.game.players : this.lobby;
    this.hostId = pool.find((p) => p.connected && p.id !== leavingId)?.id;
  }

  private removeFromLobbyIfPresent(id: string): void {
    if (this.game) return;
    this.lobby = this.lobby.filter((p) => p.id !== id);
  }

  private setConnected(id: string, v: boolean): void {
    const lp = this.lobby.find((p) => p.id === id);
    if (lp) lp.connected = v;
    const ps = this.game?.players.find((p) => p.id === id);
    if (ps) ps.connected = v;
  }

  private pushState(): void {
    for (const client of this.clients) client.send('state', this.viewFor(client.sessionId));
  }

  private viewFor(sessionId: string): ClientView {
    if (!this.game) return this.lobbyView(sessionId);
    const isViewer = this.viewers.has(sessionId);
    const v = redactDassStateFor(this.game, isViewer ? '__tv__' : sessionId);
    if (isViewer) v.you = { id: sessionId };
    v.phaseEndsAt = this.game.ended ? undefined : this.phaseEndsAt;
    return v;
  }

  private lobbyView(sessionId: string): ClientView {
    const players: PublicPlayerView[] = this.lobby.map((p) => ({
      id: p.id,
      seat: p.seat,
      nickname: p.nickname,
      connected: p.connected,
      live: this.config.baselineLive,
      vault: 0,
    }));
    return {
      phase: 'LOBBY',
      round: 0,
      totalRounds: 0,
      players,
      declares: {},
      you: { id: sessionId },
      history: [],
      ended: false,
      winnerIds: [],
      hostId: this.hostId,
    };
  }

  private spectatorView(sessionId: string): ClientView {
    if (!this.game) return this.lobbyView(sessionId);
    const v = redactDassStateFor(this.game, '__spectator__');
    v.you = { id: sessionId };
    v.phaseEndsAt = this.game.ended ? undefined : this.phaseEndsAt;
    return v;
  }
}

function parseAction(msg: { kind?: string; target?: string }): Action | undefined {
  const kind = msg?.kind;
  if (kind === 'sell') return { kind: 'sell' };
  if (kind === 'back' || kind === 'dump') {
    return typeof msg.target === 'string' ? { kind, target: msg.target } : undefined;
  }
  return undefined;
}
