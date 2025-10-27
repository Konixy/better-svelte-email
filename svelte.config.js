import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex, escapeSvelte } from 'mdsvex';
import { createHighlighter } from 'shiki';
import { existsSync } from 'fs';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// Conditionally import preprocessor (only if dist exists)
// This avoids bootstrap issues when building for the first time
let emailPreprocessor = null;
if (existsSync('./dist/preprocessor/index.js')) {
	const { betterSvelteEmailPreprocessor } = await import('./dist/preprocessor/index.js');
	emailPreprocessor = betterSvelteEmailPreprocessor({
		pathToEmailFolder: '/src/lib/emails',
		tailwindConfig: {
			theme: {
				extend: {
					colors: {
						brand: '#FF3E00'
					}
				}
			}
		}
	});
}

const theme = 'vesper';
const highlighter = await createHighlighter({
	themes: [theme],
	langs: ['javascript', 'typescript', 'svelte', 'bash']
});

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	rehypePlugins: [
		rehypeSlug,
		() =>
			rehypeAutolinkHeadings({
				properties: { class: 'heading-link', title: 'Link to this heading' }
			})
	],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme }));
			return `{@html \`${html}\` }`;
		}
	}
};

const preprocessors = [mdsvex({ extensions: ['.svx', '.md'], ...mdsvexOptions }), vitePreprocess()];

if (emailPreprocessor) {
	preprocessors.push(emailPreprocessor);
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx', '.md'],
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: preprocessors,

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;
