<script lang="ts">
	import { Body, Button, Container, Head, Heading, Hr, Html, Section, Text } from '../../index.js';
</script>

<Html>
	<Head />
	<Body class="bg-background font-sans">
		<Container class="mx-auto max-w-[600px] py-10">
			<Section class="mb-8 text-center">
				<Heading as="h1" class="mb-2 text-3xl font-bold text-foreground">shadcn test</Heading>
				<Text class="text-muted-foreground">Semantic colors resolution fixture</Text>
			</Section>

			<Section class="mb-6 rounded-lg bg-card p-6">
				<Heading as="h2" class="mb-3 text-xl font-semibold text-card-foreground">Card title</Heading
				>
				<Text class="mb-4 text-secondary-foreground">Secondary semantic text</Text>
				<Button href="#" class="rounded-md bg-primary px-6 py-3 text-primary-foreground"
					>Action</Button
				>
			</Section>

			<Hr class="my-8" />
		</Container>
	</Body>
</Html>
