// Build/serve the دسّ TV client. From repo root:
//   node apps/dasstv/build.mjs           -> apps/dasstv/public/bundle.js
//   node apps/dasstv/build.mjs --serve    -> watch + serve on :8091
import * as esbuild from 'esbuild';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const serve = process.argv.includes('--serve');
const ctx = await esbuild.context({
  entryPoints: ['apps/dasstv/src/main.ts'],
  bundle: true,
  outfile: 'apps/dasstv/public/bundle.js',
  format: 'esm',
  target: 'es2022',
  charset: 'utf8',
  sourcemap: true,
  minify: !serve,
  logLevel: 'info',
  define: { DASS_SERVER_URL: JSON.stringify(process.env.DASS_SERVER_URL ?? '') },
});

if (serve) {
  await ctx.watch();
  const { hosts, port } = await ctx.serve({ servedir: 'apps/dasstv/public', port: 8091 });
  console.log(`دسّ TV: http://localhost:${port}  (${hosts.join(', ')})`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
  const bundle = await readFile('apps/dasstv/public/bundle.js');
  const version = createHash('sha256').update(bundle).digest('hex').slice(0, 10);
  const indexPath = 'apps/dasstv/public/index.html';
  const index = await readFile(indexPath, 'utf8');
  await writeFile(indexPath, index.replace(/\/tv\/bundle\.js(?:\?v=[a-f0-9]+)?/, `/tv/bundle.js?v=${version}`));
  console.log('built -> apps/dasstv/public/bundle.js');
}
