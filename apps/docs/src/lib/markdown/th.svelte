<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		align,
		children
	}: {
		align?: 'left' | 'center' | 'right';
		children?: Snippet;
	} = $props();
</script>

<th scope="col" {align}>
	{@render children?.()}
</th>
