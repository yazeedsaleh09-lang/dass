import { randomBytes } from 'node:crypto';
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

/**
 * A seat's stable identity. `pid` is the DURABLE engine id used everywhere in game state
 * (declares/locked/scores/reveal). It is derived once and never changes, so a player's
 * identity does NOT depend on the socket/sessionId. The current connection is tracked
 * separately in `pidToSession`.
 */
interface LobbyPlayer {
  pid: string;
  seat: number;
  nickname: string;
  ready: boolean;
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

/** Options a client may pass on join. `hostToken`/`playerToken` are durable identities. */
interface JoinOptions {
  nickname?: string;
  role?: string;
  /** Secret host token (creator only) — proves host ownership on reconnect/reopen. */
  hostToken?: string;
  /** Durable per-player identity — resolves to a stable pid; survives socket changes. */
  playerToken?: string;
}

/**
 * Authoritative room = one دسّ session. Server owns the FSM, all timers, and the
 * SECRET locked actions (kept in engine state.locked, never pushed pre-reveal — the
 * per-client `state` message is redacted by redactDassStateFor).
 *
 * IDENTITY MODEL: engine identity is a durable `pid` bound to the player's secret
 * `playerToken`; `sessionId` is only the current connection. Reconnecting with the token
 * rebinds a fresh socket to the SAME pid, restoring seat/score/actions. A disconnected
 * active player's seat is held for `config.recoveryMs` before a return is treated as a
 * spectator — the seat itself never leaves the board (no elimination).
 */
export class DassRoom extends Room {
  // The TV is a client too, so transport capacity must not steal one of the
  // eight player seats. Player capacity is enforced separately in onAuth/onJoin.
  override maxClients = 20;
  // Identity + recovery are managed by us (token → pid), not by Colyseus reconnection
  // tokens, so a running game's room must not vanish the instant it is momentarily empty.
  override autoDispose = false;

  private lobby: LobbyPlayer[] = [];
  private game: GameState | null = null;
  private config: DassConfig = DEFAULT_CONFIG;
  /**
   * HOST OWNERSHIP is a secret server-issued token, NOT join order / socket id.
   * `hostToken` is generated on room creation and handed only to the creator (privately,
   * never in room state or the QR). `hostId` is merely the sessionId of the connection
   * that currently holds the token — rebound on host refresh/reconnect, never given to a
   * player who merely joined or connected first.
   */
  private hostToken = randomBytes(24).toString('base64url');
  private hostConnected = false;
  private creatorAssigned = false;
  private hostId?: string;
  private seatCounter = 0;
  private minPlayers = DEFAULT_CONFIG.minPlayers;
  private phaseTimer: ReturnType<typeof setTimeout> | null = null;
  private phaseEndsAt?: number;
  private sessionLog: LogEvent[] = []; // N1/N2 instrument
  private viewers = new Set<string>(); // TV clients: display role, not seated as players
  private reactionMoved = new Set<string>(); // pids that used their one reaction-window move

  // ---- durable identity (token <-> pid) and live connection (pid <-> session) ----
  private tokenToPid = new Map<string, string>();
  private pidToToken = new Map<string, string>();
  private sessionToPid = new Map<string, string>();
  private pidToSession = new Map<string, string>();

  // ---- in-game recovery ----
  private recoveringPids = new Set<string>(); // disconnected, inside the recovery window
  private expiredPids = new Set<string>(); // recovery window lapsed — a return watches only
  private recoveryTimers = new Map<string, ReturnType<typeof setTimeout>>();

