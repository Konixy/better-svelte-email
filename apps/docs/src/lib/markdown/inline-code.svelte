<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<code class="border border-border bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground/90">
	{@render children?.()}
</code>
