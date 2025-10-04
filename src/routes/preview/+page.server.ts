import { emailList, createEmail } from '$lib/preview/index.js';

/**
 * Load all email templates from the emails directory
 */
export function load() {
	const emails = emailList({
		root: process.cwd(),
		path: '/src/lib/emails'
	});

	return { emails };
}

/**
 * Form actions for previewing emails
 */
export const actions = createEmail;
