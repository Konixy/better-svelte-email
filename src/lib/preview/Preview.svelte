<script lang="ts">
	import { HighlightAuto } from 'svelte-highlight';
	import oneDark from 'svelte-highlight/styles/onedark';
	import type { PreviewData } from './index.js';
	import type { ActionResult } from '@sveltejs/kit';
	import { applyAction, deserialize } from '$app/forms';

	let { emailList }: { emailList: PreviewData } = $props();

	let selectedEmail = $state<string | null>(null);
	let renderedHtml = $state<string>('');
	let iframeContent = $state<string>('');
	let loading = $state(false);
	let error = $state<string | null>(null);
	let showSendModal = $state(false);
	let sendLoading = $state(false);
	let sendSuccess = $state(false);
	let sendError = $state<string | null>(null);
	let recipientEmail = $state('');

	const FONT_SANS_STYLE = `<style>
		body {
			font-family:
				ui-sans-serif,
				system-ui,
				-apple-system,
				BlinkMacSystemFont,
				'Segoe UI',
				Helvetica,
				Arial,
				'Noto Sans',
				sans-serif;
			margin: 0;
		}
	</style>`;

	function withFontSans(html: string) {
		if (!html) return '';

		if (html.includes('<head')) {
			return html.replace('<head>', `<head>${FONT_SANS_STYLE}`);
		}

		if (html.includes('<html')) {
			const htmlTagEnd = html.indexOf('>', html.indexOf('<html'));
			if (htmlTagEnd !== -1) {
				const before = html.slice(0, htmlTagEnd + 1);
				const after = html.slice(htmlTagEnd + 1);
				return `${before}<head>${FONT_SANS_STYLE}</head>${after}`;
			}
		}

		if (html.includes('<body')) {
			const bodyTagEnd = html.indexOf('>', html.indexOf('<body'));
			if (bodyTagEnd !== -1) {
				const before = html.slice(0, bodyTagEnd + 1);
				const after = html.slice(bodyTagEnd + 1);
				return `${before}${FONT_SANS_STYLE}${after}`;
			}
		}

		return `${FONT_SANS_STYLE}${html}`;
	}

	async function previewEmail(fileName: string) {
		selectedEmail = fileName;
		loading = true;
		error = null;
		renderedHtml = '';
		iframeContent = '';

		try {
			const response = await fetch('?/create-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					file: fileName,
					path: emailList.path || '/src/lib/emails'
				})
			});

			const result: ActionResult<{ body: string }> = deserialize(await response.text());

			console.log('result', result);

			if (result.type === 'success' && result.data?.body) {
				renderedHtml = result.data.body;
				iframeContent = withFontSans(result.data.body);
			} else if (result.type === 'error') {
				error = result.error?.message || 'Failed to render email';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to preview email';
		} finally {
			loading = false;
		}
	}

	function copyHtml() {
		if (renderedHtml) {
			navigator.clipboard.writeText(renderedHtml);
		}
	}

	function openSendModal() {
		showSendModal = true;
		sendError = null;
		sendSuccess = false;
	}

	function closeSendModal() {
		showSendModal = false;
		recipientEmail = '';
		sendError = null;
		sendSuccess = false;
	}

	async function sendTestEmail() {
		if (!recipientEmail) {
			sendError = 'Please provide an email address';
			return;
		}

		sendLoading = true;
		sendError = null;
		sendSuccess = false;

		try {
			const response = await fetch('?/send-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					to: recipientEmail,
					component: selectedEmail || 'Email Template',
					html: renderedHtml
				})
			});

			const result: ActionResult = deserialize(await response.text());

			if (result.type === 'success' && result.data?.success) {
				sendSuccess = true;
				setTimeout(() => {
					closeSendModal();
				}, 2000);
			} else if (result.type === 'error' || result.type === 'failure') {
				sendError =
					result.type === 'error'
						? result.error?.message
						: result.data?.error?.message || 'Failed to send email';
			}
		} catch (e) {
			sendError = e instanceof Error ? e.message : 'Failed to send email';
		} finally {
			sendLoading = false;
		}
	}
</script>

<svelte:head>
	{@html oneDark}
</svelte:head>

<div
	class="grid h-screen grid-cols-[280px_1fr] bg-gray-50 font-sans max-md:grid-cols-1 max-md:grid-rows-[auto_1fr]"
