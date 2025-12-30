import type { Root, Rule } from 'postcss';
import { isRuleInlinable } from './is-rule-inlinable.js';

export interface GlobalRules {
	/** Universal (*) rules - apply to all elements */
	universal: Rule[];
	/** Element selector rules - keyed by lowercase element name */
	element: Map<string, Rule[]>;
	/** :root rules - apply to html element only */
	root: Rule[];
}

/**
 * Extracts global CSS rules (non-class selectors) from a PostCSS Root.
 * These include universal (*), element (div, p, etc.), and :root selectors.
 *
 * Only extracts inlinable rules (not in media queries, no pseudo-classes).
 */
export function extractGlobalRules(root: Root): GlobalRules {
	const result: GlobalRules = {
		universal: [],
		element: new Map(),
		root: []
	};

	root.walkRules((rule) => {
		const selector = rule.selector.trim();

		// :root selector is a special case - it's inlinable (just targets html element)
		// Check this BEFORE isRuleInlinable since that function rejects pseudo-selectors
		if (selector === ':root') {
			// Still need to check for media queries, etc.
			if (isRuleInMediaQuery(rule)) {
				return;
			}
			result.root.push(rule);
			return;
		}

		// Skip non-inlinable rules (media queries, pseudo-classes)
		if (!isRuleInlinable(rule)) {
			return;
		}

		// Skip if selector contains a class (handled by extractRulesPerClass)
		if (selector.includes('.')) {
			return;
		}

		// Skip attribute selectors
		if (selector.includes('[')) {
			return;
		}

		// Skip ID selectors
		if (selector.includes('#')) {
			return;
		}

		// Skip complex selectors with combinators (except for universal *)
		// e.g., "div > p", "div p", "div + p", "div ~ p"
		if (/[>\s+~]/.test(selector) && selector !== '*') {
			return;
		}

		// Universal selector
		if (selector === '*') {
			result.universal.push(rule);
			return;
		}

		// Element selector (simple tag name only)
		// Match valid HTML element names (letters, numbers, hyphens)
		if (/^[a-z][a-z0-9-]*$/i.test(selector)) {
			const elementName = selector.toLowerCase();
			if (!result.element.has(elementName)) {
				result.element.set(elementName, []);
			}
			result.element.get(elementName)!.push(rule);
			return;
		}
	});

	return result;
}

/**
 * Checks if a rule is inside a media query or other non-inlinable at-rule.
 */
function isRuleInMediaQuery(rule: Rule): boolean {
	const NON_INLINABLE_AT_RULES = new Set(['media', 'supports', 'container', 'document']);

	let parent = rule.parent;
	while (parent && parent.type !== 'root') {
		if (parent.type === 'atrule') {
			const atRule = parent as import('postcss').AtRule;
			if (NON_INLINABLE_AT_RULES.has(atRule.name)) {
				return true;
			}
		}
		parent = parent.parent;
	}
	return false;
}
