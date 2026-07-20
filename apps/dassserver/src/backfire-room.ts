import { randomBytes } from 'node:crypto';
import { ErrorCode, Room, ServerError, type Client } from 'colyseus';
import { validateNickname } from '@dass/domain';
import {
  BF_DEV_SEED,
  BF_PLAYERS,
  DECISION_PHASES,
  INTEL_PHASES,
  advancePhase,
  allLocked,
  expectedDeciders,
  initBackfire,
  phaseDuration,
  redactBackfireFor,
  startBackfire,
  submitDecision,
  type BfClientView,
  type BfDecision,
  type BfGame,
  type BfPlayerInput,
  type BfPublicPlayer,
  type SideChoice,
} from '@backfire/domain';
import { makeRoomCode, setRoomStatus } from './lifecycle.js';
import { serverLog } from './log.js';

interface LobbySeat {
  pid: string;
  seat: number;
  nickname: string;
  ready: boolean;
}

interface JoinOptions {
  nickname?: string;
  role?: string;
  hostToken?: string;
  playerToken?: string;
}

export interface BackfireRoomOptions {
  /** Fixed seed for the deterministic QA scenario (§34). Test-gated. */
  seed?: number;
  /** Phase overrides so the harness can run a full slice in seconds. Test-gated. */
  phaseMs?: Partial<Record<string, number>>;
  minPlayers?: number;
  emptyRoomGraceMs?: number;
  recoveryMs?: number;
}

/**
 * One BACKFIRE session: "The Broken Relay".
 *
 * The server is the only thing that knows the whole board. It owns the phase clock, the tool
 * assignment, every secret decision and the entire authorship log; clients receive only
 * `redactBackfireFor(...)` output. Identity is the durable `playerToken → pid` model proven by
 * the existing room: a reconnecting socket rebinds to the SAME seat, mid-match, with its private
 * intel and locked decision intact.
 */
export class BackfireRoom extends Room {
  // The TV is a client too, so transport capacity must never consume one of the five seats.
  override maxClients = 20;
  // Identity and recovery are ours (token → pid), so a momentarily empty room must not vanish.
  override autoDispose = false;

  private lobby: LobbySeat[] = [];
  private game: BfGame | null = null;
  private hostToken = randomBytes(24).toString('base64url');
  private hostConnected = false;
  private creatorAssigned = false;
  private hostId?: string;
  private seatCounter = 0;
  private minPlayers = BF_PLAYERS;
  private maxPlayers = BF_PLAYERS;
  private seed = 0;
  private phaseMsOverride: Partial<Record<string, number>> = {};
  private recoveryMs = 120000;
  private emptyRoomGraceMs = 10000;

  private phaseTimer: ReturnType<typeof setTimeout> | null = null;
  private phaseEndsAt?: number;
  private viewers = new Set<string>();
  /** Players who tapped "continue" on an intel card; lets a fast table skip ahead. */
  private intelAcks = new Set<string>();

  private tokenToPid = new Map<string, string>();
  private pidToToken = new Map<string, string>();
  private sessionToPid = new Map<string, string>();
  private pidToSession = new Map<string, string>();

  private recoveringPids = new Set<string>();
  private expiredPids = new Set<string>();
  private recoveryTimers = new Map<string, ReturnType<typeof setTimeout>>();

  private messageTimes = new Map<string, number>();
  private disposeTimer: ReturnType<typeof setTimeout> | null = null;
  /** Telemetry for playtesting (§35). Written to the server log at the end of a match. */
  private telemetry: { t: string; [k: string]: unknown }[] = [];
  private phaseStartedAt = 0;
  private decisionChanges = new Map<string, number>();

