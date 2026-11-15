import { splitSelectorList } from './split-selector-list';

export interface ElementAttribute {
	name: string;
	value: string;
}

/**
 * Attribute names are lowercase, as parse5 produces them: its tokenizer lowercases every
 * name, and foreign content only adjusts names other than `class`, `id`, `style` and `data-*`
 */
export interface RenderedDocument {
	/** Attributes of the `<html>` element */
	root: ElementAttribute[];
	/** Attributes of every element below `<html>` */
	descendants: ElementAttribute[][];
	/** Text of every `<style>` element */
	styleSheets: string[];
}

/** The attributes of one element that selector matching reads */
interface ElementData {
	/** `class`, `id` and `data-*` by name, the first occurrence winning */
	attributes: Map<string, string>;
	classes: Set<string>;
}

export interface IndexedDocument {
	root: ElementData;
	/** Every `style` attribute value in the document */
	readonly styles: Set<string>;
	/** Whether some element below `<html>` matches one of `compounds` */
	matchesDescendant(compounds: CompoundSelector[]): boolean;
}

/** [ids, classes/attributes/pseudo-classes, types] */
export type Specificity = [number, number, number];

export interface SelectorMatch {
	/** Every branch is anchored on `html`, `:root` or `:host` */
	isRootOnly: boolean;
	/** Specificity of the most specific branch matching `<html>`, undefined when none does */
	rootSpecificity?: Specificity;
	/** Whether some branch matches an element below `<html>`, evaluated once on first call */
	matchesDescendant: () => boolean;
}

type SimpleSelector =
	| { type: 'html' | 'root' | 'host' }
	| { type: 'class' | 'id'; name: string }
	| { type: 'attribute'; name: string; value?: string }
	| { type: 'not'; selectors: CompoundSelector[] };

type CompoundSelector = SimpleSelector[];

