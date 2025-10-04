<script lang="ts">
	import { styleToString } from '$lib/utils/index.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		style,
		children,
		...restProps
	}: {
		style?: string;
		children?: any;
		colspan?: number;
		align?: 'left' | 'center' | 'right' | 'justify' | 'char';
	} & HTMLAttributes<HTMLTableCellElement> = $props();
</script>

<td style={styleToString({ width: '100%' }) + (style ? ';' + style : '')} {...restProps}>
	{@render children?.()}
</td>