  private messageTimes = new Map<string, number>();
  private disposeTimer: ReturnType<typeof setTimeout> | null = null;

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
      client.send('state', this.viewFor(client.sessionId));
    });

    this.onMessage('setNickname', (client, msg: { name?: string }) => {
      if (this.game || !this.acceptMessage(client.sessionId, 'nickname', 300)) return;
      const pid = this.sessionToPid.get(client.sessionId);
      const lp = pid ? this.lobby.find((p) => p.pid === pid) : undefined;
      if (!lp) return;
      lp.nickname = this.uniqueNickname(msg?.name, lp.pid);
      this.pushState();
    });

    this.onMessage('ready', (client, msg: { ready?: boolean }) => {
      if (this.game || !this.acceptMessage(client.sessionId, 'ready', 150)) return;
      const pid = this.sessionToPid.get(client.sessionId);
      const lp = pid ? this.lobby.find((p) => p.pid === pid) : undefined;
      if (lp) lp.ready = typeof msg?.ready === 'boolean' ? msg.ready : !lp.ready;
      this.pushState();
    });

    this.onMessage('start', (client) => {
      if (this.game || !this.acceptMessage(client.sessionId, 'start', 500)) return;
      if (client.sessionId !== this.hostId) return;
      const connected = this.lobby.filter((p) => this.isConnected(p.pid)).length;
      const ready = this.lobby.filter((p) => p.ready && this.isConnected(p.pid)).length;
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
      const oldPids = new Set(this.game.players.map((p) => p.id));
      for (const c of this.clients) {
        const pid = this.sessionToPid.get(c.sessionId);
        if (pid && oldPids.has(pid)) c.send('newCrew', {});
      }
      this.resetToLobby(false);
    });

    // PUBLIC declare — validated + broadcast (redacted push reveals it to all from REACTION_WINDOW).
    this.onMessage('declare', (client, msg: { kind?: string; target?: string }) => {
      if (!this.game || !this.acceptMessage(client.sessionId, 'declare', 100)) return;
      const pid = this.sessionToPid.get(client.sessionId);
      if (!pid) return;
      if (this.game.phase === 'REACTION_WINDOW') {
        if (!this.game.declares[pid] || this.reactionMoved.has(pid)) return;
      }
      const action = parseAction(msg);
      if (action && applyDeclare(this.game, pid, action)) {
        if (this.game.phase === 'REACTION_WINDOW') this.reactionMoved.add(pid);
        this.pushState();
      }
    });

    // SECRET lock — validated, stored server-side; the redacted push never leaks it to others.
    this.onMessage('lock', (client, msg: { kind?: string; target?: string }) => {
      if (!this.game || !this.acceptMessage(client.sessionId, 'lock', 100)) return;
      const pid = this.sessionToPid.get(client.sessionId);
      if (!pid) return;
      const action = parseAction(msg);
      if (action && applyLock(this.game, pid, action)) this.pushState();
    });
  }

  override onAuth(_client: Client, options: JoinOptions = {}): boolean {
    if (options.role === 'tv') return true;
    if (options.hostToken && options.hostToken === this.hostToken) return true;
    // A returning identity (known token → existing pid) is always admitted — it resumes a
    // seat (lobby or in-game) or watches, never consuming a fresh seat.
    if (options.playerToken && this.tokenToPid.has(options.playerToken)) return true;
    if (this.game) return true; // a brand-new client during a running game becomes a spectator
    if (this.lobby.length >= this.config.maxPlayers) {
      throw new ServerError(ErrorCode.APPLICATION_ERROR, 'ROOM_FULL');
    }
    return true;
  }

  override onJoin(client: Client, options: JoinOptions = {}): void {
    if (this.disposeTimer) {
      clearTimeout(this.disposeTimer);
      this.disposeTimer = null;
    }
    const isTv = options.role === 'tv';

    // 1) CREATOR — the first client to join a fresh room owns it and receives the secret
    //    host token privately. This is the ONLY way host is granted.
    if (!this.creatorAssigned) {
      this.creatorAssigned = true;
      this.bindHost(client);
      client.send('host', { token: this.hostToken });
      if (isTv) {
        this.viewers.add(client.sessionId); // creator is a display: host, but not a player seat
        this.clock.setTimeout(() => client.send('state', this.viewFor(client.sessionId)), 0);
        return;
      }
      this.admitPlayer(client, options); // creator joined as a player (tests): seat it too
      return;
    }

    // 2) HOST RECLAIM — a valid secret token rebinds host to this connection.
    if (options.hostToken && options.hostToken === this.hostToken) {
      this.bindHost(client);
      if (isTv) this.viewers.add(client.sessionId);
      this.clock.setTimeout(() => this.pushState(), 0);
      return;
    }

    // 3) TV viewer (not the creator) — display only. Never a player, never host.
    if (isTv) {
      this.viewers.add(client.sessionId);
      this.clock.setTimeout(() => client.send('state', this.viewFor(client.sessionId)), 0);
      return;
    }

    // 4) Player — durable-identity aware (see admitPlayer).
    this.admitPlayer(client, options);
  }

  /** Bind the host token to a live connection. Host ownership itself is the token, not this id. */
  private bindHost(client: Client): void {
    this.hostId = client.sessionId;
    this.hostConnected = true;
    if (this.game) this.game.hostId = this.hostId;
  }

  /**
   * Admit a player by DURABLE identity. A known token resolves to its stable pid and RESUMES
   * that seat — in the lobby or mid-game — rebinding the new socket to the original active
   * player. A new token gets a fresh pid/seat. During a game an unknown client only watches.
   */
  private admitPlayer(client: Client, options: JoinOptions): void {
    const token = typeof options.playerToken === 'string' ? options.playerToken : undefined;
    const pid = token ? this.tokenToPid.get(token) : undefined;

    if (pid) {
      const inGame = !!this.game && this.game.players.some((p) => p.id === pid);
      const inLobby = !this.game && this.lobby.some((p) => p.pid === pid);
      if (inGame && this.expiredPids.has(pid)) {
        // Recovery window genuinely lapsed → the seat stays on the board but this return
        // may only watch. It is NOT silently reactivated.
        this.sendSpectator(client);
        client.send('recoveryExpired', {});
        return;
      }
      if (inGame || inLobby) {
        this.reclaimSeat(client, pid, inGame);
        return;
      }
      // Known token but no live seat (removed pre-game) — fall through to a fresh seat.
    }

    if (this.game) {
      this.sendSpectator(client); // a brand-new client during play: watch-only
      return;
    }
    if (this.lobby.length >= this.config.maxPlayers) {
      client.leave(4001, 'ROOM_FULL');
      return;
    }
    const newPid = this.makePid();
    if (token) {
      this.tokenToPid.set(token, newPid);
      this.pidToToken.set(newPid, token);
    }
    const nickname = this.uniqueNickname(options.nickname, newPid);
    this.lobby.push({ pid: newPid, seat: this.seatCounter++, nickname, ready: false });
    this.bindSession(newPid, client.sessionId);
    this.clock.setTimeout(() => this.pushState(), 0);
  }

  /** Rebind a fresh connection to an existing seat, evicting any stale socket, and restore it. */
  private reclaimSeat(client: Client, pid: string, restored: boolean): void {
    const stale = this.pidToSession.get(pid);
    if (stale && stale !== client.sessionId) {
      this.sessionToPid.delete(stale); // detach first so the eviction's onLeave is a no-op
      this.clients.find((c) => c.sessionId === stale)?.leave(4002); // duplicate/stale socket
    }
    this.clearRecovery(pid);
    this.expiredPids.delete(pid);
    this.bindSession(pid, client.sessionId);
    if (restored) client.send('restored', {});
    this.clock.setTimeout(() => this.pushState(), 0);
  }

  private sendSpectator(client: Client): void {
    this.clock.setTimeout(() => client.send('state', this.spectatorView(client.sessionId)), 0);
  }

  override onLeave(client: Client, consented: boolean): void {
    for (const key of this.messageTimes.keys()) if (key.startsWith(`${client.sessionId}:`)) this.messageTimes.delete(key);
    if (client.sessionId === this.hostId) this.hostConnected = false;

    if (this.viewers.has(client.sessionId)) {
      this.viewers.delete(client.sessionId);
      this.pushState();
      this.armDisposeIfEmpty();
      return;
    }

    const pid = this.sessionToPid.get(client.sessionId);
    this.sessionToPid.delete(client.sessionId);
    if (!pid) {
      this.pushState();
      this.armDisposeIfEmpty();
      return;
    }
    // Only act if this session is still the one bound to the pid (it may have been rebound
    // to a newer socket by an eviction/reclaim, in which case there is nothing to release).
    if (this.pidToSession.get(pid) !== client.sessionId) {
      this.pushState();
      this.armDisposeIfEmpty();
      return;
    }
    this.pidToSession.delete(pid);
    this.setConnected(pid, false);

    // Intentional leave in the LOBBY frees the seat immediately; every other case (any
    // in-game disconnect, or a lobby drop) holds the seat for the recovery window.
    if (consented && !this.game) this.removeSeat(pid);
    else this.startRecovery(pid);
    this.pushState();
    this.armDisposeIfEmpty();
  }

  override onDispose(): void {
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    if (this.disposeTimer) clearTimeout(this.disposeTimer);
    for (const t of this.recoveryTimers.values()) clearTimeout(t);
  }

  // ---- identity / connection helpers ----
  private makePid(): string {
    return 'p_' + randomBytes(9).toString('base64url');
  }
  private isConnected(pid: string): boolean {
    return this.pidToSession.has(pid);
  }
  private bindSession(pid: string, sessionId: string): void {
    this.sessionToPid.set(sessionId, pid);
    this.pidToSession.set(pid, sessionId);
    this.recoveringPids.delete(pid);
    this.expiredPids.delete(pid);
    this.setConnected(pid, true);
  }

  // ---- recovery lifecycle ----
  private startRecovery(pid: string): void {
    this.clearRecovery(pid);
    this.recoveringPids.add(pid);
    const timer = setTimeout(() => this.onRecoveryTimeout(pid), this.config.recoveryMs);
    if (typeof timer.unref === 'function') timer.unref();
    this.recoveryTimers.set(pid, timer);
  }
  private clearRecovery(pid: string): void {
    const t = this.recoveryTimers.get(pid);
    if (t) clearTimeout(t);
    this.recoveryTimers.delete(pid);
    this.recoveringPids.delete(pid);
  }
  private onRecoveryTimeout(pid: string): void {
    this.recoveryTimers.delete(pid);
    this.recoveringPids.delete(pid);
    if (this.pidToSession.has(pid)) return; // already reconnected
    if (this.game && this.game.players.some((p) => p.id === pid)) {
      // Seat stays on the board (abstains, never eliminated); a later return only watches.
      this.expiredPids.add(pid);
    } else {
      this.removeSeat(pid);
    }
    this.pushState();
  }

  // ---- flow ----
  private startGame(): void {
    const players: PlayerInput[] = this.lobby
      .slice()
      .sort((a, b) => a.seat - b.seat)
      .map((p) => ({ id: p.pid, nickname: p.nickname, seat: p.seat }));
    this.game = startGame(initGame(players, this.config, this.hostId));
    this.reactionMoved.clear();
    for (const ps of this.game.players) ps.connected = this.isConnected(ps.id);
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
  /** Drop a seat entirely (pre-game frees the roster spot) and forget its identity. */
  private removeSeat(pid: string): void {
    this.lobby = this.lobby.filter((p) => p.pid !== pid);
    const token = this.pidToToken.get(pid);
    if (token) this.tokenToPid.delete(token);
    this.pidToToken.delete(pid);
    this.pidToSession.delete(pid);
    this.clearRecovery(pid);
    this.expiredPids.delete(pid);
  }

  private resetToLobby(keepPlayers: boolean): void {
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    this.phaseTimer = null;
    this.phaseEndsAt = undefined;
    const oldPlayers = this.game?.players ?? [];
    // Rematch keeps only players still connected; their durable pid/token carry over so a
    // refresh during the new lobby still resumes the right seat.
    this.lobby = keepPlayers
      ? oldPlayers
          .filter((p) => this.isConnected(p.id))
          .sort((a, b) => a.seat - b.seat)
          .map((p, seat) => ({ pid: p.id, seat, nickname: p.nickname, ready: false }))
      : [];
    const keptPids = new Set(this.lobby.map((p) => p.pid));
    for (const pid of [...this.pidToToken.keys()]) if (!keptPids.has(pid)) this.forgetIdentity(pid);
    this.seatCounter = this.lobby.length;
    this.game = null;
    this.sessionLog = [];
    this.reactionMoved.clear();
    this.recoveringPids.clear();
    this.expiredPids.clear();
    for (const t of this.recoveryTimers.values()) clearTimeout(t);
    this.recoveryTimers.clear();
    this.pushState();
  }

  private forgetIdentity(pid: string): void {
    const token = this.pidToToken.get(pid);
    if (token) this.tokenToPid.delete(token);
    this.pidToToken.delete(pid);
    const session = this.pidToSession.get(pid);
    if (session) this.sessionToPid.delete(session);
    this.pidToSession.delete(pid);
  }

  private acceptMessage(sessionId: string, type: string, minimumGapMs: number): boolean {
    const key = `${sessionId}:${type}`;
    const now = Date.now();
    const previous = this.messageTimes.get(key) ?? 0;
    if (now - previous < minimumGapMs) return false;
    this.messageTimes.set(key, now);
    return true;
  }

  private uniqueNickname(raw: string | undefined, selfPid: string): string {
    const base = String(raw ?? '').trim().slice(0, 20) || `لاعب ${this.seatCounter + 1}`;
    const used = new Set([
      ...this.lobby.filter((p) => p.pid !== selfPid).map((p) => p.nickname.toLocaleLowerCase('ar')),
      ...(this.game?.players ?? []).filter((p) => p.id !== selfPid).map((p) => p.nickname.toLocaleLowerCase('ar')),
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

  private setConnected(pid: string, v: boolean): void {
    const ps = this.game?.players.find((p) => p.id === pid);
    if (ps) ps.connected = v;
  }

  /** Keep a game's room alive while momentarily empty; dispose only after a real idle gap. */
  private armDisposeIfEmpty(): void {
    if (this.disposeTimer) {
      clearTimeout(this.disposeTimer);
      this.disposeTimer = null;
    }
    if (this.clients.length > 0) return;
    this.disposeTimer = setTimeout(() => {
      if (this.clients.length === 0) void this.disconnect();
    }, this.game ? this.config.recoveryMs : 1000);
    if (typeof this.disposeTimer.unref === 'function') this.disposeTimer.unref();
  }

  private pushState(): void {
    for (const client of this.clients) client.send('state', this.viewFor(client.sessionId));
  }

  private viewFor(sessionId: string): ClientView {
    if (!this.game) return this.lobbyView(sessionId);
    if (this.viewers.has(sessionId)) {
      const v = redactDassStateFor(this.game, '__tv__');
      v.you = { id: sessionId };
      return this.decorate(v);
    }
    const pid = this.sessionToPid.get(sessionId);
    if (pid && this.game.players.some((p) => p.id === pid)) {
      const v = redactDassStateFor(this.game, pid);
      v.you.reactionMoved = this.reactionMoved.has(pid);
      return this.decorate(v);
    }
    return this.spectatorView(sessionId);
  }

  /** Attach room-owned, non-engine fields and tag which disconnected seats are recovering. */
  private decorate(v: ClientView): ClientView {
    v.phaseEndsAt = this.game && !this.game.ended ? this.phaseEndsAt : undefined;
    v.hostId = this.hostId;
    v.hostConnected = this.hostConnected;
    for (const p of v.players) if (this.recoveringPids.has(p.id)) p.recovering = true;
    return v;
  }

  private lobbyView(sessionId: string): ClientView {
    const players: PublicPlayerView[] = this.lobby.map((p) => ({
      id: p.pid,
      seat: p.seat,
      nickname: p.nickname,
      connected: this.isConnected(p.pid),
      live: this.config.baselineLive,
      vault: 0,
      ready: p.ready,
      recovering: this.recoveringPids.has(p.pid) || undefined,
    }));
    return {
      phase: 'LOBBY',
      round: 0,
      totalRounds: 0,
      players,
      declares: {},
      you: { id: this.sessionToPid.get(sessionId) ?? sessionId },
      history: [],
      ended: false,
      winnerIds: [],
      hostId: this.hostId,
      hostConnected: this.hostConnected,
    };
  }

  private spectatorView(sessionId: string): ClientView {
    if (!this.game) return this.lobbyView(sessionId);
    const v = redactDassStateFor(this.game, '__spectator__');
    v.you = { id: sessionId };
    return this.decorate(v);
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
