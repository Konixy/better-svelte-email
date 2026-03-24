import { env } from '$env/dynamic/private';

type EmailsResponse = {
	files?: string[];
	path?: string;
	error?: { message?: string };
};

type RenderResponse = {
	html?: string;
	renderTimeMs?: number;
	source?: string | null;
	error?: { message?: string };
};

export async function load_emails() {
	const response = await fetch_preview_api('/api/emails');
	const payload = (await response.json()) as EmailsResponse;

	if (!response.ok) {
		return {
			files: [] as string[],
			path: '',
			error: payload.error?.message ?? 'Failed to load email list.'
		};
	}

	return {
		files: payload.files ?? [],
		path: payload.path ?? '',
		error: null as string | null
	};
}

export async function render_email(file: string) {
	const response = await fetch_preview_api('/api/render', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			file,
			includeSource: true
		})
	});

	const payload = (await response.json()) as RenderResponse;
	if (!response.ok) {
		return {
			html: '',
			source: '',
			renderTimeMs: null as number | null,
			error: payload.error?.message ?? 'Failed to render email.'
		};
	}

	return {
		html: payload.html ?? '',
		source: payload.source ?? '',
		renderTimeMs: typeof payload.renderTimeMs === 'number' ? payload.renderTimeMs : null,
		error: null as string | null
	};
}

function get_preview_api_origin() {
	const origin = env.PREVIEW_API_ORIGIN?.trim();
	if (!origin) {
		throw new Error('PREVIEW_API_ORIGIN is not configured for the preview server.');
	}

	return origin.replace(/\/+$/, '');
}

function fetch_preview_api(pathname: string, init?: RequestInit) {
	return fetch(`${get_preview_api_origin()}${pathname}`, init);
}
