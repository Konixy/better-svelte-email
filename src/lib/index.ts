// Export email components
export * from './components/index.js';

// Export the preprocessor
export { betterSvelteEmailPreprocessor } from './preprocessor/index.js';
export type { PreprocessorOptions, ComponentTransform } from './preprocessor/index.js';

// Export types for convenience
export type { ClassAttribute, TransformResult, MediaQueryStyle } from './preprocessor/types.js';
export type { TailwindConfig } from 'tw-to-css';

// Export individual functions for advanced usage
export {
	parseAttributes as parseClassAttributes,
	findHeadComponent
} from './preprocessor/parser.js';
export {
	createTailwindConverter,
	transformTailwindClasses,
	generateMediaQueries,
	sanitizeClassName
} from './preprocessor/transformer.js';
export { injectMediaQueries } from './preprocessor/head-injector.js';

// Export utilities
export {
	styleToString,
	pxToPt,
	combineStyles,
	withMargin,
	renderAsPlainText
} from './utils/index.js';
