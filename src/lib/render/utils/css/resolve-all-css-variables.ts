import type { Root, Declaration, Rule, AtRule, Container } from 'postcss';
import valueParser from 'postcss-value-parser';

const MAX_CSS_VARIABLE_RESOLUTION_ITERATIONS = 10;

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
	let iteration = 0;

	while (iteration < MAX_CSS_VARIABLE_RESOLUTION_ITERATIONS) {
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
				variableName: decl.prop
			});
		}

		if (decl.value.includes('var(')) {
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

		// Early exit: If no variable uses found, we're done
		if (variableUses.length === 0) {
			break;
		}

		// Second pass: resolve variables
		let replacedInThisIteration = false;

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
				use.declaration.value = use.declaration.value.replaceAll(
					use.raw,
					definition.declaration.value
				);
				hasReplaced = true;
				replacedInThisIteration = true;
				break;
			}

			// Check if use is in a top-level at-rule (no atRuleSelector) and definition is in :root or universal
			if (
				use.inAtRule &&
				!use.atRuleSelector &&
				(definition.selector.includes(':root') || definition.selector === '*')
			) {
				use.declaration.value = use.declaration.value.replaceAll(
					use.raw,
					definition.declaration.value
				);
				hasReplaced = true;
				replacedInThisIteration = true;
				break;
			}

			// Check if both are in rules with matching selectors
			if (!use.inAtRule && doSelectorsIntersect(use.selector, definition.selector)) {
				use.declaration.value = use.declaration.value.replaceAll(
					use.raw,
					definition.declaration.value
				);
				hasReplaced = true;
				replacedInThisIteration = true;
				break;
			}
		}

		if (!hasReplaced && use.fallback) {
			use.declaration.value = use.declaration.value.replaceAll(use.raw, use.fallback);
			replacedInThisIteration = true;
		}
	}

		// Early exit: If nothing was replaced, no point continuing
		if (!replacedInThisIteration) {
			break;
		}

		iteration++;
	}

	// Warning for circular references
	if (iteration === MAX_CSS_VARIABLE_RESOLUTION_ITERATIONS) {
		console.warn(
			`[better-svelte-email] CSS variable resolution hit maximum iterations (${MAX_CSS_VARIABLE_RESOLUTION_ITERATIONS}). ` +
				`This may indicate circular variable references.`
		);
	}
}
