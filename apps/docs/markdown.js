import { mdsvex } from 'mdsvex';
import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
	themes: ['vesper', 'github-light'],
	langs: ['javascript', 'typescript', 'svelte', 'bash', 'text']
});

const themes = { dark: 'vesper', light: 'github-light' };

/** @type {import('shiki').ShikiTransformer} */
const dropTabindex = {
	name: 'drop-tabindex',
	pre(node) {
		delete node.properties.tabindex;
	}
};

/**
 * @param {string} code
 * @param {string} lang
 */
function highlight(code, lang) {
	const language = lang || 'text';
	try {
		return highlighter.codeToHtml(code, { lang: language, themes, transformers: [dropTabindex] });
	} catch {
		return highlighter.codeToHtml(code, { lang: 'text', themes, transformers: [dropTabindex] });
	}
}

export const extensions = ['.svelte', '.svx', '.md'];

export const markdown = mdsvex({
	extensions: ['.svx', '.md'],
	heading_ids: true,
	components: new URL('./src/lib/markdown.js', import.meta.url),
	templates: {
		default: new URL('./src/lib/markdown/document.svelte', import.meta.url)
	},
	highlight: (code, { lang, inline }) => (inline ? null : highlight(code, lang))
});
