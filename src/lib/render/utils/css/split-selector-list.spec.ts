import { describe, it, expect } from 'vitest';
import { splitSelectorList } from './split-selector-list.js';

describe('splitSelectorList()', () => {
	describe('basic splitting', () => {
		it('splits simple comma-separated selectors', () => {
			expect(splitSelectorList('*, ::before, ::after')).toEqual([
				'*',
				'::before',
				'::after'
			]);
		});

		it('returns single selector as array', () => {
			expect(splitSelectorList('*')).toEqual(['*']);
		});

		it('splits multiple element selectors', () => {
			expect(splitSelectorList('div, p, span')).toEqual(['div', 'p', 'span']);
		});

		it('handles Tailwind preflight selector pattern', () => {
			expect(splitSelectorList('*, ::after, ::before, ::backdrop, ::file-selector-button')).toEqual([
				'*',
				'::after',
				'::before',
				'::backdrop',
				'::file-selector-button'
			]);
		});

		it('handles html, :host pattern', () => {
			expect(splitSelectorList('html, :host')).toEqual(['html', ':host']);
		});
	});

	describe('whitespace handling', () => {
		it('trims whitespace around selectors', () => {
			expect(splitSelectorList('div,  p,span')).toEqual(['div', 'p', 'span']);
		});

		it('handles newlines in selector list', () => {
			expect(splitSelectorList('div,\np,\nspan')).toEqual(['div', 'p', 'span']);
		});

		it('handles tabs and mixed whitespace', () => {
			expect(splitSelectorList('div,\t p, \n span')).toEqual(['div', 'p', 'span']);
		});

		it('preserves internal whitespace in complex selectors', () => {
			expect(splitSelectorList('div > p, span + a')).toEqual(['div > p', 'span + a']);
		});
	});

	describe('parentheses handling', () => {
		it('preserves commas inside :is()', () => {
			expect(splitSelectorList(':is(div, p)')).toEqual([':is(div, p)']);
		});

		it('preserves commas inside :where()', () => {
			expect(splitSelectorList(':where(div, p)')).toEqual([':where(div, p)']);
		});

		it('preserves commas inside :not()', () => {
			expect(splitSelectorList(':not(div, p)')).toEqual([':not(div, p)']);
		});

		it('preserves commas inside :has()', () => {
			expect(splitSelectorList(':has(div, p)')).toEqual([':has(div, p)']);
		});

		it('handles nested parentheses', () => {
			expect(splitSelectorList(':is(:is(div, p), span)')).toEqual([':is(:is(div, p), span)']);
		});

		it('handles deeply nested parentheses', () => {
			expect(splitSelectorList(':is(:where(:not(div, p), span), a)')).toEqual([
				':is(:where(:not(div, p), span), a)'
			]);
		});

		it('splits correctly with mixed parenthesized and non-parenthesized', () => {
			expect(splitSelectorList('div, :is(p, span), ::before')).toEqual([
				'div',
				':is(p, span)',
				'::before'
			]);
		});

		it('handles :nth-child() with formula', () => {
			expect(splitSelectorList('div, :nth-child(2n+1), span')).toEqual([
				'div',
				':nth-child(2n+1)',
				'span'
			]);
		});

		it('handles attribute selectors with commas in values', () => {
			// This is rare but valid CSS
			expect(splitSelectorList('[data-value="a,b"], div')).toEqual([
				'[data-value="a,b"]',
				'div'
			]);
		});
	});

	describe('edge cases', () => {
		it('handles empty string', () => {
			expect(splitSelectorList('')).toEqual(['']);
		});

		it('handles selector with only whitespace', () => {
			expect(splitSelectorList('   ')).toEqual(['']);
		});

		it('handles trailing comma', () => {
			expect(splitSelectorList('div, p,')).toEqual(['div', 'p', '']);
		});

		it('handles leading comma', () => {
			expect(splitSelectorList(', div, p')).toEqual(['', 'div', 'p']);
		});

		it('handles multiple consecutive commas', () => {
			expect(splitSelectorList('div,, p')).toEqual(['div', '', 'p']);
		});

		it('handles complex real-world selector', () => {
			expect(
				splitSelectorList(
					'button, input, optgroup, select, textarea, ::file-selector-button'
				)
			).toEqual([
				'button',
				'input',
				'optgroup',
				'select',
				'textarea',
				'::file-selector-button'
			]);
		});
	});

	describe('bracket handling', () => {
		it('preserves commas inside square brackets (attribute selectors)', () => {
			// Attribute selectors with comma in value
			expect(splitSelectorList('[title="hello, world"], div')).toEqual([
				'[title="hello, world"]',
				'div'
			]);
		});

		it('handles multiple attribute selectors', () => {
			expect(splitSelectorList('[data-a], [data-b="x,y"], [data-c]')).toEqual([
				'[data-a]',
				'[data-b="x,y"]',
				'[data-c]'
			]);
		});
	});
});
