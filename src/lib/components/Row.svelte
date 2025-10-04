<script lang="ts">
	import { styleToString } from '$lib/utils/index.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		style,
		children,
		...restProps
	}: {
		style?: string;
		children: any;
	} & HTMLAttributes<HTMLTableElement> = $props();
</script>

<table
	{style}
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
