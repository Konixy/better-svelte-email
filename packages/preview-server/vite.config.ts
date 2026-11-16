import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { resolveStyleExport } from '../../scripts/resolve-style-export.ts';

const twAnimateCss = resolveStyleExport('tw-animate-css', fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [tailwindcss(), sveltekit({ preprocess: [vitePreprocess()], adapter: adapter() })],
	resolve: {
		// tw-animate-css only exports a `style` condition. Vite 8 resolves CSS with JS conditions.
		alias: [{ find: /^tw-animate-css$/, replacement: twAnimateCss }]
	},
	server: { port: 3000 }
});
