import postcss, { type Rule } from 'postcss';
import { addInlinedStylesToElement } from './add-inlined-styles-to-element.js';
import type { CustomProperties } from '$lib/render/utils/css/get-custom-properties.js';
import { expect, describe, it } from 'vitest';
import type { DefaultTreeAdapterTypes as AST } from 'parse5';

describe('addInlinedStylesToElement()', () => {
	function createMockElement(classValue: string, styleValue?: string): AST.Element {
		const attrs: Array<{ name: string; value: string }> = [{ name: 'class', value: classValue }];
		if (styleValue) {
			attrs.push({ name: 'style', value: styleValue });
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

	function extractRulesMap(css: string): Map<string, Rule> {
		const root = postcss.parse(css);
		const rulesMap = new Map<string, Rule>();

		root.walkRules((rule) => {
			// Extract class names from selector
			const classMatches = rule.selector.matchAll(/\.([^\s.:>+~[#,]+)/g);
			for (const match of classMatches) {
				const className = match[1].replace(/\\(.)/g, '$1');
				if (!rulesMap.has(className)) {
					rulesMap.set(className, rule);
				}
			}
		});

		return rulesMap;
	}

	it('inlines basic Tailwind utility classes', () => {
		const element = createMockElement('text-center bg-red-500');
		const inlinableRules = extractRulesMap(`
			.text-center { text-align: center; }
			.bg-red-500 { background-color: #ef4444; }
		`);
		const nonInlinableRules = new Map<string, Rule>();
		const customProperties: CustomProperties = new Map();
		const unknownClasses: string[] = [];

		const result = addInlinedStylesToElement(
			element,
			inlinableRules,
			nonInlinableRules,
			customProperties,
			unknownClasses
		);

		const styleAttr = result.attrs?.find((attr) => attr.name === 'style');
		expect(styleAttr).toBeDefined();
		expect(styleAttr?.value).toContain('text-align: center');
		expect(styleAttr?.value).toContain('background-color: #ef4444');

		// Class attribute should be removed since all classes were inlined
		const classAttr = result.attrs?.find((attr) => attr.name === 'class');
		expect(classAttr).toBeUndefined();
	});

	it('preserves existing inline styles', () => {
		const element = createMockElement('text-center', 'font-weight: bold;');
		const inlinableRules = extractRulesMap(`
			.text-center { text-align: center; }
		`);
		const nonInlinableRules = new Map<string, Rule>();
		const customProperties: CustomProperties = new Map();
		const unknownClasses: string[] = [];

		const result = addInlinedStylesToElement(
			element,
			inlinableRules,
			nonInlinableRules,
			customProperties,
			unknownClasses
		);

		const styleAttr = result.attrs?.find((attr) => attr.name === 'style');
		expect(styleAttr?.value).toContain('font-weight: bold');
		expect(styleAttr?.value).toContain('text-align: center');
	});

	it('keeps non-inlinable classes (like media queries)', () => {
		const element = createMockElement('text-center lg:w-1/2');
		const inlinableRules = extractRulesMap(`
			.text-center { text-align: center; }
		`);
		const nonInlinableRules = extractRulesMap(`
			@media (min-width: 1024px) {
				.lg\\:w-1\\/2 { width: 50%; }
			}
		`);
		const customProperties: CustomProperties = new Map();
		const unknownClasses: string[] = [];

		const result = addInlinedStylesToElement(
			element,
			inlinableRules,
			nonInlinableRules,
			customProperties,
			unknownClasses
		);

		const classAttr = result.attrs?.find((attr) => attr.name === 'class');
		expect(classAttr).toBeDefined();
		// The class should be sanitized
		expect(classAttr?.value).toBeTruthy();
	});

	it('tracks unknown classes', () => {
		const element = createMockElement('text-center unknown-class another-unknown');
		const inlinableRules = extractRulesMap(`
			.text-center { text-align: center; }
		`);
		const nonInlinableRules = new Map<string, Rule>();
		const customProperties: CustomProperties = new Map();
		const unknownClasses: string[] = [];

		addInlinedStylesToElement(
			element,
			inlinableRules,
			nonInlinableRules,
			customProperties,
			unknownClasses
		);

		expect(unknownClasses).toContain('unknown-class');
		expect(unknownClasses).toContain('another-unknown');
		expect(unknownClasses).not.toContain('text-center');
	});

	it('handles elements with no classes', () => {
		const element: AST.Element = {
			nodeName: 'div',
			tagName: 'div',
			namespaceURI: 'http://www.w3.org/1999/xhtml',
			attrs: [],
			childNodes: [],
			parentNode: null
		} as AST.Element;
		const inlinableRules = new Map<string, Rule>();
		const nonInlinableRules = new Map<string, Rule>();
		const customProperties: CustomProperties = new Map();
		const unknownClasses: string[] = [];

		const result = addInlinedStylesToElement(
			element,
			inlinableRules,
			nonInlinableRules,
			customProperties,
			unknownClasses
		);

		expect(result.attrs).toEqual([]);
	});

	it('handles mixed inlinable and non-inlinable classes', () => {
		const element = createMockElement('text-center bg-red-500 md:bg-blue-500 unknown-class');
		const inlinableRules = extractRulesMap(`
			.text-center { text-align: center; }
			.bg-red-500 { background-color: #ef4444; }
		`);
		const nonInlinableRules = extractRulesMap(`
			@media (min-width: 768px) {
				.md\\:bg-blue-500 { background-color: #3b82f6; }
			}
		`);
		const customProperties: CustomProperties = new Map();
		const unknownClasses: string[] = [];

		const result = addInlinedStylesToElement(
			element,
			inlinableRules,
			nonInlinableRules,
			customProperties,
			unknownClasses
		);

		const styleAttr = result.attrs?.find((attr) => attr.name === 'style');
		expect(styleAttr?.value).toContain('text-align: center');
		expect(styleAttr?.value).toContain('background-color: #ef4444');

		const classAttr = result.attrs?.find((attr) => attr.name === 'class');
		expect(classAttr).toBeDefined();
		expect(unknownClasses).toContain('unknown-class');
	});

	it('handles empty class attribute', () => {
		const element = createMockElement('   ');
		const inlinableRules = new Map<string, Rule>();
		const nonInlinableRules = new Map<string, Rule>();
		const customProperties: CustomProperties = new Map();
		const unknownClasses: string[] = [];

		const result = addInlinedStylesToElement(
			element,
			inlinableRules,
			nonInlinableRules,
			customProperties,
			unknownClasses
		);

		// Should remove the class attribute
		const classAttr = result.attrs?.find((attr) => attr.name === 'class');
		expect(classAttr).toBeUndefined();
	});
});
