import fs from 'node:fs/promises';
import path from 'node:path';

export type ResendCredentials = {
	apiKey: string;
	from: string;
};

const DEFAULT_FROM = 'onboarding@resend.dev';

export function getResendCredentialsPath(cwd = process.cwd()) {
	return path.join(cwd, '.bse', 'resend.json');
}

function gitignoreAlreadyIgnoresBse(content: string) {
	return content.split('\n').some((line) => {
		const trimmed = line.trim().split('#')[0]?.trim() ?? '';
		if (!trimmed) {
			return false;
		}
		return (
			trimmed === '.bse' ||
			trimmed === '.bse/' ||
			trimmed.endsWith('/.bse') ||
			trimmed.endsWith('/.bse/')
		);
	});
}

/** Ensures `.bse/` is listed in the project root `.gitignore` when persisting credentials. */
export async function ensureBseInGitignore(cwd = process.cwd()): Promise<{ added: boolean }> {
	const gitignorePath = path.join(cwd, '.gitignore');
	let content = '';

	try {
		content = await fs.readFile(gitignorePath, 'utf8');
	} catch (error) {
		if (!isEnoent(error)) {
			throw error;
		}
	}

	if (gitignoreAlreadyIgnoresBse(content)) {
		return { added: false };
	}

	const entry = '\n# Better Svelte Email dev credentials\n.bse/\n';
	const next =
		content.length === 0
			? `.bse/\n`
			: content.endsWith('\n')
				? `${content}${entry.trimStart()}`
				: `${content}${entry}`;

	await fs.writeFile(gitignorePath, next, 'utf8');
	return { added: true };
}

export async function loadPersistedResendCredentials(
	cwd = process.cwd()
): Promise<ResendCredentials | null> {
	const filePath = getResendCredentialsPath(cwd);
	try {
		const raw = await fs.readFile(filePath, 'utf8');
		const parsed = JSON.parse(raw) as Partial<ResendCredentials>;
		if (typeof parsed.apiKey !== 'string' || !parsed.apiKey.trim()) {
			return null;
		}
		const from =
			typeof parsed.from === 'string' && parsed.from.trim() ? parsed.from.trim() : DEFAULT_FROM;
		return { apiKey: parsed.apiKey.trim(), from };
	} catch (error) {
		if (isEnoent(error)) {
			return null;
		}
		throw error;
	}
}

export async function savePersistedResendCredentials(
	credentials: ResendCredentials,
	cwd = process.cwd()
): Promise<void> {
	const dir = path.join(cwd, '.bse');
	const filePath = getResendCredentialsPath(cwd);
	await fs.mkdir(dir, { recursive: true, mode: 0o700 });
	const { added: addedToGitignore } = await ensureBseInGitignore(cwd);
	await fs.writeFile(
		filePath,
		JSON.stringify(
			{
				apiKey: credentials.apiKey,
				from: credentials.from || DEFAULT_FROM
			},
			null,
			2
		) + '\n',
		{ encoding: 'utf8', mode: 0o600 }
	);

	const relativeCredentialsPath = path.relative(cwd, filePath) || filePath;
	if (addedToGitignore) {
		console.log(
			`Resend credentials saved to ${relativeCredentialsPath} and .bse/ was added to .gitignore.`
		);
	} else {
		console.log(
			`Resend credentials saved to ${relativeCredentialsPath} (.bse/ is already in .gitignore).`
		);
	}
}

export async function clearPersistedResendCredentials(cwd = process.cwd()): Promise<void> {
	try {
		await fs.unlink(getResendCredentialsPath(cwd));
	} catch (error) {
		if (!isEnoent(error)) {
			throw error;
		}
	}
}

export function createResendCredentialsStore(cwd = process.cwd()) {
	let session: ResendCredentials | null = null;
	let persisted: ResendCredentials | null = null;
	let persistedLoaded = false;

	async function ensurePersistedLoaded() {
		if (!persistedLoaded) {
			persisted = await loadPersistedResendCredentials(cwd);
			persistedLoaded = true;
		}
	}

	return {
		getDefaultFrom: () => DEFAULT_FROM,

		get(): ResendCredentials | null {
			return session ?? persisted;
		},

		async isConfigured(): Promise<boolean> {
			await ensurePersistedLoaded();
			return session !== null || persisted !== null;
		},

		async getPublicConfig(): Promise<{
			configured: boolean;
			from: string | null;
			persisted: boolean;
		}> {
			await ensurePersistedLoaded();
			const active = session ?? persisted;
			return {
				configured: active !== null,
				from: active?.from ?? null,
				persisted: persisted !== null
			};
		},

		setSession(credentials: ResendCredentials | null) {
			session = credentials;
		},

		async setCredentials(
			credentials: ResendCredentials,
			options: { persist: boolean }
		): Promise<void> {
			session = credentials;
			if (options.persist) {
				await savePersistedResendCredentials(credentials, cwd);
				persisted = credentials;
				persistedLoaded = true;
			}
		},

		async initializeFromCliFlag(credentials: ResendCredentials, persist: boolean) {
			session = credentials;
			if (persist) {
				await savePersistedResendCredentials(credentials, cwd);
				persisted = credentials;
				persistedLoaded = true;
			}
		}
	};
}

function isEnoent(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		(error as NodeJS.ErrnoException).code === 'ENOENT'
	);
}

export { DEFAULT_FROM as RESEND_DEFAULT_FROM };
