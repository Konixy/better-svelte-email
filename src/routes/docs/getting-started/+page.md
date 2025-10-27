# Getting started

Welcome to **Better Svelte Email**! This guide walks you through installation, configuration, and building your first email.

## Requirements

- Svelte 5.14.3 or higher
- Tailwind CSS (soon will be optional)

## Installation

Install the package:

```bash
npm install better-svelte-email
```

## Configure the preprocessor

Add the Better Svelte Email preprocessor to your `svelte.config.js`:

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { betterSvelteEmailPreprocessor } from 'better-svelte-email/preprocessor';

const config = {
	preprocess: [vitePreprocess(), betterSvelteEmailPreprocessor()],
	kit: {
		adapter: adapter()
	}
};

export default config;
```

## Write your first email

Create a new file at `src/lib/emails/welcome.svelte`:

```svelte
<!-- src/lib/emails/welcome.svelte -->
<script>
	import { Html, Head, Body, Container, Section, Text, Button } from 'better-svelte-email';

	let { name = 'there' } = $props();
</script>

<Html>
	<Head />
	<Body class="bg-zinc-100">
		<Preview preview="Welcome Email" />
		<Container class="mx-auto max-w-lg">
			<Section class="rounded-2xl bg-white p-8 shadow">
				<Text class="text-2xl font-bold text-zinc-900">Welcome {name}!</Text>
				<Text class="mt-3 text-zinc-600">
					Better Svelte Email converts Svelte components into email-safe HTML.
				</Text>
				<Button
					href="https://better-svelte-email.konixy.fr/docs"
					class="mt-6 inline-flex items-center justify-center rounded-lg bg-orange-600 px-6 py-3 text-white"
				>
					Explore the docs
				</Button>
			</Section>
		</Container>
	</Body>
</Html>
```

## Render and send it

Render the email using the `render` function from `svelte/server` and send it using your preferred email provider (resend in this example).

```typescript
// src/routes/api/send-email/+server.ts
import { render } from 'svelte/server';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import WelcomeEmail from '$lib/emails/welcome.svelte';

const resend = new Resend(env.PRIVATE_RESEND_API_KEY);

export async function POST({ request }) {
	const { name, email } = await request.json();

	const result = render(WelcomeEmail, { props: { name } });

	// Send email using your preferred service (Resend, SendGrid, etc.)
	await resend.emails.send({
	  from: 'noreply@example.com',
	  to: email,
	  subject: 'Welcome!',
	  html: result.body
	});

	return new Response('Sent');
}
```

## Further configuration

### Tailwind configuration

You can configure Tailwind using the `tailwindConfig` option in the preprocessor.

```js
// svelte.config.js
betterSvelteEmailPreprocessor({
	tailwindConfig: {
		theme: { extend: { colors: { brand: '#FF3E00' } } }
	}
});
```

### Custom email folder

You can configure the path to the email folder using the `pathToEmailFolder` option in the preprocessor (defaults to `/src/lib/emails`).

```js
// svelte.config.js
betterSvelteEmailPreprocessor({
	pathToEmailFolder: '/src/lib/custom'
});
```
