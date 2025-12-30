import { expect, test, describe } from 'vitest';
import { sanitizeCustomCss } from './sanitize-custom-css.js';

describe('sanitizeCustomCss', () => {
	test('should remove @import rules', () => {
		const css = '@import "styles.css"; .test { color: red; }';
		const result = sanitizeCustomCss(css);
		expect(result).not.toContain('@import');
		expect(result).toContain('.test { color: red; }');
	});

	test('should remove multiple @import rules', () => {
		const css = `
			@import "first.css";
			@import url("second.css");
			.body { background: white; }
		`;
		const result = sanitizeCustomCss(css);
		expect(result).not.toContain('@import');
		expect(result).toContain('.body { background: white; }');
	});

	test('should keep other at-rules like @media', () => {
		const css = `
			@import "print.css";
			@media print {
				.no-print { display: none; }
			}
		`;
		const result = sanitizeCustomCss(css);
		expect(result).not.toContain('@import');
		expect(result).toContain('@media print');
		expect(result).toContain('.no-print { display: none; }');
	});

	test('should return empty string if only @imports are present', () => {
		const css = '@import "one.css"; @import "two.css";';
		const result = sanitizeCustomCss(css).trim();
		expect(result).toBe('');
	});

	test('should handle empty input', () => {
		expect(sanitizeCustomCss('')).toBe('');
	});

	test('should remove @plugin rules', () => {
		const css = '@plugin "my-plugin"; .test { color: red; }';
		const result = sanitizeCustomCss(css);
		expect(result).not.toContain('@plugin');
		expect(result).toContain('.test { color: red; }');
	});

	test('should remove @source rules (Tailwind v4)', () => {
		const css = `
			@source "../node_modules/some-lib/**/*";
			.test { color: red; }
		`;
		const result = sanitizeCustomCss(css);
		expect(result).not.toContain('@source');
		expect(result).toContain('.test { color: red; }');
	});
});
