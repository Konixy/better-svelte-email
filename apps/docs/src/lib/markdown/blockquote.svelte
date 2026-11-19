<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<blockquote class="border-l-2 border-svelte/30 bg-muted/40 px-4 py-2 text-muted-foreground">
	{@render children?.()}
</blockquote>
