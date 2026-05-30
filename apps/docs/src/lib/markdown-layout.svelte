<script lang="ts" module>
	export { default as CodeBlock } from '$lib/components/code-block.svelte';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

{@render children?.()}
