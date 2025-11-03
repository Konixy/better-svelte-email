import type { RequestEvent } from '@sveltejs/kit';
import { Resend } from 'resend';
import fs from 'fs';
import { render } from 'svelte/server';
import path from 'path';
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html';

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
		} catch {
			throw new Error(
				'Could not determine the root path of your project. Please pass in the root param manually using process.cwd() or an absolute path'
			);
		}
	}

	const fullPath = path.join(root, emailPath);

	// Check if directory exists
	if (!fs.existsSync(fullPath)) {
		console.warn(`Email directory not found: ${fullPath}`);
		return { files: null, path: emailPath };
	}

	const files = createEmailComponentList(emailPath, getFiles(fullPath));

	if (!files.length) {
		return { files: null, path: emailPath };
	}

	return { files, path: emailPath };
};

const getEmailComponent = async (emailPath: string, file: string) => {
	try {
		// Import the email component dynamically
		return (await import(/* @vite-ignore */ `${emailPath}${path.sep}${file}.svelte`)).default;
	} catch {
		throw new Error(
			`Failed to import email component '${file}'. Make sure the file exists and includes the <Head /> component.`
		);
	}
};

/**
 * SvelteKit form action to render an email component.
 * Use this with the Preview component to render email templates on demand.
 *
 * @example
 * ```ts
 * // +page.server.ts
 * import { createEmail } from 'better-svelte-email/preview';
 *
 * export const actions = createEmail;
 * ```
 */
export const createEmail = {
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

			// Render the component to HTML
			const { body } = render(emailComponent);

			// Remove all HTML comments from the body before formatting
			const bodyWithoutComments = body.replace(/<!--[\s\S]*?-->/g, '');
			const formattedBody = await prettier.format(bodyWithoutComments, {
				parser: 'html',
				plugins: [parserHtml]
			});

			return {
				body: formattedBody
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
 *
 * @example
 * ```ts
 * // In +page.server.ts
 * import { PRIVATE_RESEND_API_KEY } from '$env/static/private';
 *
 * export const actions = {
 *   ...createEmail,
 *   ...sendEmail({ resendApiKey: PRIVATE_RESEND_API_KEY })
 * };
 * ```
 */
export const sendEmail = ({
	customSendEmailFunction,
	resendApiKey
}: {
	customSendEmailFunction?: typeof SendEmailFunction;
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
				html: (await render(emailComponent)).body
			};

			let sent: { success: boolean; error?: any } = { success: false, error: null };

			if (!customSendEmailFunction && resendApiKey) {
				sent = await defaultSendEmailFunction(email, resendApiKey);
			} else if (customSendEmailFunction) {
				sent = await customSendEmailFunction(email, resendApiKey);
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
function getFiles(dir: string, files: string[] = []) {
	// Get an array of all files and directories in the passed directory using fs.readdirSync
	const fileList = fs.readdirSync(dir);
	// Create the full path of the file/directory by concatenating the passed directory and file/directory name
	for (const file of fileList) {
		const name = `${dir}${path.sep}${file}`;
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
		if (filePath.includes(`.svelte`)) {
			const fileName = filePath.substring(
				filePath.indexOf(root) + root.length + 1,
				filePath.indexOf('.svelte')
			);
			emailComponentList.push(fileName);
		}
	});

	return emailComponentList;
}

// Export the Preview component
// Note: The component is available via: import EmailPreview from 'better-svelte-email/preview/EmailPreview.svelte'
// or: import { EmailPreview } from 'better-svelte-email/preview'
export { default as EmailPreview } from './EmailPreview.svelte';
