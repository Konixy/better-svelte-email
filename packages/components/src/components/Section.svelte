<script lang="ts">
	import type { HTMLTableAttributes } from 'svelte/elements';

	let {
		children,
		...restProps
	}: {
		children: any;
	} & HTMLTableAttributes = $props();
</script>

<table
	align="center"
	width="100%"
	border="0"
	cellspacing="0"
	cellpadding="0"
	role="presentation"
	{...restProps}
>
	<tbody>
		<tr>
			<td>
				{@render children?.()}
			</td>
		</tr>
	</tbody>
</table>
