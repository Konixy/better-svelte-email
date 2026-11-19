<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<strong class="font-semibold text-foreground">
	{@render children?.()}
</strong>
