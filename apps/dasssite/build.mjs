// Build/serve the دسّ marketing site. From repo root:
//   node apps/dasssite/build.mjs           -> apps/dasssite/public/bundle.js
//   node apps/dasssite/build.mjs --serve    -> watch + serve on :8092
import * as esbuild from 'esbuild';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const serve = process.argv.includes('--serve');
const ctx = await esbuild.context({
  entryPoints: ['apps/dasssite/src/main.ts'],
  bundle: true,
  outfile: 'apps/dasssite/public/bundle.js',
  format: 'esm',
  target: 'es2022',
  charset: 'utf8',
  sourcemap: true,
  minify: !serve,
  logLevel: 'info',
});

if (serve) {
  await ctx.watch();
  const { hosts, port } = await ctx.serve({ servedir: 'apps/dasssite/public', port: 8092 });
  console.log(`دسّ site: http://localhost:${port}  (${hosts.join(', ')})`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
  const bundle = await readFile('apps/dasssite/public/bundle.js');
  const version = createHash('sha256').update(bundle).digest('hex').slice(0, 10);
  const indexPath = 'apps/dasssite/public/index.html';
  const index = await readFile(indexPath, 'utf8');
  await writeFile(indexPath, index.replace(/\/bundle\.js(?:\?v=[a-f0-9]+)?/, `/bundle.js?v=${version}`));
  console.log('built -> apps/dasssite/public/bundle.js');
}
