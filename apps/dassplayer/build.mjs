// Build/serve the دسّ Player client. From repo root:
//   node apps/dassplayer/build.mjs           -> apps/dassplayer/public/bundle.js
//   node apps/dassplayer/build.mjs --serve    -> watch + serve on :8090
// For a hosted (Netlify) build set DASS_SERVER_URL=wss://your-server-host.
import * as esbuild from 'esbuild';

const serve = process.argv.includes('--serve');
const ctx = await esbuild.context({
  entryPoints: ['apps/dassplayer/src/main.ts'],
  bundle: true,
  outfile: 'apps/dassplayer/public/bundle.js',
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
  const { hosts, port } = await ctx.serve({ servedir: 'apps/dassplayer/public', port: 8090 });
  console.log(`دسّ player: http://localhost:${port}  (${hosts.join(', ')})`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('built -> apps/dassplayer/public/bundle.js');
}