>
	<div
		class="flex flex-col overflow-hidden border-r border-gray-200 bg-white max-md:max-h-[40vh] max-md:border-r-0 max-md:border-b"
	>
		<div class="flex items-center justify-between gap-2 border-b border-gray-200 p-6 pb-4">
			<h2 class="m-0 text-lg font-semibold text-gray-900">Email Templates</h2>
			{#if emailList.files}
				<span
					class="min-w-6 rounded-full bg-blue-500 px-2 py-0.5 text-center text-xs font-semibold text-white"
				>
					{emailList.files.length}
				</span>
			{/if}
		</div>

		{#if !emailList.files || emailList.files.length === 0}
			<div class="px-4 py-8 text-center text-gray-500">
				<p class="my-2 text-sm">No email templates found</p>
				<p class="my-2 text-xs text-gray-400">
					Create email components in <code
						class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs"
						>{emailList.path || '/src/lib/emails'}</code
					>
				</p>
			</div>
		{:else}
			<ul class="m-0 flex-1 list-none overflow-y-auto p-2">
				{#each emailList.files as file}
					<li>
						<button
							class="flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent p-3 text-left text-sm text-gray-700 transition-all duration-150 hover:bg-gray-100"
							class:bg-blue-50={selectedEmail === file}
							class:text-blue-900={selectedEmail === file}
							class:font-medium={selectedEmail === file}
							onclick={() => previewEmail(file)}
						>
							<span class="flex-shrink-0 text-xl">📧</span>
							<span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{file}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="flex flex-col overflow-hidden bg-white">
		{#if !selectedEmail}
			<div class="flex flex-1 items-center justify-center bg-gray-50">
				<div class="max-w-md p-8 text-center">
					<div class="mb-4 text-6xl">✨</div>
					<h3 class="mb-2 text-2xl font-semibold text-gray-900">Select an Email Template</h3>
					<p class="text-gray-500">
						Choose a template from the sidebar to preview its rendered HTML
					</p>
				</div>
			</div>
		{:else if loading}
			<div class="flex flex-1 items-center justify-center bg-gray-50">
				<div class="max-w-md p-8 text-center">
					<div
						class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"
					></div>
					<p class="text-gray-500">Rendering email...</p>
				</div>
			</div>
		{:else if error}
			<div class="flex flex-1 items-center justify-center bg-gray-50">
				<div class="max-w-md p-8 text-center">
					<div class="mb-4 text-5xl">⚠️</div>
					<h3 class="mb-2 text-2xl font-semibold text-gray-900">Error Rendering Email</h3>
					<p class="mb-0 text-gray-500">{error}</p>
					<button
						class="mt-4 cursor-pointer rounded-md border-0 bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
						onclick={() => selectedEmail && previewEmail(selectedEmail)}
					>
						Try Again
					</button>
				</div>
			</div>
		{:else if renderedHtml}
			<div class="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
				<h3 class="m-0 text-lg font-semibold text-gray-900">{selectedEmail}</h3>
				<div class="flex gap-2">
					<button
						class="flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-all duration-150 hover:border-gray-400 hover:bg-gray-50"
						onclick={copyHtml}
						title="Copy HTML"
					>
						<span class="text-base">📋</span> Copy HTML
					</button>
					<button
						class="flex cursor-pointer items-center gap-1.5 rounded-md border-0 bg-blue-500 px-3.5 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-blue-600"
						onclick={openSendModal}
						title="Send Test Email"
					>
						<span class="text-base">📨</span> Send Test
					</button>
				</div>
			</div>

			<div class="flex-1 overflow-hidden bg-gray-50 p-4">
				<iframe
					title="Email Preview"
					srcdoc={iframeContent}
					class="h-full w-full rounded-lg border border-gray-200 bg-white"
					sandbox="allow-same-origin allow-scripts"
				></iframe>
			</div>

			<details class="overflow-auto border-t border-gray-200 bg-gray-50">
				<summary
					class="cursor-pointer px-6 py-3 font-medium text-gray-700 select-none hover:bg-gray-100"
				>
					View HTML Source
				</summary>
				<HighlightAuto class="h-full overflow-y-scroll text-xs" code={renderedHtml} />
			</details>
		{/if}
	</div>
</div>

{#if showSendModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={closeSendModal}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
		>
			<h3 id="modal-title" class="mb-4 text-xl font-semibold text-gray-900">Send Test Email</h3>

			{#if sendSuccess}
				<div class="mb-4 rounded-md bg-green-50 p-4 text-center">
					<div class="mb-2 text-3xl">✅</div>
					<p class="font-medium text-green-800">Email sent successfully!</p>
				</div>
			{:else}
				<div class="mb-4">
					<label for="recipient-email" class="mb-1 block text-sm font-medium text-gray-700">
						Recipient Email
					</label>
					<input
						id="recipient-email"
						type="email"
						bind:value={recipientEmail}
						placeholder="your@email.com"
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
					<p class="mt-1 text-xs text-gray-500">
						The email will be sent using the Resend API key configured on the server.
					</p>
				</div>

				{#if sendError}
					<div class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
						{sendError}
					</div>
				{/if}

				<div class="flex justify-end gap-2">
					<button
						class="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
						onclick={closeSendModal}
						disabled={sendLoading}
					>
						Cancel
					</button>
					<button
						class="cursor-pointer rounded-md border-0 bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
						onclick={sendTestEmail}
						disabled={sendLoading}
					>
						{sendLoading ? 'Sending...' : 'Send Email'}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
