import path from 'node:path';
import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-vercel';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vitest/config';
import { extensions, preprocess } from './markdown.js';

const twAnimateCss = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	'node_modules/tw-animate-css/dist/tw-animate.css'
);

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
