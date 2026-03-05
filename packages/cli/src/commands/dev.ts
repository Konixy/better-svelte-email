import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPreviewApiHandler } from '../preview-api.js';

const CONTENT_TYPES: Record<string, string> = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.ico': 'image/x-icon',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.txt': 'text/plain; charset=utf-8',
	'.wasm': 'application/wasm'
};

type DevOptions = {
	port: number | string;
	dir: string;
	customCssPath?: string;
};

async function resolvePreviewDir() {
	const currentDir = path.dirname(fileURLToPath(import.meta.url));
	const candidates = [
		path.resolve(currentDir, 'preview'),
		path.resolve(currentDir, '../preview'),
		path.resolve(currentDir, '../../dist/preview'),
		path.resolve(currentDir, '../../../preview-server/dist')
	];

	for (const candidate of candidates) {
		try {
			const stats = await fs.stat(path.join(candidate, 'index.html'));
			if (stats.isFile()) {
				return candidate;
			}
		} catch {
			// Continue searching candidates.
		}
	}

	throw new Error(
		'Could not find bundled preview assets. Run `bun run build` in packages/cli to bundle the preview UI.'
	);
}

function getContentType(filePath: string) {
	const extension = path.extname(filePath);
	return CONTENT_TYPES[extension] ?? 'application/octet-stream';
}

export async function dev(options: DevOptions) {
	const port = Number(options.port);
	const previewDir = await resolvePreviewDir();
	const handlePreviewApi = createPreviewApiHandler({
		emailsDir: options.dir,
		customCssPath: options.customCssPath
	});

	const server = http.createServer(async (req, res) => {
		try {
			const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
			if (await handlePreviewApi(requestUrl, req, res)) {
				return;
			}

			const requestedPath = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
			const decodedPath = decodeURIComponent(requestedPath);
			const filePath = path.resolve(previewDir, `.${decodedPath}`);
			const relativePath = path.relative(previewDir, filePath);

			if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
				res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
				res.end('Forbidden');
				return;
			}

			try {
				const file = await fs.readFile(filePath);
				res.writeHead(200, { 'Content-Type': getContentType(filePath) });
				res.end(file);
				return;
			} catch {
				if (path.extname(decodedPath)) {
					res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
					res.end('Not found');
					return;
				}

				const fallbackPath = path.join(previewDir, 'index.html');
				const fallback = await fs.readFile(fallbackPath);
				res.writeHead(200, { 'Content-Type': getContentType(fallbackPath) });
				res.end(fallback);
			}
		} catch (error) {
			res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
			res.end(
				error instanceof Error ? error.message : 'Unexpected error while serving preview assets.'
			);
		}
	});

	server.listen(port, () => {
		console.log(`Preview server running on http://localhost:${port}`);
	});
}
