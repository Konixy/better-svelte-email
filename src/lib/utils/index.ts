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
