import { loadEmails } from '$lib/server/preview-api';

export async function load() {
	const emails = await loadEmails();

	return {
		files: emails.files,
		emailPath: emails.path,
		emailsError: emails.error,
		selectedFile: null,
		html: '',
		source: '',
		renderTimeMs: null,
		renderError: null
	};
}
