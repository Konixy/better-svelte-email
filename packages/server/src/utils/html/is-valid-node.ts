import type { AST } from '../..';

export function isValidNode(node: AST.ChildNode): node is AST.Element {
	return !node.nodeName.startsWith('#');
}
