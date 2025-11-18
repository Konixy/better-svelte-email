export type EmailTreeEntry = FileEntry | DirectoryEntry;

export type FileEntry = {
	type: 'file';
	name: string;
	path: string;
};

export type DirectoryEntry = {
	type: 'directory';
	name: string;
	path: string;
	items: EmailTreeEntry[];
};

export function buildEmailTree(paths: readonly string[] | null | undefined): EmailTreeEntry[] {
	if (!paths || paths.length === 0) {
		return [];
	}

	const root: EmailTreeEntry[] = [];
	const directoryMap = new Map<string, DirectoryEntry>();

	for (const rawPath of paths) {
		if (!rawPath) continue;

		const normalized = normalizePath(rawPath);
		const segments = normalized.split('/').filter(Boolean);
		if (segments.length === 0) continue;

		let parentChildren = root;
		let parentPath = '';

		segments.forEach((segment, index) => {
			const currentPath = parentPath ? `${parentPath}/${segment}` : segment;
			const isFile = index === segments.length - 1;

			if (isFile) {
				parentChildren.push({
					type: 'file',
					name: segment,
					path: normalized
				});
			} else {
				let directory = directoryMap.get(currentPath);
				if (!directory) {
					directory = {
						type: 'directory',
						name: segment,
						path: currentPath,
						items: []
					};
					directoryMap.set(currentPath, directory);
					parentChildren.push(directory);
				}
				parentChildren = directory.items;
			}

			parentPath = currentPath;
		});
	}

	return sortTree(root);
}

function normalizePath(path: string): string {
	return path.replace(/^[./]+/, '').replace(/\/+/g, '/');
}

function sortTree(nodes: EmailTreeEntry[]): EmailTreeEntry[] {
	nodes.sort((a, b) => {
		if (a.type === b.type) {
			return a.name.localeCompare(b.name);
		}
		return a.type === 'directory' ? -1 : 1;
	});

	for (const node of nodes) {
		if (node.type === 'directory') {
			sortTree(node.items);
		}
	}

	return nodes;
}
