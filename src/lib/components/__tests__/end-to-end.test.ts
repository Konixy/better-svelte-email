import { describe, it, expect } from 'vitest';
import Renderer from '$lib/render/index.js';
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
			theme: {
				extend: {
					colors: {
						brand: '#ff3e00'
					}
				}
			}
		});
		const html = await renderer.render(TestEmail);

		// The bg-brand class should use the custom color from config
		expect(html).toMatchSnapshot();
	});
});
