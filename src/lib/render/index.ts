import { render as svelteRender } from 'svelte/server';
import { parse, serialize, type DefaultTreeAdapterTypes } from 'parse5';
import postcss from 'postcss';
import { walk } from './utils/html/walk.js';
import { setupTailwind } from './utils/tailwindcss/setup-tailwind.js';
import type { Config } from 'tailwindcss';
import { sanitizeStyleSheet } from './utils/css/sanitize-stylesheet.js';
import { extractRulesPerClass } from './utils/css/extract-rules-per-class.js';
import { getCustomProperties } from './utils/css/get-custom-properties.js';
import { sanitizeNonInlinableRules } from './utils/css/sanitize-non-inlinable-rules.js';
import { addInlinedStylesToElement } from './utils/tailwindcss/add-inlined-styles-to-element.js';
import { isValidNode } from './utils/html/is-valid-node.js';
import { removeAttributesFunctions } from './utils/html/remove-attributes-functions.js';
import { convert } from 'html-to-text';

export type TailwindConfig = Omit<Config, 'content'>;
export type { DefaultTreeAdapterTypes as AST };

/**
 * Options for rendering a Svelte component
 */
export type RenderOptions = {
	props?: Omit<Record<string, any>, '$$slots' | '$$events'> | undefined;
	context?: Map<any, any>;
	idPrefix?: string;
};

/**
 * Email renderer that converts Svelte components to email-safe HTML with inlined Tailwind styles.
 *
 * @example
 * ```ts
 * import Renderer from 'better-svelte-email/renderer';
 * import EmailComponent from './email.svelte';
 *
 * const renderer = new Renderer({
 *   theme: {
 *     extend: {
 *       colors: {
 *         brand: '#FF3E00'
 *       }
 *     }
 *   }
 * });
 *
 * const html = await renderer.render(EmailComponent, {
 *   props: { name: 'John' }
 * });
 * ```
 */
export default class Renderer {
	private tailwindConfig: TailwindConfig;

	constructor(tailwindConfig: TailwindConfig = {}) {
		this.tailwindConfig = tailwindConfig;
	}

	/**
	 * Renders a Svelte component to email-safe HTML with inlined Tailwind CSS.
	 *
	 * Automatically:
	 * - Converts Tailwind classes to inline styles
	 * - Injects media queries into `<head>` for responsive classes
	 * - Replaces DOCTYPE with XHTML 1.0 Transitional
	 * - Removes comments and Svelte artifacts
	 *
	 * @param component - The Svelte component to render
	 * @param options - Render options including props, context, and idPrefix
	 * @returns Email-safe HTML string
	 *
	 * @example
	 * ```ts
	 * const html = await renderer.render(EmailComponent, {
	 *   props: { username: 'john_doe', resetUrl: 'https://...' }
	 * });
	 * ```
	 */
	render = async (component: any, options?: RenderOptions | undefined) => {
		const { body } = svelteRender(component, options);

		let ast = parse(body);
		ast = removeAttributesFunctions(ast);

		let classesUsed: string[] = [];
		const tailwindSetup = await setupTailwind(this.tailwindConfig);

		walk(ast, (node) => {
			if (isValidNode(node)) {
				const classAttr = node.attrs?.find((attr) => attr.name === 'class');

				if (classAttr && classAttr.value) {
					const classes = classAttr.value.split(/\s+/).filter(Boolean);
					classesUsed = [...classesUsed, ...classes];
					tailwindSetup.addUtilities(classes);
				}
			}

			return node;
		});

		const styleSheet = tailwindSetup.getStyleSheet();
		sanitizeStyleSheet(styleSheet);

		const { inlinable: inlinableRules, nonInlinable: nonInlinableRules } = extractRulesPerClass(
			styleSheet,
			classesUsed
		);

		const customProperties = getCustomProperties(styleSheet);

		// Create a new Root for non-inline styles
		const nonInlineStyles = postcss.root();
		for (const rule of nonInlinableRules.values()) {
			nonInlineStyles.append(rule.clone());
		}
		sanitizeNonInlinableRules(nonInlineStyles);

		const hasNonInlineStylesToApply = nonInlinableRules.size > 0;
		let appliedNonInlineStyles = false;
		let hasHead = false;
		const unknownClasses: string[] = [];

		ast = walk(ast, (node) => {
			if (isValidNode(node)) {
				const elementWithInlinedStyles = addInlinedStylesToElement(
					node,
					inlinableRules,
					nonInlinableRules,
					customProperties,
					unknownClasses
				);
				if (node.nodeName === 'head') {
					hasHead = true;
				}
				return elementWithInlinedStyles;
			}
			return node;
		});

		let serialized = serialize(ast);

		if (unknownClasses.length > 0) {
			console.warn(
				`[better-svelte-email] You are using the following classes that were not recognized: ${unknownClasses.join(' ')}.`
			);
		}

		if (hasHead && hasNonInlineStylesToApply) {
			appliedNonInlineStyles = true;
			serialized = serialized.replace(
				'<head>',
				'<head>' + '<style>' + nonInlineStyles.toString() + '</style>'
			);
		}

		if (hasNonInlineStylesToApply && !appliedNonInlineStyles) {
			throw new Error(
				`You are trying to use the following Tailwind classes that cannot be inlined: ${Array.from(
					nonInlinableRules.keys()
				).join(' ')}.
For the media queries to work properly on rendering, they need to be added into a <style> tag inside of a <head> tag,
the render function tried finding a <head> element but just wasn't able to find it.

Make sure that you have a <head> element at any depth. 
This can also be our <Head> component.

If you do already have a <head> element at some depth, 
please file a bug https://github.com/Konixy/better-svelte-email/issues/new?assignees=&labels=bug&projects=.`
			);
		}

		// Replace various DOCTYPE formats with XHTML 1.0 Transitional
		serialized = serialized.replace(
			/<!DOCTYPE\s+html[^>]*>/i,
			'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
		);

		return serialized;
	};
}

/**
 * Render HTML as plain text
 * @param markup - HTML string
 * @returns Plain text string
 */
export const toPlainText = (markup: string) => {
	return convert(markup, {
		selectors: [
			{ selector: 'img', format: 'skip' },
			{ selector: '#__better-svelte-email-preview', format: 'skip' }
		]
	});
};
