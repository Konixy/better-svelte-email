import fs from 'node:fs/promises';
import http from 'node:http';
import chokidar, { type FSWatcher } from 'chokidar';
import { debounceAsync } from './async-utils';
import { allowPreviewCors, parsePort, proxyToPreviewServer } from './http';
import { createPreviewApiHandler } from './preview-api';
import { startPreviewForDev, type ManagedPreviewServer } from './preview-servers';
import type { DevOptions } from './types';

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
		previewServer = await startPreviewForDev({
			previewApiOrigin: `http://127.0.0.1:${port}`,
			previewHmr: hmrEnabled,
			usePreviewDevServer,
			requestedPreviewPort
		});
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
