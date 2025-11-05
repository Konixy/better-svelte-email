import type { Rule } from 'css-tree';
import { sanitizeClassName } from '$lib/render/utils/compatibility/sanitize-class-name.js';
import type { CustomProperties } from '$lib/render/utils/css/get-custom-properties.js';
import { makeInlineStylesFor } from '$lib/render/utils/css/make-inline-styles-for.js';
import type { AST } from '$lib/render/index.js';
import { combineStyles } from '$lib/utils/index.js';

export function addInlinedStylesToElement(
	element: AST.Element,
	inlinableRules: Map<string, Rule>,
	nonInlinableRules: Map<string, Rule>,
	customProperties: CustomProperties,
	unknownClasses: string[]
): AST.Element {
	const classAttr = element.attrs?.find((attr) => attr.name === 'class');
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

		const styles = makeInlineStylesFor(rules, customProperties);
		const styleAttr = element.attrs?.find((attr) => attr.name === 'style');
		const newStyles = combineStyles(styleAttr?.value ?? '', styles);

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
	}

	return element;
}
