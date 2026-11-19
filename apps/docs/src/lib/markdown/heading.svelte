<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		level,
		id,
		children
	}: {
		level: 1 | 2 | 3 | 4 | 5 | 6;
		id?: string;
		children?: Snippet;
	} = $props();

	const tags = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5', 6: 'h6' } as const;
	const classes = {
		1: 'mb-6 text-4xl leading-tight font-bold',
		2: 'mt-12 border-b border-border pb-3 text-2xl font-semibold',
		3: 'mt-8 text-lg font-semibold',
		4: '',
		5: '',
		6: ''
	} as const;

	let tag = $derived(tags[level]);
	let className = $derived(classes[level]);
</script>

<svelte:element
	this={tag}
	{id}
	class="group/heading scroll-mt-26 tracking-tight text-foreground {className}"
>
	{#if id}
		<a
			href="#{id}"
			class="relative before:absolute before:left-[-1em] before:font-sans before:text-svelte before:opacity-0 before:transition-opacity before:duration-200 before:ease-in-out before:content-['#'] group-hover/heading:before:opacity-100"
			title="Link to this heading"
			aria-hidden="true"
			tabindex="-1"
		></a>
	{/if}
	{@render children?.()}
</svelte:element>
