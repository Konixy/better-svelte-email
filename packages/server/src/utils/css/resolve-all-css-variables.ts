import postcss, { type Root, type Declaration, type Rule, type AtRule } from 'postcss';
import valueParser from 'postcss-value-parser';
import type { ContainerWithChildren } from 'postcss/lib/container';
import {
	compareSpecificity,
	indexDocument,
	LAYER_NAME,
	matchSelector,
	type IndexedDocument,
	type RenderedDocument,
	type SelectorMatch,
	type Specificity
} from './match-selector';

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
		parent = parent.parent as ContainerWithChildren | undefined;
	}
	return undefined;
}

function isInAtRule(decl: Declaration): boolean {
	let parent = decl.parent;
	while (parent) {
		if (parent.type === 'atrule') {
			return true;
		}
		parent = parent.parent as ContainerWithChildren | undefined;
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
		parent = parent.parent as ContainerWithChildren | undefined;
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

function findIntersectingDefinition(
	use: VariableUse,
	definitions: Set<VariableDefinition>
): VariableDefinition | undefined {
	for (const definition of definitions) {
		if (use.variableName !== definition.variableName) {
			continue;
		}

		// Check if use is in an at-rule and definition is in a matching rule
		if (
			use.inAtRule &&
			use.atRuleSelector &&
			doSelectorsIntersect(use.atRuleSelector, definition.selector)
		) {
			return definition;
		}

		// Check if use is in a top-level at-rule (no atRuleSelector) and definition is in :root or universal
		if (
			use.inAtRule &&
			!use.atRuleSelector &&
			(definition.selector.includes(':root') || definition.selector === '*')
		) {
			return definition;
		}

		// Check if both are in rules with matching selectors
		if (!use.inAtRule && doSelectorsIntersect(use.selector, definition.selector)) {
			return definition;
		}
	}
	return undefined;
}

/** Whether the declaration sits in a rule nested in another rule, directly or through an at-rule */
function isInNestedRule(decl: Declaration): boolean {
	let parent = decl.parent?.parent;
	while (parent) {
		if (parent.type === 'rule') return true;
		parent = parent.parent as ContainerWithChildren | undefined;
	}
	return false;
}

/**
 * Returns the cascade layer of a declaration in a top-level rule wrapped in nothing but
 * `@layer` blocks: the dotted layer path, `null` when unlayered, or undefined for any
 * other placement
 */
function getPlainRuleLayer(
	decl: Declaration,
	anonymousLayers: Map<AtRule, string>
): string | null | undefined {
	if (decl.parent?.type !== 'rule' || isInNestedRule(decl)) return undefined;

	const layers: string[] = [];
	let parent = decl.parent.parent;
	while (parent && parent.type !== 'root') {
		const atRule = parent as AtRule;
		if (atRule.type !== 'atrule' || atRule.name.toLowerCase() !== 'layer') return undefined;
		const name = atRule.params.replace(/^[\t\n\f\r ]+|[\t\n\f\r ]+$/g, '');
		if (name && !LAYER_NAME.test(name)) return undefined;
		// Layer names cannot contain spaces, so this never collides with a named layer
		layers.unshift(name || (anonymousLayers.get(atRule) ?? `anonymous ${anonymousLayers.size}`));
		if (!name) anonymousLayers.set(atRule, layers[0]);
		parent = parent.parent as ContainerWithChildren | undefined;
	}
	return layers.length > 0 ? layers.join('.') : null;
}

const CSS_WIDE_KEYWORDS = new Set(['initial', 'inherit', 'unset', 'revert', 'revert-layer']);
// Functions a custom property computes on the declaring element, not where it is used
const ELEMENT_DEPENDENT_VALUE = /\b(?:var|attr|if)\(/i;

interface RootCandidate {
	value: string;
	important: boolean;
	layer: string | null;
	specificity: Specificity;
	sourceIndex: number;
}

function compareRootCandidates(first: RootCandidate, second: RootCandidate): number {
	return (
		Number(first.important) - Number(second.important) ||
		Number(first.layer === null) - Number(second.layer === null) ||
		compareSpecificity(first.specificity, second.specificity) ||
		first.sourceIndex - second.sourceIndex
	);
}

/** Whether a `@layer` around the declaration has a dotted name segment that is `properties` */
function isInLayerNamedProperties(decl: Declaration): boolean {
	let parent = decl.parent;
	while (parent) {
		if (parent.type === 'atrule') {
			const atRule = parent as AtRule;
			if (
				atRule.name.toLowerCase() === 'layer' &&
				atRule.params.split('.').includes('properties')
			) {
				return true;
			}
		}
		parent = parent.parent as ContainerWithChildren | undefined;
	}
	return false;
}

/**
 * Returns the cascaded value of every variable that holds one value on every element: each
 * declaration of it is a plain top-level declaration (wrapped in nothing but `@layer`) with
 * a literal value, whose selector matches `<html>` or no element at all. Variables registered
 * with `@property`, declared in the document's own styles, in a `properties` layer or in
 * competing layers, or written with escapes are left out, and a stylesheet with `@namespace`
 * yields none.
 */
function getRootValues(
	root: Root,
	document: RenderedDocument,
	index: IndexedDocument,
	match: (selector: string) => SelectorMatch | undefined
): Map<string, string> {
	const values = new Map<string, string>();
	const excluded = new Set<string>();
	const candidates = new Map<string, RootCandidate[]>();
	// Every declaring selector of a variable, to leave out those reaching below `<html>`
	const declaringSelectors = new Map<string, SelectorMatch[]>();
	// Set when an escaped name or an unparseable style hides which variables are declared
	let isIncomplete = false;
	const exclude = (name: string) => {
		isIncomplete ||= name.includes('\\');
		excluded.add(name);
	};
	const excludeDeclaredIn = (css: string) => {
		try {
			postcss.parse(css).walk((node) => {
				if (node.type === 'decl') exclude(node.prop);
				if (node.type === 'atrule' && node.name.toLowerCase() === 'property') {
					exclude(node.params.trim());
				}
			});
		} catch {
			isIncomplete = true;
		}
	};

	let hasNamespace = false;
	const anonymousLayers = new Map<AtRule, string>();
	let sourceIndex = 0;
	const censusDeclaration = (decl: Declaration) => {
		sourceIndex++;
		isIncomplete ||= decl.prop.includes('\\');
		if (!decl.prop.startsWith('--')) return;
		// The lookup below skips these, so an `!important` among them would be lost
		if (isInLayerNamedProperties(decl)) {
			excluded.add(decl.prop);
			return;
		}

		const layer = getPlainRuleLayer(decl, anonymousLayers);
		const selectorMatch = layer === undefined ? undefined : match((decl.parent as Rule).selector);
		const value = decl.value.trim();
		if (
			!selectorMatch ||
			!value ||
			// An escape can spell a keyword, a function or `!important` the checks here would miss
			decl.value.includes('\\') ||
			decl.raws.value?.raw.includes('\\') ||
			decl.raws.important?.includes('\\') ||
			ELEMENT_DEPENDENT_VALUE.test(value) ||
			CSS_WIDE_KEYWORDS.has(value.toLowerCase())
		) {
			excluded.add(decl.prop);
			return;
		}

		const selectors = declaringSelectors.get(decl.prop) ?? [];
		selectors.push(selectorMatch);
		declaringSelectors.set(decl.prop, selectors);
		if (selectorMatch.rootSpecificity) {
			const list = candidates.get(decl.prop) ?? [];
			list.push({
				value: decl.value,
				important: Boolean(decl.important),
				layer: layer!,
				specificity: selectorMatch.rootSpecificity,
				sourceIndex
			});
			candidates.set(decl.prop, list);
		}
	};

	// One walk for both node types, as each walk of the stylesheet is a large share of the cost
	root.walk((node) => {
		if (node.type === 'atrule') {
			const name = node.name.toLowerCase();
			if (name === 'property') exclude(node.params.trim());
			// A default namespace changes which elements every selector matches
			if (name === 'namespace') hasNamespace = true;
		} else if (node.type === 'decl') {
			censusDeclaration(node);
		}
	});
	if (hasNamespace || isIncomplete) return values;

	const names = [...candidates.keys()].filter((name) => {
		const list = candidates.get(name)!;
		const layers = new Set(list.map((candidate) => candidate.layer));
		// Layer order, and `!important` reversing it, are not modelled
		const isLayerSafe =
			layers.size === 1 ||
			(layers.size === 2 && layers.has(null) && !list.some((candidate) => candidate.important));
		return !excluded.has(name) && isLayerSafe;
	});
	// The document is only read for variables that can still take a root value
	if (names.length === 0) return values;

	index.styles.forEach(excludeDeclaredIn);
	document.styleSheets.forEach(excludeDeclaredIn);
	if (isIncomplete) return values;

	for (const name of names) {
		if (excluded.has(name)) continue;
		if (declaringSelectors.get(name)!.some((selectorMatch) => selectorMatch.matchesDescendant())) {
			continue;
		}
		const winner = candidates
			.get(name)!
			.reduce((best, candidate) => (compareRootCandidates(candidate, best) > 0 ? candidate : best));
		values.set(name, winner.value);
	}
	return values;
}

/**
 * When every declaration of a variable is a plain top-level declaration whose selector
 * matches the rendered `<html>` or no element at all, properties reading it in their own
 * rule take its cascaded value instead of the first intersecting definition.
 *
 * @param document - The rendered document; without it every variable resolves as before
 */
export function resolveAllCssVariables(root: Root, document?: RenderedDocument) {
	let iteration = 0;

	const index = document && indexDocument(document);
	const selectorMatches = new Map<string, SelectorMatch | undefined>();
	const match = (selector: string) => {
		if (!selectorMatches.has(selector)) {
			selectorMatches.set(selector, matchSelector(selector, index!));
		}
		return selectorMatches.get(selector);
	};
	const rootValues = document
		? getRootValues(root, document, index!, match)
		: new Map<string, string>();
	// Only properties reading the variable in their own rule take the root value. The first
	// intersecting lookup copies a variable's declaration into rules where it may not apply,
	// so those keep their previous value, as do declarations that received such a copy
	// still holding `var()`.
	const movedUses = new Set<Declaration>();
	const takesRootValue = (decl: Declaration) => {
		if (
			decl.prop.startsWith('--') ||
			movedUses.has(decl) ||
			decl.parent?.type !== 'rule' ||
			isInNestedRule(decl)
		) {
			return false;
		}
		// A root-only rule that does not match `<html>` applies nowhere and keeps its value. Only
		// a selector naming an anchor can be root-only, so the others skip parsing.
		const selector = (decl.parent as Rule).selector;
		if (!/html|:root|:host/i.test(selector)) return true;
		const selectorMatch = match(selector);
		return !selectorMatch?.isRootOnly || selectorMatch.rootSpecificity !== undefined;
	};

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

			let value = rootValues.get(use.variableName);
			if (value === undefined || !takesRootValue(use.declaration)) {
				value = findIntersectingDefinition(use, variableDefinitions)?.declaration.value;
				if (value?.includes('var(')) movedUses.add(use.declaration);
			}

			if (value !== undefined) {
				use.declaration.value = use.declaration.value.replaceAll(use.raw, value);
				hasReplaced = true;
				replacedInThisIteration = true;
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
