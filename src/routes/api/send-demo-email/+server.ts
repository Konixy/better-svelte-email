import { json } from '@sveltejs/kit';
import { render } from 'svelte/server';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import DemoEmail from '$lib/emails/demo-email.svelte';

const resend = new Resend(env.RESEND_API_KEY);

export async function POST({ request }) {
	try {
		const { email, userName } = await request.json();

		// Validate input
		if (!email || !email.includes('@')) {
			return json({ error: 'Please provide a valid email address' }, { status: 400 });
		}

		// Render the email component
		const result = render(DemoEmail, {
			props: {
				userName: userName || 'Demo User',
				testMessage:
					'This email was generated using better-svelte-email! All the Tailwind classes you see were transformed into inline styles at build time.'
			}
		});

		// Send email using Resend
		const { data, error } = await resend.emails.send({
			from: env.FROM_EMAIL || 'onboarding@resend.dev',
			to: email,
			subject: '✨ better-svelte-email Demo - It Works!',
			html: result.body
		});

		if (error) {
			console.error('Resend error:', error);
			return json({ error: 'Failed to send email: ' + error.message }, { status: 500 });
		}

		return json({
			success: true,
			message: 'Email sent successfully! Check your inbox.',
			emailId: data?.id
		});
	} catch (error) {
		console.error('Server error:', error);
		return json(
			{
				error: error instanceof Error ? error.message : 'An unexpected error occurred'
			},
			{ status: 500 }
		);
	}
}
