import postcss, { type Root } from 'postcss';
import { compile } from 'tailwindcss';
import type { TailwindConfig } from '$lib/render/index.js';
import indexCss from './tailwind-stylesheets/index.js';
import preflightCss from './tailwind-stylesheets/preflight.js';
import themeCss from './tailwind-stylesheets/theme.js';
import utilitiesCss from './tailwind-stylesheets/utilities.js';
import { sanitizeCustomCss } from './sanitize-custom-css.js';
import path from 'path';
import { createRequire } from 'module';
// import fs from 'fs';

const require = createRequire(process.cwd());

export type TailwindSetup = Awaited<ReturnType<typeof setupTailwind>>;

export async function setupTailwind(config: TailwindConfig) {
	const baseCss = `
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
${config.customCssPaths ? config.customCssPaths.map((path) => `@import "${path}";`).join('\n') : ''}
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

			if (config.customCssPaths?.includes(id)) {
				let customCss: string;
				try {
					const importPath = path.resolve(process.cwd(), id);
					const normalizedImportPath = importPath.replace(/\\/g, '/').replace(/\/+$/, '');

					console.log(await import(/* @vite-ignore */ normalizedImportPath));
					customCss = (await require(/* @vite-ignore */ normalizedImportPath)).default;
				} catch (error) {
					console.error(error);
					throw new Error(`Failed to import custom CSS file '${id}'.`);
				}
				if (!customCss) {
					throw new Error(`Failed to import custom CSS file '${id}'.`);
				}
				const sanitizedCustomCss = sanitizeCustomCss(customCss);
				console.log(sanitizedCustomCss);

				return {
					base,
					path: id,
					content: sanitizedCustomCss
				};
			}

			throw new Error(`'${id}' file not recognized`);
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
