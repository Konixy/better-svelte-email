<script>
	import { Html, Head, Body, Container, Section, Text, Button } from '$lib/components/index.js';

	let { userName = 'User', testMessage = 'This is a test email!' } = $props();
</script>

<Html>
	<Head />
	<Body class="bg-gray-100 font-sans">
		<Container class="mx-auto max-w-2xl bg-white p-8">
			<!-- Header -->
			<Section class="mb-6 border-b border-gray-200 pb-6">
				<Text as="h1" class="mb-2 text-3xl font-bold text-gray-900">better-svelte-email Demo</Text>
				<Text class="text-gray-600">
					This email was generated using Tailwind classes and transformed by the preprocessor!
				</Text>
			</Section>

			<!-- Main Content -->
			<Section class="mb-6">
				<Text class="mb-4 text-lg text-gray-800">Hello {userName}! 👋</Text>

				<Text class="mb-4 text-gray-700">{testMessage}</Text>

				<Container class="mb-6 rounded-lg bg-blue-50 p-4">
					<Text class="mb-2 font-semibold text-blue-900">✨ Features Demonstrated:</Text>
					<ul class="flex list-disc flex-col gap-1 pl-5 text-blue-800">
						<li>Tailwind classes converted to inline styles</li>
						<li>Responsive design with media queries</li>
						<li>Email-safe CSS transformations</li>
						<li>Build-time preprocessing (zero runtime cost)</li>
					</ul>
				</Container>

				<!-- Buttons showcase -->
				<Section class="mb-6">
					<Button
						href="https://github.com/Konixy/better-svelte-email"
						class="inline-block rounded bg-blue-600 px-6 py-3 font-semibold text-white sm:bg-green-600"
					>
						View on GitHub
					</Button>

					<Button
						href="https://svelte.dev"
						class="ml-3 inline-block rounded border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700"
					>
						Learn Svelte 5
					</Button>
				</Section>
			</Section>

			<!-- Stats Grid -->
			<Section class="mb-6">
				<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
					<tbody>
						<tr>
							<td class="rounded-lg bg-purple-50 p-4 text-center" style="width: 33.33%;">
								<Text as="div" class="mb-1 text-3xl font-bold text-purple-600">52+</Text>
								<Text as="div" class="text-sm text-purple-700">Tests Passing</Text>
							</td>
							<td style="width: 10px;"></td>
							<td class="rounded-lg bg-green-50 p-4 text-center" style="width: 33.33%;">
								<Text as="div" class="mb-1 text-3xl font-bold text-green-600">100%</Text>
								<Text as="div" class="text-sm text-green-700">TypeScript</Text>
							</td>
							<td style="width: 10px;"></td>
							<td class="rounded-lg bg-orange-50 p-4 text-center" style="width: 33.33%;">
								<Text as="div" class="mb-1 text-3xl font-bold text-orange-600">0ms</Text>
								<Text as="div" class="text-sm text-orange-700">Runtime Cost</Text>
							</td>
						</tr>
					</tbody>
				</table>
			</Section>

			<!-- Code Example -->
			<Container class="mb-6 rounded-lg bg-gray-50 p-4">
				<Text class="mb-2 text-sm font-semibold text-gray-700">How it works:</Text>
				<pre
					class="overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100"
					style="margin: 0;"><code
						>// Input
&lt;Button class="bg-blue-500 text-white p-4"&gt;
  Click Me
&lt;/Button&gt;

// Output (after preprocessing)
&lt;Button styleString="background-color: rgb(59, 130, 246); ..."&gt;
  Click Me
&lt;/Button&gt;</code
					></pre>
			</Container>

			<!-- Footer -->
			<Section class="border-t border-gray-200 pt-6 text-center">
				<Text class="mb-2 text-sm text-gray-600">Built with Svelte 5 & Tailwind CSS</Text>
				<Text class="text-xs text-gray-500">
					You're receiving this email because you tested the better-svelte-email demo.
				</Text>
			</Section>
		</Container>
	</Body>
</Html>
