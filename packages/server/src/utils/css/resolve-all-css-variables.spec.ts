import postcss from 'postcss';
import { resolveAllCssVariables } from './resolve-all-css-variables';
import type { ElementAttribute, RenderedDocument } from './match-selector';
import { expect, describe, it } from 'vitest';

describe('resolveAllCSSVariables', () => {
	it('ignores @layer (properties) defined for browser compatibility', () => {
		const root = postcss.parse(`/*! tailwindcss v4.1.12 | MIT License | https://tailwindcss.com */
@layer properties;
@layer theme, base, components, utilities;
@layer theme {
  :root, :host {
    --color-red-500: oklch(63.7% 0.237 25.331);
    --color-blue-400: oklch(70.7% 0.165 254.624);
    --color-blue-600: oklch(54.6% 0.245 262.881);
    --color-gray-200: oklch(92.8% 0.006 264.531);
    --color-black: #000;
    --color-white: #fff;
    --spacing: 0.25rem;
    --text-sm: 0.875rem;
    --text-sm--line-height: calc(1.25 / 0.875);
    --radius-md: 0.375rem;
  }
}
@layer utilities {
  .mt-8 {
    margin-top: calc(var(--spacing) * 8);
  }
  .rounded-md {
    border-radius: var(--radius-md);
  }
  .bg-blue-600 {
    background-color: var(--color-blue-600);
  }
  .bg-red-500 {
    background-color: var(--color-red-500);
  }
  .bg-white {
    background-color: var(--color-white);
  }
  .p-4 {
    padding: calc(var(--spacing) * 4);
  }
  .px-3 {
    padding-inline: calc(var(--spacing) * 3);
  }
  .py-2 {
    padding-block: calc(var(--spacing) * 2);
  }
  .text-sm {
    font-size: var(--text-sm);
    line-height: var(--tw-leading, var(--text-sm--line-height));
  }
  .text-\\[14px\\] {
    font-size: 14px;
  }
  .leading-\\[24px\\] {
    --tw-leading: 24px;
    line-height: 24px;
  }
  .text-black {
    color: var(--color-black);
  }
  .text-blue-400 {
    color: var(--color-blue-400);
  }
  .text-blue-600 {
    color: var(--color-blue-600);
  }
  .text-gray-200 {
    color: var(--color-gray-200);
  }
  .no-underline {
    text-decoration-line: none;
  }
}
@property --tw-leading {
  syntax: "*";
  inherits: false;
}
@layer properties {
  @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))) {
    *, ::before, ::after, ::backdrop {
      --tw-leading: initial;
    }
  }
}
`);
		resolveAllCssVariables(root);
		expect(root.toString()).toMatchSnapshot();
	});

	it('works with simple css variables on a :root', () => {
		const root = postcss.parse(`:root {
  --width: 100px;
}

.box {
  width: var(--width);
}`);
		resolveAllCssVariables(root);
		expect(root.toString()).toMatchSnapshot();
	});

	it('works for variables across different CSS layers', () => {
		const root = postcss.parse(`@layer base {
      :root {
        --width: 100px;
      }
    }

    @layer utilities {
      .box {
        width: var(--width);
      }
    }`);
		resolveAllCssVariables(root);
		expect(root.toString()).toMatchSnapshot();
	});

	it('works with multiple variables in the same declaration', () => {
		const root = postcss.parse(`:root {
      --top: 101px;
      --bottom: 102px;
      --right: 103px;
      --left: 104px;
    }

    .box {
      margin: var(--top) var(--right) var(--bottom) var(--left);
    }`);

		resolveAllCssVariables(root);
		expect(root.toString()).toMatchSnapshot();
	});

	it('keeps variable usages if it cant find their declaration', () => {
		const root = postcss.parse(`.box {
  width: var(--width);
}`);
		resolveAllCssVariables(root);
		expect(root.toString()).toMatchSnapshot();
	});

	it('works with variables set in the same rule', () => {
		const root = postcss.parse(`.box {
  --width: 200px;
  width: var(--width);
}

@media (min-width: 1280px) {
  .xl\\:bg-green-500 {
    --tw-bg-opacity: 1;
    background-color: rgb(34 197 94 / var(--tw-bg-opacity))
  }
}
`);
		resolveAllCssVariables(root);
		expect(root.toString()).toMatchSnapshot();
	});

	it('works with a variable set in a layer, and used in another through a media query', () => {
		const root = postcss.parse(`@layer theme {
  :root {
    --color-blue-300: blue;
  }
}

@layer utilities {
  .sm\\:bg-blue-300 {
    @media (width >= 40rem) {
      background-color: var(--color-blue-300);
    }
  }
}`);
		resolveAllCssVariables(root);
		expect(root.toString()).toMatchSnapshot();
	});

	it('uses fallback values when variable definition is not found', () => {
		const root = postcss.parse(`.box {
  width: var(--undefined-width, 150px);
  height: var(--undefined-height, 200px);
  margin: var(--undefined-margin, 10px 20px);
}`);
		resolveAllCssVariables(root);
		expect(root.toString()).toMatchSnapshot();
	});

	it('handles nested var() functions in fallbacks', () => {
		const root = postcss.parse(`:root {
  --fallback-width: 300px;
}

.box {
  width: var(--undefined-width, var(--fallback-width));
  height: var(--undefined-height, var(--also-undefined, 250px));
}`);
		resolveAllCssVariables(root);
		expect(root.toString()).toMatchSnapshot();
	});

	it('handles deeply nested var() functions with complex parentheses', () => {
		const root = postcss.parse(`:root {
  --primary: blue;
  --secondary: red;
  --fallback: green;
  --size: 20px;
}

.box {
  color: var(--primary, var(--secondary, var(--fallback)));
  width: var(--size, calc(100px + var(--size, 20px)));
  border: var(--border-width, var(--border-style, var(--border-color, 1px solid black)));
  --r: 100;
  --b: 10;
  background: var(--bg-color, rgb(var(--r, 255), var(--g, 0), var(--b, 0)));
}`);
		resolveAllCssVariables(root);
		expect(root.toString()).toMatchSnapshot();
	});

	it('handles selectors with asterisks in attribute selectors and pseudo-functions', () => {
		const root = postcss.parse(`* {
  --global-color: red;
}

input[type="*"]:hover {
  color: var(--global-color);
}

div:nth-child(2*n+1) {
  background: var(--global-color);
}

.test[data-attr="value*test"] {
  border-color: var(--global-color);
}

.universal-with-class-* {
  --class-color: blue;
  text-decoration: var(--class-color);
}

.normal {
  color: var(--class-color);
}`);

		resolveAllCssVariables(root);
		const result = root.toString();

		// Variables from universal selector (*) should resolve to other selectors with actual universal selector
		expect(result).toContain('input[type="*"]:hover');
		expect(result).toContain('color: red');
		expect(result).toContain('div:nth-child(2*n+1)');
		expect(result).toContain('background: red');
		expect(result).toContain('.test[data-attr="value*test"]');
		expect(result).toContain('border-color: red');

		// Variables from *.universal-with-class should resolve within the same selector
		expect(result).toContain('.universal-with-class-*');
		expect(result).toContain('text-decoration: blue');
		// .normal should NOT get the --class-color from .universal-with-class-* as selectors don't intersect
		expect(result).toContain('.normal');
	});

	it('resolves two-level nested variables (shadcn pattern)', () => {
		const root = postcss.parse(`:root {
  --background: oklch(98.5% 0.001 106.423);
  --foreground: oklch(21.6% 0.006 56.043);
}

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

.bg-background {
  background-color: var(--color-background);
}

.text-foreground {
  color: var(--color-foreground);
}`);

		resolveAllCssVariables(root);

		const result = root.toString();
		expect(result).toContain('background-color: oklch(98.5% 0.001 106.423)');
		expect(result).toContain('color: oklch(21.6% 0.006 56.043)');
		expect(result).not.toContain('var(--color-background)');
		expect(result).not.toContain('var(--color-foreground)');
		expect(result).not.toContain('var(--background)');
		expect(result).not.toContain('var(--foreground)');
	});

	it('resolves three-level nested variables', () => {
		const root = postcss.parse(`:root {
  --base: #ff0000;
}

:root {
  --level1: var(--base);
}

:root {
  --level2: var(--level1);
}

.test {
  color: var(--level2);
}`);

		resolveAllCssVariables(root);

		const result = root.toString();
		expect(result).toContain('color: #ff0000');
		expect(result).not.toContain('var(--');
	});

	it('handles circular variable references gracefully', () => {
		const root = postcss.parse(`:root {
  --a: var(--b);
  --b: var(--a);
}

.test {
  color: var(--a);
}`);

		// Mock console.warn
		const originalWarn = console.warn;
		let warnCalled = false;
		console.warn = (msg: string) => {
			if (msg.includes('maximum iterations')) {
				warnCalled = true;
			}
		};

		resolveAllCssVariables(root);

		console.warn = originalWarn;

		expect(warnCalled).toBe(true);
		// Variable should remain unresolved (graceful degradation)
		const result = root.toString();
		expect(result).toContain('var(--');
	});

	it('handles mix of nested and direct variables', () => {
		const root = postcss.parse(`:root {
  --primary: blue;
  --secondary-base: red;
  --secondary: var(--secondary-base);
}

.test1 {
  color: var(--primary);
}

.test2 {
  color: var(--secondary);
}`);

		resolveAllCssVariables(root);

		const result = root.toString();
		expect(result).toContain('.test1');
		expect(result).toContain('color: blue');
		expect(result).toContain('.test2');
		expect(result).toContain('color: red');
		expect(result).not.toContain('var(--');
	});

	it('resolves nested variables in fallback values', () => {
		const root = postcss.parse(`:root {
  --fallback-base: green;
  --fallback: var(--fallback-base);
}

.test {
  color: var(--undefined, var(--fallback));
}`);

		resolveAllCssVariables(root);

		const result = root.toString();
		expect(result).toContain('color: green');
		expect(result).not.toContain('var(--');
	});
});