  override onCreate(options: BackfireRoomOptions = {}): void {
    this.roomId = makeRoomCode();
    setRoomStatus(this.roomId, 'active');
    serverLog('room_created', { roomId: this.roomId, game: 'backfire' });

    const allowTestConfig = process.env.DASS_ALLOW_TEST_CONFIG === '1';
    this.seed = allowTestConfig && typeof options.seed === 'number' ? options.seed : (randomBytes(4).readUInt32BE(0) || BF_DEV_SEED);
    this.phaseMsOverride = allowTestConfig ? (options.phaseMs ?? {}) : {};
    this.minPlayers = allowTestConfig ? (options.minPlayers ?? BF_PLAYERS) : BF_PLAYERS;
    this.maxPlayers = Math.max(this.minPlayers, BF_PLAYERS);
    this.emptyRoomGraceMs = allowTestConfig ? (options.emptyRoomGraceMs ?? 10000) : 10000;
    this.recoveryMs = allowTestConfig ? (options.recoveryMs ?? 120000) : 120000;

    this.onMessage('sync', (client) => {
      client.send('state', this.viewFor(client.sessionId));
    });

    this.onMessage('syncHost', (client) => {
      if (client.sessionId === this.hostId) client.send('host', { token: this.hostToken });
    });

    this.onMessage('setNickname', (client, msg: { name?: string }) => {
      if (this.game || !this.accept(client.sessionId, 'nickname', 300)) return;
      const pid = this.sessionToPid.get(client.sessionId);
      const seat = pid ? this.lobby.find((p) => p.pid === pid) : undefined;
      if (!seat) return;
      const result = validateNickname(msg?.name);
      if (!result.ok) return;
      seat.nickname = this.uniqueNickname(result.value, seat.pid);
      this.pushState();
    });

    this.onMessage('ready', (client, msg: { ready?: boolean }) => {
      if (this.game || !this.accept(client.sessionId, 'ready', 150)) return;
      const pid = this.sessionToPid.get(client.sessionId);
      const seat = pid ? this.lobby.find((p) => p.pid === pid) : undefined;
      if (seat) seat.ready = typeof msg?.ready === 'boolean' ? msg.ready : !seat.ready;
      this.pushState();
    });

    this.onMessage('start', (client) => {
      if (this.game || !this.accept(client.sessionId, 'start', 500)) return;
      if (client.sessionId !== this.hostId) return;
      const connected = this.lobby.filter((p) => this.isConnected(p.pid)).length;
      const ready = this.lobby.filter((p) => p.ready && this.isConnected(p.pid)).length;
      if (connected < this.minPlayers || ready !== connected) return;
      this.beginMatch();
    });

    // SECRET decision. Stored server-side; the redacted push never carries it to another client.
    this.onMessage('decide', (client, msg: unknown) => {
      if (!this.game || !this.accept(client.sessionId, 'decide', 120)) return;
      if (!DECISION_PHASES.has(this.game.phase)) return;
      const pid = this.sessionToPid.get(client.sessionId);
      if (!pid) return;
      const decision = parseDecision(msg);
      if (!decision) return;
      const had = this.game.decisions[pid] !== undefined;
      if (!submitDecision(this.game, pid, decision)) return;
      if (had) this.decisionChanges.set(pid, (this.decisionChanges.get(pid) ?? 0) + 1);
      this.pushState();
      this.maybeAdvanceEarly();
    });

    // "I have read my card." Purely a pacing signal — it can only shorten a wait, never skip input.
    this.onMessage('ack', (client) => {
      if (!this.game || !this.accept(client.sessionId, 'ack', 200)) return;
      if (!INTEL_PHASES.has(this.game.phase)) return;
      const pid = this.sessionToPid.get(client.sessionId);
      if (!pid) return;
      this.intelAcks.add(pid);
      this.pushState();
      this.maybeAdvanceEarly();
    });

    this.onMessage('restart', (client) => {
      if (!this.accept(client.sessionId, 'restart', 500)) return;
      if (!this.game?.ended || client.sessionId !== this.hostId) return;
      this.resetToLobby(true);
    });

    this.onMessage('newCrew', (client) => {
      if (!this.accept(client.sessionId, 'newCrew', 500)) return;
      if (!this.game?.ended || client.sessionId !== this.hostId) return;
      const oldPids = new Set(this.game.players.map((p) => p.id));
      for (const c of this.clients) {
        const pid = this.sessionToPid.get(c.sessionId);
        if (pid && oldPids.has(pid)) c.send('newCrew', {});
      }
      this.resetToLobby(false);
    });
  }

  // ---------------------------------------------------------------- join / identity

  override onAuth(client: Client, options: JoinOptions = {}): boolean {
    const role = options.role === 'tv' ? 'tv' : 'player';
    serverLog('join_attempt', {
      roomId: this.roomId,
      sessionId: client.sessionId,
      role,
      reconnect: !!options.hostToken || !!options.playerToken,
    });
    if (options.hostToken && options.hostToken !== this.hostToken) this.reject('INVALID_HOST_TOKEN', role);
    if (options.role === 'tv') return true;
    if (options.hostToken === this.hostToken) return true;
    const allowTestTokens = process.env.DASS_ALLOW_TEST_CONFIG === '1';
    if (options.playerToken && !allowTestTokens && !/^[A-Za-z0-9_-]{24,128}$/.test(options.playerToken)) {
      this.reject('INVALID_PLAYER_TOKEN', role);
    }
    // A returning identity always gets in: it resumes its seat or watches, never taking a new one.
    if (options.playerToken && this.tokenToPid.has(options.playerToken)) return true;
    if (this.game?.ended) this.reject('ROOM_CLOSED', role);
    if (this.game) return true; // a brand-new client mid-match becomes a spectator
    const nickname = validateNickname(options.nickname);
    if (!nickname.ok) this.reject(nickname.reason, role);
    if (this.lobby.length >= this.maxPlayers) this.reject('ROOM_FULL', role);
    return true;
  }

