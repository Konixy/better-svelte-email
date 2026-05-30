<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { Button } from '$lib/components/ui/button';
	import type { Snippet } from 'svelte';

	interface Props {
		code: string;
		children?: Snippet;
	}

	let { code, children }: Props = $props();

	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			clearTimeout(resetTimer);
			resetTimer = setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// Clipboard access may be unavailable.
		}
	}
</script>

<div class="code-block group relative">
	<Button
		variant="outline"
		size="icon-sm"
		class="absolute top-2 right-2 z-10 border-border/60 bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
		onclick={copy}
		aria-label={copied ? 'Copied' : 'Copy code'}
		type="button"
	>
		{#if copied}
			<CheckIcon class="size-3.5" />
		{:else}
			<CopyIcon class="size-3.5" />
		{/if}
	</Button>
	{@render children?.()}
</div>
