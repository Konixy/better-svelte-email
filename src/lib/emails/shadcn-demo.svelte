<script lang="ts">
	import {
		Html,
		Head,
		Body,
		Container,
		Section,
		Heading,
		Text,
		Button,
		Hr
	} from '$lib/components/index.js';
</script>

<Html>
	<Head />
	<Body class="bg-background font-sans">
		<Container class="mx-auto max-w-[600px] py-10">
			<!-- Hero Section -->
			<Section class="mb-8 text-center">
				<Heading as="h1" class="mb-2 text-3xl font-bold text-foreground">
					shadcn/ui Email Styles
				</Heading>
				<Text class="text-muted-foreground">
					Beautiful semantic colors for email templates
				</Text>
			</Section>

			<!-- Primary Action Card -->
			<Section class="mb-6 rounded-lg bg-card p-6">
				<Heading as="h2" class="mb-3 text-xl font-semibold text-card-foreground">
					Primary Action
				</Heading>
				<Text class="mb-4 text-muted-foreground">
					The primary color creates strong call-to-action buttons
				</Text>
				<Button
					href="https://shadcn-svelte.com/docs/theming"
					class="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
				>
					Get Started
				</Button>
			</Section>

			<!-- Secondary Action Section -->
			<Section class="mb-6 rounded-lg bg-secondary p-6">
				<Heading as="h2" class="mb-3 text-xl font-semibold text-secondary-foreground">
					Secondary Actions
				</Heading>
				<Text class="mb-4 text-secondary-foreground">
					Secondary colors provide subtle alternatives
				</Text>
				<Button
					href="#"
					class="rounded-md border border-border bg-card px-6 py-3 text-sm font-medium text-card-foreground"
				>
					Learn More
				</Button>
			</Section>

			<!-- Divider -->
			<Hr class="my-8 border-border" />

			<!-- Footer -->
			<Section class="text-center">
				<Text class="text-sm text-muted-foreground">
					Built with better-svelte-email and shadcn-svelte
				</Text>
			</Section>
		</Container>
	</Body>
</Html>
