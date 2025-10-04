<script lang="ts">
	import { styleToString } from '$lib/utils/index.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		children,
		href,
		target = '_blank',
		style,
		...restProps
	}: {
		href: string;
		target?: string;
		children: any;
	} & HTMLAttributes<HTMLAnchorElement> = $props();
</script>

<a
	{href}
	{target}
	{...restProps}
	style={styleToString({ textDecorationLine: 'none', color: '#067df7' }) +
		(style ? ';' + style : '')}
>
	{@render children?.()}
</a>
