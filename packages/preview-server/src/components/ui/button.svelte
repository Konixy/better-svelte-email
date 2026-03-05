<script lang="ts">
	import { cn } from '../../utils.js';

	let { href, class: className, ...restProps } = $props();

	const buttonStyles = cva;
</script>

{#if href}
	<a class={cn()} {href} {...restProps}></a>
{:else}{/if}
