import type { AST } from '../../index.js';

export function isValidNode(node: AST.ChildNode): node is AST.Element {
	return !node.nodeName.startsWith('#');
}
