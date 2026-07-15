// Build/serve the v0.1 web client with esbuild. Run from repo root:
//   node apps/web/build.mjs           -> one-off build to apps/web/public/bundle.js
//   node apps/web/build.mjs --serve   -> watch + serve on http://localhost:8080
import * as esbuild from 'esbuild';

const serve = process.argv.includes('--serve');

// Server URL is baked in at build time. For a hosted (Netlify) build, set
//   CRISIS_SERVER_URL=wss://your-server-host   (must be wss:// on an https site).
const ctx = await esbuild.context({
  entryPoints: ['apps/web/src/main.ts'],
  bundle: true,
  outfile: 'apps/web/public/bundle.js',
  format: 'esm',
  target: 'es2022',
  charset: 'utf8',
  sourcemap: true,
  logLevel: 'info',
  define: { CRISIS_SERVER_URL: JSON.stringify(process.env.CRISIS_SERVER_URL ?? '') },
});

if (serve) {
  await ctx.watch();
  const { hosts, port } = await ctx.serve({ servedir: 'apps/web/public', port: 8080 });
  console.log(`web client: http://localhost:${port}  (hosts: ${hosts.join(', ')})`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('built -> apps/web/public/bundle.js');
}
