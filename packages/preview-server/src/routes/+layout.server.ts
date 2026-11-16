import { PREVIEW_HMR, PREVIEW_API_ORIGIN } from '$app/env/private';
import { emptySendEmailConfig } from '#lib/send-email-config.js';
import { loadSendEmailConfig } from '#lib/server/preview-api.js';

function isPreviewHmrDisabled() {
	const v = PREVIEW_HMR?.trim().toLowerCase();
	return v === '0' || v === 'false' || v === 'off' || v === 'no';
}

export async function load() {
	const origin = PREVIEW_API_ORIGIN?.trim().replace(/\/+$/, '') ?? '';
	const previewEventsUrl = isPreviewHmrDisabled()
		? ''
		: origin
			? `${origin}/api/preview-events`
			: '/api/preview-events';

	const sendEmailConfig = origin ? await loadSendEmailConfig() : emptySendEmailConfig();

	return { previewEventsUrl, previewApiOrigin: origin, sendEmailConfig };
}
