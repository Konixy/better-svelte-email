import type { Rule, Declaration } from 'postcss';
import valueParser from 'postcss-value-parser';
import type { CustomProperties } from './get-custom-properties.js';

export function makeInlineStylesFor(
	inlinableRules: Rule[],
	customProperties: CustomProperties
): string {
	let styles = '';

	// Collect local variable declarations
	const localVariableDeclarations = new Map<string, Declaration>();
	for (const rule of inlinableRules) {
		rule.walkDecls((decl) => {
			if (decl.prop.startsWith('--')) {
				localVariableDeclarations.set(decl.prop, decl);
			}
		});
	}

	// Process rules and resolve variables
	for (const rule of inlinableRules) {
		rule.walkDecls((decl) => {
			// Skip variable declarations
			if (decl.prop.startsWith('--')) return;

			let value = decl.value;

			// Resolve var() references
			if (value.includes('var(')) {
				const parsed = valueParser(value);

				parsed.walk((node) => {
					if (node.type === 'function' && node.value === 'var') {
						const varNameNode = node.nodes[0];
						const variableName = varNameNode ? valueParser.stringify(varNameNode).trim() : '';

						if (variableName) {
							// Check local declarations first
							const localDef = localVariableDeclarations.get(variableName);
							if (localDef) {
								node.type = 'word';
								node.value = localDef.value;
								node.nodes = [];
							} else {
								// Check custom properties (from @property rules)
								const customProp = customProperties.get(variableName);
								if (customProp?.initialValue) {
									node.type = 'word';
									node.value = customProp.initialValue.value;
									node.nodes = [];
								}
							}
						}
					}
				});

				value = valueParser.stringify(parsed.nodes);
			}

			const important = decl.important ? '!important' : '';
			styles += `${decl.prop}: ${value} ${important};`;
		});
	}

	return styles;
}
