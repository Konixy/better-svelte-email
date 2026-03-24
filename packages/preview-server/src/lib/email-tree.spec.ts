import { describe, expect, it } from 'vitest';
import { buildEmailTree, filterEmailTree } from './email-tree.js';

describe('buildEmailTree()', () => {
	it('returns an empty array for null, undefined, or empty input', () => {
		expect(buildEmailTree(null)).toEqual([]);
		expect(buildEmailTree(undefined)).toEqual([]);
		expect(buildEmailTree([])).toEqual([]);
	});

	it('builds a nested tree and sorts directories before files', () => {
		const tree = buildEmailTree(['a/File.svelte', 'b/File.svelte', 'Root.svelte']);
		expect(tree.map((n) => n.name)).toEqual(['a', 'b', 'Root.svelte']);
		const dirA = tree.find((n) => n.type === 'directory' && n.name === 'a');
		expect(dirA?.type).toBe('directory');
		if (dirA?.type === 'directory') {
			expect(dirA.items).toHaveLength(1);
			expect(dirA.items[0]).toMatchObject({
				type: 'file',
				name: 'File.svelte',
				path: 'a/File.svelte'
			});
		}
	});

	it('normalizes leading dots and slashes', () => {
		const tree = buildEmailTree(['./foo//Bar.svelte']);
		expect(tree).toHaveLength(1);
		expect(tree[0]).toMatchObject({
			type: 'directory',
			name: 'foo',
			path: 'foo'
		});
		if (tree[0].type === 'directory') {
			expect(tree[0].items[0]).toMatchObject({
				type: 'file',
				name: 'Bar.svelte',
				path: 'foo/Bar.svelte'
			});
		}
	});

	it('skips empty string paths', () => {
		expect(buildEmailTree([''])).toEqual([]);
	});
});

describe('filterEmailTree()', () => {
	const sample = buildEmailTree(['news/Weekly.svelte', 'Welcome.svelte']);

	it('returns a shallow copy when query is empty', () => {
		const filtered = filterEmailTree(sample, '');
		expect(filtered).toEqual(sample);
		expect(filtered).not.toBe(sample);
	});

	it('matches file paths case-insensitively', () => {
		const filtered = filterEmailTree(sample, 'WEEKLY');
		expect(filtered).toHaveLength(1);
		expect(filtered[0].type).toBe('directory');
		if (filtered[0].type === 'directory') {
			expect(filtered[0].items).toHaveLength(1);
			expect(filtered[0].items[0]).toMatchObject({ path: 'news/Weekly.svelte' });
		}
	});

	it('keeps parent directory when a child matches', () => {
		const filtered = filterEmailTree(sample, 'Weekly');
		expect(filtered.some((n) => n.type === 'directory' && n.name === 'news')).toBe(true);
	});

	it('returns empty array when nothing matches', () => {
		expect(filterEmailTree(sample, 'xyz-none')).toEqual([]);
	});
});
