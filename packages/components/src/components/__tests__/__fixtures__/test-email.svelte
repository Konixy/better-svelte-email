<script>
	import {
		Html,
		Head,
		Body,
		Text,
		Button,
		Container,
		Heading,
		Link,
		Hr,
		Preview,
		Section,
		Row,
		Column,
		Img
	} from '../../index.js';
	import Nested from './nested/nested.svelte';

	const padding = 'px-4 py-2';
	const fontSemibold = 'font-semibold';
	const paddingStyle = 'padding: 2rem;';
</script>

<Html>
	<Head />
	<Body>
		<!-- Preview text (edge case: long text truncation) -->
		<Preview preview="This is a preview text that should be visible in email clients" />

		<Container class="bg-gray-100" style={paddingStyle}>
			<!-- Nested component with margin props + Tailwind classes -->
			<Nested />

			<!-- Edge case: Responsive classes (should be kept as sanitized classes) -->
			<Heading as="h2" class="font-semibold md:text-3xl lg:text-4xl">Responsive Heading</Heading>

			<!-- Edge case: Multiple utility combinations -->
			<Text class="mb-4 text-center text-lg text-gray-700">Multiple utilities text</Text>

			<!-- Edge case: Mixed inline styles + Tailwind -->
			<Text style="font-weight: bold;" class="mt-2 text-red-600">Bold red text with margin</Text>

			<!-- Horizontal rule -->
			<Hr />

			<!-- Edge case: Section with Row and Column layout -->
			<Section class="rounded-lg bg-white p-6">
				<Row>
					<Column class="w-1/2 p-4">
						<Text class="font-bold">Column 1</Text>
						<Text class="text-sm text-gray-600">Left column content</Text>
					</Column>
					<Column class="w-1/2 p-4">
						<Text class="font-bold">Column 2</Text>
						<Text class="text-sm text-gray-600">Right column content</Text>
					</Column>
				</Row>
			</Section>

			<Hr />

			<!-- Edge case: Image with Tailwind classes -->
			<Img
				src="https://example.com/logo.png"
				alt="Logo"
				width="200"
				height="100"
				class="mx-auto rounded-md"
			/>

			<!-- Edge case: Link with Tailwind + inline styles -->
			<Link href="https://example.com" class="font-semibold text-blue-600 underline">
				Visit our website
			</Link>

			<!-- Edge case: Button with custom brand color + multiple utilities -->
			<Button
				class="bg-brand rounded {padding} text-white hover:bg-red-600"
				style="width: 33.33%"
				href="https://example.com"
			>
				Click Me
			</Button>

			<!-- Edge case: Button with gradient-like classes -->
			<Button
				class="rounded-full bg-linear-to-r from-blue-500 to-purple-600 px-6 py-3 text-white"
				href="#"
			>
				Gradient Button
			</Button>

			<!-- Edge case: Complex spacing utilities -->
			<Container class="mt-8 mb-4 border border-blue-200 bg-blue-50 px-6 py-8 shadow-sm">
				<Heading as="h3" class="mb-2 text-xl font-bold text-blue-900">Nested Container</Heading>
				<Text class="leading-relaxed text-blue-700">
					This tests complex spacing, borders, and shadows
				</Text>
			</Container>

			<!-- Edge case: Arbitrary values (if supported) -->
			<Text class="p-[12px] text-[#123456]">Custom arbitrary values</Text>

			<!-- Edge case: Empty style attribute -->
			<Text style="" class="text-green-600">Text with empty style attribute</Text>

			<!-- Edge case: No classes, only inline styles -->
			<Text style="color: purple; font-size: 18px;">Pure inline styles</Text>
		</Container>
	</Body>
</Html>
