/**
 * Convert a style object to a CSS string
 * @param style - Object containing CSS properties
 * @returns CSS string with properties
 */
export function styleToString(style: Record<string, string | number | undefined>): string {
	return Object.entries(style)
		.filter(([, value]) => value !== undefined && value !== null && value !== '')
		.map(([key, value]) => {
			// Convert camelCase to kebab-case
			const cssKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
			return `${cssKey}:${value}`;
		})
		.join(';');
}

/**
 * Convert pixels to points for email clients
 * @param px - Pixel value as string
 * @returns Point value as string
 */
export function pxToPt(px: string | number): string {
	const value = typeof px === 'string' ? parseFloat(px) : px;
	return `${Math.round(value * 0.75)}pt`;
}

export type Margin = {
	m?: string;
	mx?: string;
	my?: string;
	mt?: string;
	mr?: string;
	mb?: string;
	ml?: string;
};

/**
 * Convert margin props to a CSS style object
 * @param props - Margin properties object with shorthand notation (m, mx, my, mt, mr, mb, ml)
 * @returns Style object with margin properties in pixels
 */
export function withMargin(props: Margin) {
	const margins = [
		withSpace(props.m, ['margin']),
		withSpace(props.mx, ['marginLeft', 'marginRight']),
		withSpace(props.my, ['marginTop', 'marginBottom']),
		withSpace(props.mt, ['marginTop']),
		withSpace(props.mr, ['marginRight']),
		withSpace(props.mb, ['marginBottom']),
		withSpace(props.ml, ['marginLeft'])
	];

	return Object.assign({}, ...margins);
}

function withSpace(value: string | undefined, properties: string[]) {
	return properties.reduce((styles, property) => {
		if (value) {
			return { ...styles, [property]: `${value}px` };
		}
		return styles;
	}, {});
}

/**
 * Combine multiple styles into a single string
 * @param styles - Array of style strings
 * @returns Combined style string
 */
export function combineStyles(...styles: (string | undefined | null)[]) {
	return styles.filter((style) => style !== '' && style !== undefined && style !== null).join(';');
}
