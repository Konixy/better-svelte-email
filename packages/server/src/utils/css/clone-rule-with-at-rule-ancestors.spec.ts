import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import { cloneRuleWithAtRuleAncestors } from './clone-rule-with-at-rule-ancestors';

describe('cloneRuleWithAtRuleAncestors()', () => {
	it('clones a top-level rule unchanged', () => {
		const root = postcss.parse(`.text-center { text-align: center; }`);
		const rule = root.first!;
		const cloned = cloneRuleWithAtRuleAncestors(rule as postcss.Rule);

		expect(cloned.toString()).toBe(rule.toString());
		expect(cloned).not.toBe(rule);
	});

	it('preserves a parent @media at-rule', () => {
		const root = postcss.parse(`
			@media (width >= 48rem) {
				.md\\:text-left { text-align: left; }
			}
		`);
		const media = root.first as postcss.AtRule;
		const rule = media.first as postcss.Rule;
		const cloned = cloneRuleWithAtRuleAncestors(rule);

		expect(cloned.type).toBe('atrule');
		expect((cloned as postcss.AtRule).name).toBe('media');
		expect((cloned as postcss.AtRule).params).toBe('(width >= 48rem)');
		expect(cloned.toString()).toContain('text-align: left');
		expect(cloned.toString()).toContain('.md\\:text-left');
	});

	it('preserves nested @media ancestors (responsive + hover)', () => {
		const root = postcss.parse(`
			@media (width >= 48rem) {
				@media (hover: hover) {
					.md\\:hover\\:bg-gray-100:hover { background-color: gray; }
				}
			}
		`);
		const outer = root.first as postcss.AtRule;
		const inner = outer.first as postcss.AtRule;
		const rule = inner.first as postcss.Rule;
		const cloned = cloneRuleWithAtRuleAncestors(rule);

		expect(cloned.toString()).toMatch(/@media \(width >= 48rem\)/);
		expect(cloned.toString()).toMatch(/@media \(hover: hover\)/);
		expect(cloned.toString()).toContain('background-color: gray');
	});

	it('skips @layer wrappers', () => {
		const root = postcss.parse(`
			@layer utilities {
				@media (width >= 64rem) {
					.lg\\:w-1\\/2 { width: 50%; }
				}
			}
		`);
		const layer = root.first as postcss.AtRule;
		const media = layer.first as postcss.AtRule;
		const rule = media.first as postcss.Rule;
		const cloned = cloneRuleWithAtRuleAncestors(rule);

		expect(cloned.toString()).not.toContain('@layer');
		expect(cloned.type).toBe('atrule');
		expect((cloned as postcss.AtRule).name).toBe('media');
		expect(cloned.toString()).toContain('width: 50%');
	});

	it('does not mutate the original rule or stylesheet', () => {
		const css = `
			@media (width >= 48rem) {
				.md\\:text-left { text-align: left; }
			}
		`;
		const root = postcss.parse(css);
		const media = root.first as postcss.AtRule;
		const rule = media.first as postcss.Rule;
		const before = root.toString();

		cloneRuleWithAtRuleAncestors(rule);

		expect(root.toString()).toBe(before);
		expect(media.nodes).toHaveLength(1);
	});
});
