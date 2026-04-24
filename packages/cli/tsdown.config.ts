import { defineConfig } from 'tsdown';

export default defineConfig({
	exports: {
		customExports: {
			'./preview-entry': './dist/preview-server/index.js'
		}
	},
	format: ['cjs', 'esm'],
	publint: false
});
