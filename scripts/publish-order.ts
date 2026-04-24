import { readdir } from 'node:fs/promises';
import path from 'node:path';

type WorkspacePackage = {
	dir: string;
	name: string;
	deps: string[];
};

const entries = await readdir('packages', { withFileTypes: true });
const packages: WorkspacePackage[] = [];

for (const entry of entries) {
	if (!entry.isDirectory()) continue;

	const dir = path.join('packages', entry.name);
	const manifest = await Bun.file(path.join(dir, 'package.json')).json();
	if (manifest.private === true) continue;

	packages.push({
		dir,
		name: manifest.name,
		deps: Object.keys({
			...(manifest.dependencies ?? {}),
			...(manifest.optionalDependencies ?? {})
		})
	});
}

const byName = new Map(packages.map((pkg) => [pkg.name, pkg] as const));

for (const pkg of packages) {
	pkg.deps = pkg.deps.filter((dep) => byName.has(dep)).sort();
}

const visiting = new Set<string>();
const visited = new Set<string>();
const ordered: string[] = [];

function visit(name: string) {
	if (visited.has(name)) return;
	if (visiting.has(name)) {
		throw new Error(`Circular publish dependency involving ${name}`);
	}

	visiting.add(name);
	const pkg = byName.get(name);
	if (!pkg) {
		throw new Error(`Unknown package ${name}`);
	}

	for (const dep of pkg.deps) {
		visit(dep);
	}

	visiting.delete(name);
	visited.add(name);
	ordered.push(pkg.dir);
}

for (const name of [...byName.keys()].sort()) {
	visit(name);
}

process.stdout.write(ordered.join('\n'));
