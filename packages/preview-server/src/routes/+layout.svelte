<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { SvelteTheme } from 'svelte-themes';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	$effect(() => {
		if (!browser || !data.previewEventsUrl) {
			return;
		}

		const source = new EventSource(data.previewEventsUrl);
		source.addEventListener('reload', () => {
			void invalidateAll();
		});
		return () => source.close();
	});
</script>

<SvelteTheme attribute="class" storageKey="bse_preview_mode">
	<main>
		{@render children()}
	</main>
</SvelteTheme>
