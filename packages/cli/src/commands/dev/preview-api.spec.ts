import { PassThrough } from 'node:stream';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	createPreviewApiHandler,
	previewSvelteKitShimPlugin,
	resolveEmailsRoot,
	tryResolveSvelteKitRuntimeApp
} from './preview-api';

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
	it('stubs generated __SERVER__/internal imports with or without the js suffix', async () => {
		const plugin = previewSvelteKitShimPlugin(process.cwd());
		expect(await plugin.resolveId?.('__SERVER__/internal')).toBe('\0preview-sk:server-internal');
		expect(await plugin.resolveId?.('__SERVER__/internal.js')).toBe('\0preview-sk:server-internal');
	});
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
		const { handlePreviewApi } = createPreviewApiHandler({ emailsDir: '.' });
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
		const { handlePreviewApi } = createPreviewApiHandler({ emailsDir: '.' });
		const req = makeRequest({ method: 'GET', url: '/api/source?file=Welcome' });
		const { res, status, json } = collectResponse();
		await handlePreviewApi(new URL('http://127.0.0.1/api/source?file=Welcome'), req, res);
		expect(status()).toBe(200);
		const payload = json() as { file: string; source: string };
		expect(payload.file).toBe('Welcome');
		expect(payload.source).toContain('<script>');
	});

	it('GET /api/source rejects path traversal', async () => {
		const { handlePreviewApi } = createPreviewApiHandler({ emailsDir: '.' });
		const req = makeRequest({ method: 'GET', url: '/api/source?file=../Welcome' });
		const { res, status, json } = collectResponse();
		await handlePreviewApi(new URL('http://127.0.0.1/api/source?file=../Welcome'), req, res);
		expect(status()).toBe(400);
		expect((json() as { error: { message: string } }).error.message).toContain('invalid');
	});

	it('GET /api/source returns 404 for missing file', async () => {
		const { handlePreviewApi } = createPreviewApiHandler({ emailsDir: '.' });
		const req = makeRequest({ method: 'GET', url: '/api/source?file=Missing' });
		const { res, status, json } = collectResponse();
		await handlePreviewApi(new URL('http://127.0.0.1/api/source?file=Missing'), req, res);
		expect(status()).toBe(404);
		expect((json() as { error: { message: string } }).error.message).toContain('not found');
	});

	it('POST /api/render returns 404 when file is missing (before Vite)', async () => {
		const { handlePreviewApi } = createPreviewApiHandler({ emailsDir: '.' });
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
		const { handlePreviewApi } = createPreviewApiHandler({ emailsDir: '.' });
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
		const { handlePreviewApi } = createPreviewApiHandler({ emailsDir: '.' });
		const req = makeRequest({ method: 'GET', url: '/' });
		const { res, status, raw } = collectResponse();
		const handled = await handlePreviewApi(new URL('http://127.0.0.1/'), req, res);
		expect(handled).toBe(false);
		expect(status()).toBe(0);
		expect(raw()).toBe('');
	});

	it('unknown API route returns 404 JSON', async () => {
		const { handlePreviewApi } = createPreviewApiHandler({ emailsDir: '.' });
		const req = makeRequest({ method: 'GET', url: '/api/unknown' });
		const { res, status, json } = collectResponse();
		await handlePreviewApi(new URL('http://127.0.0.1/api/unknown'), req, res);
		expect(status()).toBe(404);
		expect((json() as { error: { message: string } }).error.message).toContain('not found');
	});
});
