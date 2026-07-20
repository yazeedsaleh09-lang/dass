// Render og-backfire-source.svg to public/og-backfire.png at 1200x630 via headless Edge.
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile, readFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import WebSocket from 'ws';

const svg = await readFile(resolve('apps/dasssite/og-backfire-source.svg'), 'utf8');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{width:1200px;height:630px;overflow:hidden;background:#050507}svg{display:block}</style></head><body>${svg}</body></html>`;
const tmpHtml = resolve('apps/dasssite/public/_ogtmp.html');
await writeFile(tmpHtml, html);

const edge = process.env.EDGE_PATH ?? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9700 + Math.floor(Math.random() * 200);
const profile = await mkdtemp(resolve(tmpdir(), 'bf-og-'));
const child = spawn(edge, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
const sleep = (ms) => new Promise((d) => setTimeout(d, ms));
let socket;
try {
  let page;
  for (let i = 0; i < 80; i++) { try { const l = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json()); page = l.find((x) => x.type === 'page'); if (page?.webSocketDebuggerUrl) break; } catch {} await sleep(100); }
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((d, r) => { socket.once('open', d); socket.once('error', r); });
  let seq = 0; const pending = new Map();
  socket.on('message', (raw) => { const m = JSON.parse(String(raw)); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } });
  const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { resolve: res, reject: rej }); socket.send(JSON.stringify({ id, method, params })); });
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `http://localhost:8092/_ogtmp.html` });
  await sleep(1200);
  const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
  await writeFile(resolve('apps/dasssite/public/og-backfire.png'), Buffer.from(shot.data, 'base64'));
  console.log('og-backfire.png regenerated (1200x630)');
  await send('Browser.close').catch(() => {});
} finally { socket?.close(); child.kill(); await rm(profile, { recursive: true, force: true }).catch(() => {}); await unlink(tmpHtml).catch(() => {}); }
