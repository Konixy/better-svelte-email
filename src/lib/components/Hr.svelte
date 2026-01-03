<script lang="ts">
	import { combineStyles, styleToString } from '$lib/utils/index.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let { style, ...restProps }: HTMLAttributes<HTMLHRElement> = $props();

	const defaultStyles = styleToString({
		width: '100%',
		border: 'none',
		borderTopWidth: '1px',
		borderTopStyle: 'solid',
		borderColor: '#eaeaea'
	});
</script>

<hr style={combineStyles(defaultStyles, style)} {...restProps} />
