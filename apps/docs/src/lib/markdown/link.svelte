<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let { children, ...rest }: { children?: Snippet } & HTMLAnchorAttributes = $props();
</script>

<a
	{...rest}
	class="font-medium text-svelte/80 underline decoration-svelte/20 underline-offset-2 transition-colors hover:text-svelte hover:decoration-svelte/50 [&_strong]:text-svelte"
>
	{@render children?.()}
</a>
