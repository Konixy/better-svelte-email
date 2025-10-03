import { tailwindToCSS, type TailwindConfig } from 'tw-to-css';
import type { TransformResult, MediaQueryStyle } from './types.js';

/**
 * Initialize Tailwind converter with config
 */
export function createTailwindConverter(config?: TailwindConfig) {
	const { twi } = tailwindToCSS({ config });
	return twi;
}

/**
 * Transform Tailwind classes to inline styles and responsive classes
 */
export function transformTailwindClasses(
	classString: string,
	tailwindConverter: ReturnType<typeof createTailwindConverter>
): TransformResult {
	// Split classes
	const classes = classString.trim().split(/\s+/).filter(Boolean);

	// Separate responsive from non-responsive classes
	const responsiveClasses: string[] = [];
	const nonResponsiveClasses: string[] = [];

	for (const cls of classes) {
		// Responsive classes have format: sm:, md:, lg:, xl:, 2xl:
		if (/^(sm|md|lg|xl|2xl):/.test(cls)) {
			responsiveClasses.push(cls);
		} else {
			nonResponsiveClasses.push(cls);
		}
	}

	// Convert non-responsive classes to CSS
	let inlineStyles = '';
	const invalidClasses: string[] = [];

	if (nonResponsiveClasses.length > 0) {
		const classesStr = nonResponsiveClasses.join(' ');

		try {
			// Generate CSS from Tailwind classes
			const css = tailwindConverter(classesStr, {
				merge: false,
				ignoreMediaQueries: true
			});

			// Extract styles from CSS
			const styles = extractStylesFromCSS(css, nonResponsiveClasses);
			inlineStyles = styles.validStyles;
			invalidClasses.push(...styles.invalidClasses);
		} catch (error) {
			console.warn('Failed to convert Tailwind classes:', error);
		}
	}

	return {
		inlineStyles,
		responsiveClasses,
		invalidClasses
	};
}

/**
 * Extract CSS properties from generated CSS
 * Handles the format: .classname { prop: value; }
 */
function extractStylesFromCSS(
	css: string,
	originalClasses: string[]
): { validStyles: string; invalidClasses: string[] } {
	const invalidClasses: string[] = [];
	const styleProperties: string[] = [];

	// Remove media queries (we handle those separately)
	const cssWithoutMedia = css.replace(/@media[^{]+\{(?:[^{}]|\{[^{}]*\})*\}/g, '');

	// Create a map of class name -> CSS rules
	const classMap = new Map<string, string>();

	// Match .classname { rules }
	const classRegex = /\.([^\s{]+)\s*\{([^}]+)\}/g;
	let match;

	while ((match = classRegex.exec(cssWithoutMedia)) !== null) {
		const className = match[1];
		const rules = match[2].trim();

		// Normalize class name (tw-to-css might transform special chars)
		const normalizedClass = className.replace(/[:#\-\[\]\/\.%!_]+/g, '_');

		classMap.set(normalizedClass, rules);
	}

	// For each original class, try to find its CSS
	for (const originalClass of originalClasses) {
		// Normalize the original class name to match what tw-to-css produces
		const normalized = originalClass.replace(/[:#\-\[\]\/\.%!]+/g, '_');

		if (classMap.has(normalized)) {
			const rules = classMap.get(normalized)!;
			// Add the rules (already in format "prop: value;")
			styleProperties.push(rules);
		} else {
			// Class not found - might be invalid Tailwind
			invalidClasses.push(originalClass);
		}
	}

	// Combine all style properties
	const validStyles = styleProperties.join(' ').trim();

	return { validStyles, invalidClasses };
}

/**
 * Generate media query CSS for responsive classes
 */
export function generateMediaQueries(
	responsiveClasses: string[],
	tailwindConverter: ReturnType<typeof createTailwindConverter>,
	tailwindConfig?: TailwindConfig
): MediaQueryStyle[] {
	if (responsiveClasses.length === 0) {
		return [];
	}

	const mediaQueries: MediaQueryStyle[] = [];

	// Default breakpoints (can be overridden by config)
	const breakpoints = {
		sm: '475px',
		md: '768px',
		lg: '1024px',
		xl: '1280px',
		'2xl': '1536px',
		...tailwindConfig?.theme?.screens
	};

	// Group classes by breakpoint
	const classesByBreakpoint = new Map<string, string[]>();

	for (const cls of responsiveClasses) {
		const match = cls.match(/^(sm|md|lg|xl|2xl):(.+)/);
		if (match) {
			const [, breakpoint, baseClass] = match;

			if (!classesByBreakpoint.has(breakpoint)) {
				classesByBreakpoint.set(breakpoint, []);
			}

			classesByBreakpoint.get(breakpoint)!.push(cls);
		}
	}

	// Generate CSS for each breakpoint
	for (const [breakpoint, classes] of classesByBreakpoint) {
		const breakpointValue = breakpoints[breakpoint as keyof typeof breakpoints];

		if (!breakpointValue) continue;

		// Generate full CSS including media queries
		const fullCSS = tailwindConverter(classes.join(' '), {
			merge: false,
			ignoreMediaQueries: false
		});

		// Extract just the media query portion
		const mediaQueryRegex = new RegExp(`@media[^{]*\\{([^{}]|\\{[^{}]*\\})*\\}`, 'g');

		let match;
		while ((match = mediaQueryRegex.exec(fullCSS)) !== null) {
			const mediaQueryBlock = match[0];

			// Make all rules !important for email clients
			const withImportant = mediaQueryBlock.replace(
				/([a-z-]+)\s*:\s*([^;!}]+)/gi,
				'$1: $2 !important'
			);

			// Parse out the query and content
			const queryMatch = withImportant.match(/@media\s*([^{]+)/);
			if (queryMatch) {
				const query = `@media ${queryMatch[1].trim()}`;

				mediaQueries.push({
					query,
					className: `responsive-${breakpoint}`,
					rules: withImportant
				});
			}
		}
	}

	return mediaQueries;
}

/**
 * Sanitize class names for use in CSS (replace special characters)
 */
export function sanitizeClassName(className: string): string {
	return className.replace(/[:#\-\[\]\/\.%!]+/g, '_');
}
