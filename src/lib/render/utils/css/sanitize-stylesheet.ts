import type { Root } from 'postcss';
import { resolveAllCssVariables } from './resolve-all-css-variables.js';
import { resolveCalcExpressions } from './resolve-calc-expressions.js';
import { sanitizeDeclarations } from './sanitize-declarations.js';

export interface SanitizeConfig {
	baseFontSize?: number;
}

export function sanitizeStyleSheet(root: Root, config?: SanitizeConfig) {
	resolveAllCssVariables(root);
	resolveCalcExpressions(root, config);
	sanitizeDeclarations(root, config);
}
