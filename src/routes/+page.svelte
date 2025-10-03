<div class="container mx-auto max-w-4xl p-8">
	<h1 class="mb-4 text-4xl font-bold">better-svelte-email</h1>

	<p class="mb-8 text-xl text-gray-600">
		A Svelte 5 preprocessor that transforms Tailwind CSS classes in email components.
	</p>

	<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-2xl font-semibold">Quick Example</h2>

		<div class="mb-4">
			<p class="mb-2 font-semibold text-gray-700">Input:</p>
			<pre class="overflow-x-auto rounded bg-gray-50 p-4 text-sm"><code
					>&lt;script&gt;
  let &#123; name = 'User' &#125; = $props();
&lt;/script&gt;

&lt;Button class="rounded bg-blue-500 px-4 py-2 text-white"&gt;
  Click Me
&lt;/Button&gt;</code
				></pre>
		</div>

		<div>
			<p class="mb-2 font-semibold text-gray-700">Output:</p>
			<pre class="overflow-x-auto rounded bg-gray-50 p-4 text-sm"><code
					>&lt;Button styleString="background-color: rgb(59, 130, 246); ..."&gt;
  Click Me
&lt;/Button&gt;</code
				></pre>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<a
			href="/demo"
			class="block rounded-lg border border-blue-200 bg-blue-50 p-6 transition hover:bg-blue-100"
		>
			<h3 class="mb-2 text-lg font-semibold text-blue-900">📝 View Demo</h3>
			<p class="text-blue-700">See example email components and how they transform</p>
		</a>

		<a
			href="https://github.com/Konixy/better-svelte-email"
			class="block rounded-lg border border-gray-200 bg-gray-50 p-6 transition hover:bg-gray-100"
		>
			<h3 class="mb-2 text-lg font-semibold text-gray-900">🔗 GitHub</h3>
			<p class="text-gray-700">Check out the source code and documentation</p>
		</a>
	</div>
</div>
