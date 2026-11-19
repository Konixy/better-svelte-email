<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, start }: { children?: Snippet; start?: number } = $props();
</script>

<ol class="list-decimal space-y-2" {start}>
	{@render children?.()}
</ol>
