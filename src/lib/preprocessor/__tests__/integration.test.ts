import { describe, it, expect } from 'vitest';
import { betterSvelteEmailPreprocessor } from '../index.js';

describe('betterSvelteEmailPreprocessor', () => {
	it('should transform simple email component', async () => {
		const preprocessor = betterSvelteEmailPreprocessor();

		const input = `
			<script>
				import { Button, Head, Html } from 'better-svelte-email';
			</script>

			<Html>
				<Head />
				<Button class="bg-blue-500 text-white p-4">Click</Button>
			</Html>
		`;

		const result = await preprocessor.markup?.({
			content: input,
			filename: '/src/lib/emails/test.svelte'
		});

		expect(result).toBeDefined();
		if (result && 'code' in result) {
			expect(result.code).toContain('styleString=');
			expect(result.code).toContain('background-color');
			expect(result.code).toContain('color');
			expect(result.code).toContain('padding');
		}
	});

	it('should inject media queries for responsive classes', async () => {
		const preprocessor = betterSvelteEmailPreprocessor();

		const input = `
			<script>
				import { Button, Head, Html } from 'better-svelte-email';
			</script>

			<Html>
				<Head />
				<Button class="bg-blue-500 sm:bg-red-500 mx-5">Click</Button>
			</Html>
		`;

		const result = await preprocessor.markup?.({
			content: input,
			filename: '/src/lib/emails/test.svelte'
		});

		if (result && 'code' in result) {
			expect(result.code).toContain('<Head>');
			expect(result.code).toContain('</Head>');
			expect(result.code).toContain('@media');
			expect(result.code).toContain('<style>');
			expect(result.code).toContain('!important');
		}
	});

	it('should skip files outside email folder', async () => {
		const preprocessor = betterSvelteEmailPreprocessor({
			pathToEmailFolder: '/src/lib/emails'
		});

		const input = `<Button class="bg-blue-500">Click</Button>`;

		const result = await preprocessor.markup?.({
			content: input,
			filename: '/src/lib/components/button.svelte'
		});

		expect(result).toBeUndefined();
	});

	it('should handle custom email folder path', async () => {
		const preprocessor = betterSvelteEmailPreprocessor({
			pathToEmailFolder: '/src/custom-emails'
		});

		const input = `
			<Html>
				<Head />
				<Button class="p-4">Click</Button>
			</Html>
		`;

		const result = await preprocessor.markup?.({
			content: input,
			filename: '/src/custom-emails/welcome.svelte'
		});

		expect(result).toBeDefined();
		if (result && 'code' in result) {
			expect(result.code).toContain('styleString=');
		}
	});

	it('should handle components without classes', async () => {
		const preprocessor = betterSvelteEmailPreprocessor();

		const input = `
			<Html>
				<Head />
				<Button>Click</Button>
			</Html>
		`;

		const result = await preprocessor.markup?.({
			content: input,
			filename: '/src/lib/emails/test.svelte'
		});

		expect(result).toBeDefined();
		// Should return code even if no transformation happened
		if (result && 'code' in result) {
			expect(result.code).toContain('Click');
		}
	});

	it('should handle nested components', async () => {
		const preprocessor = betterSvelteEmailPreprocessor();

		const input = `
			<Html>
				<Head />
				<Container class="bg-gray-100 p-8">
					<Button class="bg-blue-500 text-white">Click</Button>
				</Container>
			</Html>
		`;

		const result = await preprocessor.markup?.({
			content: input,
			filename: '/src/lib/emails/test.svelte'
		});

		expect(result).toBeDefined();
		// Should transform both Container and Button
		if (result && 'code' in result) {
			const styleStringCount = (result.code.match(/styleString=/g) || []).length;
			expect(styleStringCount).toBe(2);
		}
	});

	it('should preserve non-class attributes', async () => {
		const preprocessor = betterSvelteEmailPreprocessor();

		const input = `
			<Html>
				<Head />
				<Button href="https://example.com" class="bg-blue-500">Click</Button>
			</Html>
		`;

		const result = await preprocessor.markup?.({
			content: input,
			filename: '/src/lib/emails/test.svelte'
		});

		if (result && 'code' in result) {
			expect(result.code).toContain('href="https://example.com"');
			expect(result.code).toContain('styleString=');
		}
	});

	it('should handle multiple responsive classes', async () => {
		const preprocessor = betterSvelteEmailPreprocessor();

		const input = `
			<Html>
				<Head />
				<Button class="p-4 sm:p-6 md:p-8">Click</Button>
			</Html>
		`;

		const result = await preprocessor.markup?.({
			content: input,
			filename: '/src/lib/emails/test.svelte'
		});

		if (result && 'code' in result) {
			expect(result.code).toContain('@media');
			expect(result.code).toContain('styleString=');
		}
	});

	it('should handle conditional blocks', async () => {
		const preprocessor = betterSvelteEmailPreprocessor();

		const input = `
			<Html>
				<Head />
				{#if showButton}
					<Button class="bg-blue-500">Click</Button>
				{/if}
			</Html>
		`;

		const result = await preprocessor.markup?.({
			content: input,
			filename: '/src/lib/emails/test.svelte'
		});

		expect(result).toBeDefined();
		if (result && 'code' in result) {
			expect(result.code).toContain('styleString=');
		}
	});

	it('should handle each blocks', async () => {
		const preprocessor = betterSvelteEmailPreprocessor();

		const input = `
			<Html>
				<Head />
				{#each items as item}
					<Button class="bg-blue-500">{item}</Button>
				{/each}
			</Html>
		`;

		const result = await preprocessor.markup?.({
			content: input,
			filename: '/src/lib/emails/test.svelte'
		});

		expect(result).toBeDefined();
		if (result && 'code' in result) {
			expect(result.code).toContain('styleString=');
		}
	});

	it('should replace class attribute correctly', async () => {
		const preprocessor = betterSvelteEmailPreprocessor();

		const input = `<Html><Head /><Button class="bg-blue-500">Click</Button></Html>`;

		const result = await preprocessor.markup?.({
			content: input,
			filename: '/src/lib/emails/test.svelte'
		});

		// Old class attribute should be replaced
		if (result && 'code' in result) {
			expect(result.code).not.toContain('class="bg-blue-500"');
			// New styleString attribute should be present
			expect(result.code).toContain('styleString=');
		}
	});

	it('should work with debug mode', async () => {
		const preprocessor = betterSvelteEmailPreprocessor({ debug: true });

		const input = `
			<Html>
				<Head />
				<Button class="bg-blue-500">Click</Button>
			</Html>
		`;

		const result = await preprocessor.markup?.({
			content: input,
			filename: '/src/lib/emails/test.svelte'
		});

		expect(result).toBeDefined();
	});

	it('should handle HTML elements alongside components', async () => {
		const preprocessor = betterSvelteEmailPreprocessor();

		const input = `
			<Html>
				<Head />
				<div class="bg-gray-100">
					<Button class="bg-blue-500">Click</Button>
				</div>
			</Html>
		`;

		const result = await preprocessor.markup?.({
			content: input,
			filename: '/src/lib/emails/test.svelte'
		});

		expect(result).toBeDefined();
		if (result && 'code' in result) {
			const styleStringCount = (result.code.match(/styleString=/g) || []).length;
			expect(styleStringCount).toBe(2);
		}
	});
});
