import type { AST } from '$lib/render/index.js';
import { Declaration, type Rule } from 'postcss';

export function getMatchingGlobalRulesForElement(rules: Rule[], element: AST.Element): Rule[] {
	const matchingRules: Rule[] = [];
	for (const rule of rules) {
		const matchingDecl = rule.nodes.filter(
			(node) => node.type === 'decl' && node.prop.match(/(border|outline)-color/g)
		) as Declaration[];
		if (matchingDecl.length === 0) continue;

		const matchingDecls: Declaration[] = [];
		for (const decl of matchingDecl) {
			const key = decl.prop.match(/(border|outline)-color/)?.[1];
			if (!key) continue;
			const value = element.attrs?.find((attr) => attr.name === 'class' && attr.value?.match(key));
			if (!value) continue;
			matchingDecls.push(decl);
		}
		if (matchingDecls.length > 0) {
			rule.nodes = matchingDecls;
			matchingRules.push(rule);
		}
	}
	return matchingRules;
}
