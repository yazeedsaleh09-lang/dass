// BACKFIRE screenshot harness. Reuses the browser-check CDP plumbing to drive the real TV plus
// five real phones and save PNGs of every meaningful state, at TV and phone resolutions, so the
// living-room presentation can be reviewed as rendered rather than as source.
//
// Usage: DASS_ALLOW_TEST_CONFIG=1 tsx apps/dassserver/src/backfireshots.ts <outDir>

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { BackfireRoom } from './backfire-room.js';
import { createDassHttpServer } from './static.js';

const APP_PORT = 2713;
const CDP_PORT = 9334;
const ORIGIN = `http://127.0.0.1:${APP_PORT}`;
const NAMES = ['نورة', 'عمر', 'ليلى', 'سارة', 'فهد'];
const OUT = path.resolve(process.argv[2] ?? 'artifacts/backfire-pre-friends/after');
const BROWSERS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];
const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

class Page {
  private nextId = 1;
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private constructor(private ws: WebSocket, readonly label: string) {
    this.ws.on('message', (raw: Buffer) => this.onMessage(String(raw)));
  }
  static async attach(targetId: string, label: string): Promise<Page> {
    const ws = new WebSocket(`ws://127.0.0.1:${CDP_PORT}/devtools/page/${targetId}`, { maxPayload: 64 * 1024 * 1024 });
    await new Promise<void>((res, rej) => { ws.once('open', () => res()); ws.once('error', rej); });
    const page = new Page(ws, label);
    await page.send('Runtime.enable');
    await page.send('Page.enable');
    return page;
  }
  private onMessage(raw: string): void {
    const msg = JSON.parse(raw) as { id?: number; result?: unknown; error?: { message?: string } };
    if (msg.id === undefined) return;
    const w = this.pending.get(msg.id);
    this.pending.delete(msg.id);
    if (!w) return;
    if (msg.error) w.reject(new Error(msg.error.message ?? 'cdp')); else w.resolve(msg.result);
  }
  send(method: string, params: Record<string, unknown> = {}): Promise<any> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => { if (this.pending.delete(id)) reject(new Error(`${method} timed out`)); }, 20000);
    });
  }
  async goto(url: string): Promise<void> { await this.send('Page.navigate', { url }); await wait(500); }
  async evaluate<T>(expression: string): Promise<T> {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }) as { result?: { value?: T } };
    return r.result?.value as T;
  }
  async viewport(width: number, height: number): Promise<void> {
    await this.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  }
  async shot(name: string): Promise<void> {
    const r = await this.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }) as { data?: string };
    if (r?.data) { writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(r.data, 'base64')); console.log(`  saved ${name}.png`); }
  }
  async waitFor<T>(expr: string, pred: (v: T) => boolean, ms: number): Promise<T | undefined> {
    const s = Date.now(); let last: T | undefined;
    while (Date.now() - s < ms) { last = await this.evaluate<T>(expr); if (pred(last)) return last; await wait(150); }
    return last;
  }
  close(): void { try { this.ws.close(); } catch { /* closing */ } }
}
function browserSend(ws: WebSocket, id: number, method: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const on = (raw: Buffer): void => {
      const m = JSON.parse(String(raw)) as { id?: number; result?: Record<string, unknown>; error?: { message?: string } };
      if (m.id !== id) return;
      ws.off('message', on);
      if (m.error) reject(new Error(m.error.message)); else resolve(m.result ?? {});
    };
    ws.on('message', on);
    ws.send(JSON.stringify({ id, method, params }));
    setTimeout(() => reject(new Error(`${method} timed out`)), 20000);
  });
}
const TICK = `(() => {
  const ack = document.querySelector('#ack'); if (ack && !ack.disabled) { ack.click(); return 'ack'; }
  const ready = document.querySelector('#ready'); if (ready && ready.textContent.trim() === 'جاهز') { ready.click(); return 'ready'; }
  const confirm = document.querySelector('#confirm'); if (!confirm) return 'idle';
  const sel = document.querySelector('.target.sel, .side-btn.sel');
  if (!sel) { const o = document.querySelector('.target:not([data-role])') || document.querySelector('.target, .side-btn'); if (o) { o.click(); return 'pick'; } }
  if (!confirm.disabled) { confirm.click(); return 'confirm'; } return 'wait';
})()`;
const TITLE = `((document.querySelector('.st-main')||{}).textContent||'').trim()`;
const PHASE = `(window.__view && window.__view.phase) || ''`;

