// src/routes/api/send-email/+server.ts
import Renderer, { toPlainText } from 'better-svelte-email/render';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import WelcomeEmail from '$lib/emails/welcome.svelte';

const tailwindConfig = {
	theme: { extend: { colors: { brand: '#FF3E00' } } }
};
const { render } = new Renderer(tailwindConfig);
const resend = new Resend(env.PRIVATE_RESEND_API_KEY);

export async function POST({ request }) {
	const { name, email } = await request.json();

	const html = await render(WelcomeEmail, { props: { name } });
	const plainText = toPlainText(html);

	// Send email using your preferred service (Resend, SendGrid, etc.)
	await resend.emails.send({
		from: 'onboarding@resend.dev',
		to: email,
		subject: 'Welcome!',
		html,
		text: plainText
	});

	return new Response('Email sent');
}
