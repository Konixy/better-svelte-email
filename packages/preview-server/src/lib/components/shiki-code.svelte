<script lang="ts">
	import { createHighlighter } from 'shiki';
	import { useTheme } from 'svelte-themes';
	import { onMount } from 'svelte';

	type Props = {
		code: string;
		lang: 'html' | 'svelte';
	};

	let { code, lang }: Props = $props();

	const themeStore = useTheme();
	let isDark = $derived((themeStore.resolvedTheme ?? 'light') === 'dark');
	let highlightedHtml = $state<string | null>(null);
	let highlighter = $state<Awaited<ReturnType<typeof createHighlighter>> | null>(null);

	onMount(async () => {
		highlighter = await createHighlighter({
			themes: ['github-dark', 'github-light'],
			langs: ['html', 'svelte']
		});
	});

	$effect(() => {
		const h = highlighter;
		const c = code;
		const l = lang;
		const t = isDark ? 'github-dark' : 'github-light';

		if (!h) {
			highlightedHtml = null;
			return;
		}

		if (!c) {
			highlightedHtml = null;
			return;
		}

		try {
			highlightedHtml = h.codeToHtml(c, { lang: l, theme: t });
		} catch {
			highlightedHtml = h.codeToHtml(c, { lang: 'text', theme: t });
		}
	});
</script>

{#if highlightedHtml}
	<div
		class="shiki-code [&_code]:bg-transparent! [&_pre]:m-0! [&_pre]:rounded-none! [&_pre]:bg-transparent! [&_pre]:p-4! [&_pre]:text-xs [&_pre]:leading-relaxed"
	>
		{@html highlightedHtml}
	</div>
{:else}
	<pre class="m-0 overflow-auto p-4 text-xs leading-relaxed"><code>{code || 'Loading...'}</code
		></pre>
{/if}
