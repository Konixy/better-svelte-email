import { defineConfig } from 'tsdown';

export default defineConfig({
	exports: { all: true },
	unbundle: true,
	treeshake: false,
	format: ['cjs', 'esm'],
	publint: true
});