const MAX_SELECTOR_LENGTH = 1000;
// CSS whitespace only: other Unicode spaces are part of a name or invalid, never separators
const WHITESPACE_EDGES = /^[\t\n\f\r ]+|[\t\n\f\r ]+$/g;
const IDENTIFIER_SOURCE = '(?:--|-?(?:[a-z_]|[^\\0-\\x7f]))(?:[\\w-]|[^\\0-\\x7f])*';
const IDENTIFIER = new RegExp(`^${IDENTIFIER_SOURCE}`, 'i');
/** A dotted cascade layer name of unescaped identifiers */
export const LAYER_NAME = new RegExp(`^${IDENTIFIER_SOURCE}(?:\\.${IDENTIFIER_SOURCE})*$`, 'i');
// Unescaped newlines inside a string make the whole selector invalid
const ATTRIBUTE =
	/^\[[\t\n\f\r ]*(data-[\w-]+)[\t\n\f\r ]*(?:=[\t\n\f\r ]*("[^"\n\r\f]*"|'[^'\n\r\f]*'|[^\t\n\f\r "'\]]+)[\t\n\f\r ]*)?\]/i;

function isAnchor(selector: SimpleSelector): boolean {
	return selector.type === 'html' || selector.type === 'root' || selector.type === 'host';
}

/**
 * Parses one compound of an optional `html` or `:root`/`:host`, classes, ids, `data-*`
 * presence or equality, and `:not()` over a list of compounds of classes, ids and `data-*`.
 * Returns undefined for anything else, including combinators.
 */
function parseCompoundSelector(source: string): CompoundSelector | undefined {
	const compound: CompoundSelector = [];
	// The open `:not()` argument list, whose last entry receives parsed selectors
	let not: CompoundSelector[] | undefined;
	let i = 0;

	const typeName = source.match(IDENTIFIER)?.[0];
	if (typeName) {
		if (typeName.toLowerCase() !== 'html') return undefined;
		compound.push({ type: 'html' });
		i = typeName.length;
	}

	while (i < source.length) {
		const rest = source.slice(i);
		const target = not ? not[not.length - 1] : compound;
		const separator = not && rest.match(/^[\t\n\f\r ]*(?:(\))|,[\t\n\f\r ]*)/);

		if (separator) {
			if (target.length === 0) return undefined;
			if (separator[1]) {
				compound.push({ type: 'not', selectors: not! });
				not = undefined;
			} else {
				not!.push([]);
			}
			i += separator[0].length;
		} else if (rest[0] === '.' || rest[0] === '#') {
			const name = rest.slice(1).match(IDENTIFIER)?.[0];
			if (!name) return undefined;
			target.push({ type: rest[0] === '.' ? 'class' : 'id', name });
			i += 1 + name.length;
		} else if (rest[0] === '[') {
			const match = rest.match(ATTRIBUTE);
			if (!match) return undefined;
			let value = match[2];
			if (value !== undefined && /^["']/.test(value)) value = value.slice(1, -1);
			else if (value !== undefined && value.match(IDENTIFIER)?.[0] !== value) return undefined;
			target.push({ type: 'attribute', name: match[1].toLowerCase(), value });
			i += match[0].length;
		} else if (!not && /^:(?:root|host)(?![\w-]|[^\0-\x7f]|\()/i.test(rest)) {
			compound.push({ type: rest.slice(1, 5).toLowerCase() as 'root' | 'host' });
			i += 5;
		} else if (!not && /^:not\(/i.test(rest)) {
			not = [[]];
			i += 5 + rest.slice(5).match(/^[\t\n\f\r ]*/)![0].length;
		} else {
			// Combinators, `*`, pseudo-elements, other pseudo-classes and nesting inside `:not()`
			return undefined;
		}
	}

	if (not || compound.length === 0 || compound.filter(isAnchor).length > 1) return undefined;
	return compound;
}

function isReadAttribute(name: string): boolean {
	return name === 'class' || name === 'id' || name.startsWith('data-');
}

function splitClasses(value: string): string[] {
	return value.split(/[\t\n\f\r ]+/);
}

function toElementData(attributes: ElementAttribute[]): ElementData {
	const read = new Map<string, string>();
	for (const { name, value } of attributes) {
		if (isReadAttribute(name) && !read.has(name)) read.set(name, value);
	}
	return { attributes: read, classes: new Set(splitClasses(read.get('class') ?? '')) };
}

/**
 * Reads the attributes selector matching needs. The values present below `<html>` rule out
 * most selectors without looking at single elements; ids and `data-*` values are collected
 * only once a selector requires one. The per-element index is built only when the values
 * cannot decide, once per distinct element.
 */
export function indexDocument(document: RenderedDocument): IndexedDocument {
	let styles: Set<string> | undefined;
	let classes: Set<string> | undefined;
	let ids: Set<string> | undefined;
	let data: Map<string, Set<string>> | undefined;
	let descendants: ElementData[] | undefined;

	const readStylesAndClasses = () => {
		const classValues = new Set<string>();
		styles = new Set();
		classes = new Set();
		for (const { name, value } of document.root) {
			if (name === 'style') styles.add(value);
		}
		for (const attributes of document.descendants) {
			for (const { name, value } of attributes) {
				if (name === 'style') styles.add(value);
				else if (name === 'class') classValues.add(value);
			}
		}
		for (const value of classValues) {
			for (const name of splitClasses(value)) classes.add(name);
		}
	};

	const readIdsAndData = () => {
		ids = new Set();
		data = new Map();
		for (const attributes of document.descendants) {
			for (const { name, value } of attributes) {
				if (name === 'id') ids.add(value);
				else if (name.startsWith('data-')) {
					let present = data.get(name);
					if (!present) data.set(name, (present = new Set()));
					present.add(value);
				}
			}
		}
	};

	/** Whether every class, id and `data-*` value the compound requires is present somewhere */
	const mayMatch = (compound: CompoundSelector) =>
		compound.every((selector) => {
			switch (selector.type) {
				case 'class':
					if (!classes) readStylesAndClasses();
					return classes!.has(selector.name);
				case 'id':
					if (!ids) readIdsAndData();
					return ids!.has(selector.name);
				case 'attribute': {
					if (!data) readIdsAndData();
					const present = data!.get(selector.name);
					return (
						present !== undefined && (selector.value === undefined || present.has(selector.value))
					);
				}
				// `:not()` can match whatever is present; anchors never reach here
				default:
					return true;
			}
		});

	const getDescendants = () => {
		if (descendants) return descendants;
		const distinct = new Map<string, ElementAttribute[]>();
		for (const attributes of document.descendants) {
			// Length prefixes keep the key unambiguous whatever the names and values hold
			let key = '';
			for (const { name, value } of attributes) {
				if (isReadAttribute(name)) key += `${name.length}:${name}${value.length}:${value}`;
			}
			if (!distinct.has(key)) distinct.set(key, attributes);
		}
		descendants = [...distinct.values()].map(toElementData);
		return descendants;
	};

	return {
		root: toElementData(document.root),
		get styles() {
			if (!styles) readStylesAndClasses();
			return styles!;
		},
		matchesDescendant(compounds) {
			const possible = compounds.filter(mayMatch);
			return (
				possible.length > 0 &&
				getDescendants().some((element) =>
					possible.some((compound) => matches(compound, element, false))
				)
			);
		}
	};
}

function matches(compound: CompoundSelector, element: ElementData, isRoot: boolean): boolean {
	return compound.every((selector) => {
		switch (selector.type) {
			case 'html':
			case 'root':
				return isRoot;
			case 'host':
				return false;
			case 'class':
				return element.classes.has(selector.name);
			case 'id':
				return element.attributes.get('id') === selector.name;
			case 'attribute': {
				const value = element.attributes.get(selector.name);
				return value !== undefined && (selector.value === undefined || value === selector.value);
			}
			case 'not':
				return !selector.selectors.some((argument) => matches(argument, element, isRoot));
		}
	});
}

export function compareSpecificity(first: Specificity, second: Specificity): number {
	return first[0] - second[0] || first[1] - second[1] || first[2] - second[2];
}

function getSpecificity(compound: CompoundSelector): Specificity {
	const total: Specificity = [0, 0, 0];
	for (const selector of compound) {
		let added: Specificity = [0, 1, 0];
		if (selector.type === 'id') added = [1, 0, 0];
		if (selector.type === 'html') added = [0, 0, 1];
		if (selector.type === 'not') {
			added = selector.selectors
				.map(getSpecificity)
				.reduce((best, current) => (compareSpecificity(current, best) > 0 ? current : best));
		}
		total[0] += added[0];
		total[1] += added[1];
		total[2] += added[2];
	}
	return total;
}

/**
 * Evaluates `selector` against the rendered document. Returns undefined when any branch is
 * outside the grammar of `parseCompoundSelector`, which never matches more than one element
 * deep. `:host` parses but never matches.
 */
export function matchSelector(
	selector: string,
	document: IndexedDocument
): SelectorMatch | undefined {
	// Escaped names would need full CSS unescaping to compare reliably
	if (selector.length > MAX_SELECTOR_LENGTH || /[\\\0]/.test(selector)) return undefined;

	const unanchored: CompoundSelector[] = [];
	let isRootOnly = true;
	let rootSpecificity: Specificity | undefined;
	const trim = (branch: string) => branch.replace(WHITESPACE_EDGES, '');
	const branches = selector.includes(',') ? splitSelectorList(selector, trim) : [trim(selector)];
	for (const branch of branches) {
		const compound = parseCompoundSelector(branch);
		if (!compound) return undefined;
		if (!compound.some(isAnchor)) {
			isRootOnly = false;
			unanchored.push(compound);
		}

		if (!matches(compound, document.root, true)) continue;
		const specificity = getSpecificity(compound);
		if (!rootSpecificity || compareSpecificity(specificity, rootSpecificity) > 0) {
			rootSpecificity = specificity;
		}
	}

	let matchesDescendant: boolean | undefined;
	return {
		isRootOnly,
		rootSpecificity,
		matchesDescendant: () =>
			(matchesDescendant ??= unanchored.length > 0 && document.matchesDescendant(unanchored))
	};
}
