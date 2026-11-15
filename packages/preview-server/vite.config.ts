import path from 'node:path';
import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const twAnimateCss = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	'node_modules/tw-animate-css/dist/tw-animate.css'
);

export default defineConfig({
	plugins: [tailwindcss(), sveltekit({ preprocess: [vitePreprocess()], adapter: adapter() })],
	resolve: {
		// tw-animate-css only exports a `style` condition. Vite 8 resolves CSS with JS conditions.
		alias: [{ find: /^tw-animate-css$/, replacement: twAnimateCss }]
	},
	server: { port: 3000 }
});
