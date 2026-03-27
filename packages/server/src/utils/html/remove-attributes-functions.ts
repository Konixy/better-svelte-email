import type { AST } from '../..';
import { isValidNode } from './is-valid-node';
import { walk } from './walk';

export function removeAttributesFunctions(ast: AST.Document): AST.Document {
	return walk(ast, (node) => {
		if (isValidNode(node)) {
			node.attrs = node.attrs?.filter((attr) => !['onload', 'onerror'].includes(attr.name)) ?? [];
		}

		return node;
	});
}
