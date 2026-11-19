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
	let tag = $derived(tags[level]);
</script>

<svelte:element this={tag} {id}>
	{#if id}
		<a
			href="#{id}"
			class="heading-link"
			title="Link to this heading"
			aria-hidden="true"
			tabindex="-1"
		>
			<span class="icon icon-link"></span>
		</a>
	{/if}
	{@render children?.()}
</svelte:element>
