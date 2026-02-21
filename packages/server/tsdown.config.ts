import { defineConfig } from 'tsdown';

export default defineConfig({
	exports: true,
	format: ['cjs', 'esm'],
	publint: true
});
