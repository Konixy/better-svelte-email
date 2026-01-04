import type { Root } from 'postcss';
import valueParser, { type Node, type FunctionNode } from 'postcss-value-parser';

export interface SanitizeDeclarationsConfig {
	baseFontSize?: number;
}

/**
 * Converts a CSS length value to pixels.
 * Returns null for units that cannot be converted (%, vw, vh, ch, ex, etc.)
 */
function toPixels(value: number, unit: string, baseFontSize: number): number | null {
	switch (unit.toLowerCase()) {
		case 'px':
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
			return null;
	}
}

// Color conversion constants
const LAB_TO_LMS = {
	l: [0.3963377773761749, 0.2158037573099136],
	m: [-0.1055613458156586, -0.0638541728258133],
	s: [-0.0894841775298119, -1.2914855480194092]
};
const LSM_TO_RGB = {
	r: [4.0767416360759583, -3.3077115392580629, 0.2309699031821043],
	g: [-1.2684379732850315, 2.6097573492876882, -0.341319376002657],
	b: [-0.0041960761386756, -0.7034186179359362, 1.7076146940746117]
};

function lrgbToRgb(input: number): number {
	const absoluteNumber = Math.abs(input);
	const sign = input < 0 ? -1 : 1;

	if (absoluteNumber > 0.0031308) {
		return sign * (absoluteNumber ** (1 / 2.4) * 1.055 - 0.055);
	}

	return input * 12.92;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function oklchToOklab(oklch: { l: number; c: number; h: number }) {
	return {
		l: oklch.l,
		a: oklch.c * Math.cos((oklch.h / 180) * Math.PI),
		b: oklch.c * Math.sin((oklch.h / 180) * Math.PI)
	};
}

/** Convert oklch to RGB */
function oklchToRgb(oklch: { l: number; c: number; h: number }): {
	r: number;
	g: number;
	b: number;
} {
	const oklab = oklchToOklab(oklch);

	const l = (oklab.l + LAB_TO_LMS.l[0] * oklab.a + LAB_TO_LMS.l[1] * oklab.b) ** 3;
	const m = (oklab.l + LAB_TO_LMS.m[0] * oklab.a + LAB_TO_LMS.m[1] * oklab.b) ** 3;
	const s = (oklab.l + LAB_TO_LMS.s[0] * oklab.a + LAB_TO_LMS.s[1] * oklab.b) ** 3;

	const r = 255 * lrgbToRgb(LSM_TO_RGB.r[0] * l + LSM_TO_RGB.r[1] * m + LSM_TO_RGB.r[2] * s);
	const g = 255 * lrgbToRgb(LSM_TO_RGB.g[0] * l + LSM_TO_RGB.g[1] * m + LSM_TO_RGB.g[2] * s);
	const b = 255 * lrgbToRgb(LSM_TO_RGB.b[0] * l + LSM_TO_RGB.b[1] * m + LSM_TO_RGB.b[2] * s);

	return {
		r: clamp(r, 0, 255),
		g: clamp(g, 0, 255),
		b: clamp(b, 0, 255)
	};
}

function formatRgb(r: number, g: number, b: number, a?: number): string {
	const rInt = Math.round(r);
	const gInt = Math.round(g);
	const bInt = Math.round(b);

	if (a !== undefined && a !== 1) {
		return `rgb(${rInt}, ${gInt}, ${bInt}, ${a})`;
	}
	return `rgb(${rInt}, ${gInt}, ${bInt})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number; a?: number } {
	hex = hex.replace('#', '');

	if (hex.length === 3) {
		return {
			r: parseInt(hex[0] + hex[0], 16),
			g: parseInt(hex[1] + hex[1], 16),
			b: parseInt(hex[2] + hex[2], 16)
		};
	}
	if (hex.length === 4) {
		return {
			r: parseInt(hex[0] + hex[0], 16),
			g: parseInt(hex[1] + hex[1], 16),
			b: parseInt(hex[2] + hex[2], 16),
			a: parseInt(hex[3] + hex[3], 16) / 255
		};
	}
	if (hex.length === 5) {
		return {
			r: parseInt(hex.slice(0, 2), 16),
			g: parseInt(hex[2] + hex[2], 16),
			b: parseInt(hex[3] + hex[3], 16),
			a: parseInt(hex[4] + hex[4], 16) / 255
		};
	}
	if (hex.length === 6) {
		return {
			r: parseInt(hex.slice(0, 2), 16),
			g: parseInt(hex.slice(2, 4), 16),
			b: parseInt(hex.slice(4, 6), 16)
		};
	}
	if (hex.length === 7) {
		return {
			r: parseInt(hex.slice(0, 2), 16),
			g: parseInt(hex.slice(2, 4), 16),
			b: parseInt(hex.slice(4, 6), 16),
			a: parseInt(hex[6] + hex[6], 16) / 255
		};
	}
	// 8 character hex
	return {
		r: parseInt(hex.slice(0, 2), 16),
		g: parseInt(hex.slice(2, 4), 16),
		b: parseInt(hex.slice(4, 6), 16),
		a: parseInt(hex.slice(6, 8), 16) / 255
	};
}

interface ParsedOklch {
	l?: number;
	c?: number;
	h?: number;
	a?: number;
}

function parseOklchValues(nodes: Node[]): ParsedOklch {
	const result: ParsedOklch = {};

	for (const node of nodes) {
		if (node.type === 'word') {
			const numMatch = node.value.match(/^(-?[\d.]+)(%|deg)?$/i);
			if (numMatch) {
				const value = parseFloat(numMatch[1]);
				const unit = numMatch[2]?.toLowerCase();

				if (unit === '%') {
					if (result.l === undefined) {
						result.l = value / 100;
					} else if (result.a === undefined) {
						result.a = value / 100;
					}
				} else if (unit === 'deg') {
					if (result.h === undefined) {
						result.h = value;
					}
				} else {
					if (result.l === undefined) {
						result.l = value;
					} else if (result.c === undefined) {
						result.c = value;
					} else if (result.h === undefined) {
						result.h = value;
					} else if (result.a === undefined) {
						result.a = value;
					}
				}
			}
		}
	}

	return result;
}

interface ParsedRgb {
	r?: number;
	g?: number;
	b?: number;
	a?: number;
}

function parseRgbValues(nodes: Node[]): ParsedRgb {
	const result: ParsedRgb = {};

	for (const node of nodes) {
		if (node.type === 'word') {
			const numMatch = node.value.match(/^(-?[\d.]+)(%)?$/);
			if (numMatch) {
				const value = parseFloat(numMatch[1]);
				const isPercent = numMatch[2] === '%';

				if (result.r === undefined) {
					result.r = isPercent ? (value * 255) / 100 : value;
				} else if (result.g === undefined) {
					result.g = isPercent ? (value * 255) / 100 : value;
				} else if (result.b === undefined) {
					result.b = isPercent ? (value * 255) / 100 : value;
				} else if (result.a === undefined) {
					result.a = isPercent ? value / 100 : value;
				}
			}
		}
	}

	return result;
}

function transformColorMix(node: FunctionNode): string | null {
	// We're expecting the structure to be something like:
	// color-mix(in oklab, rgb(...) X%, transparent)

	// Check if it ends with transparent
	const lastNode = node.nodes[node.nodes.length - 1];
	if (lastNode?.type !== 'word' || lastNode.value !== 'transparent') {
		return null;
	}

	// Find the rgb function and percentage
	let rgbFunc: FunctionNode | null = null;
	let percentage: number | null = null;

	for (const child of node.nodes) {
		if (child.type === 'function' && child.value === 'rgb') {
			rgbFunc = child;
		}
		if (child.type === 'word' && child.value.endsWith('%')) {
			percentage = parseFloat(child.value) / 100;
		}
	}

	if (rgbFunc && percentage !== null) {
		const rgbValues = parseRgbValues(rgbFunc.nodes);
		if (rgbValues.r !== undefined && rgbValues.g !== undefined && rgbValues.b !== undefined) {
			return formatRgb(rgbValues.r, rgbValues.g, rgbValues.b, percentage);
		}
	}

	return null;
}

/**
 * Meant to do all the things necessary, in a per-declaration basis, to have the best email client
 * support possible.
 *
 * Here's the transformations it does so far:
 * - convert relative units (rem, em, pt, pc, in, cm, mm) to px for better email client support;
 * - convert all `rgb` with space-based syntax into a comma based one;
 * - convert all `oklch` values into `rgb`;
 * - convert all hex values into `rgb`;
 * - convert `padding-inline` into `padding-left` and `padding-right`;
 * - convert `padding-block` into `padding-top` and `padding-bottom`;
 * - convert `margin-inline` into `margin-left` and `margin-right`;
 * - convert `margin-block` into `margin-top` and `margin-bottom`.
 */
export function sanitizeDeclarations(root: Root, config?: SanitizeDeclarationsConfig) {
	const baseFontSize = config?.baseFontSize ?? 16;

	root.walkDecls((decl) => {
		// Handle infinity calc for border-radius
		if (decl.prop === 'border-radius' && /calc\s*\(\s*infinity\s*\*\s*1px\s*\)/i.test(decl.value)) {
			decl.value = '9999px';
		}

		// Handle shorthand properties
		if (decl.prop === 'padding-inline') {
			const values = decl.value.split(/\s+/).filter(Boolean);
			decl.prop = 'padding-left';
			decl.value = values[0];
			decl.cloneAfter({ prop: 'padding-right', value: values[1] || values[0] });
		}
		if (decl.prop === 'padding-block') {
			const values = decl.value.split(/\s+/).filter(Boolean);
			decl.prop = 'padding-top';
			decl.value = values[0];
			decl.cloneAfter({ prop: 'padding-bottom', value: values[1] || values[0] });
		}
		if (decl.prop === 'margin-inline') {
			const values = decl.value.split(/\s+/).filter(Boolean);
			decl.prop = 'margin-left';
			decl.value = values[0];
			decl.cloneAfter({ prop: 'margin-right', value: values[1] || values[0] });
		}
		if (decl.prop === 'margin-block') {
			const values = decl.value.split(/\s+/).filter(Boolean);
			decl.prop = 'margin-top';
			decl.value = values[0];
			decl.cloneAfter({ prop: 'margin-bottom', value: values[1] || values[0] });
		}

		// Convert relative units to px for better email client support
		// Check if value contains any convertible units (excluding px which is already fine)
		const hasConvertibleUnits = /\d+(rem|em|pt|pc|in|cm|mm)\b/i.test(decl.value);
		if (hasConvertibleUnits) {
			const parsed = valueParser(decl.value);

			parsed.walk((node) => {
				if (node.type === 'word') {
					const match = node.value.match(/^(-?[\d.]+)(rem|em|pt|pc|in|cm|mm)$/i);
					if (match) {
						const numValue = parseFloat(match[1]);
						const unit = match[2];
						const pxValue = toPixels(numValue, unit, baseFontSize);

						if (pxValue !== null) {
							// Round to avoid floating point precision issues
							// Use up to 3 decimal places for precision, then trim trailing zeros
							const rounded = Math.round(pxValue * 1000) / 1000;
							node.value = `${rounded}px`;
						}
					}
				}
			});

			decl.value = valueParser.stringify(parsed.nodes);
		}

		// Parse and transform color values
		if (
			decl.value.includes('oklch(') ||
			decl.value.includes('rgb(') ||
			decl.value.includes('#') ||
			decl.value.includes('color-mix(')
		) {
			const parsed = valueParser(decl.value);

			parsed.walk((node) => {
				// Convert oklch to rgb
				if (node.type === 'function' && node.value === 'oklch') {
					const oklchValues = parseOklchValues(node.nodes);

					if (
						oklchValues.l === undefined ||
						oklchValues.c === undefined ||
						oklchValues.h === undefined
					) {
						throw new Error('Could not determine the parameters of an oklch() function.', {
							cause: decl
						});
					}

					const rgb = oklchToRgb({
						l: oklchValues.l,
						c: oklchValues.c,
						h: oklchValues.h
					});

					// Transform function node to word node
					(node as unknown as Node).type = 'word';
					node.value = formatRgb(rgb.r, rgb.g, rgb.b, oklchValues.a);
					node.nodes = [];
				}

				// Convert space-based rgb to comma-based
				if (node.type === 'function' && node.value === 'rgb') {
					const rgbValues = parseRgbValues(node.nodes);

					if (rgbValues.r === undefined || rgbValues.g === undefined || rgbValues.b === undefined) {
						throw new Error('Could not determine the parameters of an rgb() function.', {
							cause: decl
						});
					}

					// Transform function node to word node
					(node as unknown as Node).type = 'word';
					node.value = formatRgb(rgbValues.r, rgbValues.g, rgbValues.b, rgbValues.a);
					node.nodes = [];
				}

				// Handle color-mix with transparent
				if (node.type === 'function' && node.value === 'color-mix') {
					const result = transformColorMix(node);
					if (result) {
						// Transform function node to word node
						(node as unknown as Node).type = 'word';
						node.value = result;
						node.nodes = [];
					}
				}

				// Convert hex to rgb
				if (node.type === 'word' && node.value.startsWith('#')) {
					const rgb = hexToRgb(node.value);
					node.value = formatRgb(rgb.r, rgb.g, rgb.b, rgb.a);
				}
			});

			decl.value = valueParser.stringify(parsed.nodes);
		}
	});
}
