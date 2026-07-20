import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1')), '../../..');
let failed = false;
function check(ok: boolean, message: string): void {
  console.log(`${ok ? '  ok   ✓' : '  FAIL ✗'} ${message}`);
  if (!ok) failed = true;
}

async function text(relative: string): Promise<string> {
  return readFile(path.join(root, relative), 'utf8');
}

async function verifyArtifact(app: 'dasssite' | 'bftv' | 'bfplayer', publicPath: string): Promise<void> {
  const bundlePath = path.join(root, `apps/${app}/public/bundle.js`);
  const mapPath = `${bundlePath}.map`;
  const index = await text(`apps/${app}/public/index.html`);
  const bundle = await readFile(bundlePath);
  const expected = createHash('sha256').update(bundle).digest('hex').slice(0, 10);
  check(index.includes(`${publicPath}?v=${expected}`), `${app} HTML references the current bundle hash (${expected})`);
  check((await stat(bundlePath)).size > 0 && (await stat(mapPath)).size > 0, `${app} deployment bundle and source map exist`);
}

async function main(): Promise<void> {
  const render = await text('render.yaml');
  const pkg = JSON.parse(await text('package.json')) as { engines?: { node?: string }; scripts?: Record<string, string> };
  const docker = await text('Dockerfile');
  const playerSource = await text('apps/bfplayer/src/main.ts');
  const tvSource = await text('apps/bftv/src/main.ts');

  check(render.includes('buildCommand: npm ci --include=dev && npm run bfbuild'), 'Render uses a clean production build');
  check(render.includes('startCommand: npm run dassserver'), 'Render starts the current Dass server');
  check(render.includes('healthCheckPath: /health'), 'Render health check targets /health');
  check(!render.includes('localhost') && !render.includes('127.0.0.1'), 'Render configuration contains no local endpoint');
  check(render.includes('branch: main') && render.includes('autoDeployTrigger: commit'), 'Render deploys the production branch on commits');
  check(render.includes('NPM_CONFIG_PRODUCTION') && !render.includes('DASS_ALLOW_TEST_CONFIG'), 'Render installs build tooling without enabling test-only room overrides');
  check(pkg.engines?.node === '20.x', 'production Node runtime is pinned to Node 20.x');
  const bfbuild = pkg.scripts?.bfbuild ?? '';
  check(
    bfbuild.includes('dasssite') && bfbuild.includes('bftv') && bfbuild.includes('bfplayer'),
    'production build includes the site and both BACKFIRE clients',
  );
  check(docker.includes('npm run bfbuild') && docker.includes('"dassserver"'), 'Docker artifact builds and starts the same current stack');
  check(!/BF_SERVER_URL\s*\|\|\s*['"]ws:\/\/localhost/.test(playerSource + tvSource), 'clients have no configured localhost production endpoint');
  check(playerSource.includes("location.protocol === 'https:' ? 'wss' : 'ws'") && tvSource.includes("location.protocol === 'https:' ? 'wss' : 'ws'"), 'TV and player select the same-origin secure WebSocket endpoint');
  check(tvSource.includes('BF_PUBLIC_URL || location.origin') && tvSource.includes('/play?code='), 'QR uses the canonical production player URL and exact room code');
  check(!tvSource.includes('/play?hostToken') && !tvSource.includes('/play?playerToken'), 'QR contains no host or player secret');
  // The QA phase/seed overrides must stay inert unless the server is explicitly started with
  // the test flag, so a public deploy cannot be sped up or replayed from a URL.
  check(
    !render.includes('DASS_ALLOW_TEST_CONFIG'),
    'the deployed environment does not enable test-only room overrides',
  );

  await verifyArtifact('dasssite', '/bundle.js');
  await verifyArtifact('bftv', '/tv/bundle.js');
  await verifyArtifact('bfplayer', '/play/bundle.js');
  console.log(`\n${failed ? 'DASS PRODUCTION CHECK: FAILED' : 'DASS PRODUCTION CHECK: PASSED'}`);
  process.exitCode = failed ? 1 : 0;
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
