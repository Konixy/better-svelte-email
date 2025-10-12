import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import Body from '../Body.svelte';
import Button from '../Button.svelte';
import Column from '../Column.svelte';
import Container from '../Container.svelte';
import Head from '../Head.svelte';
import Heading from '../Heading.svelte';
import Hr from '../Hr.svelte';
import Html from '../Html.svelte';
import Img from '../Img.svelte';
import Link from '../Link.svelte';
import Preview from '../Preview.svelte';
import Row from '../Row.svelte';
import Section from '../Section.svelte';
import Text from '../Text.svelte';

const testChildren = () => 'test';

describe('Component Rendering with style', () => {
	describe('Body', () => {
		it('should render body with table structure', () => {
			const result = render(Body, {
				props: {
					children: testChildren
				}
			});

			expect(result.body).toContain('<body');
			expect(result.body).toContain('</body>');
			expect(result.body).toContain('<table');
			expect(result.body).toContain('align="center"');
			expect(result.body).toContain('width="100%"');
			expect(result.body).toContain('role="presentation"');
		});

		it('should apply style to the td element', () => {
			const testStyles = 'background-color:rgb(243,244,246); padding:20px;';

			const result = render(Body, {
				props: {
					style: testStyles,
					children: testChildren
				}
			});

			expect(result.body).toContain('background-color:rgb(243,244,246)');
			expect(result.body).toContain('padding:20px');
		});

		it('should pass through HTML attributes', () => {
			const result = render(Body, {
				props: {
					class: 'email-body',
					id: 'main-body',
					children: testChildren
				}
			});

			expect(result.body).toContain('class="email-body"');
			expect(result.body).toContain('id="main-body"');
		});
	});

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

	describe('Column', () => {
		it('should render as td element', () => {
			const result = render(Column, {
				props: {
					children: testChildren
				}
			});

			expect(result.body).toContain('<td');
			expect(result.body).toContain('</td>');
		});

		it('should apply custom style', () => {
			const testStyles = 'background-color:rgb(243,244,246); padding:16px;';

			const result = render(Column, {
				props: {
					style: testStyles,
					children: testChildren
				}
			});

			expect(result.body).toContain('background-color:rgb(243,244,246)');
			expect(result.body).toContain('padding:16px');
		});

		it('should merge style with default styles', () => {
			const result = render(Column, {
				props: {
					style: 'vertical-align:top;',
					children: testChildren
				}
			});

			expect(result.body).toContain('vertical-align:top');
		});

		it('should handle colspan attribute', () => {
			const result = render(Column, {
				props: {
					colspan: 2,
					children: testChildren
				}
			});

			expect(result.body).toContain('colspan="2"');
		});

		it('should handle align attribute', () => {
			const result = render(Column, {
				props: {
					align: 'center',
					children: testChildren
				}
			});

			expect(result.body).toContain('align="center"');
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

	describe('Heading', () => {
		it('should render as h1 by default when as="h1" is specified', () => {
			const result = render(Heading, {
				props: {
					as: 'h1',
					children: testChildren
				}
			});

			expect(result.body).toContain('<h1');
			expect(result.body).toContain('</h1>');
		});

		it('should render different heading levels', () => {
			const levels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

			levels.forEach((level) => {
				const result = render(Heading, {
					props: {
						as: level,
						children: testChildren
					}
				});

				expect(result.body).toContain(`<${level}`);
				expect(result.body).toContain(`</${level}>`);
			});
		});

		it('should apply custom style', () => {
			const testStyles = 'color:rgb(37,99,235); font-size:32px; font-weight:700;';

			const result = render(Heading, {
				props: {
					as: 'h2',
					style: testStyles,
					children: testChildren
				}
			});

			expect(result.body).toContain('color:rgb(37,99,235)');
			expect(result.body).toContain('font-size:32px');
			expect(result.body).toContain('font-weight:700');
		});

		it('should apply margin shorthand (m)', () => {
			const result = render(Heading, {
				props: {
					as: 'h1',
					m: '20',
					children: testChildren
				}
			});

			expect(result.body).toContain('margin:20px');
		});

		it('should apply horizontal margin (mx)', () => {
			const result = render(Heading, {
				props: {
					as: 'h2',
					mx: '16',
					children: testChildren
				}
			});

			expect(result.body).toContain('margin-left:16px');
			expect(result.body).toContain('margin-right:16px');
		});

		it('should apply vertical margin (my)', () => {
			const result = render(Heading, {
				props: {
					as: 'h3',
					my: '24',
					children: testChildren
				}
			});

			expect(result.body).toContain('margin-top:24px');
			expect(result.body).toContain('margin-bottom:24px');
		});

		it('should apply individual margin props', () => {
			const result = render(Heading, {
				props: {
					as: 'h1',
					mt: '10',
					mr: '15',
					mb: '20',
					ml: '25',
					children: testChildren
				}
			});

			expect(result.body).toContain('margin-top:10px');
			expect(result.body).toContain('margin-right:15px');
			expect(result.body).toContain('margin-bottom:20px');
			expect(result.body).toContain('margin-left:25px');
		});

		it('should merge custom styles with margin styles', () => {
			const result = render(Heading, {
				props: {
					as: 'h2',
					style: 'color:blue; font-weight:600;',
					my: '16',
					children: testChildren
				}
			});

			// Margin styles should be present
			expect(result.body).toContain('margin-top:16px');
			expect(result.body).toContain('margin-bottom:16px');
			// Custom styles should be present
			expect(result.body).toContain('color:blue');
			expect(result.body).toContain('font-weight:600');
		});

		it('should handle empty style prop', () => {
			const result = render(Heading, {
				props: {
					as: 'h1',
					style: '',
					m: '10',
					children: testChildren
				}
			});

			expect(result.body).toContain('margin:10px');
		});

		it('should handle no margin props', () => {
			const result = render(Heading, {
				props: {
					as: 'h3',
					style: 'color:red;',
					children: testChildren
				}
			});

			expect(result.body).toContain('color:red');
			expect(result.body).toContain('<h3');
		});

		it('should pass through HTML attributes', () => {
			const result = render(Heading, {
				props: {
					as: 'h1',
					id: 'main-heading',
					class: 'heading-class',
					children: testChildren
				}
			});

			expect(result.body).toContain('id="main-heading"');
			expect(result.body).toContain('class="heading-class"');
		});

		it('should render with preprocessor-transformed Tailwind styles', () => {
			// Simulates preprocessor output: class="text-3xl font-bold text-blue-600 mb-4"
			const preprocessedStyles =
				'font-size:1.875rem; line-height:2.25rem; font-weight:700; color:rgb(37,99,235); margin-bottom:1rem;';

			const result = render(Heading, {
				props: {
					as: 'h1',
					style: preprocessedStyles,
					children: testChildren
				}
			});

			expect(result.body).toContain('font-size:1.875rem');
			expect(result.body).toContain('line-height:2.25rem');
			expect(result.body).toContain('font-weight:700');
			expect(result.body).toContain('color:rgb(37,99,235)');
			expect(result.body).toContain('margin-bottom:1rem');
		});

		it('should combine margin props with preprocessor styles', () => {
			const preprocessedStyles = 'font-size:2rem; font-weight:600; color:rgb(17,24,39);';

			const result = render(Heading, {
				props: {
					as: 'h2',
					style: preprocessedStyles,
					mt: '32',
					mb: '16',
					children: testChildren
				}
			});

			// Margin props should be applied
			expect(result.body).toContain('margin-top:32px');
			expect(result.body).toContain('margin-bottom:16px');
			// Preprocessor styles should be present
			expect(result.body).toContain('font-size:2rem');
			expect(result.body).toContain('font-weight:600');
			expect(result.body).toContain('color:rgb(17,24,39)');
		});
	});

	describe('Img', () => {
		it('should render img element with required attributes', () => {
			const result = render(Img, {
				props: {
					src: 'https://example.com/image.png',
					alt: 'Test Image',
					width: '600',
					height: '400'
				}
			});

			expect(result.body).toContain('<img');
			expect(result.body).toContain('src="https://example.com/image.png"');
			expect(result.body).toContain('alt="Test Image"');
			expect(result.body).toContain('width="600"');
			expect(result.body).toContain('height="400"');
		});

		it('should have default styles', () => {
			const result = render(Img, {
				props: {
					src: 'https://example.com/image.png',
					alt: 'Test',
					width: '100',
					height: '100'
				}
			});

			expect(result.body).toContain('display:block');
			expect(result.body).toContain('outline:none');
			expect(result.body).toContain('border:none');
			expect(result.body).toContain('text-decoration:none');
		});

		it('should apply custom style', () => {
			const testStyles = 'border-radius:8px; max-width:100%;';

			const result = render(Img, {
				props: {
					src: 'https://example.com/image.png',
					alt: 'Test',
					width: '600',
					height: '400',
					style: testStyles
				}
			});

			expect(result.body).toContain('border-radius:8px');
			expect(result.body).toContain('max-width:100%');
		});

		it('should merge custom style with default styles', () => {
			const result = render(Img, {
				props: {
					src: 'https://example.com/image.png',
					alt: 'Test',
					width: '100',
					height: '100',
					style: 'margin:20px;'
				}
			});

			// Default styles should be present
			expect(result.body).toContain('display:block');
			expect(result.body).toContain('border:none');
			// Custom style should be present
			expect(result.body).toContain('margin:20px');
		});

		it('should pass through additional HTML attributes', () => {
			const result = render(Img, {
				props: {
					src: 'https://example.com/image.png',
					alt: 'Test',
					width: '100',
					height: '100',
					class: 'email-image',
					id: 'header-logo'
				}
			});

			expect(result.body).toContain('class="email-image"');
			expect(result.body).toContain('id="header-logo"');
		});
	});

	describe('Link', () => {
		it('should render anchor element with href', () => {
			const result = render(Link, {
				props: {
					href: 'https://example.com',
					children: testChildren
				}
			});

			expect(result.body).toContain('<a');
			expect(result.body).toContain('href="https://example.com"');
			expect(result.body).toContain('</a>');
		});

		it('should have default target="_blank"', () => {
			const result = render(Link, {
				props: {
					href: 'https://example.com',
					children: testChildren
				}
			});

			expect(result.body).toContain('target="_blank"');
		});

		it('should allow custom target', () => {
			const result = render(Link, {
				props: {
					href: 'https://example.com',
					target: '_self',
					children: testChildren
				}
			});

			expect(result.body).toContain('target="_self"');
		});

		it('should have default styles', () => {
			const result = render(Link, {
				props: {
					href: 'https://example.com',
					children: testChildren
				}
			});

			expect(result.body).toContain('text-decoration-line:none');
			expect(result.body).toContain('color:#067df7');
		});

		it('should apply custom style', () => {
			const testStyles = 'color:rgb(255,0,0); font-weight:600;';

			const result = render(Link, {
				props: {
					href: 'https://example.com',
					style: testStyles,
					children: testChildren
				}
			});

			expect(result.body).toContain('color:rgb(255,0,0)');
			expect(result.body).toContain('font-weight:600');
		});

		it('should merge custom style with default styles', () => {
			const result = render(Link, {
				props: {
					href: 'https://example.com',
					style: 'font-size:18px;',
					children: testChildren
				}
			});

			// Default styles should be present
			expect(result.body).toContain('text-decoration-line:none');
			// Custom style should be present
			expect(result.body).toContain('font-size:18px');
		});

		it('should pass through additional HTML attributes', () => {
			const result = render(Link, {
				props: {
					href: 'https://example.com',
					class: 'email-link',
					id: 'cta-link',
					children: testChildren
				}
			});

			expect(result.body).toContain('class="email-link"');
			expect(result.body).toContain('id="cta-link"');
		});
	});

	describe('Preview', () => {
		it('should render preview div with text', () => {
			const previewText = 'This is a preview text for the email';

			const result = render(Preview, {
				props: {
					preview: previewText
				}
			});

			expect(result.body).toContain('<div');
			expect(result.body).toContain('This is a preview text for the email');
			expect(result.body).toContain('id="__better-svelte-email-preview"');
		});

		it('should have hidden styles', () => {
			const result = render(Preview, {
				props: {
					preview: 'Test preview'
				}
			});

			expect(result.body).toContain('display:none');
			expect(result.body).toContain('overflow:hidden');
			expect(result.body).toContain('line-height:1px');
			expect(result.body).toContain('opacity:0');
			expect(result.body).toContain('max-height:0');
			expect(result.body).toContain('max-width:0');
		});

		it('should have data-skip-in-text attribute', () => {
			const result = render(Preview, {
				props: {
					preview: 'Test preview'
				}
			});

			expect(result.body).toContain('data-skip-in-text');
		});

		it('should truncate preview text to max length', () => {
			const longText = 'A'.repeat(200);

			const result = render(Preview, {
				props: {
					preview: longText
				}
			});

			// Should only contain first 150 characters
			expect(result.body).toContain('A'.repeat(150));
			// Should not contain the full 200 characters as visible text
			const visibleText = result.body.match(/>[A]+</)?.[0] || '';
			expect(visibleText.length).toBeLessThan(202); // <> brackets + 200 chars
		});

		it('should add whitespace padding for short text', () => {
			const shortText = 'Short';

			const result = render(Preview, {
				props: {
					preview: shortText
				}
			});

			expect(result.body).toContain('Short');
			// Should have whitespace padding div
			expect(result.body).toMatch(/<div>[^<]*<\/div>/);
		});

		it('should pass through additional HTML attributes', () => {
			const result = render(Preview, {
				props: {
					preview: 'Test',
					class: 'custom-preview'
				}
			});

			expect(result.body).toContain('class="custom-preview"');
		});
	});

	describe('Row', () => {
		it('should render table structure', () => {
			const result = render(Row, {
				props: {
					children: testChildren
				}
			});

			expect(result.body).toContain('<table');
			expect(result.body).toContain('</table>');
			expect(result.body).toContain('<tbody');
			expect(result.body).toContain('<tr');
		});

		it('should have proper table attributes', () => {
			const result = render(Row, {
				props: {
					children: testChildren
				}
			});

			expect(result.body).toContain('align="center"');
			expect(result.body).toContain('width="100%"');
			expect(result.body).toContain('role="presentation"');
		});

		it('should apply style to table element', () => {
			const testStyles = 'background-color:rgb(243,244,246); margin:10px;';

			const result = render(Row, {
				props: {
					style: testStyles,
					children: testChildren
				}
			});

			expect(result.body).toContain('background-color:rgb(243,244,246)');
			expect(result.body).toContain('margin:10px');
		});

		it('should have width 100% on tbody and tr', () => {
			const result = render(Row, {
				props: {
					children: testChildren
				}
			});

			expect(result.body).toContain('style="width: 100%;"');
		});

		it('should pass through additional HTML attributes', () => {
			const result = render(Row, {
				props: {
					class: 'email-row',
					id: 'header-row',
					children: testChildren
				}
			});

			expect(result.body).toContain('class="email-row"');
			expect(result.body).toContain('id="header-row"');
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
