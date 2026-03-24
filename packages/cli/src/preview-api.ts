import fs from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { format } from 'prettier';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createServer, normalizePath, type ViteDevServer } from 'vite';
import type { RendererOptions } from '@better-svelte-email/server';

type PreviewApiOptions = {
	emailsDir: string;
	customCssPath?: string;
};

type RenderBody = {
	file?: string;
	props?: Record<string, unknown>;
	includeSource?: boolean;
};

const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';
const MAX_BODY_SIZE = 1024 * 1024;

type RendererInstance = {
	render: (component: unknown, options?: { props?: Record<string, unknown> }) => Promise<string>;
};

type RendererModule = {
	Renderer: new (options?: RendererOptions) => RendererInstance;
};

export type PreviewApiBundle = {
	handlePreviewApi: (
		requestUrl: URL,
		req: IncomingMessage,
		res: ServerResponse
	) => Promise<boolean>;
	/** Close Vite, drop renderer, reload custom CSS promise (call after email/CSS file changes). */
	invalidateCaches: () => Promise<void>;
	getEmailsRoot: () => string;
	/** Absolute paths to pass to the file watcher (CSS files that affect render). */
	getCssWatchPaths: () => string[];
};

function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
	res.writeHead(statusCode, { 'Content-Type': JSON_CONTENT_TYPE });
	res.end(JSON.stringify(body));
}

function createError(message: string, statusCode = 500) {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
}

function sanitizeFileInput(file: unknown) {
	if (typeof file !== 'string') {
		return null;
	}

	const cleaned = file
		.replace(/\\/g, '/')
		.replace(/^\/+/, '')
		.replace(/\.svelte$/, '')
		.trim();
	if (!cleaned) {
		return null;
	}

	const segments = cleaned.split('/');
	if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
		return null;
	}

	return cleaned;
}

export function resolveEmailsRoot(emailsDir: string) {
	if (path.isAbsolute(emailsDir)) {
		return path.normalize(emailsDir);
	}

	return path.resolve(process.cwd(), emailsDir);
}

function resolveCustomCssPath(customCssPath?: string) {
	if (!customCssPath) {
		return null;
	}

	if (path.isAbsolute(customCssPath)) {
		return path.normalize(customCssPath);
	}

	return path.resolve(process.cwd(), customCssPath);
}

async function loadCustomCss(customCssPath?: string) {
	const resolvedCustomCssPath = resolveCustomCssPath(customCssPath);
	if (resolvedCustomCssPath) {
		try {
			return await fs.readFile(resolvedCustomCssPath, 'utf8');
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			throw createError(
				`Failed to read custom CSS file "${resolvedCustomCssPath}": ${message}`,
				500
			);
		}
	}

	const defaultCssCandidates = [
		path.resolve(process.cwd(), 'src/app.css'),
		path.resolve(process.cwd(), 'src/routes/layout.css')
	];
	const cssChunks: string[] = [];

	for (const cssPath of defaultCssCandidates) {
		try {
			cssChunks.push(await fs.readFile(cssPath, 'utf8'));
		} catch (error) {
			if (isMissingFileError(error)) {
				continue;
			}

			const message = error instanceof Error ? error.message : String(error);
			throw createError(`Failed to read default CSS file "${cssPath}": ${message}`, 500);
		}
	}

	if (!cssChunks.length) {
		return undefined;
	}

	return cssChunks.join('\n\n');
}

function resolveEmailFile(emailsRoot: string, file: string) {
	const absolutePath = path.resolve(emailsRoot, `${file}.svelte`);
	const relativePath = path.relative(emailsRoot, absolutePath);

	if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
		throw createError('Invalid file path.', 400);
	}

	return absolutePath;
}

async function listEmailsRecursively(rootDir: string, currentDir = rootDir): Promise<string[]> {
	const entries = await fs.readdir(currentDir, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const absolutePath = path.join(currentDir, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await listEmailsRecursively(rootDir, absolutePath)));
			continue;
		}

		if (!entry.isFile() || !entry.name.endsWith('.svelte')) {
			continue;
		}

		const relativeFile = path.relative(rootDir, absolutePath).replace(/\\/g, '/');
		files.push(relativeFile.slice(0, -'.svelte'.length));
	}

	return files;
}

async function readJsonBody(req: IncomingMessage): Promise<RenderBody> {
	let rawBody = '';

	for await (const chunk of req) {
		rawBody += chunk;
		if (rawBody.length > MAX_BODY_SIZE) {
			throw createError('Request body is too large.', 413);
		}
	}

	if (!rawBody) {
		return {};
	}

	try {
		const parsed = JSON.parse(rawBody);
		if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
			throw new Error('Invalid JSON object.');
		}

		return parsed as RenderBody;
	} catch {
		throw createError('Request body must be valid JSON.', 400);
	}
}

function isMissingFileError(error: unknown) {
	if (!(error instanceof Error)) {
		return false;
	}

	return 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT';
}

