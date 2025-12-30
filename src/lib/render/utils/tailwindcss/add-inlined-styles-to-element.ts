import type { Rule } from 'postcss';
import { sanitizeClassName } from '$lib/render/utils/compatibility/sanitize-class-name.js';
import type { CustomProperties } from '$lib/render/utils/css/get-custom-properties.js';
import { makeInlineStylesFor } from '$lib/render/utils/css/make-inline-styles-for.js';
import type { GlobalRules } from '$lib/render/utils/css/extract-global-rules.js';
import type { AST } from '$lib/render/index.js';
import { combineStyles } from '$lib/utils/index.js';

/**
 * Gets global styles for an element based on its tag name.
 * Applies rules in specificity order: universal (*) -> element -> :root (for html only)
 */
function getGlobalStylesForElement(
	element: AST.Element,
	globalRules: GlobalRules,
	customProperties: CustomProperties
): string {
	const rules: Rule[] = [];
	const tagName = element.tagName.toLowerCase();

	// 1. Universal rules (lowest specificity)
	rules.push(...globalRules.universal);

	// 2. Element selector rules
	const elementRules = globalRules.element.get(tagName);
	if (elementRules) {
		rules.push(...elementRules);
	}

	// 3. :root rules (only for html element)
	if (tagName === 'html') {
		rules.push(...globalRules.root);
	}

	if (rules.length === 0) {
		return '';
	}

	return makeInlineStylesFor(rules, customProperties);
}

export function addInlinedStylesToElement(
	element: AST.Element,
	inlinableRules: Map<string, Rule>,
	nonInlinableRules: Map<string, Rule>,
	customProperties: CustomProperties,
	unknownClasses: string[],
	globalRules?: GlobalRules
): AST.Element {
	// Get global styles first (lowest specificity)
	const globalStyles = globalRules
		? getGlobalStylesForElement(element, globalRules, customProperties)
		: '';

	const classAttr = element.attrs?.find((attr) => attr.name === 'class');
	const styleAttr = element.attrs?.find((attr) => attr.name === 'style');
	const existingStyles = styleAttr?.value ?? '';

	if (classAttr && classAttr.value) {
		const classes = classAttr.value.split(/\s+/).filter(Boolean);

		const residualClasses: string[] = [];

		const rules: Rule[] = [];
		for (const className of classes) {
			const rule = inlinableRules.get(className);
			if (rule) {
				rules.push(rule);
			} else {
				residualClasses.push(className);
			}
		}

		const classStyles = makeInlineStylesFor(rules, customProperties);

		// Combine: global (lowest) -> class styles -> existing inline (highest)
		const newStyles = combineStyles(globalStyles, classStyles, existingStyles);

		if (newStyles) {
			if (styleAttr) {
				element.attrs = element.attrs?.map((attr) => {
					if (attr.name === 'style') {
						return { ...attr, value: newStyles };
					}
					return attr;
				});
			} else {
				element.attrs = [...element.attrs, { name: 'style', value: newStyles }];
			}
		}

		if (residualClasses.length > 0) {
			element.attrs = element.attrs?.map((attr) => {
				if (attr.name === 'class') {
					return {
						...attr,
						value: residualClasses
							.map((className) => {
								if (nonInlinableRules.has(className)) {
									return sanitizeClassName(className);
								} else {
									if (!unknownClasses.includes(className)) {
										unknownClasses.push(className);
									}

									return className;
								}
							})
							.join(' ')
					};
				}
				return attr;
			});
		} else {
			element.attrs = element.attrs?.filter((attr) => attr.name !== 'class');
		}
	} else if (globalStyles) {
		// Element has no classes but should still receive global styles
		const newStyles = combineStyles(globalStyles, existingStyles);

		if (newStyles) {
			if (styleAttr) {
				element.attrs = element.attrs?.map((attr) => {
					if (attr.name === 'style') {
						return { ...attr, value: newStyles };
					}
					return attr;
				});
			} else {
				element.attrs = [...(element.attrs || []), { name: 'style', value: newStyles }];
			}
		}
	}

	return element;
}
