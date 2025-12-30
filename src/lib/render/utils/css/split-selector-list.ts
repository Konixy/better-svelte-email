/**
 * Splits a CSS selector list by commas, respecting parentheses and brackets.
 * e.g., "*, ::before, ::after" → ["*", "::before", "::after"]
 * e.g., ":is(div, p), span" → [":is(div, p)", "span"]
 */
export function splitSelectorList(selector: string): string[] {
	const result: string[] = [];
	let current = '';
	let parenDepth = 0;
	let bracketDepth = 0;
	let inString: string | null = null;

	for (let i = 0; i < selector.length; i++) {
		const char = selector[i];

		// Handle string literals (for attribute selectors like [title="a,b"])
		if ((char === '"' || char === "'") && !inString) {
			inString = char;
		} else if (char === inString) {
			inString = null;
		}

		if (!inString) {
			if (char === '(') parenDepth++;
			if (char === ')') parenDepth--;
			if (char === '[') bracketDepth++;
			if (char === ']') bracketDepth--;

			// Split on comma only at top level
			if (char === ',' && parenDepth === 0 && bracketDepth === 0) {
				result.push(current.trim());
				current = '';
				continue;
			}
		}

		current += char;
	}

	result.push(current.trim());
	return result;
}
