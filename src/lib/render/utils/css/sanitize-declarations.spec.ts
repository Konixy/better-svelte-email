import postcss from 'postcss';
import { sanitizeDeclarations } from './sanitize-declarations.js';
import { expect, describe, it, test } from 'vitest';

describe('sanitizeDeclarations', () => {
	it('converts border-radius:calc(Infinity * 1px) to border-radius:9999px', () => {
		let root = postcss.parse(`.rounded-full {
  border-radius: calc(Infinity * 1px);
}
`);
		sanitizeDeclarations(root);
		expect(root.toString()).toContain('border-radius: 9999px');

		root = postcss.parse(`.rounded-full {
  border-radius: calc(infinity * 1px);
}
`);
		sanitizeDeclarations(root);
		expect(root.toString()).toContain('border-radius: 9999px');

		root = postcss.parse(`.rounded-full {
  border-radius: calc(infinity*1px);
}
`);
		sanitizeDeclarations(root);
		expect(root.toString()).toContain('border-radius: 9999px');

		root = postcss.parse(`.rounded-full {
  border-radius: calc(Infinity*1px);
}
`);
		sanitizeDeclarations(root);
		expect(root.toString()).toContain('border-radius: 9999px');
	});

	it('separates padding-block and padding-inline', () => {
		let root = postcss.parse(`.box {
  padding-inline: 4px 14;
}
`);
		sanitizeDeclarations(root);
		expect(root.toString()).toMatchSnapshot();

		root = postcss.parse(`.box {
  padding-block: 10px 20%;
}
`);
		sanitizeDeclarations(root);
		expect(root.toString()).toMatchSnapshot();

		root = postcss.parse(`.box {
  padding-inline: 99rem;
}
`);
		sanitizeDeclarations(root);
		expect(root.toString()).toMatchSnapshot();

		root = postcss.parse(`.box {
  padding-block: 8px;
}
`);
		sanitizeDeclarations(root);
		expect(root.toString()).toMatchSnapshot();
	});

	it('should do separation of margin-block and margin-inline', () => {
		let root = postcss.parse(`.box {
  margin-inline: 4px 14;
}
`);
		sanitizeDeclarations(root);
		expect(root.toString()).toMatchSnapshot();

		root = postcss.parse(`.box {
  margin-block: 10px 20%;
}
`);
		sanitizeDeclarations(root);
		expect(root.toString()).toMatchSnapshot();

		root = postcss.parse(`.box {
  margin-inline: 99rem;
}
`);
		sanitizeDeclarations(root);
		expect(root.toString()).toMatchSnapshot();

		root = postcss.parse(`.box {
  margin-block: 8px;
}
`);
		sanitizeDeclarations(root);
		expect(root.toString()).toMatchSnapshot();
	});

	test('oklch to rgb conversion', () => {
		let stylesheet = postcss.parse('div { color: oklch(90.5% 0.2 180); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString(), 'conversion without alpha').toMatchSnapshot();

		stylesheet = postcss.parse('div { color: oklch(96.6% 0.147 107 / 80%); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString(), 'conversion with alpha').toMatchSnapshot();

		stylesheet = postcss.parse('div { color: oklch(96.6% 0.147 107deg / 80%); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString(), 'conversion with deg unit').toMatchSnapshot();

		stylesheet = postcss.parse('div { color: oklch(92.6% 0.0546 218 / 50%); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: oklch(88.3% 0.102 329); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: oklch(69.3% 0.206 42.8); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();
	});

	test('rgba space syntax to comma syntax conversion', () => {
		let stylesheet = postcss.parse('div { color: rgb(255 0 128); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString(), 'conversion with space syntax and no alpha').toMatchSnapshot();

		stylesheet = postcss.parse('div { color: rgb(255 0 128 / 0.5); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString(), 'conversion with space syntax and alpha').toMatchSnapshot();

		stylesheet = postcss.parse('div { color: rgb(100% 0% 50% / 50%); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString(), 'conversion with percentage values').toMatchSnapshot();

		stylesheet = postcss.parse('div { color: rgb(255 0 128 / 50%); }');
		sanitizeDeclarations(stylesheet);
		expect(
			stylesheet.toString(),
			'conversion with space syntax and alpha with a percetange syntax'
		).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: rgb(255 0 128 / 1); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse(
			'div { background: linear-gradient(rgb(255 0 0), rgb(0 255 0 / 0.8)); }'
		);
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: rgb(  255   0   128  /  0.7  ); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: rgb(0 0 0); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: rgb(255, 0, 128); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString(), 'treatment for already supported rgb syntax').toMatchSnapshot();
	});

	test('hex to rgb conversion', () => {
		let stylesheet = postcss.parse('div { color: #f0a; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString(), '3-digit hex without alpha').toMatchSnapshot();

		stylesheet = postcss.parse('div { color: #f0a8; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString(), '4-digit hex with alpha').toMatchSnapshot();

		stylesheet = postcss.parse('div { color: #ff00aa; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString(), '6-digit hex without alpha').toMatchSnapshot();

		stylesheet = postcss.parse('div { color: #ff00aa80; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString(), '8-digit hex with alpha').toMatchSnapshot();

		stylesheet = postcss.parse('div { color: #000; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: #fff; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: #ff0000; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: #00ff00; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: #0000ff; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: #abcdef; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: #ABCDEF; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: #AbCdEf; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString(), 'mixed casing').toMatchSnapshot();

		stylesheet = postcss.parse('div { color: #ff000000; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { color: #ff0000ff; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse('div { background: linear-gradient(#ff0000, #00ff00, #0000ff); }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse(
			'div { background: linear-gradient(#ff0000, rgb(0 255 0), oklch(50% 0.2 240)); }'
		);
		sanitizeDeclarations(stylesheet);
		const result = stylesheet.toString();
		expect(result).toMatchSnapshot();

		stylesheet = postcss.parse('div { content: "Visit our site at example.com#section"; }');
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();

		stylesheet = postcss.parse(`
      div {
        color: #ff0000;
        background-color: #00ff00;
        border-color: #0000ff;
        box-shadow: 0 0 10px #333;
      }
    `);
		sanitizeDeclarations(stylesheet);
		expect(stylesheet.toString()).toMatchSnapshot();
	});

	it('handles transparency generated with color-mix', () => {
		const stylesheet = postcss.parse(`
     .bg-blue-600/50 {
        background-color: color-mix(in oklab, oklch(54.6% 0.245 262.881) 60%, transparent);
      }
    `);
		sanitizeDeclarations(stylesheet);
		const result = stylesheet.toString();
		expect(result).toMatchSnapshot();
	});

	describe('complex scenarios', () => {
		it('handles multiple declarations with different rgb formats', () => {
			const stylesheet = postcss.parse(`
        div {
          color: rgb(255 0 128 / 0.5);
          background-color: rgb(0 255 0);
          border-color: rgb(128, 128, 128);
        }
      `);
			sanitizeDeclarations(stylesheet);
			const result = stylesheet.toString();
			expect(result).toMatchSnapshot();
		});

		it('handles nested rules', () => {
			const stylesheet = postcss.parse(`
        @media (min-width: 768px) {
          div { color: rgb(255 0 128 / 0.8); }
        }
      `);
			sanitizeDeclarations(stylesheet);
			expect(stylesheet.toString()).toMatchSnapshot();
		});

		it('processes at-rule declarations', () => {
			const stylesheet = postcss.parse(`
        @keyframes fade {
          from { background: rgb(255 0 0 / 0); }
          to { background: rgb(255 0 0 / 1); }
        }
      `);
			sanitizeDeclarations(stylesheet);
			const result = stylesheet.toString();
			expect(result).toMatchSnapshot();
		});
	});
});
