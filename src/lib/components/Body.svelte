<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, ...restProps }: { children?: any } & HTMLAttributes<HTMLBodyElement> = $props();
</script>

<body {...restProps}>
	{@render children?.()}
</body>
