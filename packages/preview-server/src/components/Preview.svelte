<script lang="ts">
	import { onMount } from 'svelte';

	type RenderResponse = {
		html?: string;
		source?: string | null;
		error?: { message?: string };
	};

	let html = $state('');
	let source = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);
	let currentPath = $state('');
	let currentFile = $state('');

	async function loadPreview(file: string) {
		loading = true;
		error = null;

		try {
			const response = await fetch('/api/render', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					file,
					includeSource: true
				})
			});

			const payload = (await response.json()) as RenderResponse;
			if (!response.ok) {
				throw new Error(payload.error?.message ?? 'Failed to render email.');
			}

			html = payload.html ?? '';
			source = payload.source ?? '';
		} catch (renderError) {
			error = renderError instanceof Error ? renderError.message : 'Failed to render email.';
			html = '';
			source = '';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		const syncPath = () => {
			const nextPath = window.location.pathname;
			if (nextPath === currentPath) {
				return;
			}

			currentPath = nextPath;
			const nextFile = nextPath.replace(/^\/+/, '');
			currentFile = nextFile;

			if (!nextFile) {
				html = '';
				source = '';
				error = null;
				loading = false;
				return;
			}

			void loadPreview(nextFile);
		};

		syncPath();
		const interval = window.setInterval(syncPath, 100);
		return () => {
			window.clearInterval(interval);
		};
	});
</script>

<p>Preview: <code>{currentPath}</code></p>

{#if loading}
	<p>Rendering email...</p>
{:else if error}
	<p>{error}</p>
{:else}
	<h2>Rendered HTML</h2>
	<iframe srcdoc={html} title="Rendered email" style="width: 100%; min-height: 420px;"></iframe>

	<h2>Source</h2>
	<pre>{source}</pre>
{/if}

<p><a href="/">Home</a></p>
