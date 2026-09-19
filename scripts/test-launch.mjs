import { build } from 'esbuild';

// Bundle TypeScript unit tests in memory; no extra test framework or server needed.
const result = await build({
  entryPoints: ['test/launch.test.ts'], bundle: true, write: false,
  platform: 'node', format: 'esm', target: 'node22',
});
await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
