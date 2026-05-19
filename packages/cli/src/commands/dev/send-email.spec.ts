import { describe, expect, it } from 'vitest';
import { defaultPreviewSubject, isValidEmailAddress } from './send-email';

describe('send-email helpers', () => {
	it('validates email addresses', () => {
		expect(isValidEmailAddress('user@example.com')).toBe(true);
		expect(isValidEmailAddress('bad')).toBe(false);
		expect(isValidEmailAddress('a@b')).toBe(false);
	});

	it('builds default preview subjects from file paths', () => {
		expect(defaultPreviewSubject('welcome')).toBe('[Preview] welcome');
		expect(defaultPreviewSubject('nested/Foo')).toBe('[Preview] Foo');
	});
});
