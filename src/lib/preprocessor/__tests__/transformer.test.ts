import { describe, it, expect } from 'vitest';
import {
	createTailwindConverter,
	transformTailwindClasses,
	generateMediaQueries,
	sanitizeClassName
} from '../transformer.js';

describe('transformTailwindClasses', () => {
	const converter = createTailwindConverter();

	it('should convert simple Tailwind classes to inline styles', () => {
		const result = transformTailwindClasses('bg-blue-500 p-4', converter);

		expect(result.inlineStyles).toContain('background-color');
		expect(result.inlineStyles).toContain('padding');
		expect(result.responsiveClasses).toHaveLength(0);
	});

	it('should separate responsive classes', () => {
		const result = transformTailwindClasses('bg-blue-500 sm:bg-red-500', converter);

		expect(result.inlineStyles).toContain('background-color');
		expect(result.responsiveClasses).toHaveLength(1);
		expect(result.responsiveClasses[0]).toBe('sm:bg-red-500');
	});

	it('should handle multiple responsive breakpoints', () => {
		const result = transformTailwindClasses('p-4 sm:p-6 md:p-8 lg:p-10', converter);

		expect(result.responsiveClasses).toHaveLength(3);
		expect(result.responsiveClasses).toContain('sm:p-6');
		expect(result.responsiveClasses).toContain('md:p-8');
		expect(result.responsiveClasses).toContain('lg:p-10');
	});

	it('should handle text color classes', () => {
		const result = transformTailwindClasses('text-white', converter);

		expect(result.inlineStyles).toContain('color');
	});

	it('should handle border and border-radius', () => {
		const result = transformTailwindClasses('rounded border border-gray-300', converter);

		expect(result.inlineStyles).toBeTruthy();
	});

	it('should return empty strings for empty input', () => {
		const result = transformTailwindClasses('', converter);

		expect(result.inlineStyles).toBe('');
		expect(result.responsiveClasses).toHaveLength(0);
		expect(result.invalidClasses).toHaveLength(0);
	});

	it('should handle whitespace in class string', () => {
		const result = transformTailwindClasses('  bg-blue-500   p-4  ', converter);

		expect(result.inlineStyles).toContain('background-color');
		expect(result.inlineStyles).toContain('padding');
	});
});

describe('generateMediaQueries', () => {
	const converter = createTailwindConverter();

	it('should generate media queries for responsive classes', () => {
		const result = generateMediaQueries(['sm:bg-red-500'], converter);

		expect(result.length).toBeGreaterThan(0);
		expect(result[0].query).toContain('@media');
		expect(result[0].rules).toContain('background-color');
		expect(result[0].rules).toContain('!important');
	});

	it('should handle multiple breakpoints', () => {
		const result = generateMediaQueries(['sm:p-4', 'md:p-6'], converter);

		expect(result.length).toBeGreaterThan(0);
	});

	it('should return empty array for no responsive classes', () => {
		const result = generateMediaQueries([], converter);

		expect(result).toHaveLength(0);
	});

	it('should add !important to all rules', () => {
		const result = generateMediaQueries(['sm:text-red-500'], converter);

		expect(result.length).toBeGreaterThan(0);
		expect(result[0].rules).toContain('!important');
	});
});

describe('sanitizeClassName', () => {
	it('should replace colons with underscores', () => {
		const result = sanitizeClassName('sm:bg-red-500');
		expect(result).toBe('sm_bg_red_500');
	});

	it('should replace multiple special characters', () => {
		const result = sanitizeClassName('md:text-[#ff0000]');
		expect(result).not.toContain('[');
		expect(result).not.toContain(']');
		expect(result).not.toContain('#');
	});

	it('should handle hyphens', () => {
		const result = sanitizeClassName('bg-blue-500');
		expect(result).toBe('bg_blue_500');
	});

	it('should return same for already sanitized names', () => {
		const result = sanitizeClassName('simple_class');
		expect(result).toBe('simple_class');
	});
});
