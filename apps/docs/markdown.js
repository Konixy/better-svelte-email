import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { escapeSvelte, mdsvex } from 'mdsvex';
import { createHighlighter } from 'shiki';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeEnhancedTables from '@benjc/rehype-enhanced-tables';

const markdownLayout = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	'src/lib/markdown-layout.svelte'
);

const highlighter = await createHighlighter({
	themes: ['vesper', 'github-light'],
	langs: ['javascript', 'typescript', 'svelte', 'bash']
});

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	layout: markdownLayout,
	rehypePlugins: /** @type {import('mdsvex').MdsvexOptions['rehypePlugins']} */ ([
		rehypeSlug,
		[
			rehypeAutolinkHeadings,
			{
				properties: { class: 'heading-link', title: 'Link to this heading' }
			}
		],
		rehypeEnhancedTables
	]),
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const html = escapeSvelte(
				highlighter.codeToHtml(code, {
					lang: lang || 'text',
					themes: { dark: 'vesper', light: 'github-light' }
				})
			);
			return `<Components.CodeBlock code={${JSON.stringify(code)}}>{@html \`${html}\`}</Components.CodeBlock>`;
		}
	}
};

export const extensions = ['.svelte', '.svx', '.md'];

export const preprocess = [
	mdsvex({ extensions: ['.svx', '.md'], ...mdsvexOptions }),
	vitePreprocess()
];
