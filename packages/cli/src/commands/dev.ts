import fs from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import chokidar, { type FSWatcher } from 'chokidar';
import { createPreviewApiHandler } from '../preview-api.js';

type DevOptions = {
	port: number | string;
	dir: string;
	customCssPath?: string;
	previewDev?: boolean;
	previewPort?: number | string;
	/** False when `--no-hmr` is passed; default true. */
	hmr?: boolean;
};

function sleep(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
}

function debounceAsync(fn: () => Promise<void>, ms: number) {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	return () => {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			timeout = null;
			void fn();
		}, ms);
	};
}

function allowPreviewCors(req: http.IncomingMessage, res: http.ServerResponse) {
	const origin = req.headers.origin;
	if (origin && /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/i.test(origin.trim())) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Vary', 'Origin');
	}
}

async function resolvePreviewServerEntry() {
	const currentDir = path.dirname(fileURLToPath(import.meta.url));
	const candidates = [
		path.resolve(currentDir, './preview-server/index.js'),
		path.resolve(currentDir, '../preview-server/index.js'),
		path.resolve(currentDir, '../../preview-server/index.js'),
		path.resolve(currentDir, '../../dist/preview-server/index.js'),
		path.resolve(currentDir, '../../../preview-server/build/index.js')
	];

	for (const candidate of candidates) {
		try {
			const stats = await fs.stat(candidate);
			if (stats.isFile()) {
				return candidate;
			}
		} catch {
			// Continue searching candidates.
		}
	}

	throw new Error(
		'Could not find the built SvelteKit preview server. Run `bun run build:preview` in packages/cli first.'
	);
}

async function resolvePreviewServerWorkspaceDir() {
	const currentDir = path.dirname(fileURLToPath(import.meta.url));
	const candidates = [
		path.resolve(currentDir, '../../../preview-server'),
		path.resolve(currentDir, '../../preview-server')
	];

	for (const candidate of candidates) {
		try {
			const stats = await fs.stat(path.join(candidate, 'package.json'));
			if (stats.isFile()) {
				return candidate;
			}
		} catch {
			// Continue searching candidates.
		}
	}

	throw new Error(
		'Could not find the local preview-server package. Run this mode from the monorepo workspace.'
	);
}

async function isPortAvailable(port: number) {
	return await new Promise<boolean>((resolve) => {
		const server = net.createServer();
		server.unref();
		server.once('error', () => resolve(false));
		server.listen(port, '127.0.0.1', () => {
			server.close((error) => {
				if (error) {
					resolve(false);
					return;
				}

				resolve(true);
			});
		});
	});
}

async function getAvailablePort(preferredPort?: number) {
	if (preferredPort && (await isPortAvailable(preferredPort))) {
		return preferredPort;
	}

	return await new Promise<number>((resolve, reject) => {
		const server = net.createServer();
		server.unref();
		server.on('error', reject);
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			if (!address || typeof address === 'string') {
				server.close();
				reject(new Error('Failed to determine an available preview port.'));
				return;
			}

			server.close((error) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(address.port);
			});
		});
	});
}

function parsePort(value: number | string, label: string) {
	const port = Number(value);
	if (!Number.isInteger(port) || port <= 0) {
		throw new Error(`Invalid ${label}: ${String(value)}`);
	}

	return port;
}

async function waitForChildServer(port: number, childProcess: ChildProcess, timeoutMs = 10_000) {
	const deadline = Date.now() + timeoutMs;

	while (Date.now() < deadline) {
		if (childProcess.exitCode !== null) {
			throw new Error(`Preview app exited early with code ${childProcess.exitCode}.`);
		}

		const reachable = await new Promise<boolean>((resolve) => {
			const request = http.request(
				{
					host: '127.0.0.1',
					port,
					path: '/',
					method: 'GET'
				},
				(response) => {
					response.resume();
					resolve(true);
				}
			);

			request.on('error', () => resolve(false));
			request.end();
		});

		if (reachable) {
			return;
		}

		await sleep(100);
	}

	throw new Error('Timed out while waiting for the SvelteKit preview server to start.');
}

