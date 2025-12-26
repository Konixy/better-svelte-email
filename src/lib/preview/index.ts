import type { RequestEvent } from '@sveltejs/kit';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html';
import Renderer from '$lib/render/index.js';

/**
 * Import all Svelte email components file paths.
 * Create a list containing all Svelte email component file names.
 * Return this list to the client.
 */
export type PreviewData = {
	files: string[] | null;
	path: string | null;
};

type EmailListProps = {
	path?: string;
	root?: string;
};

/**
 * Get a list of all email component files in the specified directory.
 *
 * @param options.path - Relative path from root to emails folder (default: '/src/lib/emails')
 * @param options.root - Absolute path to project root (auto-detected if not provided)
 * @returns PreviewData object with list of email files and the path
 *
 * @example
 * ```ts
 * // In a +page.server.ts file
 * import { emailList } from 'better-svelte-email/preview';
 *
 * export function load() {
 *   const emails = emailList({
 *     root: process.cwd(),
 *     path: '/src/lib/emails'
 *   });
 *   return { emails };
 * }
 * ```
 */
export const emailList = ({
	path: emailPath = '/src/lib/emails',
	root
}: EmailListProps = {}): PreviewData => {
	// If root is not provided, try to use process.cwd()
	if (!root) {
		try {
			root = process.cwd();
		} catch (err) {
			throw new Error(
				'Could not determine the root path of your project. Please pass in the root param manually using process.cwd() or an absolute path.\nOriginal error: ' +
					err
			);
		}
	}

	const fullPath = path.join(root, emailPath);

	// Check if directory exists
	if (!fs.existsSync(fullPath)) {
		console.warn(`Email directory not found: ${fullPath}`);
		return { files: null, path: emailPath };
	}

	// Use the absolute folder path as the root when creating the component list so
	// we can compute correct relative paths on all platforms.
	const files = createEmailComponentList(fullPath, getFiles(fullPath));

	if (!files.length) {
		return { files: null, path: emailPath };
	}

	return { files, path: emailPath };
};

export const getEmailComponent = async (emailPath: string, file: string) => {
	const fileName = `${file}.svelte`;
	try {
		// Import the email component dynamically
		const normalizedEmailPath = emailPath.replace(/\\/g, '/').replace(/\/+$/, '');
		const normalizedFile = file.replace(/\\/g, '/').replace(/^\/+/, '');
		const importPath = `${normalizedEmailPath}/${normalizedFile}.svelte`;
		return (await import(/* @vite-ignore */ importPath)).default;
	} catch (err) {
		throw new Error(
			`Failed to import email component '${fileName}'. Make sure the file exists and includes the <Head /> component.\nOriginal error: ${err}`
		);
	}
};

const getEmailSource = async (emailPath: string, file: string) => {
	const normalizedEmailPath = emailPath.replace(/\\/g, '/').replace(/\/+$/, '');
	const normalizedFile = file.replace(/\\/g, '/').replace(/^\/+/, '');

	const candidates = new Set<string>();
	const relativeEmailPath = normalizedEmailPath.replace(/^\/+/, '');

	if (normalizedEmailPath) {
		candidates.add(path.resolve(process.cwd(), relativeEmailPath, `${normalizedFile}.svelte`));
		candidates.add(path.resolve(process.cwd(), normalizedEmailPath, `${normalizedFile}.svelte`));
		candidates.add(path.resolve(normalizedEmailPath, `${normalizedFile}.svelte`));
	}

	candidates.add(path.resolve(process.cwd(), `${normalizedFile}.svelte`));

	for (const candidate of candidates) {
		try {
			return await fs.promises.readFile(candidate, 'utf8');
		} catch {
			// continue to next candidate
		}
	}

	console.warn(`Source file not found for ${normalizedFile} in ${normalizedEmailPath}`);
	return null;
};

/**
 * SvelteKit form action to render an email component.
 * Use this with the Preview component to render email templates on demand.
 *
 * @param options.renderer - Optional renderer to use for rendering the email component (use this if you want to use a custom tailwind config)
 *
 * @example
 * ```ts
 * // +page.server.ts
 * import { createEmail } from 'better-svelte-email/preview';
 * import Renderer from 'better-svelte-email/render';
 *
 * const renderer = new Renderer({
 *   tailwindConfig: {
 *     theme: {
 *       extend: {
 *         colors: {
 *           brand: '#FF3E00'
 *         }
 *       }
 *     }
 *   }
 * });
 *
 * export const actions = createEmail({ renderer });
 * ```
 */
