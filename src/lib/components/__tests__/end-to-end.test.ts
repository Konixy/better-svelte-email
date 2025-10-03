import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import TestEmail from '$lib/emails/test-email.svelte';

describe('End-to-End Component Rendering with Tailwind', () => {
	it('should render component with Tailwind classes converted to inline styles', () => {
		const result = render(TestEmail, {
			props: {}
		});

		// Container should have bg-gray-100 and p-8 converted to inline styles
		expect(result.body).toContain('background-color:rgb(243,244,246)');
		expect(result.body).toContain('padding:2rem'); // p-8 = 2rem

		// Text should have text-lg, font-bold, text-blue-600 converted
		expect(result.body).toContain('font-size:1.125rem'); // text-lg
		expect(result.body).toContain('font-weight:700'); // font-bold
		expect(result.body).toContain('color:rgb(37,99,235)'); // text-blue-600

		// Button should have bg-blue-500, text-white, px-4, py-2, rounded converted
		expect(result.body).toContain('background-color:rgb(59,130,246)');
		expect(result.body).toContain('color:rgb(255,255,255)');
		expect(result.body).toContain('padding-left:1rem'); // px-4 = 1rem
		expect(result.body).toContain('padding-right:1rem');
		expect(result.body).toContain('padding-top:0.5rem'); // py-2 = 0.5rem
		expect(result.body).toContain('padding-bottom:0.5rem');
		expect(result.body).toContain('border-radius:0.25rem'); // rounded
	});

	it('should not have class attributes with Tailwind classes', () => {
		const result = render(TestEmail, {
			props: {}
		});

		// Original Tailwind classes should be removed/converted
		expect(result.body).not.toContain('class="bg-gray-100');
		expect(result.body).not.toContain('class="text-lg');
		expect(result.body).not.toContain('class="bg-blue-500');
	});

	it('should have inline styles in the rendered HTML', () => {
		const result = render(TestEmail, {
			props: {}
		});

		// After rendering, styleString prop becomes style attribute in HTML
		// Components receive styleString and apply it to their style attribute
		expect(result.body).toContain('style=');

		// Verify styles are actually applied (not just attributes present)
		const hasInlineBackgroundColor = result.body.includes('background-color:rgb(243,244,246)');
		const hasInlineTextColor = result.body.includes('color:rgb(37,99,235)');
		const hasInlineButtonColor = result.body.includes('background-color:rgb(59,130,246)');

		expect(hasInlineBackgroundColor).toBe(true);
		expect(hasInlineTextColor).toBe(true);
		expect(hasInlineButtonColor).toBe(true);
	});
});
