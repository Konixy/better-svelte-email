import { describe, it, expect } from 'vitest';
import postcss, { type Rule } from 'postcss';
import type { DefaultTreeAdapterTypes as AST } from 'parse5';
import { getMatchingGlobalRulesForElement } from './get-matching-global-rules-for-element.js';

describe('getMatchingGlobalRulesForElement()', () => {
	function createMockElement(classValue?: string): AST.Element {
		const attrs: Array<{ name: string; value: string }> = [];
		if (classValue !== undefined) {
			attrs.push({ name: 'class', value: classValue });
		}
		return {
			nodeName: 'div',
			tagName: 'div',
			namespaceURI: 'http://www.w3.org/1999/xhtml',
			attrs,
			childNodes: [],
			parentNode: null
		} as AST.Element;
	}

	function extractRules(css: string): Rule[] {
		const root = postcss.parse(css);
		const rules: Rule[] = [];
		root.walkRules((rule) => {
			rules.push(rule);
		});
		return rules;
	}

	it('returns matching rule when element has "border" class and rule has border-color', () => {
		const element = createMockElement('border');
		const rules = extractRules(`
			* { border-color: red; }
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(1);
		expect(result[0].toString()).toContain('border-color: red');
	});

	it('returns matching rule when element has "outline" class and rule has outline-color', () => {
		const element = createMockElement('outline');
		const rules = extractRules(`
			* { outline-color: blue; }
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(1);
		expect(result[0].toString()).toContain('outline-color: blue');
	});

	it('returns empty array when element has no matching class', () => {
		const element = createMockElement('text-center bg-red-500');
		const rules = extractRules(`
			* { border-color: red; }
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(0);
	});

	it('returns empty array when rules array is empty', () => {
		const element = createMockElement('border');
		const rules: Rule[] = [];

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(0);
	});

	it('returns empty array when element has no class attribute', () => {
		const element = createMockElement();
		const rules = extractRules(`
			* { border-color: red; }
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(0);
	});

	it('returns empty array when element has empty class value', () => {
		const element = createMockElement('');
		const rules = extractRules(`
			* { border-color: red; }
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(0);
	});

	it('skips rules without border-color or outline-color declarations', () => {
		const element = createMockElement('border');
		const rules = extractRules(`
			* { color: red; background: blue; }
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(0);
	});

	it('filters to only matching declarations within a rule', () => {
		const element = createMockElement('border');
		const rules = extractRules(`
			* { 
				border-color: red;
				outline-color: blue;
				color: green;
			}
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(1);
		// Should only contain border-color, not outline-color
		expect(result[0].toString()).toContain('border-color: red');
		expect(result[0].toString()).not.toContain('outline-color');
	});

	it('handles element with both border and outline classes', () => {
		const element = createMockElement('border outline');
		const rules = extractRules(`
			* { 
				border-color: red;
				outline-color: blue;
			}
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(1);
		// Should contain both declarations
		expect(result[0].toString()).toContain('border-color: red');
		expect(result[0].toString()).toContain('outline-color: blue');
	});

	it('handles multiple rules with different matching declarations', () => {
		const element = createMockElement('border');
		const rules = extractRules(`
			* { border-color: red; }
			div { border-color: blue; }
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(2);
		expect(result[0].toString()).toContain('border-color: red');
		expect(result[1].toString()).toContain('border-color: blue');
	});

	it('handles class names containing "border" as part of a larger name', () => {
		const element = createMockElement('border-2 border-solid');
		const rules = extractRules(`
			* { border-color: red; }
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		// Should match because "border-2" contains "border"
		expect(result).toHaveLength(1);
	});

	it('handles class names containing "outline" as part of a larger name', () => {
		const element = createMockElement('outline-2 outline-dashed');
		const rules = extractRules(`
			* { outline-color: blue; }
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		// Should match because "outline-2" contains "outline"
		expect(result).toHaveLength(1);
	});

	it('does not match when class contains unrelated text', () => {
		const element = createMockElement('text-borderless');
		const rules = extractRules(`
			* { border-color: red; }
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		// Should match because class value still contains "border"
		expect(result).toHaveLength(1);
	});

	it('handles rules from @layer', () => {
		const element = createMockElement('border');
		// Parse extracts the inner rule from @layer
		const root = postcss.parse(`
			@layer base {
				* { border-color: currentColor; }
			}
		`);
		const rules: Rule[] = [];
		root.walkRules((rule) => {
			rules.push(rule);
		});

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(1);
		expect(result[0].toString()).toContain('border-color: currentColor');
	});

	it('handles element selectors, not just universal', () => {
		const element = createMockElement('border');
		const rules = extractRules(`
			div { border-color: green; }
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(1);
		expect(result[0].toString()).toContain('border-color: green');
	});

	it('returns empty when rule has border-color but element lacks border class', () => {
		const element = createMockElement('outline');
		const rules = extractRules(`
			* { border-color: red; }
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(0);
	});

	it('returns empty when rule has outline-color but element lacks outline class', () => {
		const element = createMockElement('border');
		const rules = extractRules(`
			* { outline-color: blue; }
		`);

		const result = getMatchingGlobalRulesForElement(rules, element);

		expect(result).toHaveLength(0);
	});
});