export const createEmail = (options: { renderer?: Renderer } = {}) => {
	const { renderer = new Renderer() } = options;
	return {
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

				const emailComponent = await getEmailComponent(emailPath as string, file as string);
				const source = await getEmailSource(emailPath as string, file as string);

				// Render the component to HTML
				const html = await renderer.render(emailComponent);

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
};

export declare const SendEmailFunction: (
	{ from, to, subject, html }: { from: string; to: string; subject: string; html: string },
	resendApiKey?: string
) => Promise<{ success: boolean; error?: any }>;

const defaultSendEmailFunction: typeof SendEmailFunction = async (
	{ from, to, subject, html },
	resendApiKey
) => {
	// stringify api key to comment out temp
	const resend = new Resend(resendApiKey);
	const email = { from, to, subject, html };
	const resendReq = await resend.emails.send(email);

	if (resendReq.error) {
		return { success: false, error: resendReq.error };
	} else {
		return { success: true, error: null };
	}
};

/**
 * Sends the email using the submitted form data.
 *
 * @param options.resendApiKey - Your Resend API key (keep this server-side only)
 * @param options.customSendEmailFunction - Optional custom function to send emails
 * @param options.renderer - Optional renderer to use for rendering the email component (use this if you want to use a custom tailwind config)
 *
 * @example
 * ```ts
 * // In +page.server.ts
 * import { PRIVATE_RESEND_API_KEY } from '$env/static/private';
 * import Renderer from 'better-svelte-email/render';
 *
 * const renderer = new Renderer({
 *   tailwindConfig: {
 *     theme: {
 *       extend: {
 *         colors: {
 *           brand: '#FF3E00'
 *         }
 *       }
 *     }
 *   }
 * });
 *
 * export const actions = {
 *   ...createEmail({ renderer }),
 *   ...sendEmail({ resendApiKey: PRIVATE_RESEND_API_KEY, renderer })
 * };
 * ```
 */
export const sendEmail = ({
	customSendEmailFunction,
	resendApiKey,
	renderer = new Renderer()
}: {
	customSendEmailFunction?: (email: {
		from: string;
		to: string;
		subject: string;
		html: string;
	}) => Promise<{
		success: boolean;
		error?: any;
	}>;
	renderer?: Renderer;
	resendApiKey?: string;
} = {}) => {
	return {
		'send-email': async (event: RequestEvent): Promise<{ success: boolean; error: any }> => {
			const data = await event.request.formData();
			const emailPath = data.get('path');
			const file = data.get('file');

			if (!file || !emailPath) {
				return {
					success: false,
					error: { message: 'Missing file or path parameter' }
				};
			}

			const emailComponent = await getEmailComponent(emailPath as string, file as string);

			const email = {
				from: 'svelte-email-tailwind <onboarding@resend.dev>',
				to: `${data.get('to')}`,
				subject: `${data.get('component')} ${data.get('note') ? '| ' + data.get('note') : ''}`,
				html: await renderer.render(emailComponent)
			};

			let sent: { success: boolean; error?: any } = { success: false, error: null };

			if (!customSendEmailFunction && resendApiKey) {
				sent = await defaultSendEmailFunction(email, resendApiKey);
			} else if (customSendEmailFunction) {
				sent = await customSendEmailFunction(email);
			} else if (!customSendEmailFunction && !resendApiKey) {
				const error = {
					message:
						'Resend API key not configured. Please pass your API key to the sendEmail() function in your +page.server.ts file.'
				};
				return { success: false, error };
			}

			if (sent && sent.error) {
				console.log('Error:', sent.error);
				return { success: false, error: sent.error };
			} else {
				console.log('Email was sent successfully.');
				return { success: true, error: null };
			}
		}
	};
};

// Recursive function to get files
export function getFiles(dir: string, files: string[] = []) {
	// Get an array of all files and directories in the passed directory using fs.readdirSync
	const fileList = fs.readdirSync(dir);
	// Create the full path of the file/directory by concatenating the passed directory and file/directory name
	for (const file of fileList) {
		const name = path.join(dir, file);
		// Check if the current file/directory is a directory using fs.statSync
		if (fs.statSync(name).isDirectory()) {
			// If it is a directory, recursively call the getFiles function with the directory path and the files array
			getFiles(name, files);
		} else {
			// If it is a file, push the full path to the files array
			files.push(name);
		}
	}
	return files;
}

/**
 * Creates an array of names from the record of svelte email component file paths
 */
function createEmailComponentList(root: string, paths: string[]) {
	const emailComponentList: string[] = [];

	paths.forEach((filePath) => {
		if (filePath.endsWith('.svelte')) {
			// Get the directory name from the full path
			const fileDir = path.dirname(filePath);
			// Get the base name without extension
			const baseName = path.basename(filePath, '.svelte');

			// Normalize paths for cross-platform comparison
			const rootNormalized = path.normalize(root);
			const fileDirNormalized = path.normalize(fileDir);

			// Find where root appears in the full directory path
			const rootIndex = fileDirNormalized.indexOf(rootNormalized);

			if (rootIndex !== -1) {
				// Get everything after the root path
				const afterRoot = fileDirNormalized.substring(rootIndex + rootNormalized.length);
				// Combine with the base name using path.join for proper separators
				const relativePath = afterRoot ? path.join(afterRoot, baseName) : baseName;
				// Remove leading path separators
				const cleanPath = relativePath.replace(/^[/\\]+/, '');
				emailComponentList.push(cleanPath);
			}
		}
	});

	return emailComponentList;
}

// Export the Preview component
// Note: The component is available via: import EmailPreview from 'better-svelte-email/preview/EmailPreview.svelte'
// or: import { EmailPreview } from 'better-svelte-email/preview'
export { default as EmailPreview } from './EmailPreview.svelte';
