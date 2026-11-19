<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '#lib/components/ui/button/index.js';
	import {
		Select as SelectRoot,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import Github from '#lib/components/github.svelte';
	import MoonIcon from 'phosphor-svelte/lib/MoonIcon';
	import SunIcon from 'phosphor-svelte/lib/SunIcon';
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

	const slugPairs: [string, string][] = [
		['getting-started-v1', 'getting-started'],
		['migrating-to-v1', 'migrating-to-v2'],
		['render-v1', 'render'],
		['components-v1', 'components'],
		['email-preview-v1', 'email-dev-server']
	];

	const v2Slugs = new Set(slugPairs.map(([, b]) => b));

	const v1NavItems = [
		{ title: 'Getting started', slug: 'getting-started-v1' },
		{ title: 'Migrating to v1', slug: 'migrating-to-v1' },
		{ title: 'Renderer API', slug: 'render-v1' },
		{ title: 'Components', slug: 'components-v1' },
		{ title: 'Email Preview', slug: 'email-preview-v1' }
	] as const;

	const v2NavItems = [
		{ title: 'Getting started', slug: 'getting-started' },
		{ title: 'Migrating to v2', slug: 'migrating-to-v2' },
		{ title: 'Renderer API', slug: 'render' },
		{ title: 'Components', slug: 'components' },
		{ title: 'Email dev server', slug: 'email-dev-server' }
	] as const;

	function getDocSlug(pathname: string): string | null {
		const match = /^\/docs\/([^/]+)\/?$/.exec(pathname);
		return match?.[1] ?? null;
	}

	let docVersion = $derived.by((): 'v1' | 'v2' => {
		const slug = getDocSlug(page.url.pathname);
		if (slug && v2Slugs.has(slug)) return 'v2';
		return 'v1';
	});

	let navItems = $derived(docVersion === 'v2' ? v2NavItems : v1NavItems);

	function counterpartSlug(slug: string, target: 'v1' | 'v2'): string {
		for (const [v1Slug, v2Slug] of slugPairs) {
			if (v1Slug === slug) return target === 'v2' ? v2Slug : v1Slug;
			if (v2Slug === slug) return target === 'v1' ? v1Slug : v2Slug;
		}
		return target === 'v2' ? 'getting-started' : 'getting-started-v1';
	}

	function handleDocVersionChange(next: string) {
		if (next !== 'v1' && next !== 'v2') return;
		if (next === docVersion) return;
		const slug = getDocSlug(page.url.pathname) ?? 'getting-started';
		const targetSlug = counterpartSlug(slug, next);
		void goto(`/docs/${targetSlug}`);
	}
</script>

<svelte:head>
	<title>Docs · Better Svelte Email</title>
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<!-- Top bar -->
	<header
		class="sticky top-0 z-50 mx-auto flex w-full max-w-6xl shrink-0 flex-col items-center justify-between gap-4 border-b border-solid bg-background/50 px-6 py-3 backdrop-blur-lg not-lg:transition-colors sm:h-14 sm:flex-row {scrollY >
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
			class="flex flex-col gap-6 scroll-smooth lg:sticky lg:top-26.25 lg:max-h-[calc(100dvh-6.5rem-1px)] lg:self-start lg:overflow-y-auto lg:py-2"
		>
			<div class="flex flex-col gap-2 px-0">
				<div class="font-mono text-[10px] font-semibold text-muted-foreground">Version</div>
				<SelectRoot type="single" value={docVersion} onValueChange={handleDocVersionChange}>
					<SelectTrigger size="sm" class="w-full font-mono text-xs shadow-none">
						<span data-slot="select-value" class="flex w-full items-center justify-between gap-2">
							{#if docVersion === 'v2'}
								<span>v2</span>
								<span
									class="shrink-0 rounded border border-green-500/40 bg-green-500/10 px-1.5 py-px font-mono text-[10px] font-semibold tracking-wide text-green-700 uppercase dark:text-green-400"
								>
									Stable
								</span>
							{:else}
								<span>v1</span>
								<span
									class="shrink-0 rounded border border-red-500/40 bg-red-500/10 px-1.5 py-px font-mono text-[10px] font-semibold tracking-wide text-red-700 uppercase dark:text-red-400"
								>
									Legacy
								</span>
							{/if}
						</span>
					</SelectTrigger>
					<SelectContent align="start" class="min-w-(--bits-select-anchor-width) font-mono">
						<SelectItem value="v1" label="Version 1 (Legacy)">
							<span class="flex w-full items-center justify-between gap-2">
								<span>v1</span>
								<span
									class="shrink-0 rounded border border-red-500/40 bg-red-500/10 px-1.5 py-px font-mono text-[10px] font-semibold tracking-wide text-red-700 uppercase dark:text-red-400"
								>
									Legacy
								</span>
							</span>
						</SelectItem>
						<SelectItem value="v2" label="Version 2">
							<span class="flex w-full items-center justify-between gap-2">
								<span>v2</span>
								<span
									class="rounded border border-green-500/40 bg-green-500/10 px-1.5 py-px font-mono text-[10px] font-semibold tracking-wide text-green-700 uppercase dark:text-green-400"
								>
									Stable
								</span>
							</span>
						</SelectItem>
					</SelectContent>
				</SelectRoot>
			</div>

			<nav class="flex flex-col gap-1">
				{#each navItems as section (section.slug)}
					{@const isActive = page.url.pathname === `/docs/${section.slug}`}
					<a
						href={`/docs/${section.slug}`}
						class="flex items-center gap-2 border-l-2 px-3 py-1.5 font-mono text-sm transition-colors {isActive
							? 'border-svelte bg-muted/50 font-medium text-foreground'
							: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}"
					>
						<span>{section.title}</span>
					</a>
				{/each}
			</nav>
		</aside>

		<section class="min-w-0 overflow-x-visible">
			{@render children()}
		</section>
	</div>
</div>

<style>
	@reference '../../app.css';

	:global(html) {
		@apply overscroll-none;
	}
</style>
