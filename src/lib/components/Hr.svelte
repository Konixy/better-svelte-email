<script lang="ts">
	import { styleToString } from '$lib/utils/index.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let props: HTMLAttributes<HTMLHRElement> = $props();

	const style = styleToString({
		width: '100%',
		border: 'none',
		borderTop: '1px solid #eaeaea'
	});
</script>

<hr {...props} style={style + (props.style ? ';' + props.style : '')} />
