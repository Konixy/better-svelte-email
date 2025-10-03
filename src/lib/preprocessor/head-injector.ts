import MagicString from 'magic-string';
import type { MediaQueryStyle } from './types.js';
import { findHeadComponent } from './parser.js';

/**
 * Inject media query styles into the <Head> component
 */
export function injectMediaQueries(
	source: string,
	mediaQueries: MediaQueryStyle[]
): { code: string; success: boolean; error?: string } {
	if (mediaQueries.length === 0) {
		// No media queries to inject
		return { code: source, success: true };
	}

	// Find the Head component
	const headInfo = findHeadComponent(source);

	if (!headInfo.found || headInfo.insertPosition === null) {
		return {
			code: source,
			success: false,
			error: 'No <Head> component found. Media queries cannot be injected.'
		};
	}

	// Generate the style tag content
	const styleContent = generateStyleTag(mediaQueries);

	// Use MagicString for surgical insertion
	const s = new MagicString(source);

	// Insert at the identified position
	s.appendLeft(headInfo.insertPosition, styleContent);

	return {
		code: s.toString(),
		success: true
	};
}

/**
 * Generate <style> tag with all media queries
 */
function generateStyleTag(mediaQueries: MediaQueryStyle[]): string {
	// Combine all media queries
	const allQueries = mediaQueries.map((mq) => mq.rules).join('\n');

	return `\n\t<style>\n\t\t${allQueries}\n\t</style>\n`;
}
