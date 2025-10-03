<script>
	import { styleToString } from '$lib/utils/index.js';

	let { styleString = '', children, ...restProps } = $props();

	// Default max-width for email containers (600px = 37.5em)
	const baseStyle = styleToString({ maxWidth: '37.5em' });
	const finalStyle = baseStyle + (styleString ? ';' + styleString : '');
</script>

<table
	align="center"
	width="100%"
	role="presentation"
	cellspacing="0"
	cellpadding="0"
	border="0"
	{...restProps}
	style={finalStyle}
>
	<tbody>
		<tr style="width: 100%;">
			<td>
				{@render children?.()}
			</td>
		</tr>
	</tbody>
</table>
