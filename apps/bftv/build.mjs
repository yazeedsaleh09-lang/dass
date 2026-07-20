// Build/serve the BACKFIRE TV client. From repo root:
//   node apps/bftv/build.mjs            -> apps/bftv/public/bundle.js
//   node apps/bftv/build.mjs --serve    -> watch + serve on :8095
import * as esbuild from 'esbuild';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const serve = process.argv.includes('--serve');
const ctx = await esbuild.context({
  entryPoints: ['apps/bftv/src/main.ts'],
  bundle: true,
  outfile: 'apps/bftv/public/bundle.js',
  format: 'esm',
  target: 'es2022',
  charset: 'utf8',
  sourcemap: true,
  minify: !serve,
  logLevel: 'info',
  define: {
    BF_SERVER_URL: JSON.stringify(process.env.BF_SERVER_URL ?? ''),
    BF_PUBLIC_URL: JSON.stringify(process.env.BF_PUBLIC_URL ?? ''),
  },
});

if (serve) {
  await ctx.watch();
  const { hosts, port } = await ctx.serve({ servedir: 'apps/bftv/public', port: 8095 });
  console.log(`BACKFIRE TV: http://localhost:${port}  (${hosts.join(', ')})`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
  const bundle = await readFile('apps/bftv/public/bundle.js');
  const version = createHash('sha256').update(bundle).digest('hex').slice(0, 10);
  const indexPath = 'apps/bftv/public/index.html';
  const index = await readFile(indexPath, 'utf8');
  await writeFile(indexPath, index.replace(/\/tv\/bundle\.js(?:\?v=[a-f0-9]+)?/, `/tv/bundle.js?v=${version}`));
  console.log('built -> apps/bftv/public/bundle.js');
}
