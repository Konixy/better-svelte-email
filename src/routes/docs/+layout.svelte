<script>
	import { page } from '$app/state';

	let { children } = $props();

	const sections = [
		{ title: 'Getting started', slug: 'getting-started' },
		{ title: 'Email Preview', slug: 'email-preview' }
	];
</script>

<div
	class="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-20 lg:px-12"
>
	<aside class="flex flex-col gap-8 lg:sticky lg:top-18 lg:self-start">
		<a href="/" class="text-2xl font-bold text-svelte">Better Svelte Email</a>

		<nav class="flex flex-col gap-4">
			<div class="text-xs font-semibold tracking-[0.18em] text-zinc-400 uppercase">Docs</div>
			<ul class="flex list-none flex-col gap-1">
				{#each sections as section}
					<li>
						<a
							href={`/docs/${section.slug}`}
							class={`block rounded-xl px-3 py-2 text-sm font-medium transition-all ${
								page.url.pathname === `/docs/${section.slug}`
									? 'bg-svelte/10 text-svelte  hover:bg-svelte/15'
									: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
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
		<div
			class="min-w-0 space-y-6 text-zinc-600 [&_a]:font-medium [&_a]:text-svelte/80 [&_a:hover]:text-svelte [&_code]:rounded-md [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_h1]:mb-6 [&_h1]:text-4xl [&_h1]:leading-tight [&_h1]:font-semibold [&_h1]:text-zinc-900 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_li]:marker:text-zinc-400 [&_ol]:list-decimal [&_ol]:space-y-2 [&_p]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-zinc-950 [&_pre]:p-4 [&_pre]:text-[13px] [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:text-zinc-900 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
		>
			{@render children()}
		</div>
	</section>
</div>

<style>
	:global(html) {
		overscroll-behavior: none;
	}

	:global(.heading-link) {
		position: relative;
	}

	:global(.heading-link)::before {
		content: '#';
		opacity: 0;
		position: absolute;
		left: -1em;
		transition: opacity 0.2s ease-in-out;
	}

	:global(:has(.heading-link):hover > .heading-link::before) {
		opacity: 1;
	}
</style>
