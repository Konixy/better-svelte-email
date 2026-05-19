import { PassThrough } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { describe, expect, it } from 'vitest';
import {
	allowPreviewCors,
	isLocalPreviewOrigin,
	tryHandlePreviewApiCors
} from './http';

function makeRequest(options: {
	method: string;
	url: string;
	origin?: string;
}): IncomingMessage {
	const stream = new PassThrough();
	const req = stream as unknown as IncomingMessage;
	req.method = options.method;
	req.url = options.url;
	req.headers = options.origin ? { origin: options.origin } : {};
	return req;
}

function collectHeaders(): { res: ServerResponse; headers: () => Record<string, string | string[] | undefined> } {
	const headerBag: Record<string, string | string[] | undefined> = {};
	const res = {
		setHeader(name: string, value: string | string[]) {
			headerBag[name.toLowerCase()] = value;
		},
		writeHead() {},
		end() {}
	} as unknown as ServerResponse;
	return {
		res,
		headers: () => headerBag
	};
}

describe('preview CORS helpers', () => {
	it('accepts localhost origins on any port', () => {
		expect(isLocalPreviewOrigin('http://127.0.0.1:3001')).toBe(true);
		expect(isLocalPreviewOrigin('http://localhost:3001')).toBe(true);
		expect(isLocalPreviewOrigin('https://evil.com')).toBe(false);
	});

	it('sets CORS headers for local preview origins', () => {
		const req = makeRequest({
			method: 'POST',
			url: '/api/send-email/config',
			origin: 'http://127.0.0.1:3001'
		});
		const { res, headers } = collectHeaders();
		allowPreviewCors(req, res);
		expect(headers()['access-control-allow-origin']).toBe('http://127.0.0.1:3001');
		expect(headers()['access-control-allow-methods']).toContain('POST');
	});

	it('handles OPTIONS preflight for /api/*', () => {
		const req = makeRequest({
			method: 'OPTIONS',
			url: '/api/send-email/config',
			origin: 'http://127.0.0.1:3001'
		});
		let status = 0;
		const { res, headers } = collectHeaders();
		(res as { writeHead: (code: number) => void }).writeHead = (code: number) => {
			status = code;
		};
		const handled = tryHandlePreviewApiCors(
			new URL('http://127.0.0.1:3000/api/send-email/config'),
			req,
			res
		);
		expect(handled).toBe(true);
		expect(status).toBe(204);
		expect(headers()['access-control-allow-origin']).toBe('http://127.0.0.1:3001');
	});

	it('ignores non-API paths', () => {
		const req = makeRequest({ method: 'OPTIONS', url: '/', origin: 'http://127.0.0.1:3001' });
		const { res } = collectHeaders();
		const handled = tryHandlePreviewApiCors(new URL('http://127.0.0.1:3000/'), req, res);
		expect(handled).toBe(false);
	});
});
