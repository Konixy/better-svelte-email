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
});
