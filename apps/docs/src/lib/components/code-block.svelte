<script lang="ts">
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import CopyIcon from 'phosphor-svelte/lib/CopyIcon';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { Snippet } from 'svelte';

	interface Props {
		code: string;
		children?: Snippet;
		lang?: string;
		meta?: string;
		title?: string;
		caption?: string;
	}

	let {
		code,
		children,
		lang: _lang,
		meta: _meta,
		title: _title,
		caption: _caption
	}: Props = $props();

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

<div
	class="group relative [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-border [&_pre]:bg-background [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre_code]:border-none [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-muted-foreground"
>
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
