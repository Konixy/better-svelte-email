<script lang="ts">
	import { onMount } from 'svelte';

	let email = $state('');
	let userName = $state('');
	let loading = $state(false);
	let result = $state<{ success?: boolean; message?: string; error?: string } | null>(null);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		result = null;

		try {
			const response = await fetch('/api/send-demo-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, userName: userName || 'Demo User' })
			});

			const data = await response.json();

			if (response.ok) {
				result = { success: true, message: data.message };
				// Clear form on success
				email = '';
				userName = '';
			} else {
				result = { error: data.error || 'Failed to send email' };
			}
		} catch (error) {
			result = { error: 'Network error. Please try again.' };
		} finally {
			loading = false;
		}
	}
</script>

<div class="container mx-auto max-w-4xl p-8">
	<div class="mb-8">
		<a href="/" class="text-blue-600 hover:underline">← Back to Home</a>
	</div>

	<h1 class="mb-4 text-4xl font-bold">Email Demo</h1>

	<p class="mb-8 text-xl text-gray-600">
		Test the preprocessor by sending yourself a real email powered by Resend!
	</p>

	<!-- Demo Form -->
	<div class="mb-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
		<h2 class="mb-6 text-2xl font-semibold">Send Test Email</h2>

		<form onsubmit={handleSubmit} class="space-y-6">
			<div>
				<label for="email" class="mb-2 block font-medium text-gray-700">
					Your Email Address *
				</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					required
					placeholder="you@example.com"
					class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				<p class="mt-1 text-sm text-gray-500">We'll send the demo email to this address</p>
			</div>

			<div>
				<label for="userName" class="mb-2 block font-medium text-gray-700">
					Your Name (optional)
				</label>
				<input
					type="text"
					id="userName"
					bind:value={userName}
					placeholder="Demo User"
					class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<button
				type="submit"
				disabled={loading || !email}
				class="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading ? '✨ Sending...' : '📧 Send Demo Email'}
			</button>
		</form>

		<!-- Result Messages -->
		{#if result}
			<div class="mt-6">
				{#if result.success}
					<div class="rounded-lg border border-green-200 bg-green-50 p-4">
						<div class="flex items-start">
							<span class="text-2xl">✅</span>
							<div class="ml-3">
								<h3 class="font-semibold text-green-900">Success!</h3>
								<p class="text-green-700">{result.message}</p>
							</div>
						</div>
					</div>
				{:else if result.error}
					<div class="rounded-lg border border-red-200 bg-red-50 p-4">
						<div class="flex items-start">
							<span class="text-2xl">❌</span>
							<div class="ml-3">
								<h3 class="font-semibold text-red-900">Error</h3>
								<p class="text-red-700">{result.error}</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- What to Expect -->
	<div class="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
		<h3 class="mb-4 text-xl font-semibold text-blue-900">📨 What You'll Receive</h3>
		<ul class="space-y-2 text-blue-800">
			<li class="flex items-start">
				<span class="mr-2">✓</span>
				<span>A beautifully styled email with Tailwind classes converted to inline styles</span>
			</li>
			<li class="flex items-start">
				<span class="mr-2">✓</span>
				<span>Responsive design that works across all email clients</span>
			</li>
			<li class="flex items-start">
				<span class="mr-2">✓</span>
				<span>Live demonstration of the preprocessor in action</span>
			</li>
			<li class="flex items-start">
				<span class="mr-2">✓</span>
				<span>Code examples showing before/after transformation</span>
			</li>
		</ul>
	</div>

	<!-- Email Component Preview -->
	<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
		<h3 class="mb-4 text-xl font-semibold">📝 Email Component Source</h3>

		<p class="mb-4 text-gray-600">
			This is the Svelte component that generates the email you'll receive:
		</p>

		<pre class="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100"><code
				>&lt;script&gt;
  let &#123; userName = 'User', testMessage = 'Test!' &#125; = $props();
&lt;/script&gt;

&lt;div class="bg-gray-100 font-sans"&gt;
  &lt;div class="mx-auto max-w-2xl bg-white p-8"&gt;
    &lt;h1 class="mb-2 text-3xl font-bold text-gray-900"&gt;
      better-svelte-email Demo
    &lt;/h1&gt;
    
    &lt;p class="mb-4 text-lg text-gray-800"&gt;
      Hello &#123;userName&#125;! 👋
    &lt;/p&gt;

    &lt;a
      href="https://github.com/..."
      class="rounded bg-blue-600 px-6 py-3 text-white sm:bg-green-600"
    &gt;
      View on GitHub
    &lt;/a&gt;
  &lt;/div&gt;
&lt;/div&gt;</code
			></pre>

		<p class="mt-4 text-sm text-gray-600">
			All these Tailwind classes are automatically transformed to inline styles at build time!
		</p>
	</div>

	<!-- Setup Instructions -->
	<div class="rounded-lg border border-purple-200 bg-purple-50 p-6">
		<h3 class="mb-4 text-xl font-semibold text-purple-900">🚀 Setup Your Own</h3>

		<div class="space-y-3 text-purple-800">
			<p class="font-medium">To use this in your own project:</p>

			<ol class="list-decimal space-y-2 pl-5">
				<li>
					<strong>Install the package:</strong>
					<code class="mt-1 block rounded bg-purple-100 px-2 py-1 text-sm"
						>npm install better-svelte-email resend</code
					>
				</li>

				<li>
					<strong>Configure the preprocessor:</strong>
					<code class="mt-1 block rounded bg-purple-100 px-2 py-1 text-sm">// svelte.config.js</code
					>
				</li>

				<li>
					<strong>Add your Resend API key:</strong>
					<code class="mt-1 block rounded bg-purple-100 px-2 py-1 text-sm"
						>RESEND_API_KEY=re_your_key</code
					>
				</li>

				<li><strong>Create email components with Tailwind classes</strong></li>

				<li><strong>Render and send using Svelte 5's render() API</strong></li>
			</ol>
		</div>
	</div>
</div>
