const preStateFile = Bun.file('.changeset/pre.json');

if (await preStateFile.exists()) {
	try {
		const preState = await preStateFile.json();
		if (preState.mode === 'pre' && typeof preState.tag === 'string') {
			process.stdout.write(preState.tag);
		}
	} catch {
		// Ignore invalid or unreadable prerelease state and publish without a tag.
	}
}