  private reject(reason: string, role: string): never {
    serverLog('join_rejected', { roomId: this.roomId, role, reason });
    throw new ServerError(ErrorCode.APPLICATION_ERROR, reason);
  }

  override onJoin(client: Client, options: JoinOptions = {}): void {
    if (this.disposeTimer) {
      clearTimeout(this.disposeTimer);
      this.disposeTimer = null;
    }
    const isTv = options.role === 'tv';

    // The first client to reach a fresh room owns it and privately receives the host token.
    if (!this.creatorAssigned) {
      this.creatorAssigned = true;
      this.bindHost(client, false);
      client.send('host', { token: this.hostToken });
      if (isTv) {
        this.viewers.add(client.sessionId);
        this.clock.setTimeout(() => client.send('state', this.viewFor(client.sessionId)), 0);
        return;
      }
      this.admitPlayer(client, options);
      return;
    }

    if (options.hostToken && options.hostToken === this.hostToken) {
      this.bindHost(client, true);
      if (isTv) this.viewers.add(client.sessionId);
      this.clock.setTimeout(() => this.pushState(), 0);
      return;
    }

    if (isTv) {
      this.viewers.add(client.sessionId);
      this.clock.setTimeout(() => client.send('state', this.viewFor(client.sessionId)), 0);
      return;
    }

    this.admitPlayer(client, options);
  }

  private bindHost(client: Client, reconnecting: boolean): void {
    this.hostId = client.sessionId;
    this.hostConnected = true;
    if (this.game) this.game.hostId = this.hostId;
    serverLog(reconnecting ? 'reconnect' : 'host_bound', {
      roomId: this.roomId,
      role: 'host',
      sessionId: client.sessionId,
    });
  }

  private admitPlayer(client: Client, options: JoinOptions): void {
    const token = typeof options.playerToken === 'string' ? options.playerToken : undefined;
    const pid = token ? this.tokenToPid.get(token) : undefined;

    if (pid) {
      const inGame = !!this.game && this.game.players.some((p) => p.id === pid);
      const inLobby = !this.game && this.lobby.some((p) => p.pid === pid);
      if (inGame && this.expiredPids.has(pid)) {
        this.sendSpectator(client);
        client.send('recoveryExpired', {});
        return;
      }
      if (inGame || inLobby) {
        this.reclaimSeat(client, pid, inGame);
        return;
      }
    }

    if (this.game) {
      this.sendSpectator(client);
      return;
    }
    if (this.lobby.length >= this.maxPlayers) {
      client.leave(4001, 'ROOM_FULL');
      return;
    }
    const newPid = 'p_' + randomBytes(9).toString('base64url');
    if (token) {
      this.tokenToPid.set(token, newPid);
      this.pidToToken.set(newPid, token);
    }
    const nickname = this.uniqueNickname(options.nickname, newPid);
    this.lobby.push({ pid: newPid, seat: this.seatCounter++, nickname, ready: false });
    this.bindSession(newPid, client.sessionId);
    serverLog('player_joined', { roomId: this.roomId, playerId: newPid, seat: this.seatCounter - 1 });
    this.clock.setTimeout(() => this.pushState(), 0);
  }

  private reclaimSeat(client: Client, pid: string, restored: boolean): void {
    const stale = this.pidToSession.get(pid);
    if (stale && stale !== client.sessionId) {
      this.sessionToPid.delete(stale);
      this.clients.find((c) => c.sessionId === stale)?.leave(4002);
    }
    this.clearRecovery(pid);
    this.expiredPids.delete(pid);
    this.bindSession(pid, client.sessionId);
    serverLog('reconnect', { roomId: this.roomId, role: 'player', playerId: pid, sessionId: client.sessionId });
    if (restored) client.send('restored', {});
    this.clock.setTimeout(() => this.pushState(), 0);
  }

