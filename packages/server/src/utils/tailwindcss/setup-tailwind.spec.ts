import { setupTailwind } from './setup-tailwind.js';
import { expect, test } from 'vitest';

test('setupTailwind() and addUtilities()', async () => {
	const { addUtilities, getStyleSheet } = await setupTailwind({});

	addUtilities(['text-red-500', 'sm:bg-blue-300', 'bg-slate-900']);

	expect(getStyleSheet().toString()).toMatchSnapshot();

	addUtilities(['bg-red-100']);

	expect(getStyleSheet().toString()).toMatchSnapshot();
});
