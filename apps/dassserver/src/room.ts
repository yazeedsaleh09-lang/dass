import { ErrorCode, Room, ServerError, type Client } from 'colyseus';
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
  // The TV is a client too, so transport capacity must not steal one of the
  // eight player seats. Player capacity is enforced separately in onAuth/onJoin.
  override maxClients = 20;

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
  private reactionMoved = new Set<string>();
  private messageTimes = new Map<string, number>();

  override onCreate(options: DassRoomOptions = {}): void {
    const allowTestConfig = process.env.DASS_ALLOW_TEST_CONFIG === '1';
    this.config = {
      ...DEFAULT_CONFIG,
      ...(allowTestConfig ? (options.config ?? {}) : {}),
      phaseMs: { ...DEFAULT_CONFIG.phaseMs, ...(allowTestConfig ? (options.phaseMs ?? {}) : {}) },
    };
    this.minPlayers = allowTestConfig ? (options.minPlayers ?? this.config.minPlayers) : this.config.minPlayers;

    // A join response can arrive before browser code has attached message listeners.
    // Let every client request one authoritative snapshot after wiring itself.
    this.onMessage('sync', (client) => {
      client.send('state', this.viewers.has(client.sessionId) ? this.viewFor(client.sessionId) : this.game && !this.lobby.some((p) => p.id === client.sessionId) ? this.spectatorView(client.sessionId) : this.viewFor(client.sessionId));
    });

    this.onMessage('setNickname', (client, msg: { name?: string }) => {
      if (this.game || !this.acceptMessage(client.sessionId, 'nickname', 300)) return;
      const name = this.uniqueNickname(msg?.name, client.sessionId);
      const lp = this.lobby.find((p) => p.id === client.sessionId);
      if (lp) lp.nickname = name;
      this.pushState();
    });

    this.onMessage('ready', (client, msg: { ready?: boolean }) => {
      if (this.game || !this.acceptMessage(client.sessionId, 'ready', 150)) return;
      const lp = this.lobby.find((p) => p.id === client.sessionId);
      if (lp) lp.ready = typeof msg?.ready === 'boolean' ? msg.ready : !lp.ready;
      this.pushState();
    });

    this.onMessage('start', (client) => {
      if (this.game || !this.acceptMessage(client.sessionId, 'start', 500)) return;
      if (client.sessionId !== this.hostId) return;
      const connected = this.lobby.filter((p) => p.connected).length;
      const ready = this.lobby.filter((p) => p.ready && p.connected).length;
      if (connected < this.minPlayers || ready !== connected) return;
      this.startGame();
    });

    this.onMessage('restart', (client) => {
      if (!this.acceptMessage(client.sessionId, 'restart', 500)) return;
      if (!this.game?.ended || client.sessionId !== this.hostId) return;
      this.resetToLobby(true);
    });

    this.onMessage('newCrew', (client) => {
      if (!this.acceptMessage(client.sessionId, 'newCrew', 500)) return;
      if (!this.game?.ended || client.sessionId !== this.hostId) return;
      const oldPlayers = new Set(this.game.players.map((p) => p.id));
      for (const c of this.clients) if (oldPlayers.has(c.sessionId)) c.send('newCrew', {});
      this.resetToLobby(false);
    });

    // PUBLIC declare — validated + broadcast (redacted push reveals it to all from REACTION_WINDOW).
    this.onMessage('declare', (client, msg: { kind?: string; target?: string }) => {
      if (!this.game || !this.acceptMessage(client.sessionId, 'declare', 100)) return;
      if (this.game.phase === 'REACTION_WINDOW') {
        if (!this.game.declares[client.sessionId] || this.reactionMoved.has(client.sessionId)) return;
      }
      const action = parseAction(msg);
      if (action && applyDeclare(this.game, client.sessionId, action)) {
        if (this.game.phase === 'REACTION_WINDOW') this.reactionMoved.add(client.sessionId);
        this.pushState();
      }
    });

    // SECRET lock — validated, stored server-side; the redacted push never leaks it to others.
    this.onMessage('lock', (client, msg: { kind?: string; target?: string }) => {
      if (!this.game || !this.acceptMessage(client.sessionId, 'lock', 100)) return;
      const action = parseAction(msg);
      if (action && applyLock(this.game, client.sessionId, action)) this.pushState();
    });
  }

  override onAuth(_client: Client, options: { role?: string } = {}): boolean {
    if (options.role === 'tv' || this.game) return true;
    if (this.lobby.length >= this.config.maxPlayers) {
      throw new ServerError(ErrorCode.APPLICATION_ERROR, 'ROOM_FULL');
    }
    return true;
  }

  override onJoin(client: Client, options: { nickname?: string; role?: string } = {}): void {
    if (options.role === 'tv') {
      this.viewers.add(client.sessionId); // display only — never a player, never host
      this.clock.setTimeout(() => client.send('state', this.viewFor(client.sessionId)), 0);
      return;
    }
    if (!this.hostId) this.hostId = client.sessionId;
    if (this.game) {
      this.clock.setTimeout(() => client.send('state', this.spectatorView(client.sessionId)), 0);
      return;
    }
    if (this.lobby.length >= this.config.maxPlayers) {
      client.leave(4001, 'ROOM_FULL');
      return;
    }
    const nickname = this.uniqueNickname(options.nickname, client.sessionId);
    this.lobby.push({ id: client.sessionId, seat: this.seatCounter++, nickname, ready: false, connected: true });
    this.clock.setTimeout(() => this.pushState(), 0);
  }

  override async onLeave(client: Client, consented: boolean): Promise<void> {
    for (const key of this.messageTimes.keys()) if (key.startsWith(`${client.sessionId}:`)) this.messageTimes.delete(key);
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
    this.reactionMoved.clear();
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
        this.reactionMoved.clear();
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
          this.reactionMoved.clear();
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
    if (this.game) this.game.hostId = this.hostId;
  }

  private removeFromLobbyIfPresent(id: string): void {
    if (this.game) return;
    this.lobby = this.lobby.filter((p) => p.id !== id);
  }

  private resetToLobby(keepPlayers: boolean): void {
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    this.phaseTimer = null;
    this.phaseEndsAt = undefined;
    const oldPlayers = this.game?.players ?? [];
    this.lobby = keepPlayers
      ? oldPlayers
          .filter((p) => p.connected)
          .sort((a, b) => a.seat - b.seat)
          .map((p, seat) => ({ id: p.id, seat, nickname: p.nickname, ready: false, connected: true }))
      : [];
    this.seatCounter = this.lobby.length;
    this.hostId = this.lobby.some((p) => p.id === this.hostId) ? this.hostId : this.lobby[0]?.id;
    this.game = null;
    this.sessionLog = [];
    this.reactionMoved.clear();
    this.pushState();
  }

  private acceptMessage(sessionId: string, type: string, minimumGapMs: number): boolean {
    const key = `${sessionId}:${type}`;
    const now = Date.now();
    const previous = this.messageTimes.get(key) ?? 0;
    if (now - previous < minimumGapMs) return false;
    this.messageTimes.set(key, now);
    return true;
  }

  private uniqueNickname(raw: string | undefined, playerId: string): string {
    const base = String(raw ?? '').trim().slice(0, 20) || `لاعب ${this.seatCounter + 1}`;
    const used = new Set([
      ...this.lobby.filter((p) => p.id !== playerId).map((p) => p.nickname.toLocaleLowerCase('ar')),
      ...(this.game?.players ?? []).filter((p) => p.id !== playerId).map((p) => p.nickname.toLocaleLowerCase('ar')),
    ]);
    if (!used.has(base.toLocaleLowerCase('ar'))) return base;
    let suffix = 2;
    while (true) {
      const suffixText = ` ${suffix}`;
      const candidate = `${base.slice(0, Math.max(1, 20 - suffixText.length))}${suffixText}`;
      if (!used.has(candidate.toLocaleLowerCase('ar'))) return candidate;
      suffix += 1;
    }
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
    else v.you.reactionMoved = this.reactionMoved.has(sessionId);
    v.phaseEndsAt = this.game.ended ? undefined : this.phaseEndsAt;
    v.hostId = this.hostId;
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
      ready: p.ready,
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
    v.hostId = this.hostId;
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
