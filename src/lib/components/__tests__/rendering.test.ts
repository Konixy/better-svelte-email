import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import Button from '../Button.svelte';
import Container from '../Container.svelte';
import Head from '../Head.svelte';
import Html from '../Html.svelte';
import Section from '../Section.svelte';
import Text from '../Text.svelte';
import Hr from '../Hr.svelte';

const testChildren = () => 'test';

describe('Component Rendering with style', () => {
	describe('Button', () => {
		it('should apply style to the anchor element', () => {
			const testStyles = 'background-color:rgb(59,130,246); color:rgb(255,255,255); padding:16px;';

			const result = render(Button, {
				props: {
					style: testStyles,
					href: 'https://example.com',
					children: testChildren
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

		it('should merge style with base button styles', () => {
			const result = render(Button, {
				props: {
					style: 'background-color:blue;',
					children: testChildren
				}
			});

			// Base styles should be present
			expect(result.body).toContain('text-decoration:none');
			expect(result.body).toContain('display:inline-block');
			// Custom style should be present
			expect(result.body).toContain('background-color:blue');
		});

		it('should handle empty style', () => {
			const result = render(Button, {
				props: {
					style: '',
					children: testChildren
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
					style: styles,
					children: testChildren
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
		it('should apply style to the table element', () => {
			const testStyles = 'background-color:rgb(243,244,246); padding:32px;';

			const result = render(Container, {
				props: {
					style: testStyles,
					children: testChildren
				}
			});

			expect(result.body).toContain('background-color:rgb(243,244,246)');
			expect(result.body).toContain('padding:32px');
			expect(result.body).toContain('<table');
		});

		it('should merge style with base container styles', () => {
			const result = render(Container, {
				props: {
					style: 'padding:20px;',
					children: testChildren
				}
			});

			// Base max-width should be present
			expect(result.body).toContain('max-width:37.5em');
			// Custom style should be present
			expect(result.body).toContain('padding:20px');
		});

		it('should have default max-width', () => {
			const result = render(Container, {
				props: {
					children: testChildren
				}
			});

			expect(result.body).toContain('max-width:37.5em');
		});
	});

	describe('Text', () => {
		it('should apply style to the paragraph element', () => {
			const testStyles = 'color:rgb(55,65,81); font-size:18px; font-weight:600;';

			const result = render(Text, {
				props: {
					style: testStyles,
					children: testChildren
				}
			});

			expect(result.body).toContain('color:rgb(55,65,81)');
			expect(result.body).toContain('font-size:18px');
			expect(result.body).toContain('font-weight:600');
			expect(result.body).toContain('<p');
		});

		it('should merge style with base text styles', () => {
			const result = render(Text, {
				props: {
					style: 'color:red;',
					children: testChildren
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
					style: 'font-size:32px;',
					children: testChildren
				}
			});

			expect(result.body).toContain('<h1');
			expect(result.body).toContain('font-size:32px');
		});

		it('should have default text styles', () => {
			const result = render(Text, {
				props: {
					children: testChildren
				}
			});

			expect(result.body).toContain('font-size:14px');
			expect(result.body).toContain('line-height:24px');
			expect(result.body).toContain('margin:16px 0');
		});
	});

	describe('Section', () => {
		it('should apply style to the table element', () => {
			const testStyles = 'padding:20px; background-color:rgb(255,255,255);';

			const result = render(Section, {
				props: {
					style: testStyles,
					children: testChildren
				}
			});

			expect(result.body).toContain('padding:20px');
			expect(result.body).toContain('background-color:rgb(255,255,255)');
			expect(result.body).toContain('<table');
			expect(result.body).toContain('role="presentation"');
		});
	});

	describe('Html', () => {
		it('should apply style to the html element', () => {
			const testStyles = 'background-color:rgb(255,255,255);';

			const result = render(Html, {
				props: {
					style: testStyles,
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

	describe('Hr', () => {
		it('should have default styles along with custom styles', () => {
			const result = render(Hr, {
				props: {
					style: 'border-color:red;'
				}
			});

			expect(result.body).toContain('<hr');
			expect(result.body).toContain('width:100%;');
			expect(result.body).toContain('border:none;');
			expect(result.body).toContain('border-top:1px solid #eaeaea;');
			expect(result.body).toContain('border-color:red');
		});
	});

	describe('Preprocessor Output Simulation', () => {
		it('should render Button with preprocessor-transformed styles', () => {
			// This simulates what the preprocessor outputs:
			// class="bg-blue-500 text-white p-4" becomes style="..."
			const preprocessedStyles =
				'background-color:rgb(59,130,246); color:rgb(255,255,255); padding:16px;';

			const result = render(Button, {
				props: {
					style: preprocessedStyles,
					href: 'https://example.com',
					children: testChildren
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
					style: preprocessedStyles,
					children: testChildren
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
					style: preprocessedStyles,
					children: testChildren
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
					style: 'background-color:rgb(59,130,246);',
					href: '#',
					children: testChildren
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
		it('should handle style with trailing semicolon', () => {
			const result = render(Text, {
				props: {
					style: 'color:red;',
					children: testChildren
				}
			});

			expect(result.body).toContain('color:red');
			// Check for no double semicolons (;;)
			expect(result.body).not.toMatch(/;;/);
		});

		it('should handle style without trailing semicolon', () => {
			const result = render(Text, {
				props: {
					style: 'color:blue',
					children: testChildren
				}
			});

			expect(result.body).toContain('color:blue');
		});

		it('should handle complex Tailwind-converted styles', () => {
			const complexStyles =
				'display:flex; align-items:center; justify-content:space-between; padding:16px 24px; background-color:rgb(239,246,255); border:1px solid rgb(191,219,254); border-radius:8px;';

			const result = render(Container, {
				props: {
					style: complexStyles,
					children: testChildren
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
