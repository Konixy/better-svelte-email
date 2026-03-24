import { loadEmails, renderEmail } from '$lib/server/preview-api';

export async function load({ params }: { params: { email?: string } }) {
	const selectedFile = params.email ?? '';
	const [emails, preview] = await Promise.all([
		loadEmails(),
		selectedFile
			? renderEmail(selectedFile)
			: Promise.resolve({
					html: '',
					source: '',
					renderTimeMs: null as number | null,
					error: null as { message?: string; stack?: string } | null
				})
	]);

	return {
		files: emails.files,
		emailPath: emails.path,
		emailsError: emails.error,
		selectedFile,
		html: preview.html,
		source: preview.source,
		renderTimeMs: preview.renderTimeMs,
		renderError: preview.error
	};
}
