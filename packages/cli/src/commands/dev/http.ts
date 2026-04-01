import http from 'node:http';

export function allowPreviewCors(req: http.IncomingMessage, res: http.ServerResponse) {
	const origin = req.headers.origin;
	if (origin && /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/i.test(origin.trim())) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Vary', 'Origin');
	}
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
