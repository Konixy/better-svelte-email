import postcss from 'postcss';
import { resolveCalcExpressions } from './resolve-calc-expressions.js';
import { expect, describe, it } from 'vitest';

describe('resolveCalcExpressions()', () => {
	it('resolves spacing calc expressions from tailwind v4', () => {
		const root = postcss.parse(`
.px-3{padding-inline:calc(0.25rem*3)}
.py-2{padding-block:calc(0.25rem*2)}
  `);
		resolveCalcExpressions(root);
		expect(root.toString()).toMatchSnapshot();
	});

	it('resolves calc expressions repeating decimals', () => {
		const root = postcss.parse(`
      .w-1/3 { width: calc(0.3333333333333333*100%); }
    `);
		resolveCalcExpressions(root);
		expect(root.toString()).toMatchSnapshot();
	});

	it('does not modify complex calc expressions with nested parentheses', () => {
		const root = postcss.parse(`
.px-3{padding-inline:calc(0.25rem*(3 + 1px))}
.py-2{padding-block:calc(0.25rem*(2 + 1px))}
  `);
		resolveCalcExpressions(root);
		// Parenthesized sub-expressions are not supported and left unresolved
		expect(root.toString()).toMatchSnapshot();
	});

	describe('addition and subtraction', () => {
		it('resolves same-unit addition', () => {
			const root = postcss.parse(`.foo { width: calc(10px + 5px); }`);
			resolveCalcExpressions(root);
			expect(root.toString()).toBe(`.foo { width: 15px; }`);
		});

		it('resolves same-unit subtraction', () => {
			const root = postcss.parse(`.foo { width: calc(10px - 3px); }`);
			resolveCalcExpressions(root);
			expect(root.toString()).toBe(`.foo { width: 7px; }`);
		});

		it('resolves mixed-unit addition (rem + px) with default 16px base', () => {
			const root = postcss.parse(`.foo { border-radius: calc(0.625rem + 4px); }`);
			resolveCalcExpressions(root);
			// 0.625rem = 10px, 10px + 4px = 14px
			expect(root.toString()).toBe(`.foo { border-radius: 14px; }`);
		});

		it('resolves mixed-unit subtraction (rem - px)', () => {
			const root = postcss.parse(`.foo { border-radius: calc(0.625rem - 2px); }`);
			resolveCalcExpressions(root);
			// 0.625rem = 10px, 10px - 2px = 8px
			expect(root.toString()).toBe(`.foo { border-radius: 8px; }`);
		});

		it('respects custom baseFontSize configuration', () => {
			const root = postcss.parse(`.foo { width: calc(1rem + 8px); }`);
			resolveCalcExpressions(root, { baseFontSize: 20 });
			// 1rem = 20px, 20px + 8px = 28px
			expect(root.toString()).toBe(`.foo { width: 28px; }`);
		});

		it('handles complex expressions with multiplication then addition', () => {
			const root = postcss.parse(`.foo { width: calc(2rem * 2 + 10px); }`);
			resolveCalcExpressions(root);
			// 2rem * 2 = 4rem = 64px, 64px + 10px = 74px
			expect(root.toString()).toBe(`.foo { width: 74px; }`);
		});

		it('respects operator precedence with addition before multiplication', () => {
			const root = postcss.parse(`.foo { width: calc(2rem + 2 * 10px); }`);
			resolveCalcExpressions(root);
			// Multiplication first: 2 * 10px = 20px, then 2rem + 20px = 32px + 20px = 52px
			expect(root.toString()).toBe(`.foo { width: 52px; }`);
		});

		it('handles em units as rem (relative to root)', () => {
			const root = postcss.parse(`.foo { margin: calc(1em + 8px); }`);
			resolveCalcExpressions(root);
			// 1em = 16px, 16px + 8px = 24px
			expect(root.toString()).toBe(`.foo { margin: 24px; }`);
		});

		it('handles negative results', () => {
			const root = postcss.parse(`.foo { margin: calc(5px - 10px); }`);
			resolveCalcExpressions(root);
			expect(root.toString()).toBe(`.foo { margin: -5px; }`);
		});

		it('does not resolve percentage-based expressions', () => {
			const root = postcss.parse(`.foo { width: calc(50% + 10px); }`);
			resolveCalcExpressions(root);
			// Cannot convert % to px, so calc remains
			expect(root.toString()).toBe(`.foo { width: calc(50% + 10px); }`);
		});

		it('does not resolve vw-based expressions', () => {
			const root = postcss.parse(`.foo { width: calc(100vw - 20px); }`);
			resolveCalcExpressions(root);
			expect(root.toString()).toBe(`.foo { width: calc(100vw - 20px); }`);
		});

		it('does not resolve vh-based expressions', () => {
			const root = postcss.parse(`.foo { height: calc(100vh - 60px); }`);
			resolveCalcExpressions(root);
			expect(root.toString()).toBe(`.foo { height: calc(100vh - 60px); }`);
		});

		it('does not resolve dvh-based expressions', () => {
			const root = postcss.parse(`.foo { height: calc(100dvh - 80px); }`);
			resolveCalcExpressions(root);
			expect(root.toString()).toBe(`.foo { height: calc(100dvh - 80px); }`);
		});

		it('does not resolve svh/lvh-based expressions', () => {
			const root = postcss.parse(`.foo { height: calc(100svh - 10px); }`);
			resolveCalcExpressions(root);
			expect(root.toString()).toBe(`.foo { height: calc(100svh - 10px); }`);
		});

		it('does not resolve ch-based expressions', () => {
			const root = postcss.parse(`.foo { width: calc(60ch + 2rem); }`);
			resolveCalcExpressions(root);
			expect(root.toString()).toBe(`.foo { width: calc(60ch + 2rem); }`);
		});

		it('does not resolve ex-based expressions', () => {
			const root = postcss.parse(`.foo { height: calc(2ex + 4px); }`);
			resolveCalcExpressions(root);
			expect(root.toString()).toBe(`.foo { height: calc(2ex + 4px); }`);
		});

		it('resolves same-unit rem addition without conversion', () => {
			const root = postcss.parse(`.foo { padding: calc(1rem + 0.5rem); }`);
			resolveCalcExpressions(root);
			expect(root.toString()).toBe(`.foo { padding: 1.5rem; }`);
		});

		it('handles chained additions', () => {
			const root = postcss.parse(`.foo { width: calc(10px + 5px + 3px); }`);
			resolveCalcExpressions(root);
			expect(root.toString()).toBe(`.foo { width: 18px; }`);
		});

		it('handles mixed addition and subtraction', () => {
			const root = postcss.parse(`.foo { width: calc(20px + 10px - 5px); }`);
			resolveCalcExpressions(root);
			expect(root.toString()).toBe(`.foo { width: 25px; }`);
		});
	});
});
