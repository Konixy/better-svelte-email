import { access, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const cliDir = path.resolve(scriptDir, '..');
const sourceDir = path.resolve(cliDir, '../preview-server/build');
const targetDir = path.resolve(cliDir, 'dist/preview-server');

try {
	await access(path.join(sourceDir, 'index.js'));
} catch {
	throw new Error(
		`Preview server build not found at "${sourceDir}". Run "bun run --cwd ../preview-server build" first.`
	);
}

await rm(targetDir, { recursive: true, force: true });
await mkdir(path.dirname(targetDir), { recursive: true });
await cp(sourceDir, targetDir, { recursive: true });

console.log(`Copied preview runtime from "${sourceDir}" to "${targetDir}".`);
