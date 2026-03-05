<script lang="ts">
	import type { HTMLHtmlAttributes } from 'svelte/elements';

	type Props = HTMLHtmlAttributes & {
		lang?: string;
		dir?: 'ltr' | 'rtl' | 'auto' | null | undefined;
		style?: string;
		children?: any;
	};

	let { lang = 'en', dir = 'ltr', children, ...restProps }: Props = $props();

	const doctype =
		'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
</script>

{@html doctype}
<html {...restProps} id="__better-svelte-email" {lang} {dir}>
	{@render children?.()}
</html>
