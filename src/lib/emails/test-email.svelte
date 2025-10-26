<script>
	import { Html, Head, Body, Text, Button, Container, Heading } from '../components/index.js';
	import Template from './templates/title.svelte';
</script>

<Html>
	<Head />
	<Body>
		<Container class="bg-gray-100" style="padding: 2rem;">
			<Template />
			<Heading as="h2" class="font-semibold">Subtitle</Heading>
			<Text style="font-weight: bold;">Basic text</Text>
			<Button
				class="bg-brand rounded px-4 py-2 text-white"
				style="width: 33.33%"
				href="https://example.com"
			>
				Click Me
			</Button>
		</Container>
	</Body>
</Html>
