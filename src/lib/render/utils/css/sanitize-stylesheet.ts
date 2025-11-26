import type { Root } from 'postcss';
import { resolveAllCssVariables } from './resolve-all-css-variables.js';
import { resolveCalcExpressions } from './resolve-calc-expressions.js';
import { sanitizeDeclarations } from './sanitize-declarations.js';

export function sanitizeStyleSheet(root: Root) {
	resolveAllCssVariables(root);
	resolveCalcExpressions(root);
	sanitizeDeclarations(root);
}
