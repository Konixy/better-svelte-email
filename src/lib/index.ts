// Export email components
export * from './components/index.js';

// Export the preprocessor
export { betterSvelteEmailPreprocessor } from './preprocessor/index.js';
export type { PreprocessorOptions, ComponentTransform } from './preprocessor/index.js';

// Export renderer
export { default as Renderer, type TailwindConfig, type RenderOptions } from './render/index.js';

// Export utilities
export * from './utils/index.js';
