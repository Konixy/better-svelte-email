import type { StyleSheet } from 'css-tree';
import { resolveAllCssVariables } from './resolve-all-css-variables.js';
import { resolveCalcExpressions } from './resolve-calc-expressions.js';
import { sanitizeDeclarations } from './sanitize-declarations.js';

export function sanitizeStyleSheet(styleSheet: StyleSheet) {
	resolveAllCssVariables(styleSheet);
	resolveCalcExpressions(styleSheet);
	sanitizeDeclarations(styleSheet);
}
