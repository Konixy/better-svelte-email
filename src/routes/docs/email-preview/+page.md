# Email Preview

The Email Preview component provides a visual development environment for creating and testing your email templates. It includes features like live preview, HTML source and code source viewing, and test email sending—all within your SvelteKit application.

> **Try it live!** Check out the preview in action in [this page](/preview). You can explore sample email templates and see how the preview component works before setting it up in your own project.

## Setup

### 1. Create a preview route

Create a new route under `src/routes/email-preview/[...email]` in your SvelteKit app to host the preview component:

```svelte
<!-- src/routes/email-preview/[...email]/+page.svelte -->
<script lang="ts">
	import { EmailPreview } from 'better-svelte-email/preview';
	import { page } from '$app/state';
</script>

<EmailPreview {page} />
```

### 2. Configure the server-side logic

Create a `+page.server.ts` file in the same route to load your email templates and handle preview actions:

```typescript
// src/routes/email-preview/[...email]/+page.server.ts
import { emailList, createEmail, sendEmail } from 'better-svelte-email/preview';
import { env } from '$env/dynamic/private';

export function load() {
	const emails = emailList({
		path: '/src/lib/emails' // optional, defaults to '/src/lib/emails'
	});

	return { emails };
}

export const actions = {
	...createEmail(),
	...sendEmail({ resendApiKey: env.RESEND_API_KEY, from: 'onboarding@resend.dev' })
};
```

> **Note:** If you want to use a different email provider (SendGrid, Mailgun, etc.) instead of Resend, see the [Using a Custom Email Provider](#using-a-custom-email-provider) section below.

### 3. Add your API key (optional)

To enable test email sending, add your Resend API key to your `.env` file:

```
RESEND_API_KEY=re_your_api_key_here
```

Get your API key from [Resend](https://resend.com/docs/dashboard/api-keys/introduction).

## Configuration Options

### Tailwind configuration

To use Tailwind in your email templates, you need to pass a renderer instance to the `createEmail` and `sendEmail` actions.

```typescript
import Renderer from 'better-svelte-email/render';
import { createEmail, sendEmail } from 'better-svelte-email/preview';

const tailwindConfig = {
	theme: { extend: { colors: { brand: '#FF3E00' } } }
};
const renderer = new Renderer({ tailwindConfig });

export const actions = {
	...createEmail({ renderer }),
	...sendEmail({ renderer })
};
```

You can also pass your app's CSS (including CSS variables) to the `Renderer` class.

```typescript
import layoutStyles from 'src/routes/layout.css?raw';

const renderer = new Renderer({ customCSS: layoutStyles });
```

### Custom Email Folder

By default, the preview looks for email templates in `/src/lib/emails`. You can customize this path:

```typescript
export function load() {
	const emails = emailList({
		path: '/src/lib/custom-emails'
	});

	return { emails };
}
```

### Custom Root Path

If your project structure requires it, you can specify a custom root path:

```typescript
export function load() {
	const emails = emailList({
		root: process.cwd(),
		path: '/src/lib/emails'
	});

	return { emails };
}
```

## Using a Custom Email Provider

If you prefer to use a different email service (SendGrid, Mailgun, etc.), pass a custom send function:

```typescript
export const actions = {
	...createEmail(),
	...sendEmail({
		customSendEmailFunction: async ({ from, to, subject, html }) => {
			// Use your preferred email service
			try {
				await yourEmailService.send({ from, to, subject, html });
				return { success: true };
			} catch (error) {
				return { success: false, error };
			}
		}
	})
};
```

### Custom Send Function Signature

Your custom send function should accept an object with these properties:

- `from` (string) - Sender email address
- `to` (string) - Recipient email address
- `subject` (string) - Email subject line
- `html` (string) - Rendered HTML content

And return an object with:

- `success` (boolean) - Whether the email was sent successfully
- `error` (any, optional) - Error details if sending failed

## Example Setup with SendGrid

```typescript
import { emailList, createEmail, sendEmail } from 'better-svelte-email/preview';
import sgMail from '@sendgrid/mail';
import { env } from '$env/dynamic/private';

sgMail.setApiKey(env.SENDGRID_API_KEY);

export function load() {
	return { emails: emailList() };
}

export const actions = {
	...createEmail(),
	...sendEmail({
		customSendEmailFunction: async ({ from, to, subject, html }) => {
			try {
				await sgMail.send({ from, to, subject, html });
				return { success: true };
			} catch (error) {
				console.error('SendGrid error:', error);
				return { success: false, error };
			}
		}
	})
};
```

## Vercel Setup

If you're using Vercel serverless functions, the `createEmail` and `sendEmail` actions will not work out of the box. You will need to create some custom serverless functions to handle the actions.

You can see an example implementation in [this file](https://github.com/Konixy/better-svelte-email/blob/main/src/routes/preview/%5B...email%5D/%2Bpage.server.ts).

## Troubleshooting

### No templates showing up

Make sure:

1. Your email templates are in the correct directory (default: `/src/lib/emails`)
2. Your files have the `.svelte` extension
3. The path in `emailList()` matches your actual directory structure

### Test emails not sending

Verify that:

1. Your `RESEND_API_KEY` is set in your `.env` file
2. The API key is valid and has sending permissions
3. You've imported and spread the `sendEmail` action in your `+page.server.ts`

### Preview route not found

Ensure:

1. You've created both `+page.svelte` and `+page.server.ts` in your preview route
2. Your dev server is running
3. You're navigating to the correct URL (e.g., `http://localhost:5173/email-preview`)

## API Reference

### `emailList(options)`

Loads all email templates from the specified directory.

**Parameters:**

- `options.path` (string, optional) - Relative path from root to emails folder (default: `/src/lib/emails`)
- `options.root` (string, optional) - Absolute path to project root (auto-detected if not provided)

**Returns:** `PreviewData` object with:

- `files` (string[] | null) - Array of email template file names
- `path` (string | null) - Path to the emails directory

### `createEmail`

SvelteKit form action that renders an email component to HTML.

### `sendEmail(options)`

Returns a SvelteKit form action that sends test emails.

**Parameters:**

- `options.resendApiKey` (string, optional) - Your Resend API key
- `options.customSendEmailFunction` (function, optional) - Custom email sending function
- `options.from` (string, optional) - Sender email address (defaults to 'better-svelte-email <onboarding@resend.dev>')
