import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import Button from '../Button.svelte';
import Container from '../Container.svelte';
import Head from '../Head.svelte';
import Html from '../Html.svelte';
import Section from '../Section.svelte';
import Text from '../Text.svelte';

describe('Component Rendering with styleString', () => {
	describe('Button', () => {
		it('should apply styleString to the anchor element', () => {
			const testStyles = 'background-color:rgb(59,130,246); color:rgb(255,255,255); padding:16px;';

			const result = render(Button, {
				props: {
					styleString: testStyles,
					href: 'https://example.com'
				}
			});

			// Check that styles are applied
			expect(result.body).toContain('background-color:rgb(59,130,246)');
			expect(result.body).toContain('color:rgb(255,255,255)');
			expect(result.body).toContain('padding:16px');
			expect(result.body).toContain('href="https://example.com"');

			// Verify it's an anchor tag with style attribute
			expect(result.body).toContain('<a');
			expect(result.body).toContain('style=');
		});

		it('should merge styleString with base button styles', () => {
			const result = render(Button, {
				props: {
					styleString: 'background-color:blue;'
				}
			});

			// Base styles should be present
			expect(result.body).toContain('text-decoration:none');
			expect(result.body).toContain('display:inline-block');
			// Custom style should be present
			expect(result.body).toContain('background-color:blue');
		});

		it('should handle empty styleString', () => {
			const result = render(Button, {
				props: {
					styleString: ''
				}
			});

			// Should still have base styles
			expect(result.body).toContain('style=');
			expect(result.body).toContain('text-decoration');
		});

		it('should properly separate styles with semicolons', () => {
			const styles =
				'background-color:rgb(59,130,246); color:rgb(255,255,255); padding:16px; border-radius:4px;';

			const result = render(Button, {
				props: {
					styleString: styles
				}
			});

			// All styles should be in the output
			const styleMatch = result.body.match(/style="([^"]*)"/);
			expect(styleMatch).toBeTruthy();

			if (styleMatch) {
				const styleContent = styleMatch[1];
				expect(styleContent).toContain('background-color:rgb(59,130,246)');
				expect(styleContent).toContain('color:rgb(255,255,255)');
				expect(styleContent).toContain('padding:16px');
				expect(styleContent).toContain('border-radius:4px');
			}
		});
	});

	describe('Container', () => {
		it('should apply styleString to the table element', () => {
			const testStyles = 'background-color:rgb(243,244,246); padding:32px;';

			const result = render(Container, {
				props: {
					styleString: testStyles
				}
			});

			expect(result.body).toContain('background-color:rgb(243,244,246)');
			expect(result.body).toContain('padding:32px');
			expect(result.body).toContain('<table');
		});

		it('should merge styleString with base container styles', () => {
			const result = render(Container, {
				props: {
					styleString: 'padding:20px;'
				}
			});

			// Base max-width should be present
			expect(result.body).toContain('max-width:37.5em');
			// Custom style should be present
			expect(result.body).toContain('padding:20px');
		});

		it('should have default max-width', () => {
			const result = render(Container, {
				props: {}
			});

			expect(result.body).toContain('max-width:37.5em');
		});
	});

	describe('Text', () => {
		it('should apply styleString to the paragraph element', () => {
			const testStyles = 'color:rgb(55,65,81); font-size:18px; font-weight:600;';

			const result = render(Text, {
				props: {
					styleString: testStyles
				}
			});

			expect(result.body).toContain('color:rgb(55,65,81)');
			expect(result.body).toContain('font-size:18px');
			expect(result.body).toContain('font-weight:600');
			expect(result.body).toContain('<p');
		});

		it('should merge styleString with base text styles', () => {
			const result = render(Text, {
				props: {
					styleString: 'color:red;'
				}
			});

			// Base styles should be present
			expect(result.body).toContain('font-size:14px');
			expect(result.body).toContain('line-height:24px');
			// Custom style should be present
			expect(result.body).toContain('color:red');
		});

		it('should render with custom element tag', () => {
			const result = render(Text, {
				props: {
					as: 'h1',
					styleString: 'font-size:32px;'
				}
			});

			expect(result.body).toContain('<h1');
			expect(result.body).toContain('font-size:32px');
		});

		it('should have default text styles', () => {
			const result = render(Text, {
				props: {}
			});

			expect(result.body).toContain('font-size:14px');
			expect(result.body).toContain('line-height:24px');
			expect(result.body).toContain('margin:16px 0');
		});
	});

	describe('Section', () => {
		it('should apply styleString to the table element', () => {
			const testStyles = 'padding:20px; background-color:rgb(255,255,255);';

			const result = render(Section, {
				props: {
					styleString: testStyles
				}
			});

			expect(result.body).toContain('padding:20px');
			expect(result.body).toContain('background-color:rgb(255,255,255)');
			expect(result.body).toContain('<table');
			expect(result.body).toContain('role="presentation"');
		});
	});

	describe('Html', () => {
		it('should apply styleString to the html element', () => {
			const testStyles = 'background-color:rgb(255,255,255);';

			const result = render(Html, {
				props: {
					styleString: testStyles,
					lang: 'en'
				}
			});

			expect(result.body).toContain('background-color:rgb(255,255,255)');
			expect(result.body).toContain('lang="en"');
			expect(result.body).toContain('<!DOCTYPE html');
			expect(result.body).toContain('<html');
		});

		it('should render with RTL direction', () => {
			const result = render(Html, {
				props: {
					lang: 'ar',
					dir: 'rtl'
				}
			});

			expect(result.body).toContain('dir="rtl"');
			expect(result.body).toContain('lang="ar"');
		});

		it('should have default lang and dir attributes', () => {
			const result = render(Html, {
				props: {}
			});

			expect(result.body).toContain('lang="en"');
			expect(result.body).toContain('dir="ltr"');
		});
	});

	describe('Head', () => {
		it('should render with meta tags', () => {
			const result = render(Head, {
				props: {}
			});

			expect(result.body).toContain('<head>');
			expect(result.body).toContain('http-equiv="content-type"');
			expect(result.body).toContain('name="viewport"');
			expect(result.body).toContain('width=device-width');
		});
	});

	describe('Preprocessor Output Simulation', () => {
		it('should render Button with preprocessor-transformed styles', () => {
			// This simulates what the preprocessor outputs:
			// class="bg-blue-500 text-white p-4" becomes styleString="..."
			const preprocessedStyles =
				'background-color:rgb(59,130,246); color:rgb(255,255,255); padding:16px;';

			const result = render(Button, {
				props: {
					styleString: preprocessedStyles,
					href: 'https://example.com'
				}
			});

			const styleMatch = result.body.match(/style="([^"]*)"/);
			expect(styleMatch).toBeTruthy();

			if (styleMatch) {
				const styleAttr = styleMatch[1];
				// Verify all preprocessor-generated styles are present
				expect(styleAttr).toContain('background-color:rgb(59,130,246)');
				expect(styleAttr).toContain('color:rgb(255,255,255)');
				expect(styleAttr).toContain('padding:16px');
				// Verify base component styles are also present
				expect(styleAttr).toContain('text-decoration:none');
			}
		});

		it('should render Container with preprocessor-transformed styles', () => {
			const preprocessedStyles =
				'background-color:rgb(243,244,246); padding:32px; border-radius:8px;';

			const result = render(Container, {
				props: {
					styleString: preprocessedStyles
				}
			});

			expect(result.body).toContain('background-color:rgb(243,244,246)');
			expect(result.body).toContain('padding:32px');
			expect(result.body).toContain('border-radius:8px');
			expect(result.body).toContain('max-width:37.5em'); // Base style
		});

		it('should render Text with preprocessor-transformed styles', () => {
			const preprocessedStyles =
				'color:rgb(55,65,81); font-size:18px; font-weight:600; margin-bottom:16px;';

			const result = render(Text, {
				props: {
					styleString: preprocessedStyles
				}
			});

			expect(result.body).toContain('color:rgb(55,65,81)');
			expect(result.body).toContain('font-size:18px');
			expect(result.body).toContain('font-weight:600');
			expect(result.body).toContain('margin-bottom:16px');
		});

		it('should handle responsive classes in class attribute', () => {
			// After preprocessor, responsive classes are sanitized
			const result = render(Button, {
				props: {
					class: 'sm_bg_red_500 md_p_6',
					styleString: 'background-color:rgb(59,130,246);',
					href: '#'
				}
			});

			// Responsive classes should be in class attribute
			expect(result.body).toContain('sm_bg_red_500');
			expect(result.body).toContain('md_p_6');
			// Base styles should be in style attribute
			expect(result.body).toContain('background-color:rgb(59,130,246)');
		});
	});

	describe('Edge Cases', () => {
		it('should handle styleString with trailing semicolon', () => {
			const result = render(Text, {
				props: {
					styleString: 'color:red;'
				}
			});

			expect(result.body).toContain('color:red');
			// Check for no double semicolons (;;)
			expect(result.body).not.toMatch(/;;/);
		});

		it('should handle styleString without trailing semicolon', () => {
			const result = render(Text, {
				props: {
					styleString: 'color:blue'
				}
			});

			expect(result.body).toContain('color:blue');
		});

		it('should handle complex Tailwind-converted styles', () => {
			const complexStyles =
				'display:flex; align-items:center; justify-content:space-between; padding:16px 24px; background-color:rgb(239,246,255); border:1px solid rgb(191,219,254); border-radius:8px;';

			const result = render(Container, {
				props: {
					styleString: complexStyles
				}
			});

			expect(result.body).toContain('display:flex');
			expect(result.body).toContain('align-items:center');
			expect(result.body).toContain('justify-content:space-between');
			expect(result.body).toContain('padding:16px 24px');
			expect(result.body).toContain('background-color:rgb(239,246,255)');
			expect(result.body).toContain('border:1px solid rgb(191,219,254)');
			expect(result.body).toContain('border-radius:8px');
		});
	});
});
