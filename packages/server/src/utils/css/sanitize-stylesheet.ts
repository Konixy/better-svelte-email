import type { Root } from 'postcss';
import { resolveAllCssVariables } from './resolve-all-css-variables';
import { resolveCalcExpressions } from './resolve-calc-expressions';
import { sanitizeDeclarations } from './sanitize-declarations';
import type { RenderedDocument } from './match-selector';

export interface SanitizeConfig {
	baseFontSize?: number;
	/** The rendered document, used to resolve CSS variables in cascade order */
	document?: RenderedDocument;
}

export function sanitizeStyleSheet(root: Root, config?: SanitizeConfig) {
	resolveAllCssVariables(root, config?.document);
	resolveCalcExpressions(root, config);
	sanitizeDeclarations(root, config);
}
