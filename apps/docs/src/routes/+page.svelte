<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Github from '$lib/components/github.svelte';
	import { MoonIcon, SunIcon } from '@lucide/svelte';

	let { data } = $props();
</script>

<div class="relative mr-2 flex min-h-dvh flex-col">
	<div
		class="absolute inset-0 -z-10 h-screen w-screen bg-radial from-background to-transparent"
	></div>
	<div class="bg-dots absolute inset-0 -z-20"></div>

	<!-- Navigation -->
	<header
		class="sticky top-0 z-50 mx-auto flex w-full max-w-6xl shrink-0 flex-col items-center justify-between gap-4 px-6 py-3 sm:h-14 sm:flex-row"
	>
		<a href="/" class="flex items-center gap-2.5">
			<img src="/favicon.svg" alt="" class="size-5" />
			<span class="font-mono text-sm font-medium tracking-tight text-foreground">
				Better Svelte Email
			</span>
		</a>

		<nav class="flex items-center gap-0.5">
			<Button variant="ghost" size="sm" href="/docs" class="font-mono text-xs">Docs</Button>
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

	<!-- Hero -->
	<div class="flex flex-1 items-center justify-center overflow-hidden">
		<div class="relative z-10 mx-auto max-w-3xl px-6 text-center">
			<img
				src="/favicon.svg"
				alt="Better Svelte Email"
				class="mx-auto mb-8 size-24 motion-preset-fade drop-shadow-lg motion-delay-150"
			/>

			<h1
				class="mb-6 motion-preset-slide-up-md text-5xl leading-[1.08] font-bold tracking-tight text-foreground sm:text-7xl"
			>
				Better
				<span class="italic">Emails</span>,
				<br class="hidden sm:block" />
				for
				<span class="underline decoration-svelte decoration-[5px] underline-offset-[6px]">
					Svelte
				</span>
			</h1>

			<p
				class="mx-auto mb-14 max-w-lg motion-preset-slide-up-md font-mono text-sm leading-relaxed text-muted-foreground motion-delay-200 sm:text-[15px]"
			>
				Don't reinvent the wheel. Email-ready components with first-class Tailwind CSS support.
			</p>

			<div
				class="flex motion-preset-slide-up-sm flex-wrap items-center justify-center gap-3 motion-delay-300"
			>
				<Button href="/docs" class="group gap-2 font-mono text-sm">
					Get Started
					<svg
						class="size-3.5 transition-transform group-hover:translate-x-0.5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</Button>
				<Button variant="outline" href="/preview" class="font-mono text-sm">Try the Preview</Button>
			</div>

			<div class="mt-10 flex motion-preset-fade items-center justify-center motion-delay-500">
				<a
					href="https://github.com/Konixy/better-svelte-email"
					target="_blank"
					rel="noopener noreferrer"
					class="github-link group inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
				>
					<Github class="size-3.5" />
					<svg
						class="github-star size-3 fill-transparent stroke-current transition-[fill,stroke] group-hover:fill-yellow-500 group-hover:stroke-yellow-500"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
						/>
					</svg>
					{data.githubStars}
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	.github-link:hover .github-star {
		animation: star-pulse 0.4s ease-in-out 1;
	}
	@keyframes star-pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.4);
		}
		100% {
			transform: scale(1);
		}
	}

	.bg-dots {
		background-image: radial-gradient(var(--border) 1px, transparent 1px);
		background-size: 16px 16px;
	}
</style>
