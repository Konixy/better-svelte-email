import { load_emails, render_email } from '$lib/server/preview-api';

export async function load({ params }: { params: { email?: string } }) {
	const selectedFile = params.email ?? '';
	const [emails, preview] = await Promise.all([
		load_emails(),
		selectedFile
			? render_email(selectedFile)
			: Promise.resolve({
					html: '',
					source: '',
					renderTimeMs: null as number | null,
					error: null as string | null
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