export function createPreviewApiHandler(options: PreviewApiOptions): PreviewApiBundle {
	const projectRoot = process.cwd();
	const emailsRoot = resolveEmailsRoot(options.emailsDir);

	function getCssWatchPaths(): string[] {
		const resolved = resolveCustomCssPath(options.customCssPath);
		if (resolved) {
			return [resolved];
		}
		return [
			path.resolve(process.cwd(), 'src/app.css'),
			path.resolve(process.cwd(), 'src/routes/layout.css')
		];
	}

	let viteServerPromise: Promise<ViteDevServer> | null = null;
	let rendererPromise: Promise<RendererInstance> | null = null;
	let customCssPromise: Promise<string | undefined> = loadCustomCss(options.customCssPath);

	async function invalidateCaches() {
		rendererPromise = null;
		const pending = viteServerPromise;
		viteServerPromise = null;
		if (pending) {
			try {
				const server = await pending;
				await server.close();
			} catch {
				// Ignore shutdown errors (e.g. server failed to start).
			}
		}
		customCssPromise = loadCustomCss(options.customCssPath);
	}

	async function getViteServer() {
		if (!viteServerPromise) {
			viteServerPromise = createServer({
				appType: 'custom',
				clearScreen: false,
				configFile: false,
				root: projectRoot,
				plugins: [
					svelte({
						configFile: false
					})
				],
				server: {
					middlewareMode: true
				}
			});
		}

		return viteServerPromise;
	}

	async function getRenderer(viteServer: ViteDevServer, customCSS?: string) {
		if (!rendererPromise) {
			rendererPromise = viteServer.ssrLoadModule('@better-svelte-email/server').then((module) => {
				const rendererOptions = customCSS ? { customCSS } : undefined;
				return new (module as RendererModule).Renderer(rendererOptions);
			});
		}

		return rendererPromise;
	}

	async function renderEmailComponent(
		emailFilePath: string,
		props: Record<string, unknown>,
		customCSS?: string
	) {
		const viteServer = await getViteServer();
		const viteModulePath = `/@fs/${normalizePath(emailFilePath)}`;
		const module = await viteServer.ssrLoadModule(viteModulePath);
		const component = module.default;

		if (!component) {
			throw createError('Email module does not have a default Svelte export.', 500);
		}

		const renderer = await getRenderer(viteServer, customCSS);
		const renderStart = performance.now();
		const html = await renderer.render(component, { props });
		const renderTimeMs = performance.now() - renderStart;
		return { html, renderTimeMs };
	}

	async function handlePreviewApi(requestUrl: URL, req: IncomingMessage, res: ServerResponse) {
		if (!requestUrl.pathname.startsWith('/api/')) {
			return false;
		}

		try {
			if (requestUrl.pathname === '/api/emails' && req.method === 'GET') {
				let files: string[] = [];
				try {
					files = await listEmailsRecursively(emailsRoot);
				} catch (error) {
					if (!isMissingFileError(error)) {
						throw error;
					}
				}

				sendJson(res, 200, { files: files.sort(), path: options.emailsDir });
				return true;
			}

			if (requestUrl.pathname === '/api/source' && req.method === 'GET') {
				const file = sanitizeFileInput(requestUrl.searchParams.get('file'));
				if (!file) {
					throw createError('Missing or invalid "file" query parameter.', 400);
				}

				const filePath = resolveEmailFile(emailsRoot, file);
				try {
					const source = await fs.readFile(filePath, 'utf8');
					sendJson(res, 200, { file, source });
				} catch (error) {
					if (isMissingFileError(error)) {
						throw createError('Email source file not found.', 404);
					}

					throw error;
				}

				return true;
			}

			if (requestUrl.pathname === '/api/render' && req.method === 'POST') {
				const body = await readJsonBody(req);
				const file = sanitizeFileInput(body.file);
				if (!file) {
					throw createError('Missing or invalid "file" value.', 400);
				}

				const includeSource = body.includeSource === true;
				const filePath = resolveEmailFile(emailsRoot, file);
				const props =
					body.props && typeof body.props === 'object' && !Array.isArray(body.props)
						? body.props
						: {};

				try {
					await fs.access(filePath);
				} catch (error) {
					if (isMissingFileError(error)) {
						throw createError('Email component not found.', 404);
					}

					throw error;
				}

				const customCSS = await customCssPromise;
				const { html: renderedHtml, renderTimeMs } = await renderEmailComponent(
					filePath,
					props,
					customCSS
				);
				let html = renderedHtml;

				try {
					html = await format(html, { parser: 'html', printWidth: 100 });
				} catch {
					// Keep unformatted HTML if Prettier fails
				}

				const payload: { html: string; renderTimeMs: number; source?: string | null } = {
					html,
					renderTimeMs
				};

				if (includeSource) {
					try {
						payload.source = await fs.readFile(filePath, 'utf8');
					} catch (error) {
						if (isMissingFileError(error)) {
							payload.source = null;
						} else {
							throw error;
						}
					}
				}

				sendJson(res, 200, payload);
				return true;
			}

			sendJson(res, 404, { error: { message: 'API route not found.' } });
			return true;
		} catch (error) {
			const statusCode =
				error instanceof Error && 'statusCode' in error && typeof error.statusCode === 'number'
					? error.statusCode
					: 500;
			const message = error instanceof Error ? error.message : 'Unexpected API error.';
			sendJson(res, statusCode, { error: { message } });
			return true;
		}
	}

	return {
		handlePreviewApi,
		invalidateCaches,
		getEmailsRoot: () => emailsRoot,
		getCssWatchPaths
	};
}
