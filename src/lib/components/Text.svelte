<script>
	import { styleToString } from '$lib/utils/index.js';

	let { as = 'p', styleString = '', children, ...restProps } = $props();

	// Default email-safe text styles
	const baseStyle = styleToString({
		fontSize: '14px',
		lineHeight: '24px',
		margin: '16px 0'
	});
	const finalStyle = baseStyle + (styleString ? ';' + styleString : '');
</script>

<svelte:element this={as} {...restProps} style={finalStyle}>
	{@render children?.()}
</svelte:element>
