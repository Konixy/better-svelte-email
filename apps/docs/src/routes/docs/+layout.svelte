<script>
	import { page } from '$app/state';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Github from '$lib/components/github.svelte';
	import { MoonIcon, SunIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	let scrollY = $state(0);

	onMount(() => {
		const handleScroll = () => {
			scrollY = window.scrollY;
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	const sections = [
		{ title: 'Getting started', slug: 'getting-started' },
		{ title: 'Migrating to v2', slug: 'migrating-to-v2' },
		{ title: 'Renderer API', slug: 'render' },
		{ title: 'Components', slug: 'components' },
		{ title: 'Email Preview', slug: 'email-preview' }
	];
</script>

<svelte:head>
	<title>Docs · Better Svelte Email</title>
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<!-- Top bar -->
	<header
		class="sticky top-0 z-50 mx-auto flex w-full max-w-6xl shrink-0 flex-col items-center justify-between gap-2 border-b border-solid bg-background/50 px-6 py-3 backdrop-blur-lg not-lg:transition-colors sm:h-14 sm:flex-row {scrollY >
		50
			? 'border-border lg:[border-image:linear-gradient(to_right,transparent_0%,var(--color-border)_30%,var(--color-border)_70%,transparent_100%)_1]'
			: 'border-transparent'}"
	>
		<div class="flex items-center gap-3">
			<a href="/" class="flex items-center gap-2.5">
				<img src="/favicon.svg" alt="" class="size-5" />
				<span class="font-mono text-sm font-medium tracking-tight text-foreground">
					Better Svelte Email
				</span>
			</a>
			<Separator orientation="vertical" class="h-4!" />
			<span class="font-mono text-xs text-muted-foreground">Docs</span>
		</div>

		<nav class="flex items-center gap-0.5">
			<Button variant="ghost" size="sm" href="/preview" class="font-mono text-xs">Preview</Button>
			<Separator orientation="vertical" class="mx-1.5 h-4!" />
			<Button
				variant="ghost"
				size="icon-sm"
				href="https://github.com/Konixy/better-svelte-email"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub"
			>
				<Github class="size-4" />
			</Button>
			<Button variant="ghost" size="icon-sm" onclick={toggleMode} aria-label="Toggle theme">
				<SunIcon class="hidden size-4 dark:block" />
				<MoonIcon class="block size-4 dark:hidden" />
			</Button>
		</nav>
	</header>

	<!-- Body -->
	<div
		class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 pt-12 pb-32 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 lg:px-12"
	>
		<aside
			class="flex flex-col gap-6 lg:sticky lg:top-[calc(6.5rem+1px)] lg:max-h-[calc(100dvh-6.5rem-1px)] lg:self-start lg:overflow-y-auto lg:py-2"
		>
			<nav class="flex flex-col gap-1">
				<div
					class="mb-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
				>
					Documentation
				</div>
				{#each sections as section}
					{@const isActive = page.url.pathname === `/docs/${section.slug}`}
					<a
						href={`/docs/${section.slug}`}
						class="flex items-center border-l-2 px-3 py-1.5 font-mono text-sm transition-colors {isActive
							? 'border-svelte bg-muted/50 font-medium text-foreground'
							: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}"
					>
						{section.title}
					</a>
				{/each}
			</nav>
		</aside>

		<section class="min-w-0 overflow-x-visible">
			<div class="md">
				{@render children()}
			</div>
		</section>
	</div>
</div>

<style>
	@reference '$lib/../app.css';

	:global(html) {
		@apply overscroll-none;
	}

	:global(.heading-link) {
		@apply relative;
	}

	:global(.heading-link)::before {
		content: '#';
		@apply absolute left-[-1em] font-mono text-svelte opacity-0 transition-opacity duration-200 ease-in-out;
	}

	:global(:has(.heading-link):hover > .heading-link::before) {
		@apply opacity-100;
	}

	:global(.md) {
		@apply min-w-0 space-y-6 text-secondary-foreground;
	}

	:global(.md a) {
		@apply font-medium text-svelte/80 underline decoration-svelte/20 underline-offset-2 transition-colors;
	}

	:global(.md a:hover) {
		@apply text-svelte decoration-svelte/50;
	}

	:global(.md code) {
		@apply border border-border bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground/90;
	}

	:global(.md h1) {
		@apply mb-6 text-4xl leading-tight font-bold tracking-tight text-foreground;
	}

	:global(.md h2) {
		@apply mt-12 border-b border-border pb-3 text-2xl font-semibold tracking-tight text-foreground;
	}

	:global(.md h3) {
		@apply mt-8 text-lg font-semibold tracking-tight text-foreground;
	}

	:global(.md li::marker) {
		@apply text-muted-foreground/50;
	}

	:global(.md ol) {
		@apply list-decimal space-y-2;
	}

	:global(.md p) {
		@apply leading-relaxed;
	}

	:global(.md pre) {
		@apply overflow-x-auto border border-border bg-[oklch(0.145_0_0)] p-4 font-mono text-[13px];
	}

	:global(.md pre code) {
		@apply border-none bg-transparent p-0 text-[oklch(0.65_0.01_264)];
	}

	:global(.md strong) {
		@apply font-semibold text-foreground;
	}

	:global(.md ul) {
		@apply list-disc space-y-2 pl-6;
	}

	:global(.md blockquote) {
		@apply border-l-2 border-svelte/30 bg-muted/40 px-4 py-2 text-muted-foreground;
	}
</style>
