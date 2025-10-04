<script lang="ts">
	import { styleToString } from '$lib/utils/index.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		as = 'p',
		style = '',
		children,
		...restProps
	}: {
		as?: string;
		style?: string;
		children: any;
	} & HTMLAttributes<HTMLParagraphElement> = $props();

	// Default email-safe text styles
	const baseStyle = styleToString({
		fontSize: '14px',
		lineHeight: '24px',
		margin: '16px 0'
	});
	const finalStyle = baseStyle + (style ? ';' + style : '');
</script>

<svelte:element this={as} {...restProps} style={finalStyle}>
	{@render children?.()}
</svelte:element>
