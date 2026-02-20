import type { AtRule, Rule } from 'postcss';

// At-rules that prevent inlining when found inside a rule (CSS nesting)
const NON_INLINABLE_AT_RULES = new Set(['media', 'supports', 'container', 'document']);

export function isRuleInlinable(rule: Rule): boolean {
	// Check if rule CONTAINS a conditional at-rule (for CSS nesting like Tailwind v4)
	// e.g., .sm\:bg-blue-300 { @media (width >= 40rem) { ... } }
	let hasAtRuleInside = false;
	rule.walk((node) => {
		if (node.type === 'atrule') {
			hasAtRuleInside = true;
			return false; // Stop walking
		}
	});

	if (hasAtRuleInside) {
		return false;
	}

	// Check if rule is INSIDE a conditional at-rule (media query, etc.)
	// Note: @layer is just a grouping mechanism, it doesn't prevent inlining
	let parent = rule.parent;
	while (parent && parent.type !== 'root') {
		if (parent.type === 'atrule') {
			const atRule = parent as AtRule;
			if (NON_INLINABLE_AT_RULES.has(atRule.name)) {
				return false;
			}
		}
		parent = parent.parent;
	}

	// Check for pseudo selectors in the selector string
	// Matches :hover, ::before, :nth-child(), etc.
	const hasPseudoSelector = /::?[\w-]+(\([^)]*\))?/.test(rule.selector);

	return !hasPseudoSelector;
}
