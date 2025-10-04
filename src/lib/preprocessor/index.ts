import type { PreprocessorGroup } from 'svelte/compiler';
import MagicString from 'magic-string';
import type {
	PreprocessorOptions,
	ComponentTransform,
	MediaQueryStyle,
	ClassAttribute,
	StyleAttribute
} from './types.js';
import { parseAttributes } from './parser.js';
import {
	createTailwindConverter,
	transformTailwindClasses,
	generateMediaQueries,
	sanitizeClassName
} from './transformer.js';
import { injectMediaQueries } from './head-injector.js';

/**
 * Svelte 5 preprocessor for transforming Tailwind classes in email components
 *
 * @example
 * ```javascript
 * // svelte.config.js
 * import { betterSvelteEmailPreprocessor } from 'better-svelte-email/preprocessor';
 *
 * export default {
 *   preprocess: [
 *     vitePreprocess(),
 *     betterSvelteEmailPreprocessor({
 *       pathToEmailFolder: '/src/lib/emails',
 *       tailwindConfig: { ... }
 *     })
 *   ]
 * };
 * ```
 *
 * Reference: https://svelte.dev/docs/svelte/svelte-compiler#preprocess
 */
export function betterSvelteEmailPreprocessor(
	options: PreprocessorOptions = {}
): PreprocessorGroup {
	const { tailwindConfig, pathToEmailFolder = '/src/lib/emails', debug = false } = options;

	// Initialize Tailwind converter once (performance optimization)
	const tailwindConverter = createTailwindConverter(tailwindConfig);

	// Return a Svelte 5 PreprocessorGroup
	return {
		name: 'better-svelte-email',

		/**
		 * The markup preprocessor transforms the template/HTML portion
		 * This is where we extract and transform Tailwind classes
		 */
		markup({ content, filename }) {
			// Only process .svelte files in the configured email folder
			if (!filename || !filename.includes(pathToEmailFolder)) {
				// Return undefined to skip processing
				return;
			}

			if (!filename.endsWith('.svelte')) {
				return;
			}

			try {
				// Process the email component
				const result = processEmailComponent(content, filename, tailwindConverter, tailwindConfig);

				// Log warnings if debug mode is enabled
				if (result.warnings.length > 0) {
					if (debug) {
						console.warn(`[better-svelte-email] Warnings for ${filename}:`, result.warnings);
					}
				}

				// Return the transformed code
				// The preprocessor API expects { code: string } or { code: string, map: SourceMap }
				return {
					code: result.transformedCode
					// Note: Source maps could be added here via MagicString's generateMap()
				};
			} catch (error) {
				console.error(`[better-svelte-email] Error processing ${filename}:`, error);

				// On error, return undefined to use original content
				// This prevents breaking the build for non-email files
				return;
			}
		}
	};
}

/**
 * Process a single email component
 */
