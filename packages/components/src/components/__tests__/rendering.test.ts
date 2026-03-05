import { describe, it, expect } from 'vitest';
import { Renderer } from '@better-svelte-email/server';
import Column from '../Column.svelte';
import Heading from '../Heading.svelte';
import Html from '../Html.svelte';
import Link from '../Link.svelte';
import Preview from '../Preview.svelte';
import Text from '../Text.svelte';

const testChildren = () => 'test';

describe('Component Unique Features', () => {
	describe('Html', () => {
		it('should render with default lang and dir attributes', async () => {
			const renderer = new Renderer();
			const html = await renderer.render(Html, { props: {} });
			expect(html).toMatchSnapshot();
		});

		it('should render with RTL direction', async () => {
			const renderer = new Renderer();
			const html = await renderer.render(Html, { props: { lang: 'ar', dir: 'rtl' } });
			expect(html).toMatchSnapshot();
		});
	});

	describe('Text', () => {
		it('should render with custom element tag (as prop)', async () => {
			const renderer = new Renderer();
			const html = await renderer.render(Text, {
				props: { as: 'h1', style: 'font-size:32px;', children: testChildren }
			});
			expect(html).toMatchSnapshot();
		});
	});

	describe('Column', () => {
		it('should handle colspan attribute', async () => {
			const renderer = new Renderer();
			const html = await renderer.render(Column, { props: { colspan: 2, children: testChildren } });
			expect(html).toMatchSnapshot();
		});

		it('should handle align attribute', async () => {
			const renderer = new Renderer();
			const html = await renderer.render(Column, {
				props: { align: 'center', children: testChildren }
			});
			expect(html).toMatchSnapshot();
		});
	});

	describe('Heading', () => {
		it('should render different heading levels', async () => {
			const levels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
			const renderer = new Renderer();

			for (const level of levels) {
				const html = await renderer.render(Heading, {
					props: { as: level, children: testChildren }
				});
				expect(html).toMatchSnapshot();
			}
		});

		it('should apply margin shorthand (m)', async () => {
			const renderer = new Renderer();
			const html = await renderer.render(Heading, {
				props: { as: 'h1', m: '20', children: testChildren }
			});
			expect(html).toMatchSnapshot();
		});

		it('should apply horizontal margin (mx)', async () => {
			const renderer = new Renderer();
			const html = await renderer.render(Heading, {
				props: { as: 'h2', mx: '16', children: testChildren }
			});
			expect(html).toMatchSnapshot();
		});

		it('should apply vertical margin (my)', async () => {
			const renderer = new Renderer();
			const html = await renderer.render(Heading, {
				props: { as: 'h3', my: '24', children: testChildren }
			});
			expect(html).toMatchSnapshot();
		});

		it('should apply individual margin props', async () => {
			const renderer = new Renderer();
			const html = await renderer.render(Heading, {
				props: { as: 'h1', mt: '10', mr: '15', mb: '20', ml: '25', children: testChildren }
			});
			expect(html).toMatchSnapshot();
		});

		it('should combine margin props with inline styles', async () => {
			const renderer = new Renderer();
			const html = await renderer.render(Heading, {
				props: { as: 'h2', style: 'color:blue;', my: '16', children: testChildren }
			});
			expect(html).toMatchSnapshot();
		});
	});

	describe('Link', () => {
		it('should have default target="_blank"', async () => {
			const renderer = new Renderer();
			const html = await renderer.render(Link, {
				props: { href: 'https://example.com', children: testChildren }
			});
			expect(html).toMatchSnapshot();
		});

		it('should allow custom target', async () => {
			const renderer = new Renderer();
			const html = await renderer.render(Link, {
				props: { href: 'https://example.com', target: '_self', children: testChildren }
			});
			expect(html).toMatchSnapshot();
		});
	});

	describe('Preview', () => {
		it('should truncate preview text to max length', async () => {
			const longText = 'A'.repeat(200);
			const renderer = new Renderer();
			const html = await renderer.render(Preview, { props: { preview: longText } });
			expect(html).toMatchSnapshot();
		});

		it('should add whitespace padding for short text', async () => {
			const shortText = 'Short';
			const renderer = new Renderer();
			const html = await renderer.render(Preview, { props: { preview: shortText } });
			expect(html).toMatchSnapshot();
		});
	});
});
