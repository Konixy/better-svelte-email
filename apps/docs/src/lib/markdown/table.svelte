<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div class="ret-table-wrapper">
	<table class="ret-table">
		{@render children?.()}
	</table>
</div>
