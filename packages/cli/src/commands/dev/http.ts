import http from 'node:http';

const LOCAL_PREVIEW_ORIGIN =
	/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/i;

export function isLocalPreviewOrigin(origin: string | undefined) {
	return typeof origin === 'string' && LOCAL_PREVIEW_ORIGIN.test(origin.trim());
}

/** CORS for preview UI on a different localhost port (e.g. `--preview-dev`). */
export function allowPreviewCors(req: http.IncomingMessage, res: http.ServerResponse) {
	const origin = req.headers.origin;
	if (!isLocalPreviewOrigin(origin)) {
		return;
	}

	res.setHeader('Access-Control-Allow-Origin', origin!);
	res.setHeader('Vary', 'Origin');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Handles browser preflight for cross-origin `/api/*` calls.
 * @returns true when the request was handled (caller should return).
 */
export function tryHandlePreviewApiCors(
	requestUrl: URL,
	req: http.IncomingMessage,
	res: http.ServerResponse
): boolean {
	if (!requestUrl.pathname.startsWith('/api/')) {
		return false;
	}

	allowPreviewCors(req, res);

	if (req.method === 'OPTIONS') {
		res.writeHead(204);
		res.end();
		return true;
	}

	return false;
}

export function parsePort(value: number | string, label: string) {
	const port = Number(value);
	if (!Number.isInteger(port) || port <= 0) {
		throw new Error(`Invalid ${label}: ${String(value)}`);
	}

	return port;
}

export async function proxyToPreviewServer(
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
