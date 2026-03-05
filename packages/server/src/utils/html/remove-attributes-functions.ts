import type { AST } from '../../index.js';
import { isValidNode } from './is-valid-node.js';
import { walk } from './walk.js';

export function removeAttributesFunctions(ast: AST.Document): AST.Document {
	return walk(ast, (node) => {
		if (isValidNode(node)) {
			node.attrs = node.attrs?.filter((attr) => !['onload', 'onerror'].includes(attr.name)) ?? [];
		}

		return node;
	});
}
