<script lang="ts">
	import { onMount } from 'svelte';
	import { codeToHtml } from 'shiki';
	import { gsap } from 'gsap';

	const features = [
		{
			title: 'Stable & Future-Proof',
			description: "Built on Svelte's official preprocessor API for long-term reliability",
			icon: '🛡️'
		},
		{
			title: 'Tailwind CSS Support',
			description: 'Write Tailwind classes, get inline styles automatically for email clients',
			icon: '🎨'
		},
		{
			title: 'Visual Email Preview',
			description: 'Develop and test your emails with a built-in preview component',
			icon: '👀'
		},
		{
			title: 'TypeScript First',
			description: 'Fully typed with comprehensive type definitions out of the box',
			icon: '📘'
		}
	];

	let codeExample = $state<string>('');

	onMount(async () => {
		const { ScrollTrigger } = await import('gsap/ScrollTrigger');

		gsap.registerPlugin(ScrollTrigger);

		const heroTimeline = gsap.timeline();

		heroTimeline
			.from('.hero-title', {
				opacity: 0,
				y: 30,
				duration: 0.9,
				ease: 'power3.out'
			})
			.from(
				'.hero-description',
				{
					opacity: 0,
					y: 20,
					duration: 0.7,
					ease: 'power3.out'
				},
				'-=0.4'
			)
			.from(
				'.hero-cta > a',
				{
					opacity: 0,
					y: 20,
					duration: 0.6,
					stagger: 0.1,
					ease: 'power2.out'
				},
				'-=0.3'
			)
			.from('.github-button', {
				opacity: 0,
				y: 5,
				duration: 1,
				ease: 'power3.out'
			});

		// Subtle parallax on hero background
		gsap.to('.bg-grid-stone-100', {
			y: 50,
			ease: 'none',
			scrollTrigger: {
				trigger: '.hero-container',
				start: 'top top',
				end: 'bottom top',
				scrub: 1
			}
		});

		// Code preview section
		gsap.from('.code-preview-text', {
			opacity: 0,
			x: -30,
			duration: 0.8,
			ease: 'power3.out',
			scrollTrigger: {
				trigger: '.code-preview-section',
				start: 'top 70%'
			}
		});

		gsap.from('.code-preview-editor', {
			opacity: 0,
			x: 30,
			duration: 0.8,
			ease: 'power3.out',
			scrollTrigger: {
				trigger: '.code-preview-section',
				start: 'top 70%'
			}
		});

		// Animate feature cards with stagger
		gsap.from('.feature-card', {
			opacity: 0,
			y: 30,
			duration: 0.7,
			stagger: 0.1,
			ease: 'power3.out',
			scrollTrigger: {
				trigger: '.features-grid',
				start: 'top 75%'
			}
		});

		codeExample = await codeToHtml(
			`<script>
  import {
    Html,
    Head,
    Body,
    Container,
    Text,
    Button 
  } from 'better-svelte-email';

  let { name = 'User' } = $props();
<\/script>

<Html>
  <Head />
  <Body class="bg-gray-100">
    <Preview preview="Welcome Email" />
    <Container class="mx-auto p-8">
      <Text class="mb-4 text-2xl font-bold">
        Welcome, {name}!
      </Text>
      
      <Button
        href="https://example.com"
        class="rounded bg-orange-600 px-6 py-3 
          text-white sm:bg-green-600"
      >
        Get Started
      </Button>
    </Container>
  </Body>
</Html>`,
			{
				lang: 'svelte',
				theme: 'vesper'
			}
		);
	});
</script>

<svelte:head>
	<meta name="theme-color" content="#fafaf9" />
</svelte:head>

