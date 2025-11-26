import postcss from 'postcss';
import { makeInlineStylesFor } from './make-inline-styles-for.js';
import { expect, describe, it } from 'vitest';

describe('makeInlineStylesFor()', async () => {
	it('works in simple use case', () => {
		const root = postcss.parse(`
      .bg-red-500 { background-color: #f56565; }
      .w-full { width: 100%; }
    `);

		// Get the rules from the root
		const rules = root.nodes.filter((node) => node.type === 'rule');
		expect(makeInlineStylesFor(rules, new Map())).toMatchSnapshot();
	});

	it('does basic local variable resolution', () => {
		const root = postcss.parse(`
      .btn {
        --btn-bg: #3490dc;
        --btn-text: #fff;
        background-color: var(--btn-bg);
        color: var(--btn-text);
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
      }
    `);

		const rules = root.nodes.filter((node) => node.type === 'rule');
		expect(makeInlineStylesFor(rules, new Map())).toMatchSnapshot();
	});
});
