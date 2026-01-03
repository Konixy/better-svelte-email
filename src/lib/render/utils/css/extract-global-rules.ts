import type { AtRule, Root, Rule } from 'postcss';
import { splitSelectorList } from './split-selector-list.js';

export interface GlobalRules {
	/** Universal (*) rules - apply to all elements */
	universal: Rule[];
	/** Element selector rules - keyed by lowercase element name */
	element: Map<string, Rule[]>;
	/** :root rules - apply to html element only */
	root: Rule[];
}

/**
 * Checks if a selector string contains pseudo-classes or pseudo-elements.
 * e.g., :hover, ::before, :nth-child()
 */
function hasPseudoSelector(selector: string): boolean {
	return /::?[\w-]+(\([^)]*\))?/.test(selector);
}

/**
 * Extracts global CSS rules (non-class selectors) from a PostCSS Root.
 * These include universal (*), element (div, p, etc.), and :root selectors.
 *
 * Handles comma-separated selector lists by splitting them and extracting
 * only the inlinable parts. e.g., "*, ::before, ::after" extracts just "*".
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
		// Check media query once per rule (applies to all selectors)
		const inMediaQuery = isRuleInMediaQuery(rule);

		// Split comma-separated selector list
		const selectors = splitSelectorList(rule.selector);

		for (const rawSelector of selectors) {
			const selector = rawSelector.trim();
			if (!selector) continue;

			// :root selector is a special case - it's inlinable (just targets html element)
			if (selector === ':root') {
				if (!inMediaQuery) {
					const cloned = rule.clone();
					cloned.selector = selector;
					result.root.push(cloned);
				}
				continue;
			}

			// Check pseudo-selectors on THIS specific selector
			if (hasPseudoSelector(selector)) {
				continue;
			}

			// Skip rules in media queries
			if (inMediaQuery) {
				continue;
			}

			// Skip if selector contains a class (handled by extractRulesPerClass)
			if (selector.includes('.')) {
				continue;
			}

			// Skip attribute selectors
			if (selector.includes('[')) {
				continue;
			}

			// Skip ID selectors
			if (selector.includes('#')) {
				continue;
			}

			// Skip complex selectors with combinators (except for universal *)
			// e.g., "div > p", "div p", "div + p", "div ~ p"
			if (/[>\s+~]/.test(selector) && selector !== '*') {
				continue;
			}

			// Clone rule with single selector for storage
			const cloned = rule.clone();
			cloned.selector = selector;

			// Universal selector
			if (selector === '*') {
				result.universal.push(cloned);
				continue;
			}

			// Element selector (simple tag name only)
			// Match valid HTML element names (letters, numbers, hyphens)
			if (/^[a-z][a-z0-9-]*$/i.test(selector)) {
				const elementName = selector.toLowerCase();
				if (!result.element.has(elementName)) {
					result.element.set(elementName, []);
				}
				result.element.get(elementName)!.push(cloned);
			}
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
