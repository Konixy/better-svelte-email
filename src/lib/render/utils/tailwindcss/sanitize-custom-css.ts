import postcss from 'postcss';

export function sanitizeCustomCss(css: string) {
	const root = postcss.parse(css);

	root.walkAtRules('import', (atRule) => {
		if (atRule.name === 'import') {
			atRule.remove();
		}
	});

	return root.toString();
}
