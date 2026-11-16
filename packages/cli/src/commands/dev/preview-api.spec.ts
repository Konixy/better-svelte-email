import { spawnSync } from 'node:child_process';
import { PassThrough } from 'node:stream';
import { mkdtemp, writeFile, mkdir, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	createPreviewApiHandler,
	previewSvelteKitShimPlugin,
	resolveEmailsRoot,
	tryResolveSvelteKitRuntimeApp
} from './preview-api';
import { createResendCredentialsStore } from './resend-credentials';

function createTestPreviewApiHandler(emailsDir: string) {
	return createPreviewApiHandler({
		emailsDir,
		resendCredentials: createResendCredentialsStore()
	});
}

function makeRequest(options: { method: string; url: string; body?: string }): IncomingMessage {
	const stream = new PassThrough();
	const req = stream as unknown as IncomingMessage;
	req.method = options.method;
	req.url = options.url;
	req.headers = {};
	if (options.body !== undefined) {
		req.headers['content-length'] = String(Buffer.byteLength(options.body, 'utf8'));
	}
	queueMicrotask(() => {
		if (options.body !== undefined) {
			stream.write(options.body, 'utf8');
		}
		stream.end();
	});
	return req;
}

function collectResponse(): {
	res: ServerResponse;
	status: () => number;
	json: () => unknown;
	raw: () => string;
} {
	let statusCode = 0;
	let body = '';
	const res = {
		writeHead(code: number) {
			statusCode = code;
		},
		end(data?: string | Buffer) {
			if (data === undefined) {
				return;
			}
			body = typeof data === 'string' ? data : data.toString('utf8');
		}
	} as unknown as ServerResponse;
	return {
		res,
		status: () => statusCode,
		json: () => JSON.parse(body) as unknown,
		raw: () => body
	};
}

describe('tryResolveSvelteKitRuntimeApp()', () => {
	it('returns the kit runtime app directory when @sveltejs/kit is resolvable from cwd', () => {
		const dir = tryResolveSvelteKitRuntimeApp(process.cwd());
		expect(dir).not.toBeNull();
		expect(dir).toMatch(/[/\\]src[/\\]runtime[/\\]app$/);
	});
});

describe('previewSvelteKitShimPlugin()', () => {
	it('stubs generated SvelteKit server modules', async () => {
		const plugin = previewSvelteKitShimPlugin(process.cwd());
		expect(await plugin.resolveId?.('<sveltekit:generated>/server.js')).toBe(
			'\0preview-sk:server-internal'
		);
		expect(await plugin.resolveId?.('__SERVER__/internal')).toBe('\0preview-sk:server-internal');
		expect(await plugin.resolveId?.('__SERVER__/internal.js')).toBe('\0preview-sk:server-internal');
		expect(await plugin.resolveId?.('__sveltekit/paths')).toBe('\0preview-sk:paths');
	});

	it('renders an email with the CLI Svelte when the app depends on Svelte 5.14.3', async () => {
		const appDir = await mkdtemp(path.join(tmpdir(), 'bse-cli-old-svelte-'));
		const prevCwd = process.cwd();
		const serverPkg = fileURLToPath(new URL('../../../../server/package.json', import.meta.url));

		await mkdir(path.join(appDir, 'emails'), { recursive: true });
		await writeFile(
			path.join(appDir, 'package.json'),
			JSON.stringify(
				{
					name: 'bse-old-svelte-app',
					private: true,
					type: 'module',
					dependencies: {
						svelte: '5.14.3',
						'@better-svelte-email/server': `file:${path.dirname(serverPkg)}`
					}
				},
				null,
				2
			)
		);
		await writeFile(
			path.join(appDir, 'emails', 'hello.svelte'),
			`<script>
	let { name = 'there' } = $props();
</script>

<p class="text-lg">Hello {name}</p>
`
		);

		const installed = spawnSync('bun', ['install'], {
			cwd: appDir,
			encoding: 'utf8'
		});
		expect(installed.status, installed.stderr || installed.stdout).toBe(0);

		const appSvelte = JSON.parse(
			await readFile(path.join(appDir, 'node_modules/svelte/package.json'), 'utf8')
		) as { version: string };
		expect(appSvelte.version).toBe('5.14.3');

		process.chdir(appDir);
		const { handlePreviewApi, invalidateCaches } = createPreviewApiHandler({
			emailsDir: 'emails',
			resendCredentials: createResendCredentialsStore()
		});

		try {
			const req = makeRequest({
				method: 'POST',
				url: '/api/render',
				body: JSON.stringify({ file: 'hello', props: { name: 'Ada' } })
			});
			const { res, status, json } = collectResponse();
			await handlePreviewApi(new URL('http://127.0.0.1/api/render'), req, res);
			const payload = json() as { html?: string; error?: { message: string } };
			expect(status(), payload.error?.message).toBe(200);
			expect(payload.html).toContain('Hello Ada');
			expect(payload.html).toMatch(/font-size\s*:/);

			const resolved = await previewSvelteKitShimPlugin(appDir).resolveId?.('svelte/attachments');
			expect(typeof resolved).toBe('string');
			expect(String(resolved).startsWith(appDir)).toBe(false);
		} finally {
			await invalidateCaches();
			process.chdir(prevCwd);
			await rm(appDir, { recursive: true, force: true });
		}
	}, 120_000);
});

