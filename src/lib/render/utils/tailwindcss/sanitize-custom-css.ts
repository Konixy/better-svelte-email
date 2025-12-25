import postcss from 'postcss';

export function sanitizeCustomCss(css: string) {
	const root = postcss.parse(css);

	root.walkAtRules((atRule) => {
		if (atRule.name === 'import' || atRule.name === 'plugin') {
			atRule.remove();
		}
	});

	return root.toString();
}
