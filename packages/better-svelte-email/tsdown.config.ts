import { defineConfig } from 'tsdown';

export default defineConfig({
	exports: {
		all: true
	},
	format: ['cjs', 'esm']
});
