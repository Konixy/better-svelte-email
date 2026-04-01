import http from 'node:http';
import { type ChildProcess } from 'node:child_process';
import { sleep } from './async-utils';

export async function waitForChildServer(port: number, childProcess: ChildProcess, timeoutMs = 10_000) {
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

export async function stopChildProcess(childProcess: ChildProcess) {
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
