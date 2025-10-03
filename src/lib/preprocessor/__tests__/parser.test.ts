import { describe, it, expect } from 'vitest';
import { parseClassAttributes, findHeadComponent } from '../parser.js';

describe('parseClassAttributes', () => {
	it('should extract static class attributes', () => {
		const source = `<Button class="text-red-500">Click</Button>`;
		const result = parseClassAttributes(source);

		expect(result).toHaveLength(1);
		expect(result[0].raw).toBe('text-red-500');
		expect(result[0].isStatic).toBe(true);
		expect(result[0].elementName).toBe('Button');
	});

	it('should handle multiple classes', () => {
		const source = `<Button class="text-red-500 bg-blue-500 p-4">Click</Button>`;
		const result = parseClassAttributes(source);

		expect(result).toHaveLength(1);
		expect(result[0].raw).toBe('text-red-500 bg-blue-500 p-4');
	});

	it('should find multiple elements', () => {
		const source = `
			<Button class="btn-class">Click</Button>
			<Text class="text-class">Hello</Text>
		`;
		const result = parseClassAttributes(source);

		expect(result).toHaveLength(2);
		expect(result[0].elementName).toBe('Button');
		expect(result[1].elementName).toBe('Text');
	});

	it('should handle dynamic classes', () => {
		const source = `<Button class={dynamicClass}>Click</Button>`;
		const result = parseClassAttributes(source);

		expect(result).toHaveLength(1);
		expect(result[0].isStatic).toBe(false);
	});

	it('should handle mixed static and dynamic classes', () => {
		const source = `<Button class="static-class {dynamicClass}">Click</Button>`;
		const result = parseClassAttributes(source);

		expect(result).toHaveLength(1);
		expect(result[0].isStatic).toBe(false);
		expect(result[0].raw).toContain('static-class');
	});

	it('should handle nested components', () => {
		const source = `
			<Container class="container-class">
				<Button class="button-class">Click</Button>
			</Container>
		`;
		const result = parseClassAttributes(source);

		expect(result).toHaveLength(2);
		expect(result[0].elementName).toBe('Container');
		expect(result[1].elementName).toBe('Button');
	});

	it('should handle HTML elements', () => {
		const source = `<div class="bg-blue-500">Content</div>`;
		const result = parseClassAttributes(source);

		expect(result).toHaveLength(1);
		expect(result[0].elementName).toBe('div');
	});

	it('should handle conditional blocks', () => {
		const source = `
			{#if condition}
				<Button class="conditional-class">Click</Button>
			{/if}
		`;
		const result = parseClassAttributes(source);

		expect(result).toHaveLength(1);
		expect(result[0].raw).toBe('conditional-class');
	});

	it('should handle each blocks', () => {
		const source = `
			{#each items as item}
				<Button class="item-class">{item}</Button>
			{/each}
		`;
		const result = parseClassAttributes(source);

		expect(result).toHaveLength(1);
		expect(result[0].raw).toBe('item-class');
	});

	it('should return empty array for no classes', () => {
		const source = `<Button>No classes</Button>`;
		const result = parseClassAttributes(source);

		expect(result).toHaveLength(0);
	});
});

describe('findHeadComponent', () => {
	it('should find self-closing Head component', () => {
		const source = `<Html><Head /></Html>`;
		const result = findHeadComponent(source);

		expect(result.found).toBe(true);
		expect(result.insertPosition).not.toBeNull();
	});

	it('should find Head component with closing tag', () => {
		const source = `<Html><Head></Head></Html>`;
		const result = findHeadComponent(source);

		expect(result.found).toBe(true);
		expect(result.insertPosition).not.toBeNull();
	});

	it('should find Head component with children', () => {
		const source = `<Html><Head><title>Test</title></Head></Html>`;
		const result = findHeadComponent(source);

		expect(result.found).toBe(true);
		expect(result.insertPosition).not.toBeNull();
	});

	it('should return not found when no Head component', () => {
		const source = `<Html><Body>Content</Body></Html>`;
		const result = findHeadComponent(source);

		expect(result.found).toBe(false);
		expect(result.insertPosition).toBeNull();
	});

	it('should handle nested Head component', () => {
		const source = `
			<Html>
				<Container>
					<Head />
				</Container>
			</Html>
		`;
		const result = findHeadComponent(source);

		expect(result.found).toBe(true);
	});
});