async function stopChildProcess(childProcess: ChildProcess) {
	if (childProcess.exitCode !== null) {
		return;
	}

	childProcess.kill('SIGTERM');
	await Promise.race([
		new Promise<void>((resolve) => {
			childProcess.once('exit', () => resolve());
		}),
		sleep(5_000).then(() => {
			if (childProcess.exitCode === null) {
				childProcess.kill('SIGKILL');
			}
		})
	]);
}

async function startBuiltPreviewServer(previewApiOrigin: string, previewHmr: boolean) {
	const entry = await resolvePreviewServerEntry();
	const port = await getAvailablePort();
	const childProcess = spawn(process.execPath, [entry], {
		stdio: 'inherit',
		env: {
			...process.env,
			HOST: '127.0.0.1',
			PORT: String(port),
			PREVIEW_API_ORIGIN: previewApiOrigin,
			PREVIEW_HMR: previewHmr ? 'true' : 'false',
			NODE_ENV: process.env.NODE_ENV ?? 'production'
		}
	});

	await waitForChildServer(port, childProcess);

	return {
		port,
		childProcess,
		async stop() {
			await stopChildProcess(childProcess);
		}
	};
}

async function startPreviewDevServer(
	previewApiOrigin: string,
	requestedPort: number,
	previewHmr: boolean
) {
	const previewServerDir = await resolvePreviewServerWorkspaceDir();
	const port = await getAvailablePort(requestedPort);
	const childProcess = spawn(
		process.execPath,
		['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)],
		{
			cwd: previewServerDir,
			stdio: 'inherit',
			env: {
				...process.env,
				PREVIEW_API_ORIGIN: previewApiOrigin,
				PREVIEW_HMR: previewHmr ? 'true' : 'false'
			}
		}
	);

	await waitForChildServer(port, childProcess, 20_000);

	return {
		port,
		childProcess,
		async stop() {
			await stopChildProcess(childProcess);
		}
	};
}

type ManagedPreviewServer =
	| Awaited<ReturnType<typeof startBuiltPreviewServer>>
	| Awaited<ReturnType<typeof startPreviewDevServer>>;

async function proxyToPreviewServer(
	requestUrl: URL,
	req: http.IncomingMessage,
	res: http.ServerResponse,
	previewPort: number
) {
	return await new Promise<void>((resolve) => {
		const proxyRequest = http.request(
			{
				host: '127.0.0.1',
				port: previewPort,
				method: req.method,
				path: `${requestUrl.pathname}${requestUrl.search}`,
				headers: {
					...req.headers,
					host: `127.0.0.1:${previewPort}`
				}
			},
			(proxyResponse) => {
				res.writeHead(proxyResponse.statusCode ?? 502, proxyResponse.headers);
				proxyResponse.pipe(res);
				proxyResponse.on('end', () => resolve());
			}
		);

		proxyRequest.on('error', (error) => {
			res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
			res.end(
				error instanceof Error ? error.message : 'Failed to reach the SvelteKit preview server.'
			);
			resolve();
		});

		req.pipe(proxyRequest);
	});
}

export async function dev(options: DevOptions) {
	const port = parsePort(options.port, 'port');
	const hmrEnabled = options.hmr !== false;
	const usePreviewDevServer = options.previewDev === true;
	const requestedPreviewPort = options.previewPort
		? parsePort(options.previewPort, 'preview port')
		: 3001;
	if (usePreviewDevServer && requestedPreviewPort === port) {
		throw new Error('The preview dev server port must be different from the backend port.');
	}

	const previewApi = createPreviewApiHandler({
		emailsDir: options.dir,
		customCssPath: options.customCssPath
	});

	const sseClients = new Set<http.ServerResponse>();

	function broadcastReload() {
		for (const client of sseClients) {
			try {
				client.write('event: reload\ndata: {}\n\n');
			} catch {
				sseClients.delete(client);
			}
		}
	}

	const scheduleReload = debounceAsync(async () => {
		await previewApi.invalidateCaches();
		broadcastReload();
	}, 200);

	async function resolveExistingWatchPaths(): Promise<string[]> {
		const candidates = [previewApi.getEmailsRoot(), ...previewApi.getCssWatchPaths()];
		const existing: string[] = [];
		for (const p of candidates) {
			try {
				await fs.access(p);
				existing.push(p);
			} catch {
				// Skip missing paths (e.g. optional default CSS).
			}
		}
		return existing;
	}

	let watcher: FSWatcher | null = null;
	if (hmrEnabled) {
		const watchPaths = await resolveExistingWatchPaths();
		if (watchPaths.length > 0) {
			watcher = chokidar.watch(watchPaths, {
				ignoreInitial: true,
				awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 }
			});
			watcher.on('all', () => {
				scheduleReload();
			});
		}
	}

	function tryHandlePreviewEvents(
		requestUrl: URL,
		req: http.IncomingMessage,
		res: http.ServerResponse
	): boolean {
		if (requestUrl.pathname !== '/api/preview-events' || req.method !== 'GET') {
			return false;
		}

		if (!hmrEnabled) {
			res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
			res.end('Live reload is disabled (pass --no-hmr).');
			return true;
		}

		allowPreviewCors(req, res);
		res.writeHead(200, {
			'Content-Type': 'text/event-stream; charset=utf-8',
			'Cache-Control': 'no-store, no-cache, must-revalidate',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no'
		});
		res.write(': connected\n\n');
		res.write('event: ready\ndata: {}\n\n');
		sseClients.add(res);
		req.on('close', () => {
			sseClients.delete(res);
		});
		return true;
	}

	let previewServer: ManagedPreviewServer | null = null;

	const server = http.createServer(async (req, res) => {
		try {
			const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
			if (tryHandlePreviewEvents(requestUrl, req, res)) {
				return;
			}

			if (await previewApi.handlePreviewApi(requestUrl, req, res)) {
				return;
			}

			if (!previewServer) {
				res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
				res.end(
					usePreviewDevServer
						? 'Preview dev server is still starting.'
						: 'Preview app is still starting.'
				);
				return;
			}

			if (usePreviewDevServer) {
				res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
				res.end(
					`Preview API server is running here. Open http://127.0.0.1:${previewServer.port} for the preview UI.`
				);
				return;
			}

			await proxyToPreviewServer(requestUrl, req, res, previewServer.port);
		} catch (error) {
			res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
			res.end(
				error instanceof Error ? error.message : 'Unexpected error while serving preview assets.'
			);
		}
	});

	await new Promise<void>((resolve, reject) => {
		server.once('error', reject);
		server.listen(port, () => {
			resolve();
		});
	});

	try {
		previewServer = usePreviewDevServer
			? await startPreviewDevServer(`http://127.0.0.1:${port}`, requestedPreviewPort, hmrEnabled)
			: await startBuiltPreviewServer(`http://127.0.0.1:${port}`, hmrEnabled);
	} catch (error) {
		await watcher?.close();
		server.close();
		throw error;
	}

	let shuttingDown = false;
	const cleanup = async () => {
		if (shuttingDown) {
			return;
		}

		shuttingDown = true;
		await watcher?.close();
		for (const client of sseClients) {
			try {
				client.end();
			} catch {
				// ignore
			}
		}
		sseClients.clear();
		server.close();
		await previewServer.stop();
	};

	for (const signal of ['SIGINT', 'SIGTERM'] as const) {
		process.once(signal, () => {
			void cleanup().finally(() => {
				process.exit(0);
			});
		});
	}

	process.once('exit', () => {
		if (previewServer?.childProcess.exitCode === null) {
			previewServer.childProcess.kill('SIGTERM');
		}
	});

	if (usePreviewDevServer) {
		console.log(`Preview API running on http://localhost:${port}`);
		console.log(`Preview UI running on http://localhost:${previewServer.port}`);
		return;
	}

	console.log(`Preview server running on http://localhost:${port}`);
}
