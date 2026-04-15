<aside class="docs-beta-notice">
<p><strong>Beta.</strong> These instructions use the scoped <code>@better-svelte-email/*</code> packages (v2-style split). Install names, exports, and behavior may change before a stable release. For production, prefer <a href="./getting-started">Getting started</a> with <code>better-svelte-email</code>.</p>
</aside>

# Getting started (beta)

This guide mirrors [Getting started](./getting-started) but uses **`@better-svelte-email/components`** and **`@better-svelte-email/server`**.

## Preview: CLI, not `@better-svelte-email/preview`

**`@better-svelte-email/preview`** (SvelteKit `EmailPreview`, `createEmail`, `sendEmail`, etc.) is **deprecated** in v2. It remains on npm only for **compatibility** with existing apps that already wired a `/preview` route.

For **new** projects, use **`@better-svelte-email/cli`**: it runs a standalone **email dev server** (file watching, live preview, render API) without adding preview routes to your app. See [Email dev server (beta)](./email-preview-beta) for install options and flags.

## Requirements

- `svelte >= v5.14.3`
- `tailwindcss >= v4`

## Installation

Core rendering and components:

```bash
npm install @better-svelte-email/components @better-svelte-email/server
```

Optional — local email preview (recommended for development):

```bash
npm install -D @better-svelte-email/cli
```

Run it without adding a dependency first:

```bash
npx @better-svelte-email/cli dev
```

Or install the CLI **globally** and use the **`bse`** binary:

```bash
npm install -g @better-svelte-email/cli
bse dev
```

## Write your first email

Create a new file at `src/lib/emails/welcome.svelte`. This example uses Tailwind, but bare CSS works too.

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
	} from '@better-svelte-email/components';

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
						href="https://better-svelte-email.konixy.dev/docs"
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

```typescript
// src/routes/api/send-email/+server.ts
import { Renderer } from '@better-svelte-email/server';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import WelcomeEmail from '$lib/emails/welcome.svelte';

const { render } = new Renderer();
const resend = new Resend(env.PRIVATE_RESEND_API_KEY);

export async function POST({ request }) {
	const { name, email } = await request.json();

	const html = await render(WelcomeEmail, { props: { name } });

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

```typescript
import { toPlainText } from '@better-svelte-email/server';

const plainText = toPlainText(html);

await resend.emails.send({
	from: 'onboarding@resend.dev',
	to: email,
	subject: 'Welcome!',
	html,
	text: plainText
});
```

## Further configuration

### Tailwind configuration

Pass `customCSS` or `tailwindConfig` to `Renderer` from `@better-svelte-email/server` (same options as the stable renderer).

```js
import layoutStyles from 'src/routes/layout.css?raw';

const { render } = new Renderer({ customCSS: layoutStyles });
```

```js
const tailwindConfig = {
	theme: { extend: { colors: { brand: '#FF3E00' } } }
};
const { render } = new Renderer({ tailwindConfig });
```

## Preview your emails

Use **`@better-svelte-email/cli`** — see [Email dev server (beta)](./email-preview-beta) (`npx @better-svelte-email/cli dev`, dev dependency, or global install).
