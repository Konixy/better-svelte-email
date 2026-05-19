import type { SendEmailConfig } from '$lib/send-email-config';

export type { SendEmailConfig };

type ApiErrorBody = {
	error?: { message?: string };
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
	const payload = (await response.json()) as T & ApiErrorBody;
	if (!response.ok) {
		const message =
			typeof payload.error?.message === 'string'
				? payload.error.message
				: `Request failed (${response.status})`;
		throw new Error(message);
	}
	return payload;
}

export async function getSendEmailConfig(origin: string): Promise<SendEmailConfig> {
	const response = await fetch(`${origin}/api/send-email/config`);
	return parseJsonResponse<SendEmailConfig>(response);
}

export async function saveSendEmailConfig(
	origin: string,
	body: { apiKey: string; from: string; persist: boolean }
): Promise<SendEmailConfig> {
	const response = await fetch(`${origin}/api/send-email/config`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	return parseJsonResponse<SendEmailConfig>(response);
}

export async function sendTestEmail(
	origin: string,
	body: { to: string; file: string; html: string; subject?: string }
): Promise<{ success: boolean }> {
	const response = await fetch(`${origin}/api/send-email`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	return parseJsonResponse<{ success: boolean }>(response);
}
