import fs from 'fs';
import path from 'path';

export type PreviewData = {
	files: string[] | null;
	path: string | null;
};

type EmailListProps = {
	path?: string;
	root?: string;
};

/**
 * Get a list of all email component files in the specified directory.
 *
 * @param options.path - Relative path from root to emails folder (default: '/src/lib/emails')
 * @param options.root - Absolute path to project root (auto-detected if not provided)
 * @returns PreviewData object with list of email files and the path
 *
 * @example
 * ```ts
 * // In a +page.server.ts file
 * import { emailList } from 'better-svelte-email/preview';
 *
 * export function load() {
 *   const emails = emailList({
 *     root: process.cwd(),
 *     path: '/src/lib/emails'
 *   });
 *   return { emails };
 * }
 * ```
 */
export const emailList = ({
	path: emailPath = '/src/lib/emails',
	root
}: EmailListProps = {}): PreviewData => {
	// If root is not provided, try to use process.cwd()
	if (!root) {
		try {
			root = process.cwd();
		} catch (err) {
			throw new Error(
				'Could not determine the root path of your project. Please pass in the root param manually using process.cwd() or an absolute path.',
				{ cause: err }
			);
		}
	}

	const fullPath = path.join(root, emailPath);

	// Check if directory exists
	if (!fs.existsSync(fullPath)) {
		console.warn(`Email directory not found: ${fullPath}`);
		return { files: null, path: emailPath };
	}

	// Use the absolute folder path as the root when creating the component list so
	// we can compute correct relative paths on all platforms.
	const files = createEmailComponentList(fullPath, getFiles(fullPath));

	if (!files.length) {
		return { files: null, path: emailPath };
	}

	return { files, path: emailPath };
};

export const getEmailComponent = async (emailPath: string, file: string) => {
	const fileName = `${file}.svelte`;
	try {
		// Import the email component dynamically
		const normalizedEmailPath = emailPath.replace(/\\/g, '/').replace(/\/+$/, '');
		const normalizedFile = file.replace(/\\/g, '/').replace(/^\/+/, '');
		const importPath = `${normalizedEmailPath}/${normalizedFile}.svelte`;
		return (await import(/* @vite-ignore */ importPath)).default;
	} catch (err) {
		throw new Error(
			`Failed to import email component '${fileName}'. Make sure the file exists and includes the <Head /> component.`,
			{ cause: err }
		);
	}
};

export const getEmailSource = async (emailPath: string, file: string) => {
	const normalizedEmailPath = emailPath.replace(/\\/g, '/').replace(/\/+$/, '');
	const normalizedFile = file.replace(/\\/g, '/').replace(/^\/+/, '');

	const candidates = new Set<string>();
	const relativeEmailPath = normalizedEmailPath.replace(/^\/+/, '');

	if (normalizedEmailPath) {
		candidates.add(path.resolve(process.cwd(), relativeEmailPath, `${normalizedFile}.svelte`));
		candidates.add(path.resolve(process.cwd(), normalizedEmailPath, `${normalizedFile}.svelte`));
		candidates.add(path.resolve(normalizedEmailPath, `${normalizedFile}.svelte`));
	}

	candidates.add(path.resolve(process.cwd(), `${normalizedFile}.svelte`));

	for (const candidate of candidates) {
		try {
			return await fs.promises.readFile(candidate, 'utf8');
		} catch {
			// continue to next candidate
		}
	}

	console.warn(`Source file not found for ${normalizedFile} in ${normalizedEmailPath}`);
	return null;
};

// Recursive function to get files
export function getFiles(dir: string, files: string[] = []) {
	// Get an array of all files and directories in the passed directory using fs.readdirSync
	const fileList = fs.readdirSync(dir);
	// Create the full path of the file/directory by concatenating the passed directory and file/directory name
	for (const file of fileList) {
		const name = path.join(dir, file);
		// Check if the current file/directory is a directory using fs.statSync
		if (fs.statSync(name).isDirectory()) {
			// If it is a directory, recursively call the getFiles function with the directory path and the files array
			getFiles(name, files);
		} else {
			// If it is a file, push the full path to the files array
			files.push(name);
		}
	}
	return files;
}

/**
 * Creates an array of names from the record of svelte email component file paths
 */
function createEmailComponentList(root: string, paths: string[]) {
	const emailComponentList: string[] = [];

	paths.forEach((filePath) => {
		if (filePath.endsWith('.svelte')) {
			// Get the directory name from the full path
			const fileDir = path.dirname(filePath);
			// Get the base name without extension
			const baseName = path.basename(filePath, '.svelte');

			// Normalize paths for cross-platform comparison
			const rootNormalized = path.normalize(root);
			const fileDirNormalized = path.normalize(fileDir);

			// Find where root appears in the full directory path
			const rootIndex = fileDirNormalized.indexOf(rootNormalized);

			if (rootIndex !== -1) {
				// Get everything after the root path
				const afterRoot = fileDirNormalized.substring(rootIndex + rootNormalized.length);
				// Combine with the base name using path.join for proper separators
				const relativePath = afterRoot ? path.join(afterRoot, baseName) : baseName;
				// Remove leading path separators
				const cleanPath = relativePath.replace(/^[/\\]+/, '');
				emailComponentList.push(cleanPath);
			}
		}
	});

	return emailComponentList;
}
