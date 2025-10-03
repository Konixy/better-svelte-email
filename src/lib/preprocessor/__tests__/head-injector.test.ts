import { describe, it, expect } from 'vitest';
import { injectMediaQueries } from '../head-injector.js';
import type { MediaQueryStyle } from '../types.js';

describe('injectMediaQueries', () => {
	it('should inject media queries into self-closing Head', () => {
		const source = `<Html><Head /></Html>`;
		const mediaQueries: MediaQueryStyle[] = [
			{
				query: '@media (max-width: 475px)',
				className: 'responsive-sm',
				rules: '@media (max-width: 475px) { .sm_bg_red_500 { background-color: red !important; } }'
			}
		];

		const result = injectMediaQueries(source, mediaQueries);

		expect(result.success).toBe(true);
		expect(result.code).toContain('<style>');
		expect(result.code).toContain('@media');
		expect(result.code).toContain('background-color');
	});

	it('should inject media queries into Head with closing tag', () => {
		const source = `<Html><Head></Head></Html>`;
		const mediaQueries: MediaQueryStyle[] = [
			{
				query: '@media (max-width: 475px)',
				className: 'responsive-sm',
				rules: '@media (max-width: 475px) { .sm_p_4 { padding: 16px !important; } }'
			}
		];

		const result = injectMediaQueries(source, mediaQueries);

		expect(result.success).toBe(true);
		expect(result.code).toContain('<style>');
	});

	it('should inject media queries into Head with existing children', () => {
		const source = `<Html><Head><title>Test</title></Head></Html>`;
		const mediaQueries: MediaQueryStyle[] = [
			{
				query: '@media (max-width: 475px)',
				className: 'responsive-sm',
				rules: '@media (max-width: 475px) { .sm_text_red { color: red !important; } }'
			}
		];

		const result = injectMediaQueries(source, mediaQueries);

		expect(result.success).toBe(true);
		expect(result.code).toContain('<style>');
		expect(result.code).toContain('<title>Test</title>');
	});

	it('should return success for empty media queries array', () => {
		const source = `<Html><Head /></Html>`;
		const mediaQueries: MediaQueryStyle[] = [];

		const result = injectMediaQueries(source, mediaQueries);

		expect(result.success).toBe(true);
		expect(result.code).toBe(source);
	});

	it('should return error when no Head component found', () => {
		const source = `<Html><Body>Content</Body></Html>`;
		const mediaQueries: MediaQueryStyle[] = [
			{
				query: '@media (max-width: 475px)',
				className: 'responsive-sm',
				rules: '@media (max-width: 475px) { .sm_p_4 { padding: 16px !important; } }'
			}
		];

		const result = injectMediaQueries(source, mediaQueries);

		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
		expect(result.error).toContain('No <Head> component found');
	});

	it('should handle multiple media queries', () => {
		const source = `<Html><Head /></Html>`;
		const mediaQueries: MediaQueryStyle[] = [
			{
				query: '@media (max-width: 475px)',
				className: 'responsive-sm',
				rules: '@media (max-width: 475px) { .sm_p_4 { padding: 16px !important; } }'
			},
			{
				query: '@media (max-width: 768px)',
				className: 'responsive-md',
				rules: '@media (max-width: 768px) { .md_p_6 { padding: 24px !important; } }'
			}
		];

		const result = injectMediaQueries(source, mediaQueries);

		expect(result.success).toBe(true);
		expect(result.code).toContain('sm_p_4');
		expect(result.code).toContain('md_p_6');
	});

	it('should preserve Head attributes', () => {
		const source = `<Html><Head lang="en" /></Html>`;
		const mediaQueries: MediaQueryStyle[] = [
			{
				query: '@media (max-width: 475px)',
				className: 'responsive-sm',
				rules: '@media (max-width: 475px) { .sm_p_4 { padding: 16px !important; } }'
			}
		];

		const result = injectMediaQueries(source, mediaQueries);

		expect(result.success).toBe(true);
		expect(result.code).toContain('lang="en"');
	});

	it('should handle nested Head component', () => {
		const source = `
			<Html>
				<Container>
					<Head />
				</Container>
			</Html>
		`;
		const mediaQueries: MediaQueryStyle[] = [
			{
				query: '@media (max-width: 475px)',
				className: 'responsive-sm',
				rules: '@media (max-width: 475px) { .sm_p_4 { padding: 16px !important; } }'
			}
		];

		const result = injectMediaQueries(source, mediaQueries);

		expect(result.success).toBe(true);
		expect(result.code).toContain('<style>');
	});
});
