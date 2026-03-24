import fs from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { format } from 'prettier';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createServer, normalizePath, type Plugin, type ViteDevServer } from 'vite';
import type { RendererOptions, TailwindConfig } from '@better-svelte-email/server';

const PREVIEW_SK_VIRTUAL = '\0preview-sk:';

/**
 * Vite `define` map expected by `@sveltejs/kit` runtime modules (see `kit` `exports/vite/index.js`).
 * Without these, imports like `$app/paths` pull in `paths/internal/server.js`, which reads
 * `__SVELTEKIT_PATHS_BASE__` etc. at module init.
 */
function svelteKitRuntimeDefine(): Record<string, string> {
	const s = JSON.stringify;
	return {
		__SVELTEKIT_ADAPTER_NAME__: s('preview'),
		__SVELTEKIT_APP_DIR__: s('_app'),
		__SVELTEKIT_APP_VERSION_FILE__: s('_app/version.json'),
		__SVELTEKIT_APP_VERSION_POLL_INTERVAL__: '0',
		__SVELTEKIT_CLIENT_ROUTING__: s(true),
		__SVELTEKIT_EMBEDDED__: s(false),
		__SVELTEKIT_EXPERIMENTAL__REMOTE_FUNCTIONS__: s(false),
		__SVELTEKIT_FORK_PRELOADS__: s(false),
		__SVELTEKIT_HASH_ROUTING__: s(false),
		__SVELTEKIT_HAS_SERVER_LOAD__: 'true',
		__SVELTEKIT_HAS_UNIVERSAL_LOAD__: 'true',
		__SVELTEKIT_PATHS_ASSETS__: s(''),
		__SVELTEKIT_PATHS_BASE__: s(''),
		__SVELTEKIT_PATHS_RELATIVE__: s(false),
		__SVELTEKIT_PAYLOAD__: 'globalThis.__sveltekit_dev',
		__SVELTEKIT_SERVER_TRACING_ENABLED__: s(false),
		// esbuild `define` only allows JSON literals or simple identifiers — not `(() => {})`.
		__SVELTEKIT_TRACK__: 'Boolean'
	};
}

/** Same layout as SvelteKit: `$app/*` → `node_modules/@sveltejs/kit/src/runtime/app/*`. */
export function tryResolveSvelteKitRuntimeApp(projectRoot: string): string | null {
	try {
		const requireFromProject = createRequire(path.join(projectRoot, 'package.json'));
		const kitPkgJson = requireFromProject.resolve('@sveltejs/kit/package.json');
		return path.join(path.dirname(kitPkgJson), 'src/runtime/app');
	} catch {
		return null;
	}
}

function staticEnvModuleFromProcessEnv(kind: 'public' | 'private'): string {
	const lines: string[] = [];
	for (const [key, value] of Object.entries(process.env)) {
		if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
			continue;
		}
		if (kind === 'public' && !key.startsWith('PUBLIC_')) {
			continue;
		}
		if (kind === 'private' && key.startsWith('PUBLIC_')) {
			continue;
		}
		lines.push(`export const ${key} = ${JSON.stringify(value ?? '')};`);
	}
	return lines.length > 0 ? lines.join('\n') : 'export {};';
}

