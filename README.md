# better-svelte-email

[![CI](https://github.com/Konixy/better-svelte-email/actions/workflows/ci.yml/badge.svg)](https://github.com/Konixy/better-svelte-email/actions/workflows/ci.yml)
[![Tests](https://github.com/Konixy/better-svelte-email/actions/workflows/release.yml/badge.svg)](https://github.com/Konixy/better-svelte-email/actions/workflows/release.yml)

A Svelte preprocessor that transforms Tailwind CSS classes in email components to inline styles with responsive media query support.

## Features

✨ **Stable & Future-Proof** - Uses Svelte's public preprocessor API  
🎨 **Tailwind CSS Support** - Transforms Tailwind classes to inline styles for email clients  
📱 **Responsive Emails** - Preserves responsive classes (`sm:`, `md:`, `lg:`) as media queries  
⚡ **Build-Time Transformation** - Zero runtime overhead  
🔍 **TypeScript First** - Fully typed with comprehensive type definitions  
✅ **Well Tested** - Extensive test coverage with unit and integration tests

## Why?

Email clients don't support modern CSS in `<style>` tags, requiring inline styles. But writing inline styles is tedious and hard to maintain. This preprocessor lets you write Tailwind CSS classes and automatically transforms them to inline styles at build time.

## Installation

```bash
npm install better-svelte-email
# or
bun add better-svelte-email
# or
pnpm add better-svelte-email
```

## Quick Start

### 1. Configure the Preprocessor

Add the preprocessor to your `svelte.config.js`:

```javascript
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { betterSvelteEmailPreprocessor } from 'better-svelte-email';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess(),
		betterSvelteEmailPreprocessor({
			pathToEmailFolder: '/src/lib/emails',
			debug: false
		})
	],
	kit: {
		adapter: adapter()
	}
};

export default config;
```

### 2. Create Email Components

Create your email templates in `src/lib/emails/`:

```svelte
<!-- src/lib/emails/welcome.svelte -->
<script>
	let { name = 'User' } = $props();
</script>

<Html>
	<Head />
	<Body class="bg-gray-100">
		<Container class="mx-auto p-8">
			<Text class="mb-4 text-2xl font-bold">
				Welcome, {name}!
			</Text>

			<Button
				href="https://example.com"
				class="rounded bg-blue-600 px-6 py-3 text-white sm:bg-green-600"
			>
				Get Started
			</Button>
		</Container>
	</Body>
</Html>
```

### 3. Render and Send

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

## How It Works

The preprocessor transforms your Tailwind classes in three steps:

### 1. Non-Responsive Classes → Inline Styles

```svelte
<!-- Input -->
<Button class="bg-blue-500 p-4 text-white">Click</Button>

<!-- Output -->
<Button
	styleString="background-color: rgb(59, 130, 246); color: rgb(255, 255, 255); padding: 16px;"
>
	Click
</Button>
```

### 2. Responsive Classes → Media Queries

```svelte
<!-- Input -->
<Button class="bg-blue-500 sm:bg-red-500">Click</Button>

<!-- Output -->
<Button class="sm_bg-red-500" styleString="background-color: rgb(59, 130, 246);">Click</Button>

<!-- Injected into <Head> -->
<style>
	@media (max-width: 475px) {
		.sm_bg-red-500 {
			background-color: rgb(239, 68, 68) !important;
		}
	}
</style>
```

### 3. Mixed Classes → Both

```svelte
<!-- Input -->
<Button class="rounded bg-blue-500 p-4 sm:bg-red-500 md:p-6">Click</Button>

<!-- Output -->
<Button
	class="sm_bg-red-500 md_p-6"
	styleString="border-radius: 4px; background-color: rgb(59, 130, 246); padding: 16px;"
>
	Click
</Button>
```

## Configuration

### Options

```typescript
interface PreprocessorOptions {
	/**
	 * Path to folder containing email components
	 * @default '/src/lib/emails'
	 */
	pathToEmailFolder?: string;

	/**
	 * Custom Tailwind configuration
	 * @default undefined
	 */
	tailwindConfig?: TailwindConfig;

	/**
	 * Enable debug logging
	 * @default false
	 */
	debug?: boolean;
}
```

### Custom Tailwind Config

```javascript
betterSvelteEmailPreprocessor({
	pathToEmailFolder: '/src/lib/emails',
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

## Supported Features

### ✅ Supported

- ✅ Static Tailwind classes
- ✅ All standard Tailwind utilities (colors, spacing, typography, etc.)
- ✅ Responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- ✅ HTML elements and Svelte components
- ✅ Nested components
- ✅ Conditional blocks (`{#if}`)
- ✅ Each blocks (`{#each}`)
- ✅ Custom Tailwind configurations

### ❌ Not Supported (Yet)

- ❌ Dynamic class expressions (`class={someVar}`)
- ❌ Arbitrary values in responsive classes (`sm:[color:red]`)
- ❌ Container queries

## API Reference

### Main Export

```typescript
import { betterSvelteEmailPreprocessor } from 'better-svelte-email';
```

### Advanced Exports

For advanced use cases, you can use individual functions:

```typescript
import {
	parseClassAttributes,
	transformTailwindClasses,
	generateMediaQueries,
	injectMediaQueries
} from 'better-svelte-email';
```

## Testing

The library includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Examples

### Simple Button

```svelte
<Button class="rounded bg-blue-500 px-4 py-2 text-white">Click Me</Button>
```

### Responsive Layout

```svelte
<Container class="mx-auto w-full max-w-2xl p-4 sm:p-6 md:p-8">
	<Text class="text-lg sm:text-xl md:text-2xl">Responsive Text</Text>
</Container>
```

### Complex Email

```svelte
<Html>
	<Head />
	<Body class="bg-gray-100 font-sans">
		<Container class="mx-auto my-8 max-w-2xl rounded-lg bg-white shadow-lg">
			<Section class="p-8">
				<Text class="mb-4 text-3xl font-bold text-gray-900">Welcome to Our Service</Text>

				<Text class="mb-6 text-gray-600">
					Thank you for signing up. We're excited to have you on board!
				</Text>

				<Button
					href="https://example.com/verify"
					class="rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white sm:bg-green-600"
				>
					Verify Your Email
				</Button>
			</Section>
		</Container>
	</Body>
</Html>
```

## Troubleshooting

### Classes not being transformed

1. Make sure your file is in the configured `pathToEmailFolder`
2. Check that your classes are static strings, not dynamic expressions
3. Enable debug mode to see warnings: `{ debug: true }`

### Media queries not working

1. Ensure you have a `<Head />` component in your email
2. Check that you're using standard breakpoints (`sm:`, `md:`, etc.)
3. Verify the media queries are being injected (view the rendered HTML)

### Type errors

Make sure you have the latest version of Svelte (requires 5.14.3 or higher):

```bash
npm install svelte@latest
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

Konixy

## Development

### Running Tests

```bash
bun test
```

All tests must pass before pushing to main. The CI/CD pipeline will automatically run tests on every push and pull request.

### Building

```bash
bun run build
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`bun test`)
5. Commit your changes using [conventional commits](https://www.conventionalcommits.org/):
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `test:` - Test additions/changes
   - `chore:` - Maintenance tasks
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Releases

Releases are automated via GitHub Actions. When you bump the version in `package.json` and push to `main`, a new release will be automatically created with a generated changelog.

See [RELEASE.md](./RELEASE.md) for detailed release process documentation.

## Acknowledgments

- Built on top of [Svelte 5](https://svelte.dev/)
- Uses [tw-to-css](https://github.com/dvkndn/tw-to-css) for Tailwind to CSS conversion
- Uses [magic-string](https://github.com/rich-harris/magic-string) for efficient source transformations

## Related Projects

- [react-email](https://react.email/) - React version for email templates
- [svelte-email](https://github.com/carstenlebek/svelte-email) - Original Svelte email library

## Support

If you find this project useful, please consider giving it a ⭐️ on GitHub!
