// Build/serve the دسّ TV client. From repo root:
//   node apps/dasstv/build.mjs           -> apps/dasstv/public/bundle.js
//   node apps/dasstv/build.mjs --serve    -> watch + serve on :8091
import * as esbuild from 'esbuild';

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
  console.log('built -> apps/dasstv/public/bundle.js');
}
