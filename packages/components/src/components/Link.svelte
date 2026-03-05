<script lang="ts">
	import { combineStyles, styleToString } from '../utils/index.js';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

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
	} & HTMLAnchorAttributes = $props();

	const defaultStyles = styleToString({ textDecorationLine: 'none', color: '#067df7' });
</script>

<a {href} {target} {...restProps} style={combineStyles(defaultStyles, style)}>
	{@render children?.()}
</a>
