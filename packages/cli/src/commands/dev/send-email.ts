import { Resend } from 'resend';
import type { ResendCredentials } from './resend-credentials';

export type SendEmailPayload = {
	from: string;
	to: string;
	subject: string;
	html: string;
};

export async function sendEmailViaResend(
	credentials: ResendCredentials,
	payload: SendEmailPayload
): Promise<{ success: true } | { success: false; error: { message: string } }> {
	const resend = new Resend(credentials.apiKey);
	const result = await resend.emails.send({
		from: credentials.from,
		to: payload.to,
		subject: payload.subject,
		html: payload.html
	});

	if (result.error) {
		return {
			success: false,
			error: {
				message:
					typeof result.error.message === 'string'
						? result.error.message
						: 'Failed to send email via Resend.'
			}
		};
	}

	return { success: true };
}

export function isValidEmailAddress(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function defaultPreviewSubject(file: string) {
	const base = file.split('/').pop() || file;
	return `[Preview] ${base}`;
}
