import Renderer, { toPlainText } from './index.js';
import { expect, describe, it } from 'vitest';
import BasicComponent from './__fixtures__/BasicComponent.svelte';
import ResponsiveComponent from './__fixtures__/ResponsiveComponent.svelte';
import NoHeadComponent from './__fixtures__/NoHeadComponent.svelte';
import PropsComponent from './__fixtures__/PropsComponent.svelte';

describe('Renderer', () => {
	it('renders a basic component with Tailwind classes', async () => {
		const renderer = new Renderer();
		const html = await renderer.render(BasicComponent);

		expect(html).toContain('<!DOCTYPE html PUBLIC');
		expect(html).toContain('text-align: center');
		expect(html).toContain('background-color');
		expect(html).toContain('Hello World');
		// Classes should be inlined, not kept in class attribute
		expect(html).not.toContain('class="text-center bg-red-500"');
	});

	it('handles components with responsive classes', async () => {
		const renderer = new Renderer();
		const html = await renderer.render(ResponsiveComponent);

		// Should have inline styles for base class
		expect(html).toContain('text-align: center');
		// Should have a style tag with media query
		expect(html).toContain('<style>');
		expect(html).toContain('@media');
		expect(html).toContain('Responsive Text');
	});

	it('automatically adds head tag for non-inlinable classes', async () => {
		// Parse5 automatically adds a head tag even if not in source
		// So non-inlinable classes will be handled properly
		const renderer = new Renderer();
		const html = await renderer.render(NoHeadComponent);

		expect(html).toContain('<style>');
		expect(html).toContain('@media');
		expect(html).toContain('No Head Tag');
	});

	it('combines existing inline styles with Tailwind utilities', async () => {
		const { default: Component } = await import('./__fixtures__/CombinedStylesComponent.svelte');
		const renderer = new Renderer();
		const html = await renderer.render(Component);

		expect(html).toContain('font-weight: bold');
		expect(html).toContain('text-align: center');
	});

	it('accepts Tailwind config options', async () => {
		const { default: Component } = await import('./__fixtures__/CustomColorComponent.svelte');

		// Mock console.warn to capture warnings
		const originalWarn = console.warn;
		let warnMessage = '';
		console.warn = (msg: string) => {
			warnMessage = msg;
		};

		const renderer = new Renderer({
			tailwindConfig: {
				theme: {
					extend: {
						colors: {
							'custom-color': '#123456'
						}
					}
				}
			}
		});
		const html = await renderer.render(Component);

		console.warn = originalWarn;

		expect(html).toContain('Custom Color');
		expect(warnMessage).toBe('');
		// The custom color class should be recognized with the config
	});

	it('handles components with props', async () => {
		const renderer = new Renderer();
		const html = await renderer.render(PropsComponent, { props: { name: 'Svelte' } });

		expect(html).toContain('Hello Svelte');
		expect(html).toContain('text-align: center');
	});

	it('removes comments from output', async () => {
		const { default: Component } = await import('./__fixtures__/CommentsComponent.svelte');
		const renderer = new Renderer();
		const html = await renderer.render(Component);

		expect(html).not.toContain('<!-- This is a comment -->');
		expect(html).not.toContain('<!-- Another comment -->');
		expect(html).toContain('Content');
	});

	it('handles multiple classes on same element', async () => {
		const { default: Component } = await import('./__fixtures__/MultipleClassesComponent.svelte');
		const renderer = new Renderer();
		const html = await renderer.render(Component);

		expect(html).toContain('text-align: center');
		expect(html).toContain('background-color');
		expect(html).toContain('padding');
		expect(html).toContain('font-weight');
	});

	it('preserves DOCTYPE declaration', async () => {
		const renderer = new Renderer();
		const html = await renderer.render(BasicComponent);

		expect(html).toContain('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"');
	});

	it('handles empty components', async () => {
		const { default: Component } = await import('./__fixtures__/EmptyComponent.svelte');
		const renderer = new Renderer();
		const html = await renderer.render(Component);

		expect(html).toContain('<html');
		expect(html).toContain('<head>');
		expect(html).toContain('<body>');
	});

	it('warns about unknown classes', async () => {
		const { default: Component } = await import('./__fixtures__/UnknownClassComponent.svelte');

		// Mock console.warn to capture the warning
		const originalWarn = console.warn;
		let warnMessage = '';
		console.warn = (msg: string) => {
			warnMessage = msg;
		};

		const renderer = new Renderer();
		const html = await renderer.render(Component);

		console.warn = originalWarn;

		expect(warnMessage).toContain('unknown-class');
		expect(html).toContain('Content');
	});

	it('handles nested elements with classes', async () => {
		const { default: Component } = await import('./__fixtures__/NestedComponent.svelte');
		const renderer = new Renderer();
		const html = await renderer.render(Component);

		expect(html).toContain('Nested');
		expect(html).toContain('text-align: center');
		expect(html).toContain('font-weight');
	});

	describe('Renderer constructor backward compatibility', () => {
		it('accepts Tailwind config as the only argument (old API)', async () => {
			const { default: Component } = await import('./__fixtures__/CustomColorComponent.svelte');
			const renderer = new Renderer({
				theme: {
					extend: {
						colors: {
							'custom-color': '#112233'
						}
					}
				}
			});
			const html = await renderer.render(Component);
			// Tailwind might convert hex to rgb
			expect(html).toMatch(/color:\s*(#112233|rgb\(17,\s*34,\s*51\))/);
		});

		it('accepts options object with tailwindConfig (new API)', async () => {
			const renderer = new Renderer({
				tailwindConfig: {
					theme: {
						extend: {
							colors: {
								'custom-color': '#445566'
							}
						}
					}
				}
			});
			const { default: Component } = await import('./__fixtures__/CustomColorComponent.svelte');
			const html = await renderer.render(Component);
			// Tailwind might convert hex to rgb
			expect(html).toMatch(/color:\s*(#445566|rgb\(68,\s*85,\s*102\))/);
		});

		it('supports customCSS with @property for variable resolution in tailwind classes', async () => {
			const renderer = new Renderer({
				tailwindConfig: {
					theme: {
						extend: {
							colors: {
								'custom-color': 'var(--my-color)'
							}
						}
					}
				},
				customCSS:
					'@property --my-color { syntax: "<color>"; inherits: false; initial-value: #00ff00; }'
			});
			const { default: Component } = await import('./__fixtures__/CustomColorComponent.svelte');
			const html = await renderer.render(Component);

			// The variable should be resolved in the style attribute because it's used in a tailwind class
			expect(html).toMatch(/color:\s*(#00ff00|rgb\(0,\s*255,\s*0\))/);
		});

		it('accepts options object with both tailwindConfig and customCSS', async () => {
			const renderer = new Renderer({
				tailwindConfig: { theme: { extend: { colors: { test: '#000' } } } },
				customCSS: '.test { color: red; }'
			});
			expect(renderer).toBeDefined();
		});
	});

	it('handles custom properties and CSS variables', async () => {
		const { default: Component } = await import('./__fixtures__/VariablesComponent.svelte');
		const renderer = new Renderer();
		const html = await renderer.render(Component);

		expect(html).toContain('Variable Color');
		expect(html).toContain('text-align: center');
	});

	it('handles components using library email components', async () => {
		const { default: Component } = await import('./__fixtures__/LibraryComponentsTest.svelte');
		const renderer = new Renderer();
		const html = await renderer.render(Component);

		expect(html).toContain('<!DOCTYPE html PUBLIC');
		expect(html).toContain('<head>');
		expect(html).toContain('<body>');
		expect(html).toContain('Test Email');
	});
});

describe('Global CSS selectors (issue #46)', () => {
	it('should apply universal selector (*) styles from customCSS', async () => {
		const renderer = new Renderer({
			customCSS: `
				@layer base {
					* {
						border-color: red;
					}
				}
			`
		});
		const { default: Component } = await import('./__fixtures__/GlobalSelectorComponent.svelte');
		const html = await renderer.render(Component);

		// border class provides border-width and border-style
		expect(html).toContain('border-width');
		expect(html).toContain('border-style');
		// border-color should come from the * selector in customCSS
		// This currently FAILS - demonstrating the bug
		expect(html).toContain('border-color');
	});

	it('should apply element selector styles from customCSS', async () => {
		const renderer = new Renderer({
			customCSS: `
				div {
					outline: 2px solid blue;
				}
			`
		});
		const { default: Component } = await import('./__fixtures__/GlobalSelectorComponent.svelte');
		const html = await renderer.render(Component);

		// This currently FAILS - element selectors are ignored
		expect(html).toContain('outline');
	});

	it('class-based styles should override global selector styles', async () => {
		const renderer = new Renderer({
			customCSS: `
				@layer base {
					* {
						border-color: red;
					}
				}
			`
		});
		const { default: Component } = await import('./__fixtures__/GlobalSelectorComponent.svelte');
		// When implementation is complete, using border-blue-500 should override the * rule
		const html = await renderer.render(Component);

		// For now, this just documents expected behavior
		expect(html).toContain('border-style');
	});
});

describe('toPlainText', () => {
	it('should convert basic HTML to plain text', () => {
		const html = '<p>Hello World</p>';

		const result = toPlainText(html);

		expect(result).toBe('Hello World');
	});

	it('should handle multiple paragraphs', () => {
		const html = '<p>First paragraph</p><p>Second paragraph</p>';

		const result = toPlainText(html);

		expect(result).toContain('First paragraph');
		expect(result).toContain('Second paragraph');
	});

	it('should skip image tags', () => {
		const html = '<p>Before image</p><img src="test.jpg" alt="Test Image" /><p>After image</p>';

		const result = toPlainText(html);

		expect(result).toContain('Before image');
		expect(result).toContain('After image');
		expect(result).not.toContain('Test Image');
		expect(result).not.toContain('test.jpg');
	});

	it('should skip preview element', () => {
		const html =
			'<div id="__better-svelte-email-preview">This is preview text</div><p>Main content</p>';

		const result = toPlainText(html);

		expect(result).not.toContain('This is preview text');
		expect(result).toContain('Main content');
	});

	it('should convert links to text with URL', () => {
		const html = '<a href="https://example.com">Click here</a>';

		const result = toPlainText(html);

		expect(result).toContain('Click here');
		expect(result).toContain('https://example.com');
	});

	it('should handle headings', () => {
		const html = '<h1>Main Title</h1><h2>Subtitle</h2><p>Content</p>';

		const result = toPlainText(html);

		// html-to-text converts headings to uppercase
		expect(result).toContain('MAIN TITLE');
		expect(result).toContain('SUBTITLE');
		expect(result).toContain('Content');
	});

	it('should handle empty string', () => {
		const result = toPlainText('');

		expect(result).toBe('');
	});

	it('should handle plain text without HTML tags', () => {
		const text = 'Just plain text';

		const result = toPlainText(text);

		expect(result).toBe('Just plain text');
	});

	it('should handle nested HTML elements', () => {
		const html = '<div><p>Outer <strong>bold</strong> text</p></div>';

		const result = toPlainText(html);

		expect(result).toContain('Outer');
		expect(result).toContain('bold');
		expect(result).toContain('text');
	});

	it('should handle lists', () => {
		const html = '<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>';

		const result = toPlainText(html);

		expect(result).toContain('First item');
		expect(result).toContain('Second item');
		expect(result).toContain('Third item');
	});

	it('should handle complex email structure', () => {
		const html = `
			<html>
				<body>
					<div id="__better-svelte-email-preview">Preview text</div>
					<h1>Welcome!</h1>
					<p>Thank you for signing up.</p>
					<img src="logo.png" alt="Company Logo" />
					<a href="https://example.com/verify">Verify your email</a>
				</body>
			</html>
		`;

		const result = toPlainText(html);

		expect(result).not.toContain('Preview text');
		// html-to-text converts headings to uppercase
		expect(result).toContain('WELCOME!');
		expect(result).toContain('Thank you for signing up.');
		expect(result).not.toContain('Company Logo');
		expect(result).toContain('Verify your email');
		expect(result).toContain('https://example.com/verify');
	});

	it('should handle HTML entities', () => {
		const html = '<p>Hello &amp; welcome &lt;user&gt;</p>';

		const result = toPlainText(html);

		expect(result).toContain('&');
		expect(result).toContain('<');
		expect(result).toContain('>');
	});

	it('should preserve line breaks appropriately', () => {
		const html = '<p>Line 1</p><p>Line 2</p>';

		const result = toPlainText(html);

		// Should have some separation between paragraphs
		expect(result).toContain('Line 1');
		expect(result).toContain('Line 2');
		expect(result.indexOf('Line 1')).toBeLessThan(result.indexOf('Line 2'));
	});
});
