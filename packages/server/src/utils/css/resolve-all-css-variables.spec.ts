import postcss from 'postcss';
import { resolveAllCssVariables } from './resolve-all-css-variables.js';
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
