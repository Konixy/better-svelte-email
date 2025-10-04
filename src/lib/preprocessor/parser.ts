import { parse } from 'svelte/compiler';
import type { ClassAttribute, StyleAttribute } from './types.js';

/**
 * Parse Svelte 5 source code and extract all class attributes
 * Reference: https://svelte.dev/docs/svelte/svelte-compiler#parse
 */
export function parseAttributes(source: string): {
	class: ClassAttribute;
	style?: StyleAttribute;
}[] {
	const attributes: { class: ClassAttribute; style: StyleAttribute }[] = [];

	try {
		// Parse the Svelte file into an AST
		// Svelte 5 parse returns a Root node with modern AST structure
		const ast: any = parse(source);

		// Walk the html fragment (template portion) of the AST
		if (ast.html && ast.html.children) {
			for (const child of ast.html.children) {
				walkNode(child, attributes, source);
			}
		}
	} catch (error) {
		console.error('Failed to parse Svelte file:', error);
		throw error;
	}

	return attributes;
}

/**
 * Recursively walk Svelte 5 AST nodes to find class attributes
 */
function walkNode(
	node: any,
	attributes: { class: ClassAttribute; style?: StyleAttribute }[],
	source: string
): void {
	if (!node) return;

	// Svelte 5 AST structure:
	// - Element: HTML elements like <div>, <button>
	// - InlineComponent: Custom components like <Button>, <Head>
	// - SlotElement: <svelte:element> and other svelte: elements

	if (
		node.type === 'Element' ||
		node.type === 'InlineComponent' ||
		node.type === 'SlotElement' ||
		node.type === 'Component'
	) {
		const elementName = node.name || 'unknown';

		// Look for class and style attribute in Svelte 5 AST
		const classAttr = node.attributes?.find(
			(attr: any) => attr.type === 'Attribute' && attr.name === 'class'
		);

		const styleAttr = node.attributes?.find(
			(attr: any) => attr.type === 'Attribute' && attr.name === 'style'
		);

		if (classAttr && classAttr.value) {
			// Extract class value
			const extractedClass = extractClassValue(classAttr, source);
			let extractedStyle: {
				value: string;
				start: number;
				end: number;
			} | null = null;

			if (styleAttr && styleAttr.value) {
				extractedStyle = extractStyleValue(styleAttr, source);
			}

			if (extractedClass) {
				attributes.push({
					class: {
						raw: extractedClass.value,
						start: extractedClass.start,
						end: extractedClass.end,
						elementName,
						isStatic: extractedClass.isStatic
					},
					style: extractedStyle
						? {
								raw: extractedStyle.value,
								start: extractedStyle.start,
								end: extractedStyle.end,
								elementName
							}
						: undefined
				});
			}
		}
	}

	// Recursively process children
	if (node.children) {
		for (const child of node.children) {
			walkNode(child, attributes, source);
		}
	}

	// Handle conditional blocks (#if, #each, etc.)
	if (node.consequent) {
		if (node.consequent.children) {
			for (const child of node.consequent.children) {
				walkNode(child, attributes, source);
			}
		}
	}

	if (node.alternate) {
		if (node.alternate.children) {
			for (const child of node.alternate.children) {
				walkNode(child, attributes, source);
			}
		}
	}

	// Handle #each blocks
	if (node.body) {
		if (node.body.children) {
			for (const child of node.body.children) {
				walkNode(child, attributes, source);
			}
		}
	}
}

/**
 * Extract the actual class value from a Svelte 5 attribute node
 */
function extractClassValue(
	classAttr: any,
	source: string
): { value: string; start: number; end: number; isStatic: boolean } | null {
	// Svelte 5 attribute value formats:
	// 1. Static string: class="text-red-500"
	//    → value: [{ type: 'Text', data: 'text-red-500' }]
	//
	// 2. Expression: class={someVar}
	//    → value: [{ type: 'ExpressionTag', expression: {...} }]
	//
	// 3. Mixed: class="static {dynamic} more"
	//    → value: [{ type: 'Text' }, { type: 'ExpressionTag' }, { type: 'Text' }]

	if (!classAttr.value || classAttr.value.length === 0) {
		return null;
	}

	// Check if entirely static (only Text nodes)
	const hasOnlyText = classAttr.value.every((v: any) => v.type === 'Text');

	if (hasOnlyText) {
		// Fully static - we can safely transform this
		const textContent = classAttr.value.map((v: any) => v.data || '').join('');
		const start = classAttr.value[0].start;
		const end = classAttr.value[classAttr.value.length - 1].end;

		return {
			value: textContent,
			start,
			end,
			isStatic: true
		};
	}

	// Check if entirely dynamic (only ExpressionTag or MustacheTag)
	const hasOnlyExpression =
		classAttr.value.length === 1 &&
		(classAttr.value[0].type === 'ExpressionTag' || classAttr.value[0].type === 'MustacheTag');

	if (hasOnlyExpression) {
		// Fully dynamic - cannot transform at build time
		const exprNode = classAttr.value[0];
		const expressionCode = source.substring(exprNode.start, exprNode.end);

		return {
			value: expressionCode,
			start: exprNode.start,
			end: exprNode.end,
			isStatic: false
		};
	}

	// Mixed content (both Text and ExpressionTag)
	// Extract only the static Text portions for partial transformation
	let combinedValue = '';
	const start = classAttr.value[0].start;
	const end = classAttr.value[classAttr.value.length - 1].end;
	let hasStaticContent = false;

	for (const part of classAttr.value) {
		if (part.type === 'Text' && part.data) {
			combinedValue += part.data + ' ';
			hasStaticContent = true;
		}
		// Skip ExpressionTag nodes
	}

	if (hasStaticContent) {
		return {
			value: combinedValue.trim(),
			start,
			end,
			isStatic: false // Mixed is not fully static
		};
	}

	return null;
}

