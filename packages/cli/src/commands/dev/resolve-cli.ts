import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

/** Resolve paths via `package.json` exports (works for published installs and the dual CJS/ESM build). */
const resolveFromCli = createRequire(import.meta.url);

export function resolveCliPackageRoot(): string {
	return path.dirname(resolveFromCli.resolve('@better-svelte-email/cli/package.json'));
}

export async function resolvePreviewServerEntry() {
	let entry: string;
	try {
		entry = resolveFromCli.resolve('@better-svelte-email/cli/preview-entry');
	} catch {
		throw new Error(
			'Could not resolve the preview server entry. Did you build @better-svelte-email/cli? Run `bun run build:preview` in packages/cli first.'
		);
	}

	try {
		const stats = await fs.stat(entry);
		if (!stats.isFile()) {
			throw new Error('Not a file');
		}
	} catch {
		throw new Error(
			'Could not find the built SvelteKit preview server. Run `bun run build:preview` in packages/cli first.'
		);
	}

	return entry;
}

export async function resolvePreviewServerWorkspaceDir() {
	const previewServerDir = path.resolve(resolveCliPackageRoot(), '../preview-server');
	try {
		const stats = await fs.stat(path.join(previewServerDir, 'package.json'));
		if (stats.isFile()) {
			return previewServerDir;
		}
	} catch {
		// Fall through to error below.
	}

	throw new Error(
		'Could not find packages/preview-server next to @better-svelte-email/cli. `--preview-dev` is only for monorepo development.'
	);
}
