// BACKFIRE browser check: the real TV page plus five real phone pages, in a real browser,
// clicking real buttons against the real server.
//
// The integration check proves the rules; this proves the EXPERIENCE renders — that every
// screen mounts, every phase paints, no page throws, and a human tapping through five phones
// reaches the final reveal. Driven over the Chrome DevTools Protocol so it needs no new
// dependency: it uses whichever Edge/Chrome is already installed.

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { BackfireRoom } from './backfire-room.js';
import { createDassHttpServer } from './static.js';

const APP_PORT = 2712;
const CDP_PORT = 9333;
const ORIGIN = `http://127.0.0.1:${APP_PORT}`;
const NAMES = ['نورة', 'عمر', 'ليلى', 'سارة', 'فهد'];

const BROWSERS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

let failed = false;
function check(ok: boolean, message: string): void {
  console.log(`${ok ? '  ok   ✓' : '  FAIL ✗'} ${message}`);
  if (!ok) failed = true;
}

// ---------------------------------------------------------------- CDP plumbing

class Page {
  private ws: WebSocket;
  private nextId = 1;
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  readonly errors: string[] = [];

  private constructor(ws: WebSocket, readonly label: string) {
    this.ws = ws;
    this.ws.on('message', (raw: Buffer) => this.onMessage(String(raw)));
  }

  static async attach(targetId: string, label: string): Promise<Page> {
    const ws = new WebSocket(`ws://127.0.0.1:${CDP_PORT}/devtools/page/${targetId}`, { maxPayload: 64 * 1024 * 1024 });
    await new Promise<void>((resolve, reject) => {
      ws.once('open', () => resolve());
      ws.once('error', reject);
    });
    const page = new Page(ws, label);
    await page.send('Runtime.enable');
    await page.send('Log.enable');
    await page.send('Page.enable');
    return page;
  }

  private onMessage(raw: string): void {
    const msg = JSON.parse(raw) as {
      id?: number;
      method?: string;
      params?: Record<string, unknown>;
      result?: unknown;
      error?: { message?: string };
    };
    if (msg.id !== undefined) {
      const waiter = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      if (!waiter) return;
      if (msg.error) waiter.reject(new Error(msg.error.message ?? 'cdp error'));
      else waiter.resolve(msg.result);
      return;
    }
    // Any uncaught exception or console error is a failure of the page, full stop.
    if (msg.method === 'Runtime.exceptionThrown') {
      const details = (msg.params?.exceptionDetails ?? {}) as { text?: string; exception?: { description?: string } };
      this.errors.push(`${this.label}: ${details.exception?.description ?? details.text ?? 'exception'}`);
    }
    if (msg.method === 'Log.entryAdded') {
      const entry = (msg.params?.entry ?? {}) as { level?: string; text?: string; url?: string };
      // Two browser-policy messages are not application faults: the font CDN is unreachable in
      // this sandbox, and headless refuses navigator.vibrate without a real user gesture (the
      // client already treats haptics as optional).
      const text = entry.text ?? '';
      const ignorable = (entry.url ?? '').includes('fonts.g') || text.includes('navigator.vibrate');
      if (entry.level === 'error' && !ignorable) this.errors.push(`${this.label}: ${text}`);
    }
  }

  send(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`${method} timed out`));
      }, 15000);
    });
  }

  async goto(url: string): Promise<void> {
    await this.send('Page.navigate', { url });
    await wait(400);
  }

  async evaluate<T>(expression: string): Promise<T> {
    const result = (await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })) as { result?: { value?: T }; exceptionDetails?: { text?: string } };
    return result.result?.value as T;
  }

  async waitFor<T>(expression: string, predicate: (value: T) => boolean, timeoutMs: number, note: string): Promise<T | undefined> {
    const started = Date.now();
    let last: T | undefined;
    while (Date.now() - started < timeoutMs) {
      last = await this.evaluate<T>(expression);
      if (predicate(last)) return last;
      await wait(180);
    }
    console.log(`      (timed out waiting for ${note}; last = ${JSON.stringify(last)})`);
    return undefined;
  }

  close(): void {
    try {
      this.ws.close();
    } catch {
      /* already closing */
    }
  }
}