  private sendSpectator(client: Client): void {
    this.clock.setTimeout(() => client.send('state', this.spectatorView(client.sessionId)), 0);
  }

  override onLeave(client: Client, consented: boolean): void {
    for (const key of this.messageTimes.keys()) {
      if (key.startsWith(`${client.sessionId}:`)) this.messageTimes.delete(key);
    }
    if (client.sessionId === this.hostId) this.hostConnected = false;

    if (this.viewers.has(client.sessionId)) {
      this.viewers.delete(client.sessionId);
      this.pushState();
      this.armDisposeIfEmpty();
      return;
    }

    const pid = this.sessionToPid.get(client.sessionId);
    this.sessionToPid.delete(client.sessionId);
    if (!pid || this.pidToSession.get(pid) !== client.sessionId) {
      this.pushState();
      this.armDisposeIfEmpty();
      return;
    }
    this.pidToSession.delete(pid);
    this.setConnected(pid, false);
    if (consented && !this.game) this.removeSeat(pid);
    else this.startRecovery(pid);
    this.pushState();
    // A seat going quiet must not stall the table: the phase may now be fully locked.
    this.maybeAdvanceEarly();
    this.armDisposeIfEmpty();
  }

  override onDispose(): void {
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    if (this.disposeTimer) clearTimeout(this.disposeTimer);
    for (const t of this.recoveryTimers.values()) clearTimeout(t);
    setRoomStatus(this.roomId, 'expired');
    serverLog('room_destroyed', {
      roomId: this.roomId,
      phase: this.game?.phase ?? 'LOBBY',
      players: this.game?.players.length ?? this.lobby.length,
    });
  }

  // ---------------------------------------------------------------- match flow

  private beginMatch(): void {
    const players: BfPlayerInput[] = this.lobby
      .slice()
      .sort((a, b) => a.seat - b.seat)
      .map((p, index) => ({ id: p.pid, nickname: p.nickname, seat: index }));
    this.game = startBackfire(initBackfire(players, this.seed, this.hostId));
    for (const ps of this.game.players) ps.connected = this.isConnected(ps.id);
    this.telemetry = [{ t: 'match_start', seed: this.seed, players: players.length }];
    this.decisionChanges.clear();
    this.schedulePhase();
    this.pushState();
    serverLog('match_start', { roomId: this.roomId, seed: this.seed });
  }

  private durationFor(phase: string): number {
    const override = this.phaseMsOverride[phase];
    if (typeof override === 'number') return override;
    return phaseDuration(phase as never);
  }

