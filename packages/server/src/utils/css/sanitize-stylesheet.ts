import type { Root } from 'postcss';
import { resolveAllCssVariables } from './resolve-all-css-variables';
import { resolveCalcExpressions } from './resolve-calc-expressions';
import { sanitizeDeclarations } from './sanitize-declarations';

export interface SanitizeConfig {
	baseFontSize?: number;
}

export function sanitizeStyleSheet(root: Root, config?: SanitizeConfig) {
	resolveAllCssVariables(root);
	resolveCalcExpressions(root, config);
	sanitizeDeclarations(root, config);
}
