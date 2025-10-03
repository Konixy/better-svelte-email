<script>
	let { styleString = '', children, ...restProps } = $props();
</script>

<table
	width="100%"
	role="presentation"
	cellspacing="0"
	cellpadding="0"
	border="0"
	{...restProps}
	style={styleString}
>
	<tbody>
		<tr>
			<td>
				{@render children?.()}
			</td>
		</tr>
	</tbody>
</table>
