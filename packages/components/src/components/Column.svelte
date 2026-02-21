<script lang="ts">
	import type { HTMLTdAttributes } from 'svelte/elements';

	let {
		children,
		...restProps
	}: {
		children?: any;
	} & HTMLTdAttributes = $props();
</script>

<td {...restProps}>
	{@render children?.()}
</td>
