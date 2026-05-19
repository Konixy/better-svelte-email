import { env } from '$env/dynamic/private';
import { emptySendEmailConfig } from '$lib/send-email-config';
import { loadSendEmailConfig } from '$lib/server/preview-api';

function isPreviewHmrDisabled() {
	const v = env.PREVIEW_HMR?.trim().toLowerCase();
	return v === '0' || v === 'false' || v === 'off' || v === 'no';
}

export async function load() {
	const origin = env.PREVIEW_API_ORIGIN?.trim().replace(/\/+$/, '') ?? '';
	const previewEventsUrl = isPreviewHmrDisabled()
		? ''
		: origin
			? `${origin}/api/preview-events`
			: '/api/preview-events';

	const sendEmailConfig = origin ? await loadSendEmailConfig() : emptySendEmailConfig();

	return { previewEventsUrl, previewApiOrigin: origin, sendEmailConfig };
}
