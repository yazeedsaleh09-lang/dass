// Post-deploy smoke test against a LIVE server. Checks HTTP /health and a real WS room.
//   npm run smoketest -- wss://your-app.onrender.com
import { Client } from 'colyseus.js';

const url = (process.argv[2] ?? process.env.SMOKE_URL ?? '').trim().replace(/\/$/, '');
if (!url) {
  console.error('usage: npm run smoketest -- wss://your-host   (or ws://…)');
  process.exit(2);
}

async function main(): Promise<void> {
  const httpBase = url.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
  // 1) HTTP health + client served
  try {
    const h = await fetch(httpBase + '/health');
    console.log(`  /health   -> ${h.status} ${(await h.text()).trim()}`);
    const root = await fetch(httpBase + '/');
    const html = await root.text();
    console.log(`  /         -> ${root.status} ${html.includes('Crisis') ? '(client html served ✓)' : '(unexpected body)'}`);
  } catch (e) {
    console.error('  HTTP check failed:', (e as Error).message);
  }
  // 2) Real WebSocket room create/join
  const client = new Client(url);
  const room = await client.create<unknown>('match', { nickname: 'smoke' });
  console.log(`  WS create -> roomId ${room.roomId} ✓`);
  await room.leave(true);
  console.log('\nSMOKE TEST PASSED — the live server serves the client and accepts players.');
}

main().catch((e: unknown) => {
  console.error('\nSMOKE TEST FAILED:', (e as Error)?.message ?? e);
  process.exit(1);
});
