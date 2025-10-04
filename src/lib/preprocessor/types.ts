import type { TailwindConfig } from 'tw-to-css';

/**
 * Options for the preprocessor
 */
export interface PreprocessorOptions {
	/**
	 * Custom Tailwind configuration
	 */
	tailwindConfig?: TailwindConfig;

	/**
	 * Path to folder containing email components
	 * @default '/src/lib/emails'
	 */
	pathToEmailFolder?: string;

	/**
	 * Enable debug logging
	 * @default false
	 */
	debug?: boolean;
}

/**
 * Represents a class attribute found in the AST
 */
export interface ClassAttribute {
	/**
	 * Raw class string (e.g., "text-red-500 sm:bg-blue")
	 */
	raw: string;

	/**
	 * Start position in source code
	 */
	start: number;

	/**
	 * End position in source code
	 */
	end: number;

	/**
	 * Parent element/component name
	 */
	elementName: string;

	/**
	 * Whether this is a static string or dynamic expression
	 */
	isStatic: boolean;
}

/**
 * Represents a style attribute found in the AST
 */
export interface StyleAttribute {
	/**
	 * Raw style string (e.g., "background-color: red;")
	 */
	raw: string;

	/**
	 * Start position in source code
	 */
	start: number;

	/**
	 * End position in source code
	 */
	end: number;

	/**
	 * Parent element/component name
	 */
	elementName: string;

	/**
	 * Whether this is a static string or dynamic expression (not supported yet)
	 */
	// isStatic: boolean;
}

/**
 * Result of transforming Tailwind classes
 */
export interface TransformResult {
	/**
	 * CSS styles for inline styleString prop
	 */
	inlineStyles: string;

	/**
	 * Responsive classes to keep in class attribute
	 */
	responsiveClasses: string[];

	/**
	 * Classes that couldn't be converted (warnings)
	 */
	invalidClasses: string[];
}

/**
 * Media query CSS to inject into head
 */
export interface MediaQueryStyle {
	/**
	 * Media query condition (e.g., "@media (max-width: 475px)")
	 */
	query: string;

	/**
	 * CSS class name
	 */
	className: string;

	/**
	 * CSS rules
	 */
	rules: string;
}

/**
 * Information about a component's transformations
 */
export interface ComponentTransform {
	/**
	 * Original source code
	 */
	originalCode: string;

	/**
	 * Transformed source code
	 */
	transformedCode: string;

	/**
	 * Media queries to inject
	 */
	mediaQueries: MediaQueryStyle[];

	/**
	 * Whether <Head> component was found
	 */
	hasHead: boolean;

	/**
	 * Warnings encountered during transformation
	 */
	warnings: string[];
}
