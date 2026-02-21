<script lang="ts">
	import { combineStyles, styleToString } from '../utils/index.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		as = 'p',
		style,
		children,
		...restProps
	}: {
		as?: string;
		children: any;
	} & HTMLAttributes<HTMLParagraphElement> = $props();

	// Default email-safe text styles
	const defaultStyles = styleToString({
		fontSize: '14px',
		lineHeight: '24px',
		margin: '16px 0'
	});
</script>

<svelte:element this={as} style={combineStyles(defaultStyles, style)} {...restProps}>
	{@render children?.()}
</svelte:element>
