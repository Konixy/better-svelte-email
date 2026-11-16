import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

type PackageJson = {
	exports?: {
		'.'?: {
			style?: unknown;
		};
	};
};

/**
 * Resolve a package's `style` export from `fromFile`, including when the install
 * is hoisted above that file. `require.resolve` on the package itself fails because
 * the export map has no `default` or `require` condition.
 */
export function resolveStyleExport(specifier: string, fromFile: string): string {
	const packageJsonPath = findPackageJson(specifier, fromFile);
	const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson;
	const style = pkg.exports?.['.']?.style;
	if (typeof style !== 'string') {
		throw new Error(`Package "${specifier}" has no style export.`);
	}

	return path.resolve(path.dirname(packageJsonPath), style);
}

function findPackageJson(specifier: string, fromFile: string): string {
	const require = createRequire(fromFile);
	try {
		return require.resolve(`${specifier}/package.json`);
	} catch (error) {
		const nodeModule = require('node:module') as {
			findPackageJSON?: (id: string, parent?: string) => string | undefined;
		};
		const found = nodeModule.findPackageJSON?.(specifier, pathToFileURL(fromFile).href);
		if (!found) {
			throw error;
		}

		return found.startsWith('file:') ? fileURLToPath(found) : found;
	}
}