/**
 * Extract the actual style value from a Svelte 5 attribute node
 */
function extractStyleValue(
	styleAttr: any,
	source: string
): { value: string; start: number; end: number } | null {
	// Svelte 5 attribute value formats:
	// 1. Static string: style="color: red;"
	//    → value: [{ type: 'Text', data: 'color: red;' }]
	//
	// 2. Expression: style={someVar}
	//    → value: [{ type: 'ExpressionTag', expression: {...} }]
	//
	// 3. Mixed: style="color: red; {dynamicStyle}"
	//    → value: [{ type: 'Text' }, { type: 'ExpressionTag' }]

	if (!styleAttr.value || styleAttr.value.length === 0) {
		return null;
	}

	// Check if entirely static (only Text nodes)
	const hasOnlyText = styleAttr.value.every((v: any) => v.type === 'Text');

	if (hasOnlyText) {
		// Fully static - we can extract this
		const textContent = styleAttr.value.map((v: any) => v.data || '').join('');

		return {
			value: textContent,
			start: styleAttr.start,
			end: styleAttr.end
		};
	}

	// Check if entirely dynamic (only ExpressionTag or MustacheTag)
	const hasOnlyExpression =
		styleAttr.value.length === 1 &&
		(styleAttr.value[0].type === 'ExpressionTag' || styleAttr.value[0].type === 'MustacheTag');

	if (hasOnlyExpression) {
		// Fully dynamic - extract the expression code
		const exprNode = styleAttr.value[0];
		const expressionCode = source.substring(exprNode.start, exprNode.end);

		return {
			value: expressionCode,
			start: exprNode.start,
			end: exprNode.end
		};
	}

	// Mixed content (both Text and ExpressionTag)
	// Extract the full content including dynamic parts
	const start = styleAttr.value[0].start;
	const end = styleAttr.value[styleAttr.value.length - 1].end;
	const fullContent = source.substring(start, end);

	return {
		value: fullContent,
		start: styleAttr.start,
		end: styleAttr.end
	};
}

/**
 * Find the <Head> component in Svelte 5 AST
 * Returns the position where we should inject styles
 */
export function findHeadComponent(source: string): {
	found: boolean;
	insertPosition: number | null;
} {
	try {
		const ast: any = parse(source);

		// Find Head component in the AST
		if (ast.html && ast.html.children) {
			for (const child of ast.html.children) {
				const headInfo = findHeadInNode(child, source);
				if (headInfo) return headInfo;
			}
		}

		return { found: false, insertPosition: null };
	} catch {
		return { found: false, insertPosition: null };
	}
}

/**
 * Recursively search for Head component in Svelte 5 AST
 */
function findHeadInNode(
	node: any,
	source: string
): { found: boolean; insertPosition: number } | null {
	if (!node) return null;

	// Check if this is the Head component (InlineComponent type in Svelte 5)
	if ((node.type === 'InlineComponent' || node.type === 'Component') && node.name === 'Head') {
		// Svelte 5: Find the best insertion point for styles

		// If Head has children, insert before first child
		if (node.children && node.children.length > 0) {
			return {
				found: true,
				insertPosition: node.children[0].start
			};
		}

		// No children - need to insert before closing tag
		// Find where the opening tag ends
		const headStart = node.start;
		const headEnd = node.end;
		const headContent = source.substring(headStart, headEnd);

		// Self-closing: <Head />
		if (headContent.includes('/>')) {
			// Convert to non-self-closing by inserting before />
			const selfClosingPos = source.indexOf('/>', headStart);
			return {
				found: true,
				insertPosition: selfClosingPos
			};
		}

		// Regular closing tag: <Head></Head> or <Head>...</Head>
		const closingTagPos = source.indexOf('</Head>', headStart);
		if (closingTagPos !== -1) {
			return {
				found: true,
				insertPosition: closingTagPos
			};
		}

		// Fallback: insert right after opening tag
		const openingTagEnd = source.indexOf('>', headStart);
		if (openingTagEnd !== -1) {
			return {
				found: true,
				insertPosition: openingTagEnd + 1
			};
		}
	}

	// Search recursively through the AST
	if (node.children) {
		for (const child of node.children) {
			const found = findHeadInNode(child, source);
			if (found) return found;
		}
	}

	// Check conditional branches
	if (node.consequent) {
		if (node.consequent.children) {
			for (const child of node.consequent.children) {
				const found = findHeadInNode(child, source);
				if (found) return found;
			}
		}
	}

	if (node.alternate) {
		if (node.alternate.children) {
			for (const child of node.alternate.children) {
				const found = findHeadInNode(child, source);
				if (found) return found;
			}
		}
	}

	return null;
}
