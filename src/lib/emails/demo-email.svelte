<script lang="ts">
	import {
		Body,
		Button,
		Column,
		Container,
		Head,
		Heading,
		Hr,
		Html,
		Link,
		Preview,
		Row,
		Section,
		Text
	} from '$lib/components/index.js';

	type Feature = {
		title: string;
		description: string;
	};

	interface Props {
		name?: string;
		preview?: string;
	}

	let { name = 'there' }: Props = $props();

	const features: Feature[] = [
		{
			title: 'Stable & Future-Proof',
			description: "Built on Svelte's official preprocessor API for long-term reliability."
		},
		{
			title: 'Tailwind CSS Support',
			description: 'Write Tailwind classes, get inline styles automatically for email clients.'
		},
		{
			title: 'Visual Email Preview',
			description: 'Develop and test your emails with a built-in preview component.'
		},
		{
			title: 'TypeScript First',
			description: 'Fully typed with comprehensive type definitions out of the box.'
		}
	];
</script>

<Html>
	<Head />
	<Body class="bg-stone-50 px-4 py-10 font-sans text-gray-800">
		<Preview preview="Demo Email - better-svelte-email" />

		<Container class="w-full max-w-[520px] rounded-2xl border border-stone-200 bg-white px-6 py-10">
			<Section>
				<Text class="text-brand m-0 text-xs tracking-widest uppercase">Better Svelte Email</Text>
				<Heading as="h1" class="mt-3 mb-5 text-3xl leading-8 font-semibold text-slate-900">
					Welcome, {name}! 👋
				</Heading>
				<Text class="m-0 text-sm leading-6 text-gray-600">
					Create beautiful, responsive emails using Svelte components and Tailwind CSS. Better
					Svelte Email transforms your familiar workflow into email-safe HTML with full Tailwind
					support.
				</Text>
			</Section>

			<Section class="mt-7">
				<Heading as="h2" class="m-0 mb-4 text-xl leading-7 font-semibold text-gray-900">
					Why Better Svelte Email?
				</Heading>
				{#each features as feature, index}
					<Row>
						<Column valign="top" class="w-7">
							<Text as="span" class="text-brand m-0 text-lg leading-6">✓</Text>
						</Column>
						<Column align="left" class={index < features.length - 1 ? 'pb-4' : undefined}>
							<Heading as="h3" class="m-0 text-base leading-snug font-semibold text-gray-900">
								{feature.title}
							</Heading>
							<Text class="mt-1.5 mb-0 text-xs leading-5 text-gray-600">
								{feature.description}
							</Text>
						</Column>
					</Row>
				{/each}
			</Section>

			<Section class="mt-8 mb-6 text-center">
				<Button
					href="https://better-svelte-email.konixy.fr/docs/getting-started"
					pX={24}
					pY={14}
					class="bg-brand rounded-lg text-center text-sm font-semibold text-white no-underline"
				>
					Get Started
				</Button>
			</Section>

			<Hr class="mx-0 my-6" />

			<Section class="mt-8 text-center">
				<Text class="m-0 text-xs leading-5 text-gray-600">
					Check out the
					<Link
						href="https://better-svelte-email.konixy.fr/docs"
						class="text-brand font-semibold no-underline"
					>
						documentation
					</Link>
					to learn more,<br />or star on
					<Link
						href="https://github.com/Konixy/better-svelte-email"
						class="text-brand font-semibold no-underline"
					>
						GitHub
					</Link>
					to support the project.
				</Text>
				<Text class="mt-4 mb-0 text-xs leading-5 text-gray-400">
					Built with ❤️ by <Link href="https://github.com/Konixy" class="text-gray-500 no-underline"
						>Konixy</Link
					>
				</Text>
			</Section>
		</Container>
	</Body>
</Html>
