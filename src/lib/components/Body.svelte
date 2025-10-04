<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, style, ...restProps }: { children?: any } & HTMLAttributes<HTMLBodyElement> =
		$props();
</script>

<body {...restProps}>
	<table align="center" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
		<tbody>
			<tr>
				<td {style}>
					{@render children?.()}
				</td>
			</tr>
		</tbody>
	</table>
</body>
