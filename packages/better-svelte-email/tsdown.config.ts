import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		'components/index': 'src/components/index.ts',
		'preview/index': 'src/preview/index.ts',
		'render/index': 'src/render/index.ts',
		'utils/index': 'src/utils/index.ts'
	},
	unbundle: true,
	treeshake: false,
	dts: { oxc: true },
	outputOptions: { exports: 'named' },
	format: ['cjs', 'esm'],
	publint: true
});
