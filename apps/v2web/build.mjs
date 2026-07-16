import * as esbuild from 'esbuild';
const serve = process.argv.includes('--serve');
const ctx = await esbuild.context({
  entryPoints: ['apps/v2web/src/main.ts'],
  bundle: true,
  outfile: 'apps/v2web/public/bundle.js',
  format: 'esm',
  target: 'es2022',
  charset: 'utf8',
  sourcemap: true,
  logLevel: 'info',
  define: { CRISIS_SERVER_URL: JSON.stringify(process.env.CRISIS_SERVER_URL ?? '') },
});
if (serve) {
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: 'apps/v2web/public', port: 8081 });
  console.log(`v2 web client: http://localhost:${port}`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('built -> apps/v2web/public/bundle.js');
}
