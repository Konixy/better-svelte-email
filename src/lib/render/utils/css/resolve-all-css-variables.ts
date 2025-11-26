import type { Root, Declaration, Rule, AtRule, Container } from 'postcss';
import valueParser from 'postcss-value-parser';

interface VariableUse {
	declaration: Declaration;
	selector: string;
	inAtRule: boolean;
	atRuleSelector?: string;
	fallback?: string;
	variableName: string;
	raw: string;
}

export interface VariableDefinition {
	declaration: Declaration;
	selector: string;
	variableName: string;
	definition: string;
}

function getSelector(decl: Declaration): string {
	const parent = decl.parent;
	if (parent?.type === 'rule') {
		return (parent as Rule).selector;
	}
	return '*';
}

function getAtRuleSelector(decl: Declaration): string | undefined {
	let parent = decl.parent;
	while (parent) {
		if (parent.type === 'atrule') {
			// Check if parent of atrule is a rule
			const atRuleParent = parent.parent;
			if (atRuleParent?.type === 'rule') {
				return (atRuleParent as Rule).selector;
			}
		}
		if (parent.type === 'rule') {
			return (parent as Rule).selector;
		}
		parent = parent.parent as Container | undefined;
	}
	return undefined;
}

function isInAtRule(decl: Declaration): boolean {
	let parent = decl.parent;
	while (parent) {
		if (parent.type === 'atrule') {
			return true;
		}
		parent = parent.parent as Container | undefined;
	}
	return false;
}

function isInPropertiesLayer(decl: Declaration): boolean {
	let parent = decl.parent;
	while (parent) {
		if (parent.type === 'atrule') {
			const atRule = parent as AtRule;
			if (atRule.name === 'layer' && atRule.params?.includes('properties')) {
				return true;
			}
		}
		parent = parent.parent as Container | undefined;
	}
	return false;
}

function doSelectorsIntersect(first: string, second: string): boolean {
	if (first === second) return true;

	// Check for universal selectors
	if (first.includes(':root') || second.includes(':root')) return true;
	if (first === '*' || second === '*') return true;

	return false;
}

export function resolveAllCssVariables(root: Root) {
	const variableDefinitions = new Set<VariableDefinition>();
	const variableUses: VariableUse[] = [];

	// First pass: collect variable definitions and uses
	root.walkDecls((decl) => {
		// Skip @layer (properties) { ... } to avoid variable resolution conflicts
		if (isInPropertiesLayer(decl)) {
			return;
		}

		if (decl.prop.startsWith('--')) {
			variableDefinitions.add({
				declaration: decl,
				selector: getSelector(decl),
				variableName: decl.prop,
				definition: decl.value
			});
		} else if (decl.value.includes('var(')) {
			const parseVariableUses = (value: string) => {
				const parsed = valueParser(value);

				parsed.walk((node) => {
					if (node.type === 'function' && node.value === 'var') {
						const varNameNode = node.nodes[0];
						const varName = varNameNode ? valueParser.stringify(varNameNode).trim() : '';

						// Find fallback (after the comma)
						let fallback: string | undefined;
						const commaIndex = node.nodes.findIndex((n) => n.type === 'div' && n.value === ',');
						if (commaIndex !== -1) {
							fallback = valueParser.stringify(node.nodes.slice(commaIndex + 1)).trim();
						}

						const raw = valueParser.stringify(node);

						variableUses.push({
							declaration: decl,
							selector: getSelector(decl),
							inAtRule: isInAtRule(decl),
							atRuleSelector: getAtRuleSelector(decl),
							fallback,
							variableName: varName,
							raw
						});

						// If fallback contains var(), recursively parse those too
						if (fallback?.includes('var(')) {
							parseVariableUses(fallback);
						}
					}
				});
			};

			parseVariableUses(decl.value);
		}
	});

	// Second pass: resolve variables
	for (const use of variableUses) {
		let hasReplaced = false;

		for (const definition of variableDefinitions) {
			if (use.variableName !== definition.variableName) {
				continue;
			}

			// Check if use is in an at-rule and definition is in a matching rule
			if (
				use.inAtRule &&
				use.atRuleSelector &&
				doSelectorsIntersect(use.atRuleSelector, definition.selector)
			) {
				use.declaration.value = use.declaration.value.replaceAll(use.raw, definition.definition);
				hasReplaced = true;
				break;
			}

			// Check if both are in rules with matching selectors
			if (!use.inAtRule && doSelectorsIntersect(use.selector, definition.selector)) {
				use.declaration.value = use.declaration.value.replaceAll(use.raw, definition.definition);
				hasReplaced = true;
				break;
			}
		}

		if (!hasReplaced && use.fallback) {
			use.declaration.value = use.declaration.value.replaceAll(use.raw, use.fallback);
		}
	}
}
