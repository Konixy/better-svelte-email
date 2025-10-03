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

	// Check if Head is self-closing and convert it
	const headStart = source.lastIndexOf('<Head', headInfo.insertPosition);
	const headSegment = source.substring(headStart, headInfo.insertPosition + 10);

	if (headSegment.includes('/>')) {
		// Self-closing: convert to non-self-closing
		// Check if there's a space before />
		const spaceBeforeSelfClose = source[headInfo.insertPosition - 1] === ' ';
		const replaceStart = spaceBeforeSelfClose
			? headInfo.insertPosition - 1
			: headInfo.insertPosition;

		// Replace [space]?/> with >
		s.overwrite(replaceStart, headInfo.insertPosition + 2, '>');
		// Insert style content
		s.appendLeft(headInfo.insertPosition + 2, styleContent);
		// Add closing tag
		s.appendLeft(headInfo.insertPosition + 2, '</Head>');
	} else {
		// Already has closing tag, just insert content
		s.appendLeft(headInfo.insertPosition, styleContent);
	}

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