function processEmailComponent(
	source: string,
	_filename: string,
	tailwindConverter: ReturnType<typeof createTailwindConverter>,
	tailwindConfig: PreprocessorOptions['tailwindConfig']
): ComponentTransform {
	const warnings: string[] = [];
	let transformedCode = source;
	const allMediaQueries: MediaQueryStyle[] = [];

	// Step 1: Parse and find all class attributes
	const attributes = parseAttributes(source);

	if (attributes.length === 0) {
		// No classes to transform
		return {
			originalCode: source,
			transformedCode: source,
			mediaQueries: [],
			hasHead: false,
			warnings: []
		};
	}

	// Step 2: Transform each class attribute
	const s = new MagicString(transformedCode);

	// Process in reverse order to maintain correct positions
	const sortedAttributes = [...attributes].sort((a, b) => b.class.start - a.class.start);

	for (const attr of sortedAttributes) {
		if (!attr.class.isStatic) {
			// Skip dynamic classes for now
			warnings.push(
				`Dynamic class expression detected in ${attr.class.elementName}. ` +
					`Only static classes can be transformed at build time.`
			);
			continue;
		}

		// Transform the classes
		const transformed = transformTailwindClasses(attr.class.raw, tailwindConverter);

		// Collect warnings about invalid classes
		if (transformed.invalidClasses.length > 0) {
			warnings.push(
				`Invalid Tailwind classes in ${attr.class.elementName}: ${transformed.invalidClasses.join(', ')}`
			);
		}

		// Generate media queries for responsive classes
		if (transformed.responsiveClasses.length > 0) {
			const mediaQueries = generateMediaQueries(
				transformed.responsiveClasses,
				tailwindConverter,
				tailwindConfig
			);

			allMediaQueries.push(...mediaQueries);
		}

		// Build the new attribute value
		const newAttributes = buildNewAttributes(
			transformed.inlineStyles,
			transformed.responsiveClasses,
			attr.style?.raw
		);

		// Remove the already existing style attribute if it exists
		if (attr.style) {
			removeStyleAttribute(s, attr.style);
		}

		// Replace the class attribute with new attributes
		replaceClassAttribute(s, attr.class, newAttributes);
	}

	transformedCode = s.toString();

	// Step 3: Inject media queries into <Head>
	if (allMediaQueries.length > 0) {
		const injectionResult = injectMediaQueries(transformedCode, allMediaQueries);

		if (!injectionResult.success) {
			warnings.push(injectionResult.error || 'Failed to inject media queries');
		} else {
			transformedCode = injectionResult.code;
		}
	}

	return {
		originalCode: source,
		transformedCode,
		mediaQueries: allMediaQueries,
		hasHead: allMediaQueries.length > 0,
		warnings
	};
}

/**
 * Build new attribute string from transformation result
 */
function buildNewAttributes(
	inlineStyles: string,
	responsiveClasses: string[],
	existingStyles?: string
): string {
	const parts: string[] = [];

	// Add responsive classes if any
	if (responsiveClasses.length > 0) {
		const sanitizedClasses = responsiveClasses.map(sanitizeClassName);
		parts.push(`class="${sanitizedClasses.join(' ')}"`);
	}

	// Add inline styles if any
	if (inlineStyles) {
		// Escape quotes in styles
		const escapedStyles = inlineStyles.replace(/"/g, '&quot;');
		const withExisting = escapedStyles + (existingStyles ? existingStyles : '');
		parts.push(`style="${withExisting}"`);
	}

	return parts.join(' ');
}

/**
 * Replace class attribute with new attributes using MagicString
 */
function replaceClassAttribute(
	s: MagicString,
	classAttr: ClassAttribute,
	newAttributes: string
): void {
	// We need to replace the entire class="..." portion
	// The positions from AST are for the value, not the attribute
	// So we need to search backwards for class="

	// Find the start of the attribute (look for class=")
	const beforeAttr = s.original.substring(0, classAttr.start);
	const attrStartMatch = beforeAttr.lastIndexOf('class="');

	if (attrStartMatch === -1) {
		console.warn('Could not find class attribute start position');
		return;
	}

	// Find the end of the attribute (closing quote)
	const afterValue = s.original.substring(classAttr.end);
	const quotePos = afterValue.indexOf('"');

	if (quotePos === -1) {
		console.warn('Could not find class attribute end position');
		return;
	}

	const fullAttrStart = attrStartMatch;
	const fullAttrEnd = classAttr.end + quotePos + 1;

	// Replace the entire class="..." with our new attributes
	if (newAttributes) {
		s.overwrite(fullAttrStart, fullAttrEnd, newAttributes);
	} else {
		// No attributes to add - remove the class attribute entirely
		// Also remove any extra whitespace
		let removeStart = fullAttrStart;
		let removeEnd = fullAttrEnd;

		// Check if there's a space before
		if (s.original[removeStart - 1] === ' ') {
			removeStart--;
		}

		// Check if there's a space after
		if (s.original[removeEnd] === ' ') {
			removeEnd++;
		}

		s.remove(removeStart, removeEnd);
	}
}

/**
 * Remove style attribute with MagicString
 */
function removeStyleAttribute(s: MagicString, styleAttr: StyleAttribute): void {
	s.remove(styleAttr.start, styleAttr.end);
}

// Re-export types for convenience
export type { PreprocessorOptions, ComponentTransform };
