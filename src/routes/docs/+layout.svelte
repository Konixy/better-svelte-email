<script>
	import { page } from '$app/state';
	import { toggleMode } from 'mode-watcher';

	let { children } = $props();

	const sections = [
		{ title: 'Getting started', slug: 'getting-started' },
		{ title: 'Migrating to v1', slug: 'migrating-to-v1' },
		{ title: 'Renderer API', slug: 'render' },
		{ title: 'Components', slug: 'components' },
		{ title: 'Email Preview', slug: 'email-preview' }
	];
</script>

<svelte:head>
	<title>Docs · Better Svelte Email</title>
</svelte:head>

<div
	class="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-20 lg:px-12"
>
	<aside class="flex flex-col gap-8 lg:sticky lg:top-18 lg:self-start">
		<div class="flex items-center gap-2">
			<a href="/" class="">
				<img src="/favicon.svg" alt="Better Svelte Email" class="size-6" />
			</a>
			<button
				class="cursor-pointer rounded-xl p-2 text-sm font-semibold text-muted-foreground transition-[background-color,color] hover:bg-stone-600/10 hover:text-stone-800 dark:hover:bg-stone-700/60 dark:hover:text-stone-300"
				onclick={toggleMode}
				aria-label="Toggle mode"
			>
				<svg
					class="hidden size-4 dark:block"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path
						d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
					/></svg
				>
				<svg
					class="block size-4 dark:hidden"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path
						d="m4.93 4.93 1.41 1.41"
					/><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path
						d="m6.34 17.66-1.41 1.41"
					/><path d="m19.07 4.93-1.41 1.41" /></svg
				>
			</button>
		</div>

		<nav class="flex flex-col gap-4">
			<div class="text-xs font-semibold tracking-[0.18em] text-stone-400 uppercase">Docs</div>
			<ul class="flex list-none flex-col gap-1">
				{#each sections as section}
					<li>
						<a
							href={`/docs/${section.slug}`}
							class={`block rounded-xl px-3 py-2 text-sm font-medium transition-all ${
								page.url.pathname === `/docs/${section.slug}`
									? 'bg-svelte/10 text-svelte  hover:bg-svelte/15'
									: 'text-secondary-foreground hover:bg-secondary'
							}`}
						>
							{section.title}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</aside>

	<section class="min-w-0 overflow-x-visible">
		<div class="md">
			{@render children()}
		</div>
	</section>
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
		@apply absolute left-[-1em] opacity-0 transition-opacity duration-200 ease-in-out;
	}

	:global(:has(.heading-link):hover > .heading-link::before) {
		@apply opacity-100;
	}

	:global(.md) {
		@apply min-w-0 space-y-6 text-secondary-foreground;
	}

	:global(.md a) {
		@apply font-medium text-svelte/80 transition-colors;
	}

	:global(.md a:hover) {
		@apply text-svelte;
	}

	:global(.md code) {
		@apply rounded-md bg-muted px-1.5 py-0.5 text-[13px] text-muted-foreground;
	}

	:global(.md h1) {
		@apply mb-6 text-4xl leading-tight font-semibold text-foreground;
	}

	:global(.md h2) {
		@apply mt-10 text-2xl font-semibold text-foreground;
	}

	:global(.md h3) {
		@apply mt-8 text-lg font-semibold text-foreground;
	}

	:global(.md li::marker) {
		@apply text-stone-400;
	}

	:global(.md ol) {
		@apply list-decimal space-y-2;
	}

	:global(.md p) {
		@apply leading-relaxed;
	}

	:global(.md pre) {
		@apply overflow-x-auto rounded-2xl bg-stone-900! p-4 text-[13px];
	}

	:global(.md pre code) {
		@apply bg-transparent p-0 text-stone-400;
	}

	:global(.md strong) {
		@apply text-foreground;
	}

	:global(.md ul) {
		@apply list-disc space-y-2 pl-6;
	}

	:global(.md blockquote) {
		@apply rounded-lg border border-l-4 border-secondary-foreground/10 bg-secondary/50 px-4 py-2;
	}
</style>
