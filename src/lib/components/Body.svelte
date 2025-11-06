<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		children,
		style,
		class: className,
		...restProps
	}: { children?: any } & HTMLAttributes<HTMLBodyElement> = $props();
</script>

<body {...restProps}>
	<table align="center" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
		<tbody>
			<tr>
				<td {style} class={className}>
					{@render children?.()}
				</td>
			</tr>
		</tbody>
	</table>
</body>