describe('resolveEmailsRoot()', () => {
	it('normalizes absolute paths', () => {
		const abs = path.resolve('/tmp/emails');
		expect(resolveEmailsRoot(abs)).toBe(path.normalize(abs));
	});

	it('resolves relative paths against cwd', () => {
		const cwd = process.cwd();
		expect(resolveEmailsRoot('src/lib/emails')).toBe(path.resolve(cwd, 'src/lib/emails'));
	});
});

describe('createPreviewApiHandler()', () => {
	let tmpDir: string;
	let prevCwd: string;

	beforeEach(async () => {
		prevCwd = process.cwd();
		tmpDir = await mkdtemp(path.join(tmpdir(), 'bse-cli-preview-api-'));
		process.chdir(tmpDir);
		await mkdir(path.join(tmpDir, 'nested'), { recursive: true });
		await writeFile(path.join(tmpDir, 'Welcome.svelte'), '<script></script>\n', 'utf8');
		await writeFile(path.join(tmpDir, 'nested', 'Foo.svelte'), '<script></script>\n', 'utf8');
	});

	afterEach(async () => {
		process.chdir(prevCwd);
		await rm(tmpDir, { recursive: true, force: true });
	});

	it('GET /api/emails returns sorted relative paths', async () => {
		const { handlePreviewApi } = createTestPreviewApiHandler('.');
		const req = makeRequest({ method: 'GET', url: '/api/emails' });
		const { res, status, json } = collectResponse();
		const handled = await handlePreviewApi(new URL('http://127.0.0.1/api/emails'), req, res);
		expect(handled).toBe(true);
		expect(status()).toBe(200);
		const payload = json() as { files: string[]; path: string };
		expect(payload.files).toEqual(['Welcome', 'nested/Foo']);
		expect(payload.path).toBe('.');
	});

	it('GET /api/source returns file contents', async () => {
		const { handlePreviewApi } = createTestPreviewApiHandler('.');
		const req = makeRequest({ method: 'GET', url: '/api/source?file=Welcome' });
		const { res, status, json } = collectResponse();
		await handlePreviewApi(new URL('http://127.0.0.1/api/source?file=Welcome'), req, res);
		expect(status()).toBe(200);
		const payload = json() as { file: string; source: string };
		expect(payload.file).toBe('Welcome');
		expect(payload.source).toContain('<script>');
	});

	it('GET /api/source rejects path traversal', async () => {
		const { handlePreviewApi } = createTestPreviewApiHandler('.');
		const req = makeRequest({ method: 'GET', url: '/api/source?file=../Welcome' });
		const { res, status, json } = collectResponse();
		await handlePreviewApi(new URL('http://127.0.0.1/api/source?file=../Welcome'), req, res);
		expect(status()).toBe(400);
		expect((json() as { error: { message: string } }).error.message).toContain('invalid');
	});

	it('GET /api/source returns 404 for missing file', async () => {
		const { handlePreviewApi } = createTestPreviewApiHandler('.');
		const req = makeRequest({ method: 'GET', url: '/api/source?file=Missing' });
		const { res, status, json } = collectResponse();
		await handlePreviewApi(new URL('http://127.0.0.1/api/source?file=Missing'), req, res);
		expect(status()).toBe(404);
		expect((json() as { error: { message: string } }).error.message).toContain('not found');
	});

	it('POST /api/render returns 404 when file is missing (before Vite)', async () => {
		const { handlePreviewApi } = createTestPreviewApiHandler('.');
		const req = makeRequest({
			method: 'POST',
			url: '/api/render',
			body: JSON.stringify({ file: 'Nope' })
		});
		const { res, status, json } = collectResponse();
		await handlePreviewApi(new URL('http://127.0.0.1/api/render'), req, res);
		expect(status()).toBe(404);
		expect((json() as { error: { message: string } }).error.message).toContain('not found');
	});

	it('POST /api/render rejects invalid JSON body', async () => {
		const { handlePreviewApi } = createTestPreviewApiHandler('.');
		const req = makeRequest({
			method: 'POST',
			url: '/api/render',
			body: 'not-json'
		});
		const { res, status, json } = collectResponse();
		await handlePreviewApi(new URL('http://127.0.0.1/api/render'), req, res);
		expect(status()).toBe(400);
		expect((json() as { error: { message: string } }).error.message).toContain('JSON');
	});

	it('returns false for non-API paths', async () => {
		const { handlePreviewApi } = createTestPreviewApiHandler('.');
		const req = makeRequest({ method: 'GET', url: '/' });
		const { res, status, raw } = collectResponse();
		const handled = await handlePreviewApi(new URL('http://127.0.0.1/'), req, res);
		expect(handled).toBe(false);
		expect(status()).toBe(0);
		expect(raw()).toBe('');
	});

	it('unknown API route returns 404 JSON', async () => {
		const { handlePreviewApi } = createTestPreviewApiHandler('.');
		const req = makeRequest({ method: 'GET', url: '/api/unknown' });
		const { res, status, json } = collectResponse();
		await handlePreviewApi(new URL('http://127.0.0.1/api/unknown'), req, res);
		expect(status()).toBe(404);
		expect((json() as { error: { message: string } }).error.message).toContain('not found');
	});

	it('GET /api/send-email/config reports unconfigured by default', async () => {
		const { handlePreviewApi } = createTestPreviewApiHandler('.');
		const req = makeRequest({ method: 'GET', url: '/api/send-email/config' });
		const { res, status, json } = collectResponse();
		await handlePreviewApi(new URL('http://127.0.0.1/api/send-email/config'), req, res);
		expect(status()).toBe(200);
		expect(json()).toEqual({ configured: false, from: null, persisted: false });
	});

	it('POST /api/send-email/config stores session credentials without persisting', async () => {
		const store = createResendCredentialsStore(tmpDir);
		const { handlePreviewApi } = createPreviewApiHandler({
			emailsDir: '.',
			resendCredentials: store
		});
		const req = makeRequest({
			method: 'POST',
			url: '/api/send-email/config',
			body: JSON.stringify({
				apiKey: 're_test',
				from: 'onboarding@resend.dev',
				persist: false
			})
		});
		const { res, status, json } = collectResponse();
		await handlePreviewApi(new URL('http://127.0.0.1/api/send-email/config'), req, res);
		expect(status()).toBe(200);
		expect((json() as { configured: boolean }).configured).toBe(true);
		expect(store.get()?.apiKey).toBe('re_test');
	});

	it('POST /api/send-email rejects when not configured', async () => {
		const { handlePreviewApi } = createTestPreviewApiHandler('.');
		const req = makeRequest({
			method: 'POST',
			url: '/api/send-email',
			body: JSON.stringify({
				to: 'user@example.com',
				file: 'Welcome',
				html: '<p>Hi</p>'
			})
		});
		const { res, status, json } = collectResponse();
		await handlePreviewApi(new URL('http://127.0.0.1/api/send-email'), req, res);
		expect(status()).toBe(400);
		expect((json() as { error: { message: string } }).error.message).toContain('not configured');
	});
});
