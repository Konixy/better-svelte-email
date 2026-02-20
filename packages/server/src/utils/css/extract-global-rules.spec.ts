import { describe, it, expect } from 'vitest';
import postcss from 'postcss';
import { extractGlobalRules } from './extract-global-rules.js';

describe('extractGlobalRules()', () => {
	it('extracts universal selector rules', () => {
		const root = postcss.parse(`
			* { border-color: red; }
		`);

		const result = extractGlobalRules(root);

		expect(result.universal).toHaveLength(1);
		expect(result.universal[0].toString()).toContain('border-color: red');
	});

	it('extracts element selector rules', () => {
		const root = postcss.parse(`
			div { background: blue; }
			p { color: green; }
		`);

		const result = extractGlobalRules(root);

		expect(result.element.get('div')).toHaveLength(1);
		expect(result.element.get('p')).toHaveLength(1);
	});

	it('extracts :root selector rules', () => {
		const root = postcss.parse(`
			:root { --primary: blue; font-size: 16px; }
		`);

		const result = extractGlobalRules(root);

		expect(result.root).toHaveLength(1);
	});

	it('ignores class selectors', () => {
		const root = postcss.parse(`
			.my-class { color: red; }
			div.my-class { color: blue; }
		`);

		const result = extractGlobalRules(root);

		expect(result.universal).toHaveLength(0);
		expect(result.element.size).toBe(0);
	});

	it('ignores rules in media queries', () => {
		const root = postcss.parse(`
			@media (min-width: 768px) {
				* { font-size: 18px; }
			}
		`);

		const result = extractGlobalRules(root);

		expect(result.universal).toHaveLength(0);
	});

	it('ignores complex selectors with combinators', () => {
		const root = postcss.parse(`
			div > p { margin: 0; }
			div p { padding: 0; }
			div + p { color: red; }
			div ~ p { color: blue; }
		`);

		const result = extractGlobalRules(root);

		expect(result.element.size).toBe(0);
	});

	it('ignores ID selectors', () => {
		const root = postcss.parse(`
			#my-id { color: red; }
		`);

		const result = extractGlobalRules(root);

		expect(result.universal).toHaveLength(0);
		expect(result.element.size).toBe(0);
	});

	it('ignores attribute selectors', () => {
		const root = postcss.parse(`
			[data-test] { color: red; }
			input[type="text"] { border: 1px; }
		`);

		const result = extractGlobalRules(root);

		expect(result.element.size).toBe(0);
	});

	it('handles multiple rules for same element', () => {
		const root = postcss.parse(`
			div { color: red; }
			div { background: blue; }
		`);

		const result = extractGlobalRules(root);

		expect(result.element.get('div')).toHaveLength(2);
	});

	it('handles multiple universal rules', () => {
		const root = postcss.parse(`
			* { box-sizing: border-box; }
			* { border-color: currentColor; }
		`);

		const result = extractGlobalRules(root);

		expect(result.universal).toHaveLength(2);
	});

	it('normalizes element names to lowercase', () => {
		const root = postcss.parse(`
			DIV { color: red; }
			Span { color: blue; }
		`);

		const result = extractGlobalRules(root);

		expect(result.element.get('div')).toHaveLength(1);
		expect(result.element.get('span')).toHaveLength(1);
		expect(result.element.has('DIV')).toBe(false);
		expect(result.element.has('Span')).toBe(false);
	});

	it('handles rules inside @layer', () => {
		const root = postcss.parse(`
			@layer base {
				* { border-color: red; }
				div { margin: 0; }
			}
		`);

		const result = extractGlobalRules(root);

		expect(result.universal).toHaveLength(1);
		expect(result.element.get('div')).toHaveLength(1);
	});

	it('returns empty results when no global rules exist', () => {
		const root = postcss.parse(`
			.only-classes { color: red; }
		`);

		const result = extractGlobalRules(root);

		expect(result.universal).toHaveLength(0);
		expect(result.element.size).toBe(0);
		expect(result.root).toHaveLength(0);
	});

	describe('selector list handling (comma-separated)', () => {
		it('extracts universal from "*, ::before, ::after" selector list', () => {
			const root = postcss.parse(`
				*, ::before, ::after { box-sizing: border-box; }
			`);

			const result = extractGlobalRules(root);

			expect(result.universal).toHaveLength(1);
			expect(result.universal[0].toString()).toContain('box-sizing: border-box');
		});

		it('extracts universal from Tailwind preflight selector list', () => {
			const root = postcss.parse(`
				*, ::after, ::before, ::backdrop, ::file-selector-button {
					box-sizing: border-box;
					margin: 0;
					padding: 0;
				}
			`);

			const result = extractGlobalRules(root);

			expect(result.universal).toHaveLength(1);
			expect(result.universal[0].toString()).toContain('box-sizing: border-box');
		});

		it('extracts multiple elements from "div, p" selector list', () => {
			const root = postcss.parse(`
				div, p { color: red; }
			`);

			const result = extractGlobalRules(root);

			expect(result.element.get('div')).toHaveLength(1);
			expect(result.element.get('p')).toHaveLength(1);
			// Both should have the same declaration
			expect(result.element.get('div')![0].toString()).toContain('color: red');
			expect(result.element.get('p')![0].toString()).toContain('color: red');
		});

		it('extracts html from "html, :host" selector list', () => {
			const root = postcss.parse(`
				html, :host { line-height: 1.5; }
			`);

			const result = extractGlobalRules(root);

			expect(result.element.get('html')).toHaveLength(1);
			expect(result.element.get('html')![0].toString()).toContain('line-height: 1.5');
			// :host should be skipped (pseudo-element)
		});

		it('extracts element but skips class from "div, .class" selector list', () => {
			const root = postcss.parse(`
				div, .my-class { color: red; }
			`);

			const result = extractGlobalRules(root);

			expect(result.element.get('div')).toHaveLength(1);
			// Class selector should not be in global rules
		});

		it('extracts both :root and element from ":root, html" selector list', () => {
			const root = postcss.parse(`
				:root, html { font-size: 16px; }
			`);

			const result = extractGlobalRules(root);

			expect(result.root).toHaveLength(1);
			expect(result.element.get('html')).toHaveLength(1);
		});

		it('extracts universal but skips pseudo-element variants', () => {
			const root = postcss.parse(`
				*, *::before, *::after { box-sizing: border-box; }
			`);

			const result = extractGlobalRules(root);

			// Should only extract *, not *::before or *::after
			expect(result.universal).toHaveLength(1);
		});

		it('extracts multiple form elements from selector list', () => {
			const root = postcss.parse(`
				button, input, optgroup, select, textarea {
					font-family: inherit;
					font-size: 100%;
				}
			`);

			const result = extractGlobalRules(root);

			expect(result.element.get('button')).toHaveLength(1);
			expect(result.element.get('input')).toHaveLength(1);
			expect(result.element.get('optgroup')).toHaveLength(1);
			expect(result.element.get('select')).toHaveLength(1);
			expect(result.element.get('textarea')).toHaveLength(1);
		});

		it('skips entire selector list if all parts are non-inlinable', () => {
			const root = postcss.parse(`
				::before, ::after, ::backdrop { content: ""; }
			`);

			const result = extractGlobalRules(root);

			expect(result.universal).toHaveLength(0);
			expect(result.element.size).toBe(0);
		});

		it('skips attribute selector but extracts element from list', () => {
			const root = postcss.parse(`
				input, [type="checkbox"] { accent-color: inherit; }
			`);

			const result = extractGlobalRules(root);

			expect(result.element.get('input')).toHaveLength(1);
		});

		it('skips ID selector but extracts element from list', () => {
			const root = postcss.parse(`
				div, #my-id { color: red; }
			`);

			const result = extractGlobalRules(root);

			expect(result.element.get('div')).toHaveLength(1);
		});

		it('handles selector list inside @layer', () => {
			const root = postcss.parse(`
				@layer base {
					*, ::before, ::after { box-sizing: border-box; }
					div, p { margin: 0; }
				}
			`);

			const result = extractGlobalRules(root);

			expect(result.universal).toHaveLength(1);
			expect(result.element.get('div')).toHaveLength(1);
			expect(result.element.get('p')).toHaveLength(1);
		});

		it('skips selector list inside media query', () => {
			const root = postcss.parse(`
				@media (min-width: 768px) {
					div, p { font-size: 18px; }
				}
			`);

			const result = extractGlobalRules(root);

			expect(result.element.size).toBe(0);
		});

		it('skips combinator selectors in list but extracts simple ones', () => {
			const root = postcss.parse(`
				div, p > span, a { color: blue; }
			`);

			const result = extractGlobalRules(root);

			expect(result.element.get('div')).toHaveLength(1);
			expect(result.element.get('a')).toHaveLength(1);
			// p > span should be skipped (combinator)
			expect(result.element.has('p')).toBe(false);
			expect(result.element.has('span')).toBe(false);
		});
	});
});
