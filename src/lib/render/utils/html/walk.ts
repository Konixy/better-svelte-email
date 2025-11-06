import type { DefaultTreeAdapterTypes as AST } from 'parse5';

type WalkableNode = AST.Document | AST.Element | AST.DocumentFragment | AST.Template;
type AnyNode = AST.ChildNode;

/**
 * Walk through an HTML AST and transform nodes using a callback function.
 *
 * @param ast - The root node to start walking from
 * @param callback - A function that receives each node and returns either:
 *   - The same node (no change)
 *   - A modified node (replace)
 *   - null (remove the node)
 * @returns The transformed AST
 */
export function walk<T extends WalkableNode>(
	ast: T,
	callback: (node: AnyNode) => AnyNode | null
): T {
	// Check if this node has childNodes
	if (!('childNodes' in ast) || !ast.childNodes) {
		return ast;
	}

	// Iterate backwards to handle splicing correctly
	for (let i = ast.childNodes.length - 1; i >= 0; i--) {
		const node = ast.childNodes[i];
		const newNode = callback(node);

		if (newNode === null) {
			// Remove the node
			ast.childNodes.splice(i, 1);
		} else {
			// Replace the node if changed
			ast.childNodes[i] = newNode;

			// Recursively walk child nodes if they exist
			if (
				'childNodes' in newNode &&
				Array.isArray(newNode.childNodes) &&
				newNode.childNodes.length > 0
			) {
				walk(newNode as WalkableNode, callback);
			}
		}
	}

	return ast;
}
