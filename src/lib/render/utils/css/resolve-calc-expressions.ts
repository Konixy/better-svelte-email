import type { Root } from 'postcss';
import valueParser from 'postcss-value-parser';

interface ParsedValue {
	value: number;
	unit: string;
	type: 'dimension' | 'number' | 'percentage';
}

function parseValue(str: string): ParsedValue | null {
	const match = str.match(/^(-?[\d.]+)(%|[a-z]+)?$/i);
	if (match) {
		const value = parseFloat(match[1]);
		const unit = match[2] || '';
		return {
			value,
			unit,
			type: unit === '%' ? 'percentage' : unit ? 'dimension' : 'number'
		};
	}
	return null;
}

function formatValue(parsed: ParsedValue): string {
	return `${parsed.value}${parsed.unit}`;
}

/**
 * Splits a calc expression string into tokens (values and operators)
 * Handles both space-separated and non-space-separated expressions
 */
function tokenizeCalcExpression(expr: string): string[] {
	const tokens: string[] = [];
	let current = '';

	for (let i = 0; i < expr.length; i++) {
		const char = expr[i];

		if (char === '*' || char === '/') {
			if (current.trim()) {
				tokens.push(current.trim());
			}
			tokens.push(char);
			current = '';
		} else if (char === '+' || char === '-') {
			// Only treat as operator if not at start and previous char wasn't an operator
			// (to handle negative numbers and units like 1e-5)
			if (current.trim() && !/[eE]$/.test(current.trim())) {
				tokens.push(current.trim());
				tokens.push(char);
				current = '';
			} else {
				current += char;
			}
		} else if (char === ' ') {
			if (current.trim()) {
				// Check if next non-space char is an operator
				let nextNonSpace = i + 1;
				while (nextNonSpace < expr.length && expr[nextNonSpace] === ' ') {
					nextNonSpace++;
				}
				const nextChar = expr[nextNonSpace];
				if (nextChar !== '*' && nextChar !== '/' && nextChar !== '+' && nextChar !== '-') {
					tokens.push(current.trim());
					current = '';
				}
			}
		} else {
			current += char;
		}
	}

	if (current.trim()) {
		tokens.push(current.trim());
	}

	return tokens;
}

/**
 * Intentionally only resolves `*` and `/` operations without dealing with parenthesis,
 * because this is the only thing required to run Tailwind v4
 */
function evaluateCalcExpression(expr: string): string | null {
	const tokens = tokenizeCalcExpression(expr);

	if (tokens.length === 0) return null;
	if (tokens.length === 1) {
		const parsed = parseValue(tokens[0]);
		return parsed ? formatValue(parsed) : null;
	}

	// Process * and / operations (left to right)
	let i = 0;
	while (i < tokens.length) {
		const token = tokens[i];
		if (token === '*' || token === '/') {
			const left = parseValue(tokens[i - 1]);
			const right = parseValue(tokens[i + 1]);

			if (left && right) {
				let resultValue: number;
				if (token === '*') {
					resultValue = left.value * right.value;
				} else {
					if (right.value === 0) resultValue = 0;
					else resultValue = left.value / right.value;
				}

				// Determine result type
				let resultUnit = '';
				let resultType: ParsedValue['type'] = 'number';

				if (left.type === 'dimension' && right.type === 'number') {
					resultUnit = left.unit;
					resultType = 'dimension';
				} else if (left.type === 'number' && right.type === 'dimension') {
					resultUnit = right.unit;
					resultType = 'dimension';
				} else if (left.type === 'dimension' && right.type === 'dimension') {
					if (token === '/') {
						resultType = 'number';
					} else {
						resultUnit = left.unit;
						resultType = 'dimension';
					}
				} else if (left.type === 'percentage' || right.type === 'percentage') {
					if (token === '/' && left.type === 'percentage' && right.type === 'percentage') {
						resultType = 'number';
					} else {
						resultUnit = '%';
						resultType = 'percentage';
					}
				}

				// Replace the three tokens with the result
				const result = formatValue({ value: resultValue, unit: resultUnit, type: resultType });
				tokens.splice(i - 1, 3, result);
				i = Math.max(0, i - 1); // Go back to check for more operations
				continue;
			}
		}
		i++;
	}

	if (tokens.length === 1) {
		return tokens[0];
	}

	// If we still have multiple tokens, we couldn't fully evaluate
	return null;
}

export function resolveCalcExpressions(root: Root) {
	root.walkDecls((decl) => {
		if (!decl.value.includes('calc(')) return;

		const parsed = valueParser(decl.value);

		parsed.walk((node) => {
			if (node.type === 'function' && node.value === 'calc') {
				// Get the inner content of calc()
				const innerContent = valueParser.stringify(node.nodes);
				const result = evaluateCalcExpression(innerContent);

				if (result) {
					// Replace the function with the result
					node.type = 'word';
					node.value = result;
					node.nodes = [];
				}
			}
		});

		decl.value = valueParser.stringify(parsed.nodes);
	});
}
