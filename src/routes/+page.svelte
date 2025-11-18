<script lang="ts">
	import { toggleMode, mode } from 'mode-watcher';

	let { data } = $props();
</script>

<svelte:head>
	{#if mode.current === 'dark'}
		<meta name="theme-color" content="#18181b" />
	{:else}
		<meta name="theme-color" content="#fafaf9" />
	{/if}
</svelte:head>

<div
	class="relative min-h-screen bg-linear-to-br from-background to-orange-50 dark:to-orange-950/20"
>
	<!-- Hero Section -->
	<div class="hero-container relative h-screen overflow-hidden">
		<div class="bg-grid absolute inset-0 mask-[linear-gradient(0deg,white,transparent)]"></div>

		<div class="relative mx-auto flex h-full max-w-7xl items-center justify-center px-6 lg:px-8">
			<div class="mx-auto max-w-4xl text-center">
				<img
					src="/favicon.svg"
					alt="Better Svelte Email"
					class="mx-auto mb-6 size-24 motion-preset-fade drop-shadow-xl drop-shadow-stone-900/5 sm:size-28"
				/>
				<h1
					class="mb-6 motion-preset-slide-up-md gap-4 text-center text-5xl font-bold tracking-tight text-foreground sm:flex-row sm:text-6xl"
				>
					Better
					<span class="italic"> Emails </span>, for
					<span class="underline decoration-svelte decoration-wavy decoration-[3px]"> Svelte </span>
				</h1>

				<p
					class="mb-20 motion-preset-slide-up-md text-base leading-8 text-muted-foreground motion-delay-200 sm:text-xl"
				>
					Don't reinvent the wheel, use email-ready components with first-class tailwindcss support.
				</p>

				<div class="flex flex-wrap items-center justify-center gap-4">
					<a
						href="/docs"
						class="group relative inline-flex motion-preset-slide-up-sm items-center gap-2 rounded-xl bg-svelte/90 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-svelte/50 transition-[box-shadow,background-color] motion-delay-300 hover:bg-svelte hover:shadow-xl dark:shadow-svelte/20"
					>
						Get Started
						<svg
							class="h-4 w-4 transition-transform group-hover:translate-x-1"
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
					</a>

					<a
						href="/preview"
						class="motion-preset-slide-up-sm rounded-xl border border-border bg-muted px-8 py-3 text-sm font-semibold text-muted-foreground shadow-lg transition-[border-color,color,background-color,box-shadow] motion-delay-400 hover:border-border hover:text-foreground hover:shadow-xl dark:shadow-stone-800/50 dark:hover:bg-stone-700/60 dark:hover:text-stone-300"
					>
						Try the Preview
					</a>
				</div>
				<div class="mt-10 flex items-center justify-center gap-2">
					<a
						href="https://github.com/Konixy/better-svelte-email"
						target="_blank"
						rel="noopener noreferrer"
						class="github-button group inline-flex motion-preset-fade items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-[background-color,color] motion-delay-500 hover:bg-stone-600/10 hover:text-stone-800 dark:hover:bg-stone-700/60 dark:hover:text-stone-300"
					>
						<svg class="size-4" fill="currentColor" viewBox="0 0 24 24">
							<path
								fill-rule="evenodd"
								d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
								clip-rule="evenodd"
							/>
						</svg>
						<svg
							class="github-star-icon size-3 fill-transparent transition-[fill,stroke] group-hover:fill-yellow-500 group-hover:stroke-yellow-500"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path
								d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
							/></svg
						>
						{data.githubStars}
					</a>
					<button
						class="motion-preset-fade cursor-pointer rounded-xl p-2 text-sm font-semibold text-muted-foreground transition-[background-color,color] motion-delay-500 hover:bg-stone-600/10 hover:text-stone-800 dark:hover:bg-stone-700/60 dark:hover:text-stone-300"
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
			</div>
		</div>
	</div>
</div>

<style>
	.bg-grid {
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='oklch(70.9% 0.01 56.259 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
	}

	:global(html.dark) .bg-grid {
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='oklch(26.8% 0.007 34.298 / 0.3)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
	}

	.github-button:hover .github-star-icon {
		animation: pulse 0.4s ease-in-out 1;
	}
	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.5);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
