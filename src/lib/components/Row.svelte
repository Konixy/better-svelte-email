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
	border={0}
	cellPadding={0}
	cellSpacing={0}
	role="presentation"
	{...restProps}
>
	<tbody style="width: 100%;">
		<tr style="width: 100%;">
			{@render children?.()}
		</tr>
	</tbody>
</table>
