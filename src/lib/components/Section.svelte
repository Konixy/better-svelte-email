<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		children,
		...restProps
	}: {
		children: any;
	} & HTMLAttributes<HTMLTableElement> = $props();
</script>

<table width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0" {...restProps}>
	<tbody>
		<tr>
			<td>
				{@render children?.()}
			</td>
		</tr>
	</tbody>
</table>
