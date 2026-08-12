import type { AtRule, ChildNode, Rule } from 'postcss';

/**
 * At-rules that wrap utility rules and must be preserved when extracting
 * non-inlinable CSS for the email <style> tag.
 *
 * Tailwind v4.3.3+ flattens nesting so media/supports wrap the selector
 * instead of nesting inside it. Cloning the rule alone would drop them.
 */
const PRESERVED_AT_RULES = new Set(['media', 'supports', 'container', 'document']);

/**
 * Clone a PostCSS rule, re-wrapping it with any ancestor conditional at-rules
 * (`@media`, `@supports`, `@container`, `@document`).
 *
 * `@layer` and other grouping at-rules are skipped.
 */
export function cloneRuleWithAtRuleAncestors(rule: Rule): ChildNode {
	let current: ChildNode = rule.clone();

	const ancestors: AtRule[] = [];
	let parent = rule.parent;
	while (parent && parent.type !== 'root') {
		if (parent.type === 'atrule') {
			const atRule = parent as AtRule;
			if (PRESERVED_AT_RULES.has(atRule.name)) {
				ancestors.push(atRule);
			}
		}
		parent = parent.parent;
	}

	// Walk from nearest ancestor outward so the outermost at-rule ends up on top
	for (const atRule of ancestors) {
		const wrapper = atRule.clone({ nodes: [] });
		wrapper.append(current);
		current = wrapper;
	}

	return current;
}
