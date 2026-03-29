import { defineConfig } from 'tsdown';

export default defineConfig({
	exports: true,
	format: ['cjs', 'esm'],
	deps: {
		onlyBundle: false
	},
	publint: true
});
