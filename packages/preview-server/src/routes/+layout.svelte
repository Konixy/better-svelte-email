<script lang="ts">
	import '../app.css';
	import { browser } from '$app/env';
	import { refreshAll } from '$app/navigation';
	import { SvelteTheme } from 'svelte-themes';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	$effect(() => {
		if (!browser || !data.previewEventsUrl) {
			return;
		}

		const source = new EventSource(data.previewEventsUrl);
		source.addEventListener('reload', () => {
			void refreshAll();
		});
		return () => source.close();
	});
</script>

<SvelteTheme attribute="class" storageKey="bse_preview_mode">
	<main>
		{@render children()}
	</main>
</SvelteTheme>
