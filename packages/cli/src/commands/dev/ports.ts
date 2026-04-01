import net from 'node:net';

export async function isPortAvailable(port: number) {
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

export async function getAvailablePort(preferredPort?: number) {
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
