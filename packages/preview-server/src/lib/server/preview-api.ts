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

export async function loadEmails() {
	const response = await fetchPreviewApi('/api/emails');
	const payload = (await response.json()) as EmailsResponse;

	if (!response.ok) {
		return {
			files: [] as string[],
			path: '',
			error: payload.error ?? new Error('Failed to load email list.')
		};
	}

	return {
		files: payload.files ?? [],
		path: payload.path ?? '',
		error: null as { message?: string; stack?: string } | null
	};
}

import { emptySendEmailConfig, type SendEmailConfig } from '$lib/send-email-config';

export async function loadSendEmailConfig(): Promise<SendEmailConfig> {
	try {
		const response = await fetchPreviewApi('/api/send-email/config');
		const payload = (await response.json()) as SendEmailConfig;
		if (!response.ok) {
			return emptySendEmailConfig();
		}
		return {
			configured: payload.configured === true,
			from: typeof payload.from === 'string' ? payload.from : null,
			persisted: payload.persisted === true
		};
	} catch {
		return emptySendEmailConfig();
	}
}

export async function renderEmail(file: string) {
	const response = await fetchPreviewApi('/api/render', {
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
			error: payload.error ?? new Error('Failed to render email.')
		};
	}

	return {
		html: payload.html ?? '',
		source: payload.source ?? '',
		renderTimeMs: typeof payload.renderTimeMs === 'number' ? payload.renderTimeMs : null,
		error: null as { message?: string; stack?: string } | null
	};
}

function getPreviewApiOrigin() {
	const origin = env.PREVIEW_API_ORIGIN?.trim();
	if (!origin) {
		throw new Error('PREVIEW_API_ORIGIN is not configured for the preview server.');
	}

	return origin.replace(/\/+$/, '');
}

function fetchPreviewApi(pathname: string, init?: RequestInit) {
	return fetch(`${getPreviewApiOrigin()}${pathname}`, init);
}
