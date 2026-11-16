import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-vercel';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vitest/config';
import { resolveStyleExport } from '../../scripts/resolve-style-export.ts';
import { extensions, preprocess } from './markdown.js';

const twAnimateCss = resolveStyleExport('tw-animate-css', fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter({
				runtime: 'nodejs24.x'
			}),
			extensions,
			preprocess
		}),
		devtoolsJson()
	],
	resolve: {
		// tw-animate-css only exports a `style` condition. Vite 8 resolves CSS with JS conditions.
		alias: [{ find: /^tw-animate-css$/, replacement: twAnimateCss }]
	}
});
