import { emailList, createEmail, sendEmail } from '$lib/preview/index.js';
import { RESEND_API_KEY } from '$env/static/private';

export function load() {
	const emails = emailList({
		root: process.cwd(),
		path: '/src/lib/emails'
	});

	return { emails };
}

export const actions = {
	...createEmail,
	...sendEmail({ resendApiKey: RESEND_API_KEY })
};