describe('resolveAllCssVariables cascade order', () => {
	function resolve(css: string, document: Partial<RenderedDocument> = {}) {
		const root = postcss.parse(css);
		resolveAllCssVariables(root, { root: [], descendants: [], styleSheets: [], ...document });
		return (selector: string, prop = 'color') => {
			const values: string[] = [];
			root.walkRules((rule) => {
				if (rule.selector !== selector) return;
				rule.each((node) => {
					if (node.type === 'decl' && node.prop === prop) values.push(node.value);
				});
			});
			return values.join(', ');
		};
	}

	const element = (attributes: Record<string, string>): ElementAttribute[] =>
		Object.entries(attributes).map(([name, value]) => ({ name, value }));
	const brandUse = '.text-brand { color: var(--brand); }';
	const brandElement = element({ class: 'text-brand' });

	describe('variables declared only for the root follow the cascade', () => {
		it('uses the later of two :root blocks declaring the same variable', () => {
			const valueOf = resolve(`:root { --brand: red; }
:root { --brand: blue; }
${brandUse}`);

			expect(valueOf('.text-brand')).toBe('blue');
		});

		it('uses the later declaration when one rule declares a variable twice', () => {
			const valueOf = resolve(`:root { --brand: red; --brand: blue; }
${brandUse}`);

			expect(valueOf('.text-brand')).toBe('blue');
		});

		it('prefers a more specific matching root selector in either source order', () => {
			const qualifiedFirst = resolve(`:root:not([data-theme='dark']) { --brand: blue; }
:root { --brand: red; }
${brandUse}`);
			const qualifiedLast = resolve(`:root { --brand: red; }
:root:not([data-theme='dark']) { --brand: blue; }
${brandUse}`);

			expect(qualifiedFirst('.text-brand')).toBe('blue');
			expect(qualifiedLast('.text-brand')).toBe('blue');
		});

		it('ignores a qualified root selector the rendered html element does not match', () => {
			const css = `:root { --brand: red; }
:root:not([data-theme='dark']) { --brand: blue; }
${brandUse}`;

			expect(resolve(css)('.text-brand')).toBe('blue');
			expect(resolve(css, { root: element({ 'data-theme': 'dark' }) })('.text-brand')).toBe('red');
		});

		it('applies a later .dark block only when html has the class', () => {
			const css = `:root { --brand: red; }
.dark { --brand: green; }
${brandUse}`;
			const descendants = [brandElement];

			expect(resolve(css, { descendants })('.text-brand')).toBe('red');
			expect(
				resolve(css, { root: element({ class: 'app dark' }), descendants })('.text-brand')
			).toBe('green');
		});

		it('prefers !important and then specificity over source order', () => {
			const important = resolve(`:root { --brand: blue !important; }
:root { --brand: red; }
${brandUse}`);
			const importantHtml = resolve(`:root { --brand: green; }
html { --brand: blue !important; }
:root { --brand: red; }
${brandUse}`);
			const specificHtml = resolve(
				`:root { --brand: green; }
html.dark { --brand: blue; }
:root { --brand: red; }
${brandUse}`,
				{ root: element({ class: 'dark' }) }
			);

			expect(important('.text-brand')).toBe('blue');
			expect(importantHtml('.text-brand')).toBe('blue');
			expect(specificHtml('.text-brand')).toBe('blue');
		});

		it('lets an unlayered root declaration beat a more specific layered one', () => {
			const valueOf = resolve(`@layer theme { :root:not(.print), :host { --brand: red; } }
:root { --brand: blue; }
${brandUse}`);

			expect(valueOf('.text-brand')).toBe('blue');
		});

		it('uses the later declaration inside one layer with a valid name', () => {
			for (const name of ['theme', '_a.b-c', 'é', 'custom-properties']) {
				const valueOf = resolve(`@layer ${name} { :root { --brand: blue; } :root { --brand: red; } }
${brandUse}`);

				expect(valueOf('.text-brand'), name).toBe('red');
			}
		});

		it('never matches :host branches against the document root', () => {
			const htmlOrHost = resolve(`:root { --brand: blue; }
html, :host { --brand: red; }
${brandUse}`);
			const hostOnly = resolve(`:root { --brand: blue; }
:root.print, :host { --brand: red; }
${brandUse}`);

			expect(htmlOrHost('.text-brand')).toBe('blue');
			expect(hostOnly('.text-brand')).toBe('blue');
		});

		it('ignores a same-name variable from @layer properties', () => {
			const valueOf = resolve(`* { --tw-leading: 2; }
.leading { line-height: var(--tw-leading); }
@layer properties {
  *, ::before, ::after { --tw-leading: initial; }
  .inside { line-height: var(--tw-leading); }
}`);

			expect(valueOf('.leading', 'line-height')).toBe('2');
			expect(valueOf('.inside', 'line-height')).toBe('var(--tw-leading)');
		});
	});

	// Each case keeps the first intersecting definition, as before cascade ordering
	describe('keeps the first intersecting definition', () => {
		it('without a rendered document', () => {
			const root = postcss.parse(`:root { --brand: blue; }
:root { --brand: red; }
${brandUse}`);
			resolveAllCssVariables(root);

			expect(root.toString()).toContain('color: blue');
		});

		it('for root declarations in different cascade layers', () => {
			const valueOf = resolve(`@layer a, b;
@layer b { :root { --brand: blue; } }
@layer a { :root { --brand: red; } }
${brandUse}`);

			expect(valueOf('.text-brand')).toBe('blue');
		});

		it('for !important declarations in different cascade layers', () => {
			const valueOf = resolve(`@layer a, b;
@layer a { :root { --brand: blue !important; } }
@layer b { :root { --brand: red !important; } }
${brandUse}`);

			expect(valueOf('.text-brand')).toBe('blue');
		});

		it('for !important declarations mixing layered and unlayered roots', () => {
			const valueOf = resolve(`@layer theme { :root { --brand: blue !important; } }
:root { --brand: red !important; }
${brandUse}`);

			expect(valueOf('.text-brand')).toBe('blue');
		});

		it('for a class selector matching an element below html', () => {
			const bodyClass = resolve(
				`:root { --brand: blue; }
.dark { --brand: green; }
:root { --brand: red; }
${brandUse}`,
				{ descendants: [element({ class: 'dark' }), brandElement] }
			);
			const ancestor = resolve(
				`:root { --brand: blue; }
.promo { --brand: blue; }
:root { --brand: red; }
${brandUse}`,
				{ descendants: [element({ class: 'promo' }), brandElement] }
			);

			expect(bodyClass('.text-brand')).toBe('blue');
			expect(ancestor('.text-brand')).toBe('blue');
		});

		it('for a variable declared in a style attribute or <style> element', () => {
			const css = `:root { --brand: blue; }
:root { --brand: red; }
${brandUse}`;
			const onRoot = resolve(css, { root: element({ style: 'color: black; --brand: blue' }) });
			const onElement = resolve(css, {
				descendants: [element({ class: 'text-brand', style: '--brand: blue' })]
			});
			const inStyleElement = resolve(css, { styleSheets: [':root { --brand: blue !important; }'] });
			const unparseable = resolve(css, { descendants: [element({ style: 'color: red }' })] });

			expect(onRoot('.text-brand')).toBe('blue');
			expect(onElement('.text-brand')).toBe('blue');
			expect(inStyleElement('.text-brand')).toBe('blue');
			expect(unparseable('.text-brand')).toBe('blue');
		});

		it('for a later declaration holding a CSS-wide keyword', () => {
			for (const keyword of ['initial', 'INHERIT', 'unset', 'revert', 'revert-layer']) {
				const valueOf = resolve(`:root { --brand: blue; }
:root { --brand: ${keyword}; }
.text-brand { color: var(--brand, blue); }`);

				expect(valueOf('.text-brand'), keyword).toBe('blue');
			}
		});

		it('for a later declaration holding var()', () => {
			const valueOf = resolve(`:root { --brand: blue; }
:root { --brand: var(--missing); }
.text-brand { color: var(--brand, blue); }`);

			expect(valueOf('.text-brand')).toBe('blue');
		});

		it('for a variable registered with @property, in any case', () => {
			const typed =
				resolve(`@property --brand { syntax: "<color>"; inherits: true; initial-value: blue; }
:root { --brand: blue; }
:root { --brand: 10px; }
${brandUse}`);
			const nonInheriting =
				resolve(`@PROPERTY --brand { syntax: "<color>"; INHERITS: FALSE; initial-value: green; }
:root { --brand: blue; }
:root { --brand: red; }
${brandUse}`);

			expect(typed('.text-brand')).toBe('blue');
			expect(nonInheriting('.text-brand')).toBe('blue');
		});

		it('for an alias declared in a root rule html does not match, in either order', () => {
			const alias = ':root.light { --alias: var(--brand); }';
			const use = '.text-brand { color: var(--alias, blue); }';
			const root = element({ class: 'dark' });
			for (const theme of ['.dark', ':root.dark']) {
				const themes = `:root { --brand: blue; }\n${theme} { --brand: red; }`;
				const aliasFirst = resolve(`${themes}\n${alias}\n${use}`, { root });
				const useFirst = resolve(`${themes}\n${use}\n${alias}`, { root });

				expect(aliasFirst('.text-brand'), theme).toBe('blue');
				expect(useFirst('.text-brand'), theme).toBe('blue');
			}
		});

		it('for a use inside another variable declaration', () => {
			const themes = ':root { --brand: green; }\n:root { --brand: red; }';
			const use = '.text-brand { color: var(--alias); }';
			const overridden = resolve(`${themes}
:root { --alias: var(--brand); }
:root { --alias: green; }
${use}`);
			const conditional = resolve(`${themes}
@media print { :root { --alias: var(--brand); } }
:root { --alias: green; }
${use}`);

			expect(overridden('.text-brand')).toBe('green');
			expect(conditional('.text-brand')).toBe('green');
		});

		it('for a use in a root-only rule html does not match', () => {
			const valueOf = resolve(`:root { --brand: blue; }
:root { --brand: red; }
:root.light { color: var(--brand); }`);

			expect(valueOf(':root.light')).toBe('blue');
		});

		it('for an alias whose use declares the aliased variable itself', () => {
			const valueOf = resolve(
				`:root { --brand: blue; }
.text-brand { --brand: red; color: var(--alias); }
:root { --alias: var(--brand); }`,
				{ descendants: [brandElement] }
			);

			expect(valueOf('.text-brand')).toBe('blue');
		});

		it('for declarations in nested rules', () => {
			const root = element({ class: 'foo' });
			const nestedUse = resolve(
				`.foo { .text-brand { --brand: blue; } }
.bar { .text-brand { --brand: red; } }
${brandUse}`,
				{ root }
			);
			const nestedRoot = resolve(
				`:root { --brand: blue; }
.foo { :root { --brand: red; } }
${brandUse}`,
				{ root }
			);

			expect(nestedUse('.text-brand')).toBe('blue');
			expect(nestedRoot('.text-brand')).toBe('blue');
		});

		it('for a use on * declaring the variable itself', () => {
			const valueOf = resolve(`* { --space: 20px; margin: var(--space); }
:root { --space: 30px !important; }`);

			expect(valueOf('*', 'margin')).toBe('20px');
		});

		it('for a root declaration inside @media, also around nested conditional uses', () => {
			const laterMedia = resolve(`:root { --brand: red; }
@media (prefers-color-scheme: dark) { :root { --brand: green; } }
${brandUse}`);
			const nestedUse =
				resolve(`@media (prefers-color-scheme: light) { :root { --brand: blue !important; } }
:root { --brand: red; }
@media (prefers-color-scheme: light) {
  @media (min-width: 100px) { .text-brand { color: var(--brand); } }
}`);

			expect(laterMedia('.text-brand')).toBe('red');
			expect(nestedUse('.text-brand')).toBe('blue');
		});

		it('for a root declaration inside @container', () => {
			const valueOf = resolve(`:root { --brand: red; }
@container card (min-width: 1px) { :root { --brand: blue; } }
@container Card (min-width: 1px) { .text-brand { color: var(--brand); } }`);

			expect(valueOf('.text-brand')).toBe('red');
		});

		it('for selectors outside the supported grammar', () => {
			const selectors = [
				':root:has(.text-brand)',
				':where(:root)',
				':is(:root, .dark)',
				':root**',
				':root.light\\,mode',
				'html:root',
				':root[dir=rtl]',
				':root[data-x="a" i]',
				':root[data-x~="a"]',
				':root:not(:root)',
				':root:not(.a .b)'
			];
			const root = element({ class: 'light,mode a', dir: 'rtl', 'data-x': 'a' });
			for (const selector of selectors) {
				const valueOf = resolve(
					`${selector} { --brand: blue; }
:root { --brand: red; }
${brandUse}`,
					{ root }
				);

				expect(valueOf('.text-brand'), selector).toBe('blue');
			}
		});

		it('for an unescaped line break inside an attribute string', () => {
			for (const lineBreak of ['\n', '\r', '\f']) {
				const valueOf = resolve(
					`:root { --brand: blue; }
:root[data-x="a${lineBreak}b"] { --brand: red; }
${brandUse}`,
					{ root: element({ 'data-x': `a${lineBreak}b` }) }
				);

				expect(valueOf('.text-brand'), JSON.stringify(lineBreak)).toBe('blue');
			}
		});

		it('for deeply nested selectors, without overflowing the stack', () => {
			const depth = 20_000;
			const deep = `:root${':is('.repeat(depth)}:root${')'.repeat(depth)}`;
			const valueOf = resolve(`:root { --brand: blue; }
${deep} { --brand: red; }
${brandUse}`);

			expect(valueOf('.text-brand')).toBe('blue');
		});

		it('for a use whose own selector declares the variable', () => {
			const valueOf = resolve(
				`:root { --brand: red; }
.after { --brand: blue; color: var(--brand); }
.dark { --brand: green; }
.dark { color: var(--brand); }`,
				{ descendants: [element({ class: 'after dark' })] }
			);

			expect(valueOf('.after')).toBe('red');
			expect(valueOf('.dark')).toBe('red');
		});

		it('for a use below the root competing with a class selector', () => {
			const valueOf = resolve(
				`.promo { --brand: blue; }
:root { --brand: red; }
:root .promo { color: var(--brand); }`,
				{ descendants: [element({ class: 'promo' })] }
			);

			expect(valueOf(':root .promo')).toBe('blue');
		});

		it('for a variable also declared in a layer named properties', () => {
			const important = resolve(`:root { --brand: blue; }
:root { --brand: red; }
@layer properties { :root { --brand: blue !important; } }
${brandUse}`);
			// Only an exact name segment is skipped, so this class still reaches below html
			const similarName = resolve(
				`:root { --brand: blue; }
:root { --brand: red; }
@layer custom-properties { .promo { --brand: blue; } }
${brandUse}`,
				{ descendants: [element({ class: 'promo' }), brandElement] }
			);

			expect(important('.text-brand')).toBe('blue');
			expect(similarName('.text-brand')).toBe('blue');
		});

		it('for a declaration written with escapes', () => {
			const use = '.text-brand { color: var(--brand, blue); }';
			const keyword = resolve(`:root { --brand: blue; }
:root { --brand: \\69 nitial; }
${use}`);
			const fn = resolve(`:root { --brand: blue; }
:root { --brand: v\\61 r(--missing); }
${use}`);
			const important = resolve(`:root { --brand: blue !im\\70 ortant; }
:root { --brand: red; }
${use}`);

			expect(keyword('.text-brand')).toBe('blue');
			expect(fn('.text-brand')).toBe('blue');
			expect(important('.text-brand')).toBe('blue !im\\70 ortant');
		});

		it('for selectors holding spaces that are not CSS whitespace', () => {
			const root = element({ 'data-x': 'a' });
			for (const space of [' ', '\u000b', ' ', '﻿']) {
				const selectors = [
					`:root${space}`,
					`${space}:root`,
					`:root[data-x${space}=a]`,
					`:root:not(${space}.print)`
				];
				for (const selector of selectors) {
					const valueOf = resolve(
						`:root { --brand: blue; }
${selector} { --brand: red; }
${brandUse}`,
						{ root }
					);

					expect(valueOf('.text-brand'), JSON.stringify(selector)).toBe('blue');
				}
			}
		});

		it('for a stylesheet with @namespace', () => {
			const valueOf = resolve(`@namespace url(http://www.w3.org/2000/svg);
:root { --brand: blue; }
html { --brand: red !important; }
${brandUse}`);

			expect(valueOf('.text-brand')).toBe('blue');
		});

		it('for a cascade layer name that is not an identifier', () => {
			for (const name of ['123', '-', '-1x', 'theme.2x', 'a..b']) {
				const valueOf = resolve(`@layer ${name} { :root { --brand: blue; } :root { --brand: red; } }
${brandUse}`);

				expect(valueOf('.text-brand'), name).toBe('blue');
			}
		});

		it('when no root selector matches the rendered html element', () => {
			const valueOf = resolve(`:root.dark { --brand: blue; }
${brandUse}`);

			expect(valueOf('.text-brand')).toBe('blue');
		});
	});
});
