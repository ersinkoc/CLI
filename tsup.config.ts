import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/plugins/index.ts', 'src/api/config.ts', 'src/api/decorator.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  // Ship only executable bundles and declarations; sources are not part of the npm tarball.
  sourcemap: false,
  clean: true,
  treeshake: true,
  minify: false,
  target: 'es2022',
  outDir: 'dist',
});
