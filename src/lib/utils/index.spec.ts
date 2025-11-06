import { describe, it, expect } from 'vitest';
import { combineStyles, styleToString, pxToPt, withMargin, renderAsPlainText } from '../index.js';

describe('Utils', () => {
	describe('combineStyles', () => {
		it('should combine multiple style strings with semicolons', () => {
			const style1 = 'color:red';
			const style2 = 'background-color:blue;font-size:14px;';
			const style3 = 'font-size:16px';

			const result = combineStyles(style1, style2, style3);

			expect(result).toBe('color:red;background-color:blue;font-size:14px;font-size:16px');
		});

		it('should filter out empty strings and trim them', () => {
			const style1 = 'color:red ';
			const style2 = ' ';
			const style3 = 'background-color:blue';

			const result = combineStyles(style1, style2, style3);

			expect(result).toBe('color:red;background-color:blue');
		});

		it('should filter out undefined values', () => {
			const style1 = 'color:red';
			const style2 = undefined as unknown as string;
			const style3 = 'background-color:blue';

			const result = combineStyles(style1, style2, style3);

			expect(result).toBe('color:red;background-color:blue');
		});

		it('should filter out null values', () => {
			const style1 = 'color:red';
			const style2 = null as unknown as string;
			const style3 = 'background-color:blue';

			const result = combineStyles(style1, style2, style3);

			expect(result).toBe('color:red;background-color:blue');
		});

		it('should handle all empty values', () => {
			const result = combineStyles('', ' ', '');

			expect(result).toBe('');
		});

		it('should handle all undefined values', () => {
			const result = combineStyles(undefined as unknown as string, undefined as unknown as string);

			expect(result).toBe('');
		});

		it('should handle mixed empty, undefined, and null values', () => {
			const result = combineStyles(
				'',
				undefined as unknown as string,
				null as unknown as string,
				'color:red',
				'',
				'font-size:14px'
			);

			expect(result).toBe('color:red;font-size:14px');
		});

		it('should handle single style string', () => {
			const result = combineStyles('color:red');

			expect(result).toBe('color:red');
		});

		it('should handle no arguments', () => {
			const result = combineStyles();

			expect(result).toBe('');
		});

		it('should work with styles that already have semicolons', () => {
			const style1 = 'color:red;';
			const style2 = 'background-color:blue;';

			const result = combineStyles(style1, style2);

			expect(result).toBe('color:red;background-color:blue');
		});

		it('should combine complex style strings', () => {
			const baseStyles = 'display:inline-block;text-decoration:none;padding:12px 20px';
			const customStyles = 'background-color:rgb(59,130,246);color:white;border-radius:4px';
			const marginStyles = 'margin-top:16px;margin-bottom:16px';

			const result = combineStyles(baseStyles, customStyles, marginStyles);

			expect(result).toBe(
				'display:inline-block;text-decoration:none;padding:12px 20px;background-color:rgb(59,130,246);color:white;border-radius:4px;margin-top:16px;margin-bottom:16px'
			);
		});
	});

	describe('styleToString', () => {
		it('should convert style object to CSS string', () => {
			const style = {
				color: 'red',
				fontSize: '16px',
				backgroundColor: 'blue'
			};

			const result = styleToString(style);

			expect(result).toBe('color:red;font-size:16px;background-color:blue');
		});

		it('should convert camelCase to kebab-case', () => {
			const style = {
				marginTop: '10px',
				paddingLeft: '20px',
				borderRadius: '5px'
			};

			const result = styleToString(style);

			expect(result).toBe('margin-top:10px;padding-left:20px;border-radius:5px');
		});

		it('should filter out undefined values', () => {
			const style = {
				color: 'red',
				fontSize: undefined,
				backgroundColor: 'blue'
			};

			const result = styleToString(style);

			expect(result).toBe('color:red;background-color:blue');
		});

		it('should filter out null values', () => {
			const style = {
				color: 'red',
				fontSize: null as unknown as string,
				backgroundColor: 'blue'
			};

			const result = styleToString(style);

			expect(result).toBe('color:red;background-color:blue');
		});

		it('should filter out empty string values', () => {
			const style = {
				color: 'red',
				fontSize: '',
				backgroundColor: 'blue'
			};

			const result = styleToString(style);

			expect(result).toBe('color:red;background-color:blue');
		});

		it('should handle numeric values', () => {
			const style = {
				width: 100,
				height: 200,
				opacity: 0.5
			};

			const result = styleToString(style);

			expect(result).toBe('width:100;height:200;opacity:0.5');
		});

		it('should handle empty object', () => {
			const result = styleToString({});

			expect(result).toBe('');
		});

		it('should handle complex CSS properties', () => {
			const style = {
				WebkitTransform: 'scale(1.2)',
				MozBorderRadius: '4px',
				msFlexDirection: 'row'
			};

			const result = styleToString(style);

			expect(result).toBe(
				'-webkit-transform:scale(1.2);-moz-border-radius:4px;ms-flex-direction:row'
			);
		});
	});

	describe('pxToPt', () => {
		it('should convert pixel string to points', () => {
			const result = pxToPt('16px');

			expect(result).toBe('12pt');
		});

		it('should convert pixel number to points', () => {
			const result = pxToPt(16);

			expect(result).toBe('12pt');
		});

		it('should round to nearest integer', () => {
			const result = pxToPt(17);

			expect(result).toBe('13pt');
		});

		it('should handle decimal values', () => {
			const result1 = pxToPt(16.5);
			const result2 = pxToPt(16.7);

			expect(result1).toBe('12pt');
			expect(result2).toBe('13pt');
		});

		it('should handle zero', () => {
			const result = pxToPt(0);

			expect(result).toBe('0pt');
		});
	});

	describe('withMargin', () => {
		it('should handle all margin shorthand (m)', () => {
			const result = withMargin({ m: '16' });

			expect(result).toEqual({ margin: '16px' });
		});

		it('should handle horizontal margin (mx)', () => {
			const result = withMargin({ mx: '16' });

			expect(result).toEqual({
				marginLeft: '16px',
				marginRight: '16px'
			});
		});

		it('should handle vertical margin (my)', () => {
			const result = withMargin({ my: '16' });

			expect(result).toEqual({
				marginTop: '16px',
				marginBottom: '16px'
			});
		});

		it('should handle individual margin props', () => {
			const result = withMargin({
				mt: '10',
				mr: '15',
				mb: '20',
				ml: '25'
			});

			expect(result).toEqual({
				marginTop: '10px',
				marginRight: '15px',
				marginBottom: '20px',
				marginLeft: '25px'
			});
		});

		it('should handle mixed margin props', () => {
			const result = withMargin({
				mx: '16',
				mt: '8'
			});

			expect(result).toEqual({
				marginLeft: '16px',
				marginRight: '16px',
				marginTop: '8px'
			});
		});

		it('should handle empty props', () => {
			const result = withMargin({});

			expect(result).toEqual({});
		});

		it('should override with more specific props', () => {
			const result = withMargin({
				m: '16',
				mt: '32'
			});

			// More specific props should override general ones
			expect(result).toEqual({
				margin: '16px',
				marginTop: '32px'
			});
		});

		it('should handle undefined values', () => {
			const result = withMargin({
				mt: undefined,
				mr: '10',
				mb: undefined
			});

			expect(result).toEqual({
				marginRight: '10px'
			});
		});
	});

	describe('renderAsPlainText', () => {
		it('should convert basic HTML to plain text', () => {
			const html = '<p>Hello World</p>';

			const result = renderAsPlainText(html);

			expect(result).toBe('Hello World');
		});

		it('should handle multiple paragraphs', () => {
			const html = '<p>First paragraph</p><p>Second paragraph</p>';

			const result = renderAsPlainText(html);

			expect(result).toContain('First paragraph');
			expect(result).toContain('Second paragraph');
		});

		it('should skip image tags', () => {
			const html = '<p>Before image</p><img src="test.jpg" alt="Test Image" /><p>After image</p>';

			const result = renderAsPlainText(html);

			expect(result).toContain('Before image');
			expect(result).toContain('After image');
			expect(result).not.toContain('Test Image');
			expect(result).not.toContain('test.jpg');
		});

		it('should skip preview element', () => {
			const html =
				'<div id="__better-svelte-email-preview">This is preview text</div><p>Main content</p>';

			const result = renderAsPlainText(html);

			expect(result).not.toContain('This is preview text');
			expect(result).toContain('Main content');
		});

		it('should convert links to text with URL', () => {
			const html = '<a href="https://example.com">Click here</a>';

			const result = renderAsPlainText(html);

			expect(result).toContain('Click here');
			expect(result).toContain('https://example.com');
		});

		it('should handle headings', () => {
			const html = '<h1>Main Title</h1><h2>Subtitle</h2><p>Content</p>';

			const result = renderAsPlainText(html);

			// html-to-text converts headings to uppercase
			expect(result).toContain('MAIN TITLE');
			expect(result).toContain('SUBTITLE');
			expect(result).toContain('Content');
		});

		it('should handle empty string', () => {
			const result = renderAsPlainText('');

			expect(result).toBe('');
		});

		it('should handle plain text without HTML tags', () => {
			const text = 'Just plain text';

			const result = renderAsPlainText(text);

			expect(result).toBe('Just plain text');
		});

		it('should handle nested HTML elements', () => {
			const html = '<div><p>Outer <strong>bold</strong> text</p></div>';

			const result = renderAsPlainText(html);

			expect(result).toContain('Outer');
			expect(result).toContain('bold');
			expect(result).toContain('text');
		});

		it('should handle lists', () => {
			const html = '<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>';

			const result = renderAsPlainText(html);

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

			const result = renderAsPlainText(html);

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

			const result = renderAsPlainText(html);

			expect(result).toContain('&');
			expect(result).toContain('<');
			expect(result).toContain('>');
		});

		it('should preserve line breaks appropriately', () => {
			const html = '<p>Line 1</p><p>Line 2</p>';

			const result = renderAsPlainText(html);

			// Should have some separation between paragraphs
			expect(result).toContain('Line 1');
			expect(result).toContain('Line 2');
			expect(result.indexOf('Line 1')).toBeLessThan(result.indexOf('Line 2'));
		});
	});
});
