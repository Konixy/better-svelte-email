import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	createResendCredentialsStore,
	ensureBseInGitignore,
	getResendCredentialsPath,
	loadPersistedResendCredentials,
	savePersistedResendCredentials
} from './resend-credentials';

describe('resend-credentials', () => {
	let cwd: string;

	beforeEach(async () => {
		cwd = await mkdtemp(path.join(tmpdir(), 'bse-resend-creds-'));
	});

	afterEach(async () => {
		await rm(cwd, { recursive: true, force: true });
	});

	it('persists and loads credentials from .bse/resend.json', async () => {
		await savePersistedResendCredentials(
			{ apiKey: 're_test', from: 'onboarding@resend.dev' },
			cwd
		);
		const loaded = await loadPersistedResendCredentials(cwd);
		expect(loaded).toEqual({ apiKey: 're_test', from: 'onboarding@resend.dev' });
		expect(getResendCredentialsPath(cwd)).toBe(path.join(cwd, '.bse', 'resend.json'));
		const raw = await readFile(getResendCredentialsPath(cwd), 'utf8');
		expect(raw).toContain('re_test');
	});

	it('appends .bse/ to .gitignore when saving credentials', async () => {
		await writeFile(path.join(cwd, '.gitignore'), 'node_modules\n', 'utf8');
		await savePersistedResendCredentials(
			{ apiKey: 're_test', from: 'onboarding@resend.dev' },
			cwd
		);
		const gitignore = await readFile(path.join(cwd, '.gitignore'), 'utf8');
		expect(gitignore).toContain('.bse/');
	});

	it('does not duplicate .bse/ in .gitignore', async () => {
		await writeFile(path.join(cwd, '.gitignore'), 'node_modules\n.bse/\n', 'utf8');
		await ensureBseInGitignore(cwd);
		const gitignore = await readFile(path.join(cwd, '.gitignore'), 'utf8');
		expect(gitignore.match(/\.bse\/?/g)?.length).toBe(1);
	});

	it('keeps session-only credentials when persist is false', async () => {
		const store = createResendCredentialsStore(cwd);
		await store.setCredentials(
			{ apiKey: 're_session', from: 'onboarding@resend.dev' },
			{ persist: false }
		);
		expect(store.get()?.apiKey).toBe('re_session');
		expect(await loadPersistedResendCredentials(cwd)).toBeNull();
	});

	it('reports configured from session or persisted credentials', async () => {
		const store = createResendCredentialsStore(cwd);
		expect(await store.isConfigured()).toBe(false);
		await store.setCredentials(
			{ apiKey: 're_persist', from: 'from@resend.dev' },
			{ persist: true }
		);
		expect(await store.isConfigured()).toBe(true);
		const config = await store.getPublicConfig();
		expect(config.configured).toBe(true);
		expect(config.from).toBe('from@resend.dev');
		expect(config.persisted).toBe(true);
	});
});
