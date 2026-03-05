<script lang="ts">
	import { onMount } from 'svelte';

	type EmailsResponse = {
		files: string[];
		path: string;
	};

	let files = $state<string[]>([]);
	let emailPath = $state('');
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(() => {
		let cancelled = false;

		const loadEmails = async () => {
			loading = true;
			error = null;

			try {
				const response = await fetch('/api/emails');
				const payload = (await response.json()) as EmailsResponse & {
					error?: { message?: string };
				};

				if (!response.ok) {
					throw new Error(payload.error?.message ?? 'Failed to load email list.');
				}

				if (cancelled) {
					return;
				}

				files = payload.files ?? [];
				emailPath = payload.path ?? '';
			} catch (fetchError) {
				if (!cancelled) {
					error = fetchError instanceof Error ? fetchError.message : 'Failed to load email list.';
				}
			} finally {
				if (!cancelled) {
					loading = false;
				}
			}
		};

		void loadEmails();

		return () => {
			cancelled = true;
		};
	});
</script>

<h1>Email Preview</h1>

{#if loading}
	<p>Loading emails...</p>
{:else if error}
	<p>{error}</p>
{:else if files.length === 0}
	<p>No emails found in <code>{emailPath}</code>.</p>
{:else}
	<ul>
		{#each files as file (file)}
			<li><a href={'/' + encodeURI(file)}>{file}</a></li>
		{/each}
	</ul>
{/if}
