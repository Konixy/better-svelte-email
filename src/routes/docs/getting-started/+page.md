# Getting started

Welcome to **Better Svelte Email**! This guide walks you through installation, configuration, and building your first email.

## Requirements

- `svelte >= v5.14.3`
- `tailwindcss >= v4`

## Installation

Install the package:

```bash
npm install better-svelte-email
```

## Write your first email

Create a new file at `src/lib/emails/welcome.svelte`. This example uses tailwind, but bare css works too.

```svelte
<!-- src/lib/emails/welcome.svelte -->
<script>
	import {
		Html,
		Head,
		Body,
		Preview,
		Container,
		Section,
		Text,
		Button,
		Row
	} from 'better-svelte-email';

	let { name = 'there' } = $props();
</script>

<Html>
	<Head />
	<Body class="bg-zinc-100">
		<Preview preview="Welcome Email" />
		<Container class="m-8 mx-auto max-w-lg rounded-2xl bg-white p-8">
			<Section class="mx-auto text-center">
				<Text class="text-2xl font-bold text-zinc-900">Welcome {name}!</Text>
				<Text class="mt-3 text-zinc-600">
					Better Svelte Email converts Svelte components into email-safe HTML.
				</Text>
				<Row class="mt-6">
					<Button
						href="https://better-svelte-email.konixy.fr/docs"
						pX={24}
						pY={14}
						class="mr-2 rounded-lg bg-orange-600 text-white"
					>
						Explore the docs
					</Button>
					<Button
						href="https://github.com/Konixy/better-svelte-email"
						pX={24}
						pY={14}
						class="ml-2 rounded-lg border border-zinc-200 text-zinc-900"
					>
						or the GitHub
					</Button>
				</Row>
			</Section>
		</Container>
	</Body>
</Html>
```

## Render and send it

Render the email using the `Renderer` class and send it using your preferred email provider (resend in this example).

```typescript
// src/routes/api/send-email/+server.ts
import Renderer from 'better-svelte-email/render';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import WelcomeEmail from '$lib/emails/welcome.svelte';

const { render } = new Renderer();
const resend = new Resend(env.PRIVATE_RESEND_API_KEY);

export async function POST({ request }) {
	const { name, email } = await request.json();

	const html = await render(WelcomeEmail, { props: { name } });

	// Send email using your preferred service (Resend, SendGrid, etc.)
	await resend.emails.send({
		from: 'onboarding@resend.dev',
		to: email,
		subject: 'Welcome!',
		html
	});

	return new Response('Email sent');
}
```

## Plain text version

You can also render the email as plain text using the `toPlainText` function for better accessibility.

```typescript
import { toPlainText } from 'better-svelte-email/render';

const plainText = toPlainText(html);

await resend.emails.send({
	from: 'onboarding@resend.dev',
	to: email,
	subject: 'Welcome!',
	html,
	// Add the plain text version to the email
	text: plainText
});
```

## Further configuration

### Tailwind configuration

You can pass a Tailwind configuration object to the `Renderer` class.

```js
const tailwindConfig = {
	theme: { extend: { colors: { brand: '#FF3E00' } } }
};
const { render } = new Renderer({ tailwindConfig });
```

### Custom CSS

You can also pass a custom CSS string to the `Renderer` class.
This is useful if you want to inject your app's CSS (including CSS variables) into email rendering.
For example, if you are using shadcn-svelte, you can pass the `layout.css` (previously `app.css`) file to the `Renderer` class.

```js
import layoutStyles from 'src/routes/layout.css?raw';

const { render } = new Renderer({ customCSS: layoutStyles });
```

## Preview your emails

Better Svelte Email provides an `EmailPreview` component that you can use to preview your emails in the browser.
See the [Email Preview](./email-preview) section for a guide on how to use it.
