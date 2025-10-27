<p align="center">
  <h3 align="center">Better Svelte Email</h3>
	<p align="center">
		Create beautiful emails in Svelte with first-class Tailwind support
	</p>
	<p align="center">
		<a href="https://better-svelte-email.konixy.fr">Website</a>
		 · 
		<a href="https://github.com/Konixy/better-svelte-email">GitHub</a>
	</p>
  <p align="center">
    <a href="https://github.com/Konixy/better-svelte-email/actions/workflows/release.yml">
      <img src="https://github.com/Konixy/better-svelte-email/actions/workflows/release.yml/badge.svg" alt="Tests">
    </a>
    <a href="https://www.npmjs.com/package/better-svelte-email">
      <img src="https://img.shields.io/npm/v/better-svelte-email.svg?logo=npm" alt="npm version">
    </a>
    <a href="https://github.com/Konixy/better-svelte-email/stargazers">
      <img src="https://img.shields.io/github/stars/Konixy/better-svelte-email?style=default&logo=github" alt="GitHub stars">
    </a>
  </p>
</p>

## Features

- **Stable & Future-Proof** - Uses Svelte's public preprocessor API
- **Tailwind CSS Support** - Transforms Tailwind classes to inline styles for email clients
- **Built-in Email Preview** - Visual email preview and test sending
- **TypeScript First** - Fully typed with comprehensive type definitions
- **Well Tested** - Extensive test coverage with unit and integration tests

_See [Roadmap](./ROADMAP.md) for future features and planned improvements._

## Why?

Existing Svelte email solutions have significant limitations:

- **svelte-email** hasn't been updated in over 2 years
- **svelte-email-tailwind** suffers from stability issues and maintaining it is not sustainable anymore

Better Svelte Email is a complete rewrite built on Svelte's official preprocessor API, providing the rock-solid foundation your email infrastructure needs. It brings the simplicity, reliability, and feature richness of [React Email](https://react.email/) to the Svelte ecosystem.

## Quick Start

### 1. Install the package

```bash
npm i -D better-svelte-email
# or
bun add -D better-svelte-email
# or
pnpm add -D better-svelte-email
```

### 2. Configure the Preprocessor

Add the preprocessor to your `svelte.config.js`:

```javascript
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { betterSvelteEmailPreprocessor } from 'better-svelte-email';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess(), betterSvelteEmailPreprocessor()],
	kit: {
		adapter: adapter()
	}
};

export default config;
```

### 3. Create Email Components

Create your email templates in `src/lib/emails/`:

```svelte
<!-- src/lib/emails/welcome.svelte -->
<script>
	import { Html, Head, Body, Preview, Container, Text, Button } from 'better-svelte-email';

	let { name = 'User' } = $props();
</script>

<Html>
	<Head />
	<Body class="bg-gray-100">
		<Preview preview="Welcome Email" />
		<Container class="mx-auto p-8">
			<Text class="mb-4 text-2xl font-bold">
				Welcome, {name}!
			</Text>

			<Button
				href="https://example.com"
				class="rounded bg-orange-600 px-6 py-3 text-white sm:text-sm"
			>
				Get Started
			</Button>
		</Container>
	</Body>
</Html>
```

### 4. Render and Send

```typescript
// src/routes/api/send-email/+server.ts
import { render } from 'svelte/server';
import WelcomeEmail from '$lib/emails/welcome.svelte';

export async function POST({ request }) {
	const { name, email } = await request.json();

	// Render email (preprocessor already ran at build time!)
	const result = render(WelcomeEmail, { props: { name } });

	// Send email using your preferred service (Resend, SendGrid, etc.)
	// await resend.emails.send({
	//   from: 'noreply@example.com',
	//   to: email,
	//   subject: 'Welcome!',
	//   html: result.body
	// });

	return new Response('Sent');
}
```

## Email Preview Component

Better Svelte Email includes a built-in preview component for visually developing and testing your email templates during development.

### Setup

Create a preview route in your SvelteKit app:

```svelte
<!-- src/routes/preview/+page.svelte -->
<script lang="ts">
	import { EmailPreview } from 'better-svelte-email/preview';

	let { data } = $props();
</script>

<EmailPreview emailList={data.emails} />
```

```typescript
// src/routes/preview/+page.server.ts
import { emailList, createEmail, sendEmail } from 'better-svelte-email/preview';
import { env } from '$env/dynamic/private';

export function load() {
	const emails = emailList({
		path: '/src/lib/emails' // optional, defaults to '/src/lib/emails'
	});

	return { emails };
}

export const actions = {
	...createEmail,
	...sendEmail({ resendApiKey: env.RESEND_API_KEY })
};
```

### Features

- **HTML Source View** - Inspect the generated HTML with syntax highlighting
- **Copy to Clipboard** - Quickly copy the rendered HTML
- **Test Email Sending** - Send test emails directly from the preview UI using Resend
- **Template List** - Browse all your email templates in one place

### Environment Variables

To enable test email sending, add your Resend API key to your `.env` file:

```env
RESEND_API_KEY=re_your_api_key_here
```

Get your API key from [Resend](https://resend.com/).

### Custom Email Provider

If you prefer to use a different email provider, you can pass a custom send function:

```typescript
export const actions = {
	...createEmail,
	...sendEmail({
		customSendEmailFunction: async ({ from, to, subject, html }) => {
			// Use your preferred email service (SendGrid, Mailgun, etc.)
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

## Configuration

Here are the available options:

```javascript
betterSvelteEmailPreprocessor({
	pathToEmailFolder: '/src/lib/emails',
	debug: false,
	tailwindConfig: {
		theme: {
			extend: {
				colors: {
					brand: '#FF3E00'
				}
			}
		}
	}
});
```

## Minimum Svelte Version

The minimum supported Svelte version is 5.14.3.
For older versions, you can use [`svelte-email-tailwind`](https://github.com/steveninety/svelte-email-tailwind).

## Supported Features

### ✅ Supported

- ✅ Static Tailwind classes
- ✅ Custom Tailwind classes (`bg-[#fff]`, `my:[40px]`, ...)
- ✅ All standard Tailwind (v3) utilities (colors, spacing, typography, etc.)
- ✅ Responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- ✅ HTML elements and Svelte components
- ✅ Nested components
- ✅ Conditional blocks (`{#if}`)
- ✅ Each blocks (`{#each}`)
- ✅ Custom Tailwind configurations

### ❌ Not Supported (Yet) (See [Roadmap](./ROADMAP.md))

- ❌ Tailwind v4
- ❌ CSS Object (`style={{ color: 'red' }}`)
- ❌ Dynamic class expressions (`class={someVar}`)
- ❌ Arbitrary values in responsive classes (`sm:[color:red]`)
- ❌ Container queries

## Author

Anatole Dufour ([@Konixy](https://github.com/Konixy))

## Development

### Running Tests

```bash
bun run test
```

All tests must pass before pushing to main. The CI/CD pipeline will automatically run tests on every push and pull request.

### Building

```bash
bun run build
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

To do so, you'll need to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes
4. Run tests (`bun run test`)
5. Commit your changes using [conventional commits](https://www.conventionalcommits.org/):
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `test:` - Test additions/changes
   - `chore:` - Maintenance tasks
6. Push to your branch (`git push origin feat/amazing-feature`)
7. Open a Pull Request

## Acknowledgements

Many components and logic were inspired by or adapted from [svelte-email-tailwind](https://github.com/steveninety/svelte-email-tailwind) and [react-email](https://react.email/). Huge thanks to the authors and contributors of these projects for their excellent work.
