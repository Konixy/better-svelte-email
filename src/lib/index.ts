// Export the preprocessor
export { betterSvelteEmailPreprocessor } from './preprocessor/index.js';
export type { PreprocessorOptions, ComponentTransform } from './preprocessor/index.js';

// Export types for convenience
export type { ClassAttribute, TransformResult, MediaQueryStyle } from './preprocessor/types.js';

// Export individual functions for advanced usage
export { parseClassAttributes, findHeadComponent } from './preprocessor/parser.js';
export {
	createTailwindConverter,
	transformTailwindClasses,
	generateMediaQueries,
	sanitizeClassName
} from './preprocessor/transformer.js';
export { injectMediaQueries } from './preprocessor/head-injector.js';
