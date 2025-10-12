import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { existsSync } from 'fs';

// Conditionally import preprocessor (only if dist exists)
// This avoids bootstrap issues when building for the first time
let emailPreprocessor = null;
if (existsSync('./dist/preprocessor/index.js')) {
	const { betterSvelteEmailPreprocessor } = await import('./dist/preprocessor/index.js');
	emailPreprocessor = betterSvelteEmailPreprocessor({
		pathToEmailFolder: '/src/lib/emails'
	});
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: emailPreprocessor ? [vitePreprocess(), emailPreprocessor] : vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;
