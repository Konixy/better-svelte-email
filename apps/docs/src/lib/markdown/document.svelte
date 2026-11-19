<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div class="min-w-0 space-y-6 text-secondary-foreground">
	{@render children?.()}
</div>

<style>
	@reference '../../app.css';

	div :global(.docs-beta-notice) {
		@apply rounded-lg border border-amber-500/35 bg-amber-500/8 px-4 py-3 text-sm text-foreground;
	}

	div :global(.docs-beta-notice strong) {
		@apply font-semibold text-amber-800 dark:text-amber-300;
	}

	div :global(.docs-beta-notice p) {
		@apply m-0 leading-relaxed;
	}

	div :global(.docs-beta-notice p + p) {
		@apply mt-2;
	}
</style>
