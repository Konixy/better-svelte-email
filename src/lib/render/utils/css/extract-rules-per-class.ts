import type { Root, Rule } from 'postcss';
import { isRuleInlinable } from './is-rule-inlinable.js';

function unescapeClassName(name: string): string {
	return name.replace(/\\(.)/g, '$1');
}

export function extractRulesPerClass(root: Root, classes: string[]) {
	const classSet = new Set(classes);

	const inlinableRules = new Map<string, Rule>();
	const nonInlinableRules = new Map<string, Rule>();

	root.walkRules((rule) => {
		// Extract class names from selector using regex
		// The regex matches class names including escaped characters (like \: or \/)
		// Note: \\.  must come FIRST in the alternation to properly match escapes
		const classMatches = rule.selector.matchAll(/\.((?:\\.|[^\s.:>+~[#,])+)/g);
		const selectorClasses = [...classMatches].map((m) => unescapeClassName(m[1]));

		const targetMap = isRuleInlinable(rule) ? inlinableRules : nonInlinableRules;

		for (const className of selectorClasses) {
			if (classSet.has(className)) {
				targetMap.set(className, rule);
			}
		}
	});

	return {
		inlinable: inlinableRules,
		nonInlinable: nonInlinableRules
	};
}