function previewSvelteKitShimPlugin(projectRoot: string): Plugin {
	const kitRuntimeApp = tryResolveSvelteKitRuntimeApp(projectRoot);

	return {
		name: 'better-svelte-email-preview-sveltekit',
		enforce: 'pre',
		config() {
			const alias: { find: string; replacement: string }[] = [
				{ find: '$lib', replacement: path.join(projectRoot, 'src/lib') }
			];
			if (kitRuntimeApp) {
				alias.push({ find: '$app', replacement: kitRuntimeApp });
			}
			return {
				resolve: { alias },
				...(kitRuntimeApp
					? {
							ssr: {
								noExternal: ['@sveltejs/kit', '@sveltejs/kit/src/runtime']
							}
						}
					: {})
			};
		},
		resolveId(id) {
			// Newer Kit: `$app/paths` server entry imports `get_hooks` from generated `__SERVER__/internal.js`
			// (see SvelteKit `write_server.js`). Email preview has no `.svelte-kit` output — serve a stub.
			if (id === '__SERVER__/internal.js') {
				return `${PREVIEW_SK_VIRTUAL}server-internal`;
			}
			if (id === '__sveltekit/environment') {
				return `${PREVIEW_SK_VIRTUAL}environment`;
			}
			if (id === '__sveltekit/server') {
				return `${PREVIEW_SK_VIRTUAL}server`;
			}
			if (id === '$env/static/public') {
				return `${PREVIEW_SK_VIRTUAL}env-static-public`;
			}
			if (id === '$env/static/private') {
				return `${PREVIEW_SK_VIRTUAL}env-static-private`;
			}
			if (id === '$env/dynamic/public') {
				return `${PREVIEW_SK_VIRTUAL}env-dynamic-public`;
			}
			if (id === '$env/dynamic/private') {
				return `${PREVIEW_SK_VIRTUAL}env-dynamic-private`;
			}
		},
		load(id, options) {
			const browser = options?.ssr === false;

			switch (id) {
				case `${PREVIEW_SK_VIRTUAL}environment`:
					return [
						'export const version = "preview";',
						'export let building = false;',
						'export let prerendering = false;',
						'export function set_building() { building = true; }',
						'export function set_prerendering() { prerendering = true; }'
					].join('\n');
				case `${PREVIEW_SK_VIRTUAL}server`:
					return [
						'export let read_implementation = null;',
						// Kit ≥2.51 `$app/paths` `match()` reads `manifest._.matchers()` / `routes` (see kit `paths/server.js`).
						'export let manifest = { _: { matchers: async () => ({}), routes: [] } };',
						'export function set_read_implementation(fn) { read_implementation = fn; }',
						'export function set_manifest(m) { manifest = m; }'
					].join('\n');
				case `${PREVIEW_SK_VIRTUAL}server-internal`:
					return [
						'export async function get_hooks() {',
						'	return {',
						'		handle: undefined,',
						'		handleFetch: undefined,',
						'		handleError: undefined,',
						'		handleValidationError: undefined,',
						'		init: undefined,',
						'		reroute: undefined,',
						'		transport: undefined',
						'	};',
						'}',
						// Shape mirrors generated `internal.js` (`write_server.js`) so `runtime/server` can load if pulled in.
						'export const options = {',
						'	app_template_contains_nonce: false,',
						'	async: false,',
						'	csp: { mode: "auto", directives: {}, reportOnly: {} },',
						'	csrf_check_origin: false,',
						'	csrf_trusted_origins: [],',
						'	embedded: false,',
						'	env_public_prefix: "PUBLIC_",',
						'	env_private_prefix: "",',
						'	hash_routing: false,',
						'	hooks: null,',
						'	preload_strategy: "modulepreload",',
						'	root: null,',
						'	service_worker: false,',
						'	service_worker_options: null,',
						'	templates: { app: () => "", error: () => "" },',
						'	version_hash: ""',
						'};'
					].join('\n');
				case `${PREVIEW_SK_VIRTUAL}env-static-public`:
					return staticEnvModuleFromProcessEnv('public');
				case `${PREVIEW_SK_VIRTUAL}env-static-private`:
					return staticEnvModuleFromProcessEnv('private');
				case `${PREVIEW_SK_VIRTUAL}env-dynamic-private`:
					return `export const env = /** @type {Record<string, string>} */ ({ ...process.env });`;
				case `${PREVIEW_SK_VIRTUAL}env-dynamic-public`:
					if (browser) {
						return `export const env = /** @type {Record<string, string>} */ (typeof globalThis !== 'undefined' && globalThis.__BSE_PREVIEW_PUBLIC_ENV__ ? globalThis.__BSE_PREVIEW_PUBLIC_ENV__ : {});`;
					}
					return `export const env = /** @type {Record<string, string>} */ (Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith('PUBLIC_'))));`;
				default:
					return;
			}
		}
	};
}

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
	pixelBasedPreset: TailwindConfig;
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
			const globalKit = globalThis as typeof globalThis & { __sveltekit_dev?: object };
			globalKit.__sveltekit_dev ??= {};

			viteServerPromise = createServer({
				appType: 'custom',
				clearScreen: false,
				configFile: false,
				root: projectRoot,
				define: svelteKitRuntimeDefine(),
				plugins: [
					previewSvelteKitShimPlugin(projectRoot),
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
				const m = module as RendererModule;
				// Match typical `Renderer({ tailwindConfig, customCSS })` usage (e.g. docs preview):
				// default config must include `pixelBasedPreset` so `@apply` and utilities resolve like
				// the standalone server path, not an empty Tailwind config.
				const rendererOptions: RendererOptions = {
					tailwindConfig: { presets: [m.pixelBasedPreset] },
					...(customCSS ? { customCSS } : {})
				};
				return new m.Renderer(rendererOptions);
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
			const stack = error instanceof Error ? error.stack : undefined;
			sendJson(res, statusCode, { error: { message, stack: stack ?? new Error().stack } });
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
