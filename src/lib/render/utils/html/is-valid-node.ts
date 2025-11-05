import type { AST } from '$lib/render/index.js';

export function isValidNode(node: AST.ChildNode): node is AST.Element {
	return !node.nodeName.startsWith('#');
}
