import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import WebSocket from 'ws';

const [url, size = '1440x900', output = 'visual-qa.png', ...flags] = process.argv.slice(2);
if (!url) throw new Error('Usage: node visual-qa.mjs <url> <width>x<height> <output> [--full] [--menu] [--reduced]');
const [width, height] = size.split('x').map(Number);
if (!width || !height) throw new Error(`Invalid viewport: ${size}`);

const edge = process.env.EDGE_PATH ?? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9400 + Math.floor(Math.random() * 400);
const profile = await mkdtemp(resolve(tmpdir(), 'backfire-edge-'));
const target = resolve(output);
await mkdir(dirname(target), { recursive: true });
const child = spawn(edge, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore', windowsHide: true });

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
let socket;
try {
  let page;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
      page = pages.find((item) => item.type === 'page');
      if (page?.webSocketDebuggerUrl) break;
    } catch { /* Browser is still starting. */ }
    await sleep(100);
  }
  if (!page?.webSocketDebuggerUrl) throw new Error('Edge DevTools endpoint did not become ready.');

  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((done, reject) => { socket.once('open', done); socket.once('error', reject); });
  let sequence = 0;
  const pending = new Map();
  const problems = [];
  socket.on('message', (raw) => {
    const message = JSON.parse(String(raw));
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result);
      return;
    }
    if (message.method === 'Runtime.exceptionThrown') problems.push({ type: 'exception', detail: message.params.exceptionDetails?.text });
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') problems.push({ type: 'console', detail: message.params.args?.map((arg) => arg.value ?? arg.description).join(' ') });
    if (message.method === 'Network.loadingFailed' && !message.params.canceled) problems.push({ type: 'network', detail: `${message.params.errorText}: ${message.params.requestId}` });
    if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) problems.push({ type: 'http', detail: `${message.params.response.status} ${message.params.response.url}` });
  });
  const send = (method, params = {}) => new Promise((resolveCall, rejectCall) => {
    const id = ++sequence;
    pending.set(id, { resolve: resolveCall, reject: rejectCall });
    socket.send(JSON.stringify({ id, method, params }));
  });

  await Promise.all([send('Page.enable'), send('Runtime.enable'), send('Network.enable')]);
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700, screenWidth: width, screenHeight: height });
  if (flags.includes('--reduced')) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const requested = new URL(url);
  const bootUrl = `${requested.origin}/`;
  await send('Page.navigate', { url: bootUrl });
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const state = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
    if (state.result?.value === 'complete') break;
    await sleep(100);
  }
  await send('Runtime.evaluate', { expression: 'document.fonts?.ready', awaitPromise: true, returnByValue: true });
  if (`${requested.pathname}${requested.search}${requested.hash}` !== '/') {
    const route = JSON.stringify(`${requested.pathname}${requested.search}${requested.hash}`);
    await send('Runtime.evaluate', { expression: `history.replaceState({},'',${route});dispatchEvent(new PopStateEvent('popstate'))`, returnByValue: true });
  }
  await sleep(flags.includes('--reduced') ? 250 : 1100);
  await send('Runtime.evaluate', { expression: 'scrollTo(0,0);document.activeElement?.blur()', returnByValue: true });
  await sleep(100);
  if (flags.includes('--menu')) {
    await send('Runtime.evaluate', { expression: "document.querySelector('#mobile-toggle')?.click()", returnByValue: true });
    await sleep(250);
  }
  const pageState = await send('Runtime.evaluate', { expression: `({title:document.title,path:location.pathname,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,scrollHeight:document.documentElement.scrollHeight,bodyHeight:document.body.getBoundingClientRect().height,mainBottom:document.querySelector('main')?.getBoundingClientRect().bottom,footerBottom:document.querySelector('footer')?.getBoundingClientRect().bottom,links:[...document.querySelectorAll('link[rel="canonical"]')].map(x=>x.href),images:[...document.images].map(x=>({src:x.currentSrc||x.src,complete:x.complete,naturalWidth:x.naturalWidth}))})`, returnByValue: true });
  const capture = { format: 'png', fromSurface: true, captureBeyondViewport: flags.includes('--full') };
  if (flags.includes('--full')) {
    const metrics = await send('Page.getLayoutMetrics');
    const content = metrics.cssContentSize ?? metrics.contentSize;
    capture.clip = { x: 0, y: 0, width: Math.min(content.width, width), height: content.height, scale: 1 };
  }
  const shot = await send('Page.captureScreenshot', capture);
  await writeFile(target, Buffer.from(shot.data, 'base64'));
  await writeFile(`${target}.json`, JSON.stringify({ viewport: { width, height }, flags, page: pageState.result?.value, problems }, null, 2));
  console.log(JSON.stringify({ output: target, viewport: { width, height }, page: pageState.result?.value, problems }, null, 2));
  await send('Browser.close').catch(() => {});
} finally {
  socket?.close();
  child.kill();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