async function main(): Promise<void> {
  process.env.DASS_ALLOW_TEST_CONFIG = '1';
  mkdirSync(OUT, { recursive: true });
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const httpServer = createDassHttpServer(
    path.resolve(dirname, '../../bftv/public'),
    path.resolve(dirname, '../../bfplayer/public'),
    path.resolve(dirname, '../../dasssite/public'),
  );
  const gameServer = new Server({ transport: new WebSocketTransport({ server: httpServer }) });
  gameServer.define('backfire', BackfireRoom);
  await gameServer.listen(APP_PORT, '127.0.0.1');

  const binary = BROWSERS.find((p) => existsSync(p));
  if (!binary) { console.log('  SKIP — no Chrome/Edge found'); await gameServer.gracefullyShutdown(false); return; }
  const profile = mkdtempSync(path.join(tmpdir(), 'bf-shot-'));
  let browser: ChildProcess | undefined;
  const pages: Page[] = [];
  try {
    browser = spawn(binary, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`,
      '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb',
      '--window-size=1920,1080', 'about:blank'], { stdio: 'ignore' });
    let info: { webSocketDebuggerUrl?: string } | undefined;
    for (let i = 0; i < 60 && !info; i++) {
      try { info = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)).json() as { webSocketDebuggerUrl?: string }; } catch { await wait(250); }
    }
    if (!info?.webSocketDebuggerUrl) throw new Error('no DevTools endpoint');
    const bws = new WebSocket(info.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
    await new Promise<void>((res, rej) => { bws.once('open', () => res()); bws.once('error', rej); });
    let cdpId = 1;
    const newPage = async (url: string, label: string, isolated = false): Promise<Page> => {
      const params: Record<string, unknown> = { url: 'about:blank' };
      if (isolated) { const c = await browserSend(bws, cdpId++, 'Target.createBrowserContext', {}); params.browserContextId = c.browserContextId; }
      const r = await browserSend(bws, cdpId++, 'Target.createTarget', params);
      const page = await Page.attach(String(r.targetId), label);
      await page.goto(url);
      pages.push(page);
      return page;
    };

    // TV at 1280x720
    const tv = await newPage(`${ORIGIN}/tv?fast=1600&seed=20260720`, 'tv');
    await tv.viewport(1280, 720);
    // expose the client view for phase polling
    await tv.evaluate(`(function(){const rs=Object.getOwnPropertyDescriptor(window,'__view');})()`);
    const code = await tv.waitFor<string>(`(document.querySelector('.lb-code')||{}).textContent||''`, (v) => !!v && v.trim().length >= 6, 20000);
    await wait(1500);
    await tv.shot('tv-01-lobby-empty-1280');

    const phones: Page[] = [];
    for (let i = 0; i < 5; i++) {
      const p = await newPage(`${ORIGIN}/play?code=${encodeURIComponent((code||'').trim())}&name=${encodeURIComponent(NAMES[i]!)}`, `phone-${i}`, true);
      phones.push(p);
      await wait(300);
      if (i === 2) { await tv.waitFor<number>(`document.querySelectorAll('.seat-card:not(.ghost)').length`, (n) => n >= 3, 8000); await tv.shot('tv-02-lobby-3joined-1280'); }
    }
    await tv.waitFor<number>(`document.querySelectorAll('.seat-card:not(.ghost)').length`, (n) => n === 5, 15000);
    await wait(800);
    await tv.shot('tv-03-lobby-5joined-1280');
    // phone lobby shot at 390
    await phones[0]!.viewport(390, 844); await wait(300); await phones[0]!.shot('phone-01-lobby-390');

    for (const p of phones) await p.evaluate(TICK); // ready
    await tv.waitFor<boolean>(`!!document.querySelector('#tv-start') && !document.querySelector('#tv-start').disabled`, (v) => v === true, 12000);
    await wait(1200);
    await tv.shot('tv-04-all-ready-1280');
    await tv.evaluate(`document.querySelector('#tv-start').click()`);

    // Drive to results, screenshotting notable TV states as titles change.
    const captured = new Set<string>();
    const deadline = Date.now() + 120000;
    let results = false;
    while (Date.now() < deadline && !results) {
      for (const p of phones) { for (let t = 0; t < 4; t++) { const r = await p.evaluate<string>(TICK); if (r === 'idle' || r === 'wait') break; } }
      const snap = await tv.evaluate<{ t: string; lock: boolean; arcs: number; ret: boolean; hit: boolean; card: boolean; res: boolean; cd: boolean }>(`(() => ({
        t: ${TITLE}, lock: !!document.querySelector('.lock-strip.show'), arcs: document.querySelectorAll('.support-arc').length>0,
        ret: !!document.querySelector('.return-path'), hit: !!document.querySelector('.rnode.final-hit'),
        card: !!document.querySelector('.rc-title'), res: !!document.querySelector('.rs-rows .rs-row'),
        cd: !!document.querySelector('.cd-num')
      }))()`);
      if (snap) {
        if (snap.cd && !captured.has('cd')) { captured.add('cd'); await tv.shot('tv-05-countdown-1280'); }
        if (snap.t && !captured.has('intro') && /مُرحِّل|مرحل/.test(snap.t)) { captured.add('intro'); await tv.shot('tv-06-intro-1280'); }
        if (snap.lock && !captured.has('lock')) { captured.add('lock'); await tv.shot('tv-07-decision-lock-1280'); }
        if (snap.arcs && !captured.has('arcs')) { captured.add('arcs'); await tv.shot('tv-08-route-arcs-1280'); }
        if (snap.ret && !captured.has('ret')) { captured.add('ret'); await tv.shot('tv-09-return-path-1280'); }
        if (snap.card && !captured.has('card')) { captured.add('card'); await tv.shot('tv-10-final-reveal-1280'); }
        if (snap.hit && !captured.has('hit')) { captured.add('hit'); await tv.shot('tv-11-final-hit-1280'); }
        if (snap.res) { results = true; }
      }
      // phone decision/wait shots
      if (!captured.has('pdecide')) {
        const ps = await phones[0]!.evaluate<string>(`document.querySelector('.decide')?'decide':(document.querySelector('.wait')?'wait':'')`);
        if (ps === 'decide') { captured.add('pdecide'); await phones[0]!.shot('phone-02-decision-390'); }
      }
      await wait(120);
    }
    await wait(1200);
    await tv.shot('tv-12-results-1280');
    // results at other TV resolutions
    await tv.viewport(1366, 768); await wait(600); await tv.shot('tv-13-results-1366');
    await tv.viewport(1920, 1080); await wait(600); await tv.shot('tv-14-results-1920');
    // phone results at multiple widths
    for (const w of [320, 390, 430]) { await phones[0]!.viewport(w, 780); await wait(400); await phones[0]!.shot(`phone-03-results-${w}`); }
    // replay controls present?
    const replay = await tv.evaluate<boolean>(`!!document.querySelector('#tv-again') && !!document.querySelector('#tv-newcrew')`);
    console.log(`  replay controls on TV results: ${replay}`);

    console.log('DONE');
  } finally {
    for (const p of pages) p.close();
    browser?.kill();
    await gameServer.gracefullyShutdown(false);
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* locked on windows */ }
  }
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
