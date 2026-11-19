<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<li class="marker:text-muted-foreground/50">
	{@render children?.()}
</li>
