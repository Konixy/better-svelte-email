<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<p class="leading-relaxed">
	{@render children?.()}
</p>
