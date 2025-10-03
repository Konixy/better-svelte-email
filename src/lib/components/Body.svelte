<script>
	import { styleToString } from '$lib/utils/index.js';

	let { styleString = '', children, ...restProps } = $props();
</script>

<body {...restProps} style={styleString}>
	{@render children?.()}
</body>