async function browserSend(browserWs: WebSocket, id: number, method: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const onMessage = (raw: Buffer): void => {
      const msg = JSON.parse(String(raw)) as { id?: number; result?: Record<string, unknown>; error?: { message?: string } };
      if (msg.id !== id) return;
      browserWs.off('message', onMessage);
      if (msg.error) reject(new Error(msg.error.message ?? 'cdp error'));
      else resolve(msg.result ?? {});
    };
    browserWs.on('message', onMessage);
    browserWs.send(JSON.stringify({ id, method, params }));
    setTimeout(() => reject(new Error(`${method} timed out`)), 15000);
  });
}

// ---------------------------------------------------------------- the check

/** One tick of "a human looking at their phone": read the card, or make the obvious choice. */
const PHONE_TICK = `(() => {
  const ack = document.querySelector('#ack');
  if (ack && !ack.disabled) { ack.click(); return 'ack'; }
  const ready = document.querySelector('#ready');
  if (ready && ready.textContent.trim() === 'جاهز') { ready.click(); return 'ready'; }
  const confirm = document.querySelector('#confirm');
  if (!confirm) return 'idle';
  const selected = document.querySelector('.target.sel, .side-btn.sel');
  if (!selected) {
    // Prefer a target that holds no public Round 3 position. The Redirector and the Guardian
    // both apply this rule, so they converge on the same player — which is precisely the
    // collision that produces the signature Backfire, and lets this run exercise it.
    const option = document.querySelector('.target:not([data-role])')
      || document.querySelector('.target, .side-btn');
    if (option) { option.click(); return 'pick'; }
  }
  if (!confirm.disabled) { confirm.click(); return 'confirm'; }
  return 'wait';
})()`;

const PHONE_SCREEN = `(() => {
  const body = document.querySelector('.p-body');
  if (!body) return 'none';
  if (document.querySelector('.join-card')) return 'join';
  if (document.querySelector('.lobby')) return 'lobby';
  if (document.querySelector('.intel')) return 'intel';
  if (document.querySelector('.discuss')) return 'discussion';
  if (document.querySelector('.decide')) return 'decision';
  if (document.querySelector('.results')) return 'results';
  if (document.querySelector('.wait')) return 'wait';
  return 'other';
})()`;