  private schedulePhase(): void {
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }
    const game = this.game;
    if (!game || game.phase === 'RESULTS') {
      this.phaseEndsAt = undefined;
      return;
    }
    const duration = this.durationFor(game.phase);
    if (duration <= 0) {
      this.phaseEndsAt = undefined;
      return;
    }
    this.phaseStartedAt = Date.now();
    this.phaseEndsAt = Date.now() + duration;
    this.phaseTimer = setTimeout(() => this.step(), duration);
  }

  /**
   * Shorten a wait when the table is already done — but never shorten a phase the room is
   * meant to feel (discussion, resolution, aftershock), and never before a minimum beat so
   * the TV can show the final lock landing.
   */
  private maybeAdvanceEarly(): void {
    const game = this.game;
    if (!game) return;
    if (DECISION_PHASES.has(game.phase)) {
      if (!allLocked(game)) return;
      this.deferStep(900);
      return;
    }
    if (INTEL_PHASES.has(game.phase)) {
      const need = game.players.filter((p) => p.connected).map((p) => p.id);
      if (need.length === 0 || !need.every((id) => this.intelAcks.has(id))) return;
      const elapsed = Date.now() - this.phaseStartedAt;
      this.deferStep(Math.max(400, 4000 - elapsed));
    }
  }

  private deferStep(delay: number): void {
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    const remaining = this.phaseEndsAt ? this.phaseEndsAt - Date.now() : delay;
    const wait = Math.max(0, Math.min(delay, remaining));
    this.phaseEndsAt = Date.now() + wait;
    this.phaseTimer = setTimeout(() => this.step(), wait);
    this.pushState();
  }

  /** The single server-authoritative FSM step. */
  private step(): void {
    const game = this.game;
    if (!game) return;
    const from = game.phase;
    this.recordPhaseTelemetry(from);
    const next = advancePhase(game);
    this.intelAcks.clear();

    if (next === 'RESULTS') {
      if (this.phaseTimer) clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
      this.phaseEndsAt = undefined;
      this.telemetry.push({
        t: 'match_end',
        threat: game.world.threat,
        outcome: game.r3.outcome,
        collapsed: game.world.collapsed,
        winners: game.winnerIds,
      });
      setRoomStatus(this.roomId, 'closed');
      serverLog('match_end', {
        roomId: this.roomId,
        outcome: game.r3.outcome,
        threat: game.world.threat,
        collapsed: game.world.collapsed,
      });
      console.log('[backfire] telemetry:', JSON.stringify(this.telemetry));
      this.broadcast('telemetry', this.telemetry);
      this.pushState();
      return;
    }

    this.schedulePhase();
    this.pushState();
  }

  private recordPhaseTelemetry(phase: string): void {
    const game = this.game;
    if (!game) return;
    const elapsed = Date.now() - this.phaseStartedAt;
    if (DECISION_PHASES.has(game.phase)) {
      const missing = expectedDeciders(game).filter((id) => game.decisions[id] === undefined);
      this.telemetry.push({
        t: 'decision_phase',
        phase,
        ms: elapsed,
        locked: Object.keys(game.decisions).length,
        missing: missing.length,
        changes: Object.fromEntries(this.decisionChanges),
      });
      this.decisionChanges.clear();
    } else {
      this.telemetry.push({ t: 'phase', phase, ms: elapsed });
    }
  }

  // ---------------------------------------------------------------- recovery / helpers

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

  private startRecovery(pid: string): void {
    this.clearRecovery(pid);
    this.recoveringPids.add(pid);
    const timer = setTimeout(() => this.onRecoveryTimeout(pid), this.recoveryMs);
    if (typeof timer.unref === 'function') timer.unref();
    this.recoveryTimers.set(pid, timer);
  }

  private clearRecovery(pid: string): void {
    const timer = this.recoveryTimers.get(pid);
    if (timer) clearTimeout(timer);
    this.recoveryTimers.delete(pid);
    this.recoveringPids.delete(pid);
  }

  private onRecoveryTimeout(pid: string): void {
    this.recoveryTimers.delete(pid);
    this.recoveringPids.delete(pid);
    if (this.pidToSession.has(pid)) return;
    if (this.game && this.game.players.some((p) => p.id === pid)) this.expiredPids.add(pid);
    else this.removeSeat(pid);
    this.pushState();
  }

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
    const previous = this.game?.players ?? [];
    this.lobby = keepPlayers
      ? previous
          .filter((p) => this.isConnected(p.id))
          .sort((a, b) => a.seat - b.seat)
          .map((p, seat) => ({ pid: p.id, seat, nickname: p.nickname, ready: false }))
      : [];
    const kept = new Set(this.lobby.map((p) => p.pid));
    for (const pid of [...this.pidToToken.keys()]) if (!kept.has(pid)) this.forgetIdentity(pid);
    this.seatCounter = this.lobby.length;
    this.game = null;
    // A rematch is a new match: fresh candidates, fresh tools.
    this.seed = randomBytes(4).readUInt32BE(0) || BF_DEV_SEED;
    setRoomStatus(this.roomId, 'active');
    this.telemetry = [];
    this.intelAcks.clear();
    this.decisionChanges.clear();
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

  private accept(sessionId: string, type: string, minimumGapMs: number): boolean {
    const key = `${sessionId}:${type}`;
    const now = Date.now();
    const previous = this.messageTimes.get(key) ?? 0;
    if (now - previous < minimumGapMs) return false;
    this.messageTimes.set(key, now);
    return true;
  }

  private uniqueNickname(raw: string | undefined, selfPid: string): string {
    const validated = validateNickname(raw);
    const base = validated.ok ? validated.value : `لاعب ${this.seatCounter + 1}`;
    const used = new Set([
      ...this.lobby.filter((p) => p.pid !== selfPid).map((p) => p.nickname.toLocaleLowerCase('ar')),
      ...(this.game?.players ?? []).filter((p) => p.id !== selfPid).map((p) => p.nickname.toLocaleLowerCase('ar')),
    ]);
    if (!used.has(base.toLocaleLowerCase('ar'))) return base;
    let suffix = 2;
    for (;;) {
      const tail = ` ${suffix}`;
      const candidate = `${[...base].slice(0, Math.max(1, 20 - [...tail].length)).join('')}${tail}`;
      if (!used.has(candidate.toLocaleLowerCase('ar'))) return candidate;
      suffix += 1;
    }
  }

  private setConnected(pid: string, value: boolean): void {
    const ps = this.game?.players.find((p) => p.id === pid);
    if (ps) ps.connected = value;
  }

  private armDisposeIfEmpty(): void {
    if (this.disposeTimer) {
      clearTimeout(this.disposeTimer);
      this.disposeTimer = null;
    }
    if (this.clients.length > 0) return;
    this.disposeTimer = setTimeout(
      () => {
        if (this.clients.length === 0) void this.disconnect();
      },
      this.game ? this.recoveryMs : this.emptyRoomGraceMs,
    );
    if (typeof this.disposeTimer.unref === 'function') this.disposeTimer.unref();
  }

  // ---------------------------------------------------------------- views

  private pushState(): void {
    for (const client of this.clients) client.send('state', this.viewFor(client.sessionId));
  }

  private readyMap(): Record<string, boolean> {
    return Object.fromEntries(this.lobby.map((p) => [p.pid, p.ready]));
  }

  private viewFor(sessionId: string): BfClientView {
    if (!this.game) return this.lobbyView(sessionId);
    if (this.viewers.has(sessionId)) {
      return redactBackfireFor(this.game, '__tv__', { isTv: true, ...this.viewOptions() });
    }
    const pid = this.sessionToPid.get(sessionId);
    if (pid && this.game.players.some((p) => p.id === pid)) {
      return redactBackfireFor(this.game, pid, this.viewOptions());
    }
    return this.spectatorView(sessionId);
  }

  private viewOptions() {
    return {
      recovering: this.recoveringPids,
      phaseEndsAt: this.phaseEndsAt,
      hostId: this.hostId,
      hostConnected: this.hostConnected,
      roomCode: this.roomId,
    };
  }

  private spectatorView(sessionId: string): BfClientView {
    if (!this.game) return this.lobbyView(sessionId);
    return redactBackfireFor(this.game, '__spectator__', { isSpectator: true, ...this.viewOptions() });
  }

  private lobbyView(sessionId: string): BfClientView {
    const players: BfPublicPlayer[] = this.lobby.map((p) => ({
      id: p.pid,
      seat: p.seat,
      nickname: p.nickname,
      connected: this.isConnected(p.pid),
      ready: p.ready,
      recovering: this.recoveringPids.has(p.pid) || undefined,
      locked: false,
    }));
    const pid = this.sessionToPid.get(sessionId);
    return {
      phase: 'LOBBY',
      world: {
        threat: 1,
        worldStatus: 'stable',
        echoHolderId: null,
        echoCharge: 0,
        echoStatus: 'none',
        roundNumber: 1,
        currentCarrierId: null,
        routeCompromised: false,
        collapsed: false,
      },
      players,
      lockedCount: 0,
      expectedCount: players.filter((p) => p.connected).length,
      you: {
        id: pid ?? sessionId,
        isTv: this.viewers.has(sessionId),
        isSpectator: !pid && !this.viewers.has(sessionId),
        tool: null,
        intel: null,
        objective: null,
        decision: null,
        targets: [],
      },
      candidates: [],
      publicRoles: { redirectorId: null, guardianId: null },
      ended: false,
      winnerIds: [],
      sharedFailure: false,
      hostId: this.hostId,
      hostConnected: this.hostConnected,
      roomCode: this.roomId,
    };
  }
}

/** Parse an untrusted phone message into a decision. The engine still validates legality. */
function parseDecision(raw: unknown): BfDecision | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const msg = raw as { kind?: unknown; target?: unknown; source?: unknown; side?: unknown };
  const target = typeof msg.target === 'string' ? msg.target : undefined;
  switch (msg.kind) {
    case 'vote':
      return target ? { kind: 'vote', target } : undefined;
    case 'support':
      return target ? { kind: 'support', target } : undefined;
    case 'disrupt':
      return target ? { kind: 'disrupt', target } : undefined;
    case 'shield':
      return target ? { kind: 'shield', target } : undefined;
    case 'tiebreak':
      return target ? { kind: 'tiebreak', target } : undefined;
    case 'echo_target':
      return target ? { kind: 'echo_target', target } : undefined;
    case 'echo_shield':
      return target ? { kind: 'echo_shield', target } : undefined;
    case 'redirect':
      return target && typeof msg.source === 'string' ? { kind: 'redirect', source: msg.source, target } : undefined;
    case 'side': {
      const side = msg.side;
      if (side === 'redirect' || side === 'shield' || side === 'abstain') {
        return { kind: 'side', side: side as SideChoice };
      }
      return undefined;
    }
    default:
      return undefined;
  }
}
