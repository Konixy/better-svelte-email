import type { Root } from 'postcss';
import { sanitizeClassName } from '../compatibility/sanitize-class-name.js';
import { isRuleInlinable } from './is-rule-inlinable.js';

/**
 * This function goes through a few steps to ensure the best email client support and
 * to ensure that media queries and pseudo classes are applied correctly alongside
 * the inline styles.
 *
 * What it does:
 * 1. Converts all declarations in all rules into important ones
 * 2. Sanitizes class selectors of all non-inlinable rules
 */
export function sanitizeNonInlinableRules(root: Root) {
	root.walkRules((rule) => {
		if (!isRuleInlinable(rule)) {
			// Sanitize class names in selector
			// The regex matches class names including escaped characters (like \: or \/)
			// Note: \\. must come FIRST in the alternation to properly match escapes
			rule.selector = rule.selector.replace(/\.((?:\\.|[^\s.:>+~[#,])+)/g, (match, className) => {
				const unescaped = className.replace(/\\(.)/g, '$1');
				return '.' + sanitizeClassName(unescaped);
			});

			// Make all declarations important
			rule.walkDecls((decl) => {
				decl.important = true;
			});
		}
	});
}
