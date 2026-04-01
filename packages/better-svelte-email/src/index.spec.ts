import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';

const getExportKeys = (exportsObject: Record<string, unknown>) => Object.keys(exportsObject).sort();

describe('better-svelte-email exports', () => {
	afterEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	describe('folder index exports', () => {
		it('re-exports all component exports from components/', async () => {
			const componentA = Symbol('Body');
			const componentB = Symbol('Button');
			const mockedComponentPackage = { Body: componentA, Button: componentB };

			vi.doMock('@better-svelte-email/components', () => mockedComponentPackage);

			const componentsExports = await import('./components');

			expect(getExportKeys(componentsExports)).toEqual(getExportKeys(mockedComponentPackage));
			expect(componentsExports.Body).toBe(componentA);
			expect(componentsExports.Button).toBe(componentB);
		});

		it('re-exports all preview exports from preview/', async () => {
			const source = await readFile(new URL('./preview/index.ts', import.meta.url), 'utf8');

			expect(source).toContain("export * from '@better-svelte-email/preview';");
			expect(source).toContain(
				"export { default as EmailPreview } from '@better-svelte-email/preview/EmailPreview.svelte';"
			);
		});

		it('re-exports the intended public render API from render/', async () => {
			class MockedRenderer {}
			const mockedToPlainText = vi.fn();

			vi.doMock('@better-svelte-email/server', () => ({
				Renderer: MockedRenderer,
				toPlainText: mockedToPlainText,
				pixelBasedPreset: { test: true }
			}));

			const renderExports = await import('./render');

			expect(getExportKeys(renderExports)).toEqual(['default', 'toPlainText']);
			expect(renderExports.default).toBe(MockedRenderer);
			expect(renderExports.toPlainText).toBe(mockedToPlainText);
			expect('pixelBasedPreset' in renderExports).toBe(false);
		});

		it('re-exports all utility exports from utils/', async () => {
			const styleToString = vi.fn();
			const withMargin = vi.fn();
			const mockedUtilsPackage = { styleToString, withMargin };

			vi.doMock('@better-svelte-email/components/utils', () => mockedUtilsPackage);

			const utilsExports = await import('./utils');

			expect(getExportKeys(utilsExports)).toEqual(getExportKeys(mockedUtilsPackage));
			expect(utilsExports.styleToString).toBe(styleToString);
			expect(utilsExports.withMargin).toBe(withMargin);
		});
	});

	describe('root index exports', () => {
		it('exports components plus render aliases from src/index.ts', async () => {
			const body = Symbol('Body');
			const button = Symbol('Button');
			class MockedRenderer {}
			const mockedToPlainText = vi.fn();

			vi.doMock('./preview', () => ({}));
			vi.doMock('./utils', () => ({}));
			vi.doMock('./components', () => ({
				Body: body,
				Button: button
			}));
			vi.doMock('./render', () => ({
				default: MockedRenderer,
				toPlainText: mockedToPlainText
			}));

			const rootExports = await import('./index');
			const componentsExports = await import('./components');
			const renderExports = await import('./render');

			const expectedRootKeys = [
				...getExportKeys(componentsExports),
				'Renderer',
				'toPlainText'
			].sort();
			expect(getExportKeys(rootExports)).toEqual(expectedRootKeys);
			expect(rootExports.Renderer).toBe(renderExports.default);
			expect(rootExports.toPlainText).toBe(renderExports.toPlainText);
		});
	});
});
