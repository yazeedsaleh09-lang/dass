// Build/serve the BACKFIRE marketing site. From repo root:
//   node apps/dasssite/build.mjs           -> apps/dasssite/public/bundle.js
//   node apps/dasssite/build.mjs --serve    -> watch + serve on :8092
import * as esbuild from 'esbuild';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const serve = process.argv.includes('--serve');
// Commercial services are intentionally local until production auth/payment providers exist.
// Set DASS_DEMO_MODE=false to disable all account and checkout mutations.
const demoMode = process.env.DASS_DEMO_MODE !== 'false';
const configuredPublicOrigin = (process.env.DASS_PUBLIC_URL
  ?? (process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : ''))
  .replace(/\/$/, '');
const ctx = await esbuild.context({
  entryPoints: ['apps/dasssite/src/main.ts'],
  bundle: true,
  outfile: 'apps/dasssite/public/bundle.js',
  format: 'esm',
  target: 'es2022',
  charset: 'utf8',
  sourcemap: true,
  minify: !serve,
  define: {
    DASS_DEMO_MODE: JSON.stringify(demoMode),
    DASS_PUBLIC_ORIGIN: JSON.stringify(configuredPublicOrigin),
  },
  logLevel: 'info',
});

if (serve) {
  await ctx.watch();
  const { hosts, port } = await ctx.serve({ servedir: 'apps/dasssite/public', port: 8092 });
  console.log(`BACKFIRE site: http://localhost:${port}  (${hosts.join(', ')}) · commercial services: ${demoMode ? 'local demo' : 'disabled'}`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
  const bundle = await readFile('apps/dasssite/public/bundle.js');
  const version = createHash('sha256').update(bundle).digest('hex').slice(0, 10);
  const indexPath = 'apps/dasssite/public/index.html';
  const index = await readFile(indexPath, 'utf8');
  const canonical = configuredPublicOrigin || '/';
  const preview = configuredPublicOrigin ? `${configuredPublicOrigin}/og-backfire.png` : '/og-backfire.png';
  const builtIndex = index
    .replace(/\/bundle\.js(?:\?v=[a-f0-9]+)?/, `/bundle.js?v=${version}`)
    .replace(/(<meta property="og:url" content=")[^"]*(" \/>)/, `$1${canonical}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(" \/>)/, `$1${preview}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(" \/>)/, `$1${preview}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(" \/>)/, `$1${canonical}$2`);
  await writeFile(indexPath, builtIndex);
  console.log('built -> apps/dasssite/public/bundle.js');
  console.log(`commercial services -> ${demoMode ? 'local demo (no network/payment)' : 'disabled'}`);
}
