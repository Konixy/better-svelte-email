<script lang="ts">
	import { combineStyles, styleToString } from '../utils/index.js';
	import type { HTMLTableAttributes } from 'svelte/elements';

	let {
		children,
		style,
		...restProps
	}: {
		children: any;
	} & HTMLTableAttributes = $props();

	// Default max-width for email containers (600px = 37.5em)
	const defaultStyles = styleToString({ maxWidth: '37.5em' });
</script>

<table
	align="center"
	width="100%"
	role="presentation"
	cellspacing="0"
	cellpadding="0"
	border="0"
	style={combineStyles(defaultStyles, style)}
	{...restProps}
>
	<tbody>
		<tr style="width: 100%;">
			<td>
				{@render children?.()}
			</td>
		</tr>
	</tbody>
</table>
