<script>
	// Example email component to demonstrate the preprocessor
	// Note: This won't actually transform unless it's in the configured email folder
	let { userName = 'Demo User' } = $props();
</script>

<div class="container mx-auto p-8">
	<h1 class="mb-4 text-3xl font-bold">Email Template Demo</h1>

	<p class="mb-6 text-gray-600">
		This is a demo page showing how the preprocessor works. To see actual transformations, place
		your email components in <code class="rounded bg-gray-100 px-2 py-1">/src/lib/emails/</code>
	</p>

	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-xl font-semibold">Example Email Component</h2>

		<pre class="overflow-x-auto rounded bg-gray-50 p-4"><code
				>&lt;script&gt;
  let &#123; name = 'User' &#125; = $props();
&lt;/script&gt;

&lt;Html&gt;
  &lt;Head /&gt;
  &lt;Body class="bg-gray-100"&gt;
    &lt;Container class="mx-auto p-8"&gt;
      &lt;Text class="mb-4 text-2xl font-bold"&gt;
        Welcome, &#123;name&#125;!
      &lt;/Text&gt;
      
      &lt;Button
        href="https://example.com"
        class="rounded bg-blue-600 px-6 py-3 text-white sm:bg-green-600"
      &gt;
        Get Started
      &lt;/Button&gt;
    &lt;/Container&gt;
  &lt;/Body&gt;
&lt;/Html&gt;</code
			></pre>
	</div>

	<div class="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
		<h3 class="mb-2 font-semibold text-blue-900">📚 Documentation</h3>
		<p class="text-blue-800">
			Check out the <a href="/README.md" class="underline">README.md</a> for full documentation and examples.
		</p>
	</div>
</div>
