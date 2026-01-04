import type { Root } from 'postcss';
import valueParser from 'postcss-value-parser';

export interface CalcResolutionConfig {
	baseFontSize?: number;
}

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
 * Converts a CSS length value to pixels.
 * Returns null for units that cannot be converted (%, vw, vh, ch, ex, etc.)
 */
function toPixels(value: number, unit: string, baseFontSize: number): number | null {
	switch (unit.toLowerCase()) {
		case 'px':
		case '':
			return value;
		case 'rem':
		case 'em':
			return value * baseFontSize;
		case 'pt':
			return value * (96 / 72);
		case 'pc':
			return value * 16;
		case 'in':
			return value * 96;
		case 'cm':
			return value * (96 / 2.54);
		case 'mm':
			return value * (96 / 25.4);
		default:
			// cannot convert %, vw, vh, dvh, svh, lvh, ch, ex, etc.
			return null;
	}
}

/**
 * Checks if a unit can be converted to pixels.
 */
function isConvertibleUnit(unit: string): boolean {
	const convertible = ['px', 'rem', 'em', 'pt', 'pc', 'in', 'cm', 'mm', ''];
	return convertible.includes(unit.toLowerCase());
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
 * Resolves calc expressions including `*`, `/`, `+`, and `-` operations.
 * For `+` and `-` with mixed units, converts to pixels using the baseFontSize.
 *
 * Limitations:
 * - Parenthesized sub-expressions like `calc((10px + 5px) * 2)` are not supported.
 * - em units are treated as rem and converted to pixels using baseFontSize.
 * - Non-convertible units (%, vw, vh, etc.) will leave the calc() unresolved.
 */
function evaluateCalcExpression(expr: string, baseFontSize: number): string | null {
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

	// Process + and - operations (left to right)
	i = 0;
	while (i < tokens.length) {
		const token = tokens[i];
		if ((token === '+' || token === '-') && i > 0 && i < tokens.length - 1) {
			const left = parseValue(tokens[i - 1]);
			const right = parseValue(tokens[i + 1]);

			if (left && right) {
				// Same unit: directly compute
				if (left.unit.toLowerCase() === right.unit.toLowerCase()) {
					const resultValue = token === '+' ? left.value + right.value : left.value - right.value;
					const result = formatValue({
						value: resultValue,
						unit: left.unit,
						type: left.type
					});
					tokens.splice(i - 1, 3, result);
					i = Math.max(0, i - 1);
					continue;
				}

				// Mixed units: convert to pixels if both units are convertible
				if (isConvertibleUnit(left.unit) && isConvertibleUnit(right.unit)) {
					const leftPx = toPixels(left.value, left.unit, baseFontSize);
					const rightPx = toPixels(right.value, right.unit, baseFontSize);

					if (leftPx !== null && rightPx !== null) {
						const resultPx = token === '+' ? leftPx + rightPx : leftPx - rightPx;
						const result = formatValue({
							value: resultPx,
							unit: 'px',
							type: 'dimension'
						});
						tokens.splice(i - 1, 3, result);
						i = Math.max(0, i - 1);
						continue;
					}
				}

				// Non-convertible units (%, vw, vh, etc.): cannot resolve, skip
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

export function resolveCalcExpressions(root: Root, config?: CalcResolutionConfig) {
	const baseFontSize = config?.baseFontSize ?? 16;

	root.walkDecls((decl) => {
		if (!decl.value.includes('calc(')) return;

		const parsed = valueParser(decl.value);

		parsed.walk((node) => {
			if (node.type === 'function' && node.value === 'calc') {
				// Get the inner content of calc()
				const innerContent = valueParser.stringify(node.nodes);
				const result = evaluateCalcExpression(innerContent, baseFontSize);

				if (result) {
					// Replace the function with the result
					(node as any).type = 'word';
					node.value = result;
					node.nodes = [];
				}
			}
		});

		decl.value = valueParser.stringify(parsed.nodes);
	});
}
