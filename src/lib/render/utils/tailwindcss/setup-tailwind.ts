import postcss, { type Root } from 'postcss';
import { compile } from 'tailwindcss';
import type { TailwindConfig } from '$lib/render/index.js';
import indexCss from './tailwind-stylesheets/index.js';
import preflightCss from './tailwind-stylesheets/preflight.js';
import themeCss from './tailwind-stylesheets/theme.js';
import utilitiesCss from './tailwind-stylesheets/utilities.js';

export type TailwindSetup = Awaited<ReturnType<typeof setupTailwind>>;

/**
 * Set up Tailwind CSS compiler with optional custom CSS injection
 * @param config - Tailwind configuration
 * @param customCSS - Optional custom CSS string to inject (e.g., your theme CSS variables)
 */
export async function setupTailwind(config: TailwindConfig, customCSS?: string) {
	// customCSS so Tailwind can process @theme directives
	const baseCss = `
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
${customCSS || ''}
@config;
`;
	const compiler = await compile(baseCss, {
		async loadModule(id, base, resourceHint) {
			if (resourceHint === 'config') {
				return {
					path: id,
					base: base,
					module: config
				};
			}

			throw new Error(`NO-OP: should we implement support for ${resourceHint}?`);
		},
		polyfills: 0, // All
		async loadStylesheet(id, base) {
			if (id === 'tailwindcss') {
				return {
					base,
					path: 'tailwindcss/index.css',
					content: indexCss
				};
			}

			if (id === 'tailwindcss/preflight.css') {
				return {
					base,
					path: id,
					content: preflightCss
				};
			}

			if (id === 'tailwindcss/theme.css') {
				return {
					base,
					path: id,
					content: themeCss
				};
			}

			if (id === 'tailwindcss/utilities.css') {
				return {
					base,
					path: id,
					content: utilitiesCss
				};
			}

			throw new Error('stylesheet not supported, you can only import the ones from tailwindcss');
		}
	});

	let css: string = baseCss;

	return {
		addUtilities: function addUtilities(candidates: string[]): void {
			css = compiler.build(candidates);
		},
		getStyleSheet: function getStyleSheet(): Root {
			return postcss.parse(css);
		}
	};
}
