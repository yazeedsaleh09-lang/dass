// Build/serve the BACKFIRE phone client. From repo root:
//   node apps/bfplayer/build.mjs            -> apps/bfplayer/public/bundle.js
//   node apps/bfplayer/build.mjs --serve    -> watch + serve on :8096
import * as esbuild from 'esbuild';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const serve = process.argv.includes('--serve');
const ctx = await esbuild.context({
  entryPoints: ['apps/bfplayer/src/main.ts'],
  bundle: true,
  outfile: 'apps/bfplayer/public/bundle.js',
  format: 'esm',
  target: 'es2022',
  charset: 'utf8',
  sourcemap: true,
  minify: !serve,
  logLevel: 'info',
  define: {
    BF_SERVER_URL: JSON.stringify(process.env.BF_SERVER_URL ?? ''),
  },
});

if (serve) {
  await ctx.watch();
  const { hosts, port } = await ctx.serve({ servedir: 'apps/bfplayer/public', port: 8096 });
  console.log(`BACKFIRE player: http://localhost:${port}  (${hosts.join(', ')})`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
  const bundle = await readFile('apps/bfplayer/public/bundle.js');
  const version = createHash('sha256').update(bundle).digest('hex').slice(0, 10);
  const indexPath = 'apps/bfplayer/public/index.html';
  const index = await readFile(indexPath, 'utf8');
  await writeFile(indexPath, index.replace(/\/play\/bundle\.js(?:\?v=[a-f0-9]+)?/, `/play/bundle.js?v=${version}`));
  console.log('built -> apps/bfplayer/public/bundle.js');
}
