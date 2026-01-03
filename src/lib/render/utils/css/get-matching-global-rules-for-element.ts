import type { AST } from '$lib/render/index.js';
import { Declaration, type Rule } from 'postcss';

// Properties from * selector that should always be applied (layout-critical)
const ALWAYS_APPLY_PROPS = ['box-sizing', 'margin'];

// Properties from * selector that are conditionally applied based on element classes
const CONDITIONAL_PROPS_PATTERN = /(border|outline)-color/g;

export function getMatchingGlobalRulesForElement(rules: Rule[], element: AST.Element): Rule[] {
	const matchingRules: Rule[] = [];
	for (const rule of rules) {
		const matchingDecls: Declaration[] = [];

		for (const node of rule.nodes) {
			if (node.type !== 'decl') continue;
			const decl = node as Declaration;

			if (ALWAYS_APPLY_PROPS.includes(decl.prop)) {
				matchingDecls.push(decl);
				continue;
			}

			if (decl.prop.match(CONDITIONAL_PROPS_PATTERN)) {
				const key = decl.prop.match(/(border|outline)-color/)?.[1];
				if (!key) continue;
				const hasMatchingClass = element.attrs?.find(
					(attr) => attr.name === 'class' && attr.value?.match(key)
				);
				if (hasMatchingClass) {
					matchingDecls.push(decl);
				}
			}
		}

		if (matchingDecls.length > 0) {
			const clonedRule = rule.clone();
			clonedRule.nodes = matchingDecls;
			matchingRules.push(clonedRule);
		}
	}
	return matchingRules;
}
