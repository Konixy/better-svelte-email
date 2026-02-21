<script lang="ts">
	import { combineStyles, styleToString } from '../utils/index.js';
	import type { HTMLImgAttributes } from 'svelte/elements';

	let {
		style,
		alt,
		src,
		width,
		height,
		...restProps
	}: HTMLImgAttributes & {
		alt: string;
		src: string;
		width: string;
		height: string;
	} = $props();

	const defaultStyles = styleToString({
		display: 'block',
		outline: 'none',
		border: 'none',
		textDecoration: 'none'
	});
</script>

<img {alt} {src} {width} {height} style={combineStyles(defaultStyles, style)} {...restProps} />
