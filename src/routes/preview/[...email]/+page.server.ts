import { sendEmail } from '$lib/preview/index.js';
import { env } from '$env/dynamic/private';
import type { PreviewData } from '$lib/preview/index.js';
import type { RequestEvent } from '@sveltejs/kit';
import Renderer, { type TailwindConfig } from '$lib/render/index.js';
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html';
import { pixelBasedPreset } from '$lib/render/utils/tailwindcss/pixel-based-preset.js';
import fs from 'fs';
import path from 'path';

const tailwindConfig: TailwindConfig = {
	theme: {
		extend: {
			colors: {
				brand: '#FF3E00'
			}
		}
	},
	presets: [pixelBasedPreset]
};

const { render } = new Renderer(tailwindConfig);

// Import all email components at build time using import.meta.glob
// This creates a map of all email components that can be accessed at runtime
const emailModules = import.meta.glob('/src/lib/emails/**/*.svelte', { eager: true });

/**
 * Vercel-compatible email list function that uses Vite's import.meta.glob
 * to statically analyze email files at build time instead of runtime fs access
 */
function emailListVercel(): PreviewData {
	const files = Object.keys(emailModules)
		.map((path) => {
			// Extract filename without extension from the full path
			// e.g., '/src/lib/emails/apple-receipt.svelte' -> 'apple-receipt'
			const match = path.match(/\/src\/lib\/emails\/(.+)\.svelte$/);
			return match ? match[1] : null;
		})
		.filter((name): name is string => name !== null);

	if (files.length === 0) {
		return { files: null, path: '/src/lib/emails' };
	}

	return { files, path: '/src/lib/emails' };
}

/**
 * Vercel-compatible createEmail action that uses pre-imported email components
 * instead of dynamic runtime imports
 */
const createEmailVercel = {
	'create-email': async (event: RequestEvent) => {
		try {
			const data = await event.request.formData();
			const file = data.get('file');
			const emailPath = data.get('path');

			if (!file || !emailPath) {
				return {
					status: 400,
					body: { error: 'Missing file or path parameter' }
				};
			}

			// Construct the full path to match the keys in emailModules
			const fullPath = `${emailPath}/${file}.svelte`;

			// Get the component from the pre-imported modules
			const module = emailModules[fullPath] as { default: any } | undefined;

			if (!module || !module.default) {
				throw new Error(
					`Failed to import email component '${file}' in '${emailPath}'. Make sure the file exists and includes the <Head /> component.`
				);
			}

			const emailComponent = module.default;

			// Render the component to HTML
			const html = await render(emailComponent);

			const source = fs.readFileSync(
				path.resolve(process.cwd(), path.relative('/', fullPath)),
				'utf8'
			);

			// Remove all HTML comments from the body before formatting
			const formattedHtml = await prettier.format(html, {
				parser: 'html',
				plugins: [parserHtml]
			});

			return {
				body: formattedHtml,
				source
			};
		} catch (error) {
			console.error('Error rendering email:', error);
			return {
				status: 500,
				error: {
					message: error instanceof Error ? error.message : 'Failed to render email'
				}
			};
		}
	}
};

export function load() {
	const emails = emailListVercel();
	return { emails };
}

export const actions = {
	...createEmailVercel,
	...sendEmail({ resendApiKey: env.RESEND_API_KEY ?? 're_1234' })
};
