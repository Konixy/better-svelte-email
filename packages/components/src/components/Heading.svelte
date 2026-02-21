<script lang="ts">
	import { combineStyles, styleToString, withMargin } from '../utils/index.js';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = HTMLAttributes<HTMLHeadingElement> & {
		children: any;
		as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
		m?: string;
		mx?: string;
		my?: string;
		mt?: string;
		mr?: string;
		mb?: string;
		ml?: string;
	};

	let { style, as, children, ...restProps }: Props = $props();

	const defaultStyles = styleToString({
		...withMargin({
			m: restProps.m,
			mx: restProps.mx,
			my: restProps.my,
			mt: restProps.mt,
			mr: restProps.mr,
			mb: restProps.mb,
			ml: restProps.ml
		})
	});
</script>

<svelte:element this={as} style={combineStyles(defaultStyles, style)} {...restProps}>
	{@render children?.()}
</svelte:element>
