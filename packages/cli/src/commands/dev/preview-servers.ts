import { spawn, type ChildProcess } from 'node:child_process';
import { getAvailablePort } from './ports';
import { resolvePreviewServerEntry, resolvePreviewServerWorkspaceDir } from './resolve-cli';
import { stopChildProcess, waitForChildServer } from './child-process';

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

export type ManagedPreviewServer =
	| Awaited<ReturnType<typeof startBuiltPreviewServer>>
	| Awaited<ReturnType<typeof startPreviewDevServer>>;

export async function startPreviewForDev(options: {
	previewApiOrigin: string;
	previewHmr: boolean;
	usePreviewDevServer: boolean;
	requestedPreviewPort: number;
}): Promise<ManagedPreviewServer> {
	const { previewApiOrigin, previewHmr, usePreviewDevServer, requestedPreviewPort } = options;
	return usePreviewDevServer
		? await startPreviewDevServer(previewApiOrigin, requestedPreviewPort, previewHmr)
		: await startBuiltPreviewServer(previewApiOrigin, previewHmr);
}