async function main(): Promise<void> {
  process.env.DASS_ALLOW_TEST_CONFIG = '1';
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const tvDir = path.resolve(dirname, '../../bftv/public');
  const playerDir = path.resolve(dirname, '../../bfplayer/public');
  const siteDir = path.resolve(dirname, '../../dasssite/public');

  const httpServer = createDassHttpServer(tvDir, playerDir, siteDir);
  const gameServer = new Server({ transport: new WebSocketTransport({ server: httpServer }) });
  gameServer.define('backfire', BackfireRoom);
  await gameServer.listen(APP_PORT, '127.0.0.1');

  const binary = BROWSERS.find((p) => existsSync(p));
  if (!binary) {
    console.log('  SKIP — no Chrome/Edge binary found; run the integration check instead.');
    await gameServer.gracefullyShutdown(false);
    return;
  }
  const profile = mkdtempSync(path.join(tmpdir(), 'bf-cdp-'));
  let browser: ChildProcess | undefined;
  const pages: Page[] = [];

  try {
    browser = spawn(
      binary,
      [
        '--headless=new',
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${profile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        '--window-size=1600,900',
        'about:blank',
      ],
      { stdio: 'ignore' },
    );

    // wait for the DevTools endpoint
    let versionInfo: { webSocketDebuggerUrl?: string } | undefined;
    for (let i = 0; i < 60 && !versionInfo; i++) {
      try {
        versionInfo = (await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)).json()) as { webSocketDebuggerUrl?: string };
      } catch {
        await wait(250);
      }
    }
    if (!versionInfo?.webSocketDebuggerUrl) throw new Error('browser did not expose a DevTools endpoint');

    const browserWs = new WebSocket(versionInfo.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
    await new Promise<void>((resolve, reject) => {
      browserWs.once('open', () => resolve());
      browserWs.once('error', reject);
    });
    let cdpId = 1;
    /**
     * `isolated` puts the page in its own browser context, giving it its own localStorage.
     * That matters: the durable player token lives in localStorage, so five tabs sharing one
     * origin would otherwise resolve to ONE seat and evict each other. Five real phones have
     * five storages, and this reproduces that.
     */
    const newPage = async (url: string, label: string, isolated = false): Promise<Page> => {
      const params: Record<string, unknown> = { url: 'about:blank' };
      if (isolated) {
        const context = await browserSend(browserWs, cdpId++, 'Target.createBrowserContext', {});
        params.browserContextId = context.browserContextId;
      }
      const result = await browserSend(browserWs, cdpId++, 'Target.createTarget', params);
      const page = await Page.attach(String(result.targetId), label);
      await page.goto(url);
      pages.push(page);
      return page;
    };

    // The marketing site shares this host. It is finished work and must keep rendering exactly
    // as it did while the game around it changes.
    console.log('\nmarketing site');
    const site = await newPage(`${ORIGIN}/`, 'site');
    // The title is static HTML, so wait on DOM the site's own bundle mounts.
    const siteState = await site.waitFor<{ title: string; hero: boolean; nav: number; posters: number }>(
      `(() => ({
        title: document.title,
        hero: !!document.querySelector('#site-head') && document.body.classList.contains('backfire-site'),
        nav: document.querySelectorAll('.head-nav a').length,
        posters: document.querySelectorAll('.poster').length
      }))()`,
      (v) => v?.hero === true,
      15000,
      'site shell',
    );
    // The site's router sets its own per-route title once mounted, so match the brand, not one
    // exact string, and leave the site free to own its copy.
    check(!!siteState?.title.startsWith('BACKFIRE'), `the marketing site keeps its own title (${siteState?.title})`);
    check(siteState?.hero === true, 'the marketing site mounts its own header and body theme');
    check((siteState?.nav ?? 0) >= 3, `the marketing site navigation is intact (${siteState?.nav} links)`);
    check((siteState?.posters ?? 0) >= 3, `the marketing poster sections still render (${siteState?.posters})`);

    console.log('\nTV');
    // fast=900 compresses the phase clock; the server only honours it under the test flag.
    const tv = await newPage(`${ORIGIN}/tv?fast=1200`, 'tv');
    const code = await tv.waitFor<string>(
      `(document.querySelector('.lb-code')||{}).textContent||''`,
      (v) => !!v && v.trim().length >= 6,
      20000,
      'room code',
    );
    check(!!code, `the TV boots, creates a room and shows a join code (${code?.trim()})`);
    const qrOk = await tv.evaluate<boolean>(`!!document.querySelector('.qr-frame svg')`);
    check(qrOk, 'the lobby renders a scannable QR');

    console.log('\nphones');
    const phones: Page[] = [];
    for (let i = 0; i < 5; i++) {
      const phone = await newPage(
        `${ORIGIN}/play?code=${encodeURIComponent(code!.trim())}&name=${encodeURIComponent(NAMES[i]!)}`,
        `phone-${i + 1}`,
        true,
      );
      phones.push(phone);
    }
    const seated = await tv.waitFor<number>(
      `document.querySelectorAll('.seat-card:not(.ghost)').length`,
      (n) => n === 5,
      20000,
      'five seats on the TV',
    );
    check(seated === 5, 'all five phones appear on the TV lobby');

    const screensSeen = new Set<string>();
    for (const phone of phones) {
      screensSeen.add(await phone.evaluate<string>(PHONE_SCREEN));
      await phone.evaluate(PHONE_TICK); // tap ready
    }
    const startable = await tv.waitFor<boolean>(
      `!!document.querySelector('#tv-start') && !document.querySelector('#tv-start').disabled`,
      (v) => v === true,
      15000,
      'start enabled',
    );
    check(startable === true, 'five ready players enable the start control');

    await tv.evaluate(`document.querySelector('#tv-start').click()`);

    console.log('\nthe slice, driven from the phones');
    const titlesSeen: string[] = [];
    let sawRelay = false;
    let sawLockStrip = false;
    let sawSupportArc = false;
    let sawReturnPath = false;
    let sawFinalHit = false;
    let sawFinalCard = false;
    let reachedResults = false;

    const deadline = Date.now() + 120000;
    while (Date.now() < deadline && !reachedResults) {
      for (const phone of phones) {
        // Sample BEFORE acting: a decisive player leaves the decision screen immediately, so
        // reading the screen afterwards would only ever observe the locked state.
        const screenBefore = await phone.evaluate<string>(PHONE_SCREEN);
        if (screenBefore) screensSeen.add(screenBefore);
        // A decision is pick-then-confirm, so keep tapping until this phone has nothing left to
        // do. One tap per poll would let a short decision window close on a half-made choice.
        for (let tap = 0; tap < 4; tap++) {
          const result = await phone.evaluate<string>(PHONE_TICK);
          if (result === 'idle' || result === 'wait') break;
        }
        const screen = await phone.evaluate<string>(PHONE_SCREEN);
        if (screen) screensSeen.add(screen);
      }
      const snapshot = await tv.evaluate<{
        title: string;
        relay: boolean;
        lock: boolean;
        arcs: number;
        returnPath: boolean;
        finalHit: boolean;
        finalCard: boolean;
        results: boolean;
      }>(`(() => ({
        title: ((document.querySelector('.st-main')||{}).textContent||'').trim(),
        relay: !!document.querySelector('.relay-svg .rnode'),
        lock: !!document.querySelector('.lock-strip.show'),
        arcs: document.querySelectorAll('.support-arc').length,
        returnPath: !!document.querySelector('.return-path'),
        finalHit: !!document.querySelector('.rnode.final-hit'),
        finalCard: !!document.querySelector('.rc-title, .rc-summary'),
        results: !!document.querySelector('.rs-rows .rs-row')
      }))()`);
      if (snapshot) {
        if (snapshot.title && titlesSeen[titlesSeen.length - 1] !== snapshot.title) titlesSeen.push(snapshot.title);
        sawRelay ||= snapshot.relay;
        sawLockStrip ||= snapshot.lock;
        sawSupportArc ||= snapshot.arcs > 0;
        sawReturnPath ||= snapshot.returnPath;
        sawFinalHit ||= snapshot.finalHit;
        sawFinalCard ||= snapshot.finalCard;
        reachedResults ||= snapshot.results;
      }
      await wait(120);
    }

    check(sawRelay, 'the TV renders the relay with five positions');
    check(sawLockStrip, 'the TV shows a live lock count during decision phases');
    check(sawSupportArc, 'the Round 2 route animates support arcs on the relay');
    check(sawReturnPath, 'the Round 3 Return draws its path across the relay');
    check(sawFinalHit, 'the final consequence visibly lands on a player');
    check(titlesSeen.length >= 10, `the TV narrates the match in stages (${titlesSeen.length} distinct titles)`);
    check(sawFinalCard, 'the final causal reveal renders its cards');
    check(reachedResults, 'the TV reaches the results screen');

    for (const expected of ['lobby', 'intel', 'decision', 'wait']) {
      check(screensSeen.has(expected), `phones rendered the ${expected} screen`);
    }

    const summary = await tv.evaluate<string>(`((document.querySelector('.rs-summary')||{}).textContent||'').trim()`);
    check(!!summary && summary.length > 20, 'the results screen carries the one-sentence causal summary');
    console.log(`      summary: ${summary}`);
    console.log('      narration:');
    for (const title of titlesSeen) console.log(`        · ${title}`);

    const phoneResults = await phones[0]!.evaluate<string>(PHONE_SCREEN);
    check(phoneResults === 'results', 'phones land on their own result screen');

    console.log('\npage health');
    const allErrors = pages.flatMap((p) => p.errors);
    check(allErrors.length === 0, `no page threw an uncaught error${allErrors.length ? `: ${allErrors[0]}` : ''}`);
    for (const error of allErrors.slice(0, 8)) console.log(`      ${error}`);

    console.log(`\n${failed ? 'BACKFIRE BROWSER CHECK: FAILED' : 'BACKFIRE BROWSER CHECK: PASSED'}`);
  } finally {
    for (const page of pages) page.close();
    browser?.kill();
    await gameServer.gracefullyShutdown(false);
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {
      /* the profile directory may still be locked on Windows */
    }
  }
}

main()
  .then(() => process.exit(failed ? 1 : 0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