<div class="relative min-h-screen bg-linear-to-br from-stone-50 to-orange-50">
	<!-- Hero Section -->
	<div class="hero-container relative h-screen overflow-hidden">
		<div
			class="bg-grid-stone-100 absolute inset-0 mask-[linear-gradient(0deg,white,transparent)]"
		></div>

		<div class="relative mx-auto flex h-full max-w-7xl items-center justify-center px-6 lg:px-8">
			<div class="mx-auto max-w-4xl text-center">
				<h1
					class="hero-title mb-6 flex flex-row items-center justify-center gap-4 text-center text-5xl font-bold tracking-tight text-stone-900 sm:text-6xl"
				>
					Better
					<span class="flex flex-row">
						<span class="flex items-center gap-2 font-bold text-blue-600">
							<svg
								class="size-14 translate-y-0.5"
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
								<rect x="2" y="4" width="20" height="16" rx="2" />
							</svg>
							Emails
						</span>, for
					</span>
					<span class="flex flex-row items-center gap-1 text-svelte"
						><svg
							class="w-12"
							xmlns="http://www.w3.org/2000/svg"
							width="107"
							height="128"
							viewBox="0 0 107 128"
							><path
								d="M94.1566,22.8189c-10.4-14.8851-30.94-19.2971-45.7914-9.8348L22.2825,29.6078A29.9234,29.9234,0,0,0,8.7639,49.6506a31.5136,31.5136,0,0,0,3.1076,20.2318A30.0061,30.0061,0,0,0,7.3953,81.0653a31.8886,31.8886,0,0,0,5.4473,24.1157c10.4022,14.8865,30.9423,19.2966,45.7914,9.8348L84.7167,98.3921A29.9177,29.9177,0,0,0,98.2353,78.3493,31.5263,31.5263,0,0,0,95.13,58.117a30,30,0,0,0,4.4743-11.1824,31.88,31.88,0,0,0-5.4473-24.1157"
								style="fill:#ff3e00"
							/><path
								d="M45.8171,106.5815A20.7182,20.7182,0,0,1,23.58,98.3389a19.1739,19.1739,0,0,1-3.2766-14.5025,18.1886,18.1886,0,0,1,.6233-2.4357l.4912-1.4978,1.3363.9815a33.6443,33.6443,0,0,0,10.203,5.0978l.9694.2941-.0893.9675a5.8474,5.8474,0,0,0,1.052,3.8781,6.2389,6.2389,0,0,0,6.6952,2.485,5.7449,5.7449,0,0,0,1.6021-.7041L69.27,76.281a5.4306,5.4306,0,0,0,2.4506-3.631,5.7948,5.7948,0,0,0-.9875-4.3712,6.2436,6.2436,0,0,0-6.6978-2.4864,5.7427,5.7427,0,0,0-1.6.7036l-9.9532,6.3449a19.0329,19.0329,0,0,1-5.2965,2.3259,20.7181,20.7181,0,0,1-22.2368-8.2427,19.1725,19.1725,0,0,1-3.2766-14.5024,17.9885,17.9885,0,0,1,8.13-12.0513L55.8833,23.7472a19.0038,19.0038,0,0,1,5.3-2.3287A20.7182,20.7182,0,0,1,83.42,29.6611a19.1739,19.1739,0,0,1,3.2766,14.5025,18.4,18.4,0,0,1-.6233,2.4357l-.4912,1.4978-1.3356-.98a33.6175,33.6175,0,0,0-10.2037-5.1l-.9694-.2942.0893-.9675a5.8588,5.8588,0,0,0-1.052-3.878,6.2389,6.2389,0,0,0-6.6952-2.485,5.7449,5.7449,0,0,0-1.6021.7041L37.73,51.719a5.4218,5.4218,0,0,0-2.4487,3.63,5.7862,5.7862,0,0,0,.9856,4.3717,6.2437,6.2437,0,0,0,6.6978,2.4864,5.7652,5.7652,0,0,0,1.602-.7041l9.9519-6.3425a18.978,18.978,0,0,1,5.2959-2.3278,20.7181,20.7181,0,0,1,22.2368,8.2427,19.1725,19.1725,0,0,1,3.2766,14.5024,17.9977,17.9977,0,0,1-8.13,12.0532L51.1167,104.2528a19.0038,19.0038,0,0,1-5.3,2.3287"
								style="fill:#fff"
							/></svg
						> Svelte
					</span>
				</h1>

				<p class="hero-description mb-20 text-base leading-8 text-stone-600 sm:text-xl">
					Don't reinvent the wheel, use email-ready components with first-class tailwindcss support.
				</p>

				<div class="hero-cta flex flex-wrap items-center justify-center gap-4">
					<a
						href="/docs"
						class="group relative inline-flex items-center gap-2 rounded-xl bg-svelte/90 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-svelte/50 transition-[box-shadow,background-color] hover:bg-svelte hover:shadow-xl hover:shadow-svelte/50"
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
						class="hover:bg-stone-150 rounded-xl border border-stone-200 bg-stone-50 px-8 py-3 text-sm font-semibold text-stone-600 shadow-lg transition-[border-color,color,box-shadow] hover:border-stone-300 hover:text-stone-900 hover:shadow-xl"
					>
						Try the Preview
					</a>
				</div>
				<a
					href="https://github.com/Konixy/better-svelte-email"
					target="_blank"
					rel="noopener noreferrer"
					class="github-button group mt-10 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition-colors hover:text-stone-800"
				>
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
						<path
							fill-rule="evenodd"
							d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
							clip-rule="evenodd"
						/>
					</svg>
					Give it a star
				</a>
			</div>
		</div>
	</div>

	<!-- Code Preview Section -->
	<div class="code-preview-section relative mx-auto max-w-7xl px-6 pb-24 lg:px-8">
		<div class="grid gap-8 lg:grid-cols-2 lg:gap-16">
			<div class="code-preview-text flex flex-col justify-center">
				<h2 class="mb-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
					Write emails like components
				</h2>
				<p class="mb-6 text-lg text-stone-600">
					Use familiar Svelte syntax and Tailwind classes. The preprocessor handles all class
					transformations at build time.
				</p>
				<div class="space-y-4">
					<div class="flex items-start gap-3">
						<div
							class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-200 text-green-700"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<div>
							<h3 class="font-semibold text-stone-900">Tailwind transforms to inline styles</h3>
							<p class="text-sm text-stone-600">Every Tailwind class is automatically converted</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div
							class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-200 text-green-700"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<div>
							<h3 class="font-semibold text-stone-900">Responsive breakpoints</h3>
							<p class="text-sm text-stone-600">sm:, md:, lg: breakpoints work out of the box</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div
							class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-200 text-green-700"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<div>
							<h3 class="font-semibold text-stone-900">Custom configurations</h3>
							<p class="text-sm text-stone-600">Use your own Tailwind config and theme</p>
						</div>
					</div>
				</div>
			</div>

			<div class="code-preview-editor relative">
				<div
					class="relative overflow-hidden rounded-2xl border bg-[#101010] shadow-2xl shadow-svelte/30"
				>
					<div class="flex items-center gap-1.5 px-4 pt-2">
						<div class="size-2.5 rounded-full bg-red-500"></div>
						<div class="size-2.5 rounded-full bg-yellow-500"></div>
						<div class="size-2.5 rounded-full bg-green-500"></div>
						<span class="ml-1 text-xs text-white/40">welcome.svelte</span>
					</div>
					<div class="px-4 pt-2 pb-4 text-xs leading-relaxed *:outline-none">
						{@html codeExample}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Features Grid -->
	<div class="mx-auto max-w-7xl px-6 py-24 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
				Everything you need for email development
			</h2>
			<p class="mt-4 text-lg text-stone-600">
				Built from the ground up with developer experience and reliability in mind
			</p>
		</div>

		<div class="features-grid mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
			{#each features as feature}
				<div class="feature-card group relative">
					<div
						class="relative h-full rounded-2xl border border-stone-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-svelte/30 hover:shadow-xl hover:shadow-svelte/10"
					>
						<div class="mb-4 text-4xl">{feature.icon}</div>
						<h3 class="mb-2 text-xl font-semibold text-stone-900">{feature.title}</h3>
						<p class="text-stone-600">{feature.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Footer -->
	<footer class="mx-auto max-w-7xl px-6 pt-24 pb-16 lg:px-8">
		<div class="pt-8 text-center">
			<p class="text-sm font-semibold text-stone-600">
				Built with ❤️ by <a
					href="https://github.com/Konixy"
					class="font-medium text-orange-600 hover:text-orange-700"
					target="_blank"
					rel="noopener noreferrer">Konixy</a
				>
			</p>
			<p class="mt-2 text-sm tracking-wide text-stone-500">MIT License · Open Source</p>
		</div>
	</footer>
</div>

<style>
	@keyframes ping {
		75%,
		100% {
			transform: scale(2);
			opacity: 0;
		}
	}

	.bg-grid-stone-100 {
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(148 163 184 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
	}
</style>
