import { env } from '$env/dynamic/private';

function isPreviewHmrDisabled() {
	const v = env.PREVIEW_HMR?.trim().toLowerCase();
	return v === '0' || v === 'false' || v === 'off' || v === 'no';
}

export function load() {
	const origin = env.PREVIEW_API_ORIGIN?.trim().replace(/\/+$/, '') ?? '';
	const previewEventsUrl = isPreviewHmrDisabled()
		? ''
		: origin
			? `${origin}/api/preview-events`
			: '/api/preview-events';

	return { previewEventsUrl };
}
