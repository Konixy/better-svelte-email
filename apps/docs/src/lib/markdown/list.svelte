<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<ul class="list-disc space-y-2 pl-6">
	{@render children?.()}
</ul>
