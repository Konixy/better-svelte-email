import type { Root, Declaration } from 'postcss';

export interface CustomProperty {
	syntax?: Declaration;
	inherits?: Declaration;
	initialValue?: Declaration;
}

export type CustomProperties = Map<string, CustomProperty>;

export function getCustomProperties(root: Root): CustomProperties {
	const customProperties = new Map<string, CustomProperty>();

	root.walkAtRules('property', (atRule) => {
		const propertyName = atRule.params.trim();

		if (propertyName.startsWith('--')) {
			const prop: CustomProperty = {};

			atRule.walkDecls((decl) => {
				if (decl.prop === 'syntax') {
					prop.syntax = decl;
				}
				if (decl.prop === 'inherits') {
					prop.inherits = decl;
				}
				if (decl.prop === 'initial-value') {
					prop.initialValue = decl;
				}
			});

			customProperties.set(propertyName, prop);
		}
	});

	return customProperties;
}
