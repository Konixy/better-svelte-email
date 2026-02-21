import { describe, it, expect } from 'vitest';
import { Renderer } from '@better-svelte-email/server';
import TestEmail from './__fixtures__/test-email.svelte';

describe('End-to-End Email Rendering', () => {
	it('should render a complete email with all Tailwind classes inlined', async () => {
		const renderer = new Renderer();
		const html = await renderer.render(TestEmail);

		// Snapshot captures:
		// - All Tailwind classes converted to inline styles
		// - Proper HTML structure with email-safe DOCTYPE
		// - All components rendered correctly
		// - Mixed inline styles and Tailwind classes handled properly
		expect(html).toMatchSnapshot();
	});

	it('should handle custom Tailwind config (bg-brand color)', async () => {
		const renderer = new Renderer({
			tailwindConfig: {
				theme: {
					extend: {
						colors: {
							brand: '#ff3e00'
						}
					}
				}
			}
		});
		const html = await renderer.render(TestEmail);

		// The bg-brand class should use the custom color from config
		expect(html).toMatchSnapshot();
	});

	describe('customCSS option', () => {
		it('should inject custom CSS variables and resolve them', async () => {
			const renderer = new Renderer({
				customCSS: `
					:root {
						--primary: #ff0000;
						--secondary: #00ff00;
					}
				`
			});
			const html = await renderer.render(TestEmail);

			// Custom CSS should be parsed and available for variable resolution
			expect(html).toMatchSnapshot();
		});

		it('should convert oklch colors from custom CSS to rgb', async () => {
			const renderer = new Renderer({
				customCSS: `
					:root {
						--brand-color: oklch(0.7 0.2 250);
					}
				`
			});
			const html = await renderer.render(TestEmail);

			// OKLch colors should be converted to rgb by sanitize-declarations
			expect(html).toMatchSnapshot();
		});

		it('should combine tailwindConfig and customCSS', async () => {
			const renderer = new Renderer({
				tailwindConfig: {
					theme: {
						extend: {
							colors: {
								brand: '#ff3e00'
							}
						}
					}
				},
				customCSS: `
					:root {
						--app-background: #f5f5f5;
					}
				`
			});
			const html = await renderer.render(TestEmail);

			// Both tailwindConfig and customCSS should be applied
			expect(html).toMatchSnapshot();
		});

		it('should resolve nested CSS variables from shadcn semantic colors', async () => {
			const renderer = new Renderer({
				customCSS: `
					:root {
						--background: oklch(98.5% 0.001 106.423);
						--foreground: oklch(21.6% 0.006 56.043);
						--primary: oklch(0.216 0.006 56.043);
						--primary-foreground: oklch(0.985 0.001 106.423);
					}

					@theme {
						--color-background: var(--background);
						--color-foreground: var(--foreground);
						--color-primary: var(--primary);
						--color-primary-foreground: var(--primary-foreground);
					}
				`
			});

			const ShadcnTest = (await import('./__fixtures__/shadcn-demo.svelte')).default;
			const html = await renderer.render(ShadcnTest, { props: { name: 'Test' } });

			// Verify nested variables are fully resolved
			expect(html).not.toContain('var(--background)');
			expect(html).not.toContain('var(--color-background)');
			expect(html).not.toContain('var(--foreground)');
			expect(html).not.toContain('var(--color-foreground)');
			expect(html).not.toContain('var(--primary)');
			expect(html).not.toContain('var(--color-primary)');

			// Verify actual color values are present (converted to rgb)
			expect(html).toMatch(/rgb\(/);
		});
	});
});
