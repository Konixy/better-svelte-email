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

<div class="container">
	<div class="sidebar">
		<div class="sidebar-header">
			<h2 class="sidebar-title">Email Templates</h2>
			{#if emailList.files}
				<span class="badge">
					{emailList.files.length}
				</span>
			{/if}
		</div>

		{#if !emailList.files || emailList.files.length === 0}
			<div class="empty-state">
				<p>No email templates found</p>
				<p>
					Create email components in <code>{emailList.path || '/src/lib/emails'}</code>
				</p>
			</div>
		{:else}
			<ul class="email-list">
				{#each emailList.files as file}
					<li>
						<button
							class="email-button"
							class:active={selectedEmail === file}
							onclick={() => previewEmail(file)}
						>
							<span class="email-icon">📧</span>
							<span class="email-name">{file}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="main-content">
		{#if !selectedEmail}
			<div class="centered-state">
				<div class="centered-content">
					<div class="emoji-large">✨</div>
					<h3 class="heading">Select an Email Template</h3>
					<p class="text-gray">Choose a template from the sidebar to preview its rendered HTML</p>
				</div>
			</div>
		{:else if loading}
			<div class="centered-state">
				<div class="centered-content">
					<div class="spinner"></div>
					<p class="text-gray">Rendering email...</p>
				</div>
			</div>
		{:else if error}
			<div class="centered-state">
				<div class="centered-content">
					<div class="emoji-xlarge">⚠️</div>
					<h3 class="heading">Error Rendering Email</h3>
					<p class="text-gray">{error}</p>
					<button class="btn" onclick={() => selectedEmail && previewEmail(selectedEmail)}>
						Try Again
					</button>
				</div>
			</div>
		{:else if renderedHtml}
			<div class="preview-header">
				<h3 class="preview-title">{selectedEmail}</h3>
				<div class="button-group">
					<button class="btn-secondary" onclick={copyHtml} title="Copy HTML">
						<span class="btn-icon">📋</span> Copy HTML
					</button>
					<button class="btn-primary" onclick={openSendModal} title="Send Test Email">
						<span class="btn-icon">📨</span> Send Test
					</button>
				</div>
			</div>

			<div class="preview-container">
				<iframe
					title="Email Preview"
					srcdoc={iframeContent}
					class="preview-iframe"
					sandbox="allow-same-origin allow-scripts"
				></iframe>
			</div>

			<details class="code-section">
				<summary class="code-summary"> View HTML Source </summary>
				<div class="code-content">
					<HighlightAuto code={renderedHtml} />
				</div>
			</details>
		{/if}
	</div>
</div>

{#if showSendModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeSendModal}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="modal"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
		>
			<h3 id="modal-title" class="modal-title">Send Test Email</h3>

			{#if sendSuccess}
				<div class="success-message">
					<div class="success-icon">✅</div>
					<p class="success-text">Email sent successfully!</p>
				</div>
			{:else}
				<div class="form-group">
					<label for="recipient-email" class="form-label"> Recipient Email </label>
					<input
						id="recipient-email"
						type="email"
						bind:value={recipientEmail}
						placeholder="your@email.com"
						class="form-input"
					/>
					<p class="form-help">
						The email will be sent using the Resend API key configured on the server.
					</p>
				</div>

				{#if sendError}
					<div class="error-message">
						{sendError}
					</div>
				{/if}

				<div class="modal-actions">
					<button class="btn-cancel" onclick={closeSendModal} disabled={sendLoading}>
						Cancel
					</button>
					<button class="btn-submit" onclick={sendTestEmail} disabled={sendLoading}>
						{sendLoading ? 'Sending...' : 'Send Email'}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	* {
		box-sizing: border-box;
	}

	.container {
		display: grid;
		grid-template-columns: 280px 1fr;
		height: 100vh;
		width: 100vw;
		background-color: #f9fafb;
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
	}

	@media (max-width: 768px) {
		.container {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-right: 1px solid #e5e7eb;
		background-color: white;
	}

	@media (max-width: 768px) {
		.sidebar {
			max-height: 40vh;
			border-right: 0;
			border-bottom: 1px solid #e5e7eb;
		}
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		border-bottom: 1px solid #e5e7eb;
		padding: 1.5rem;
		padding-bottom: 1rem;
	}

	.sidebar-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
	}

	.badge {
		min-width: 1.5rem;
		border-radius: 9999px;
		background-color: #3b82f6;
		padding: 0.125rem 0.5rem;
		text-align: center;
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
	}

	.empty-state {
		padding: 2rem 1rem;
		text-align: center;
		color: #6b7280;
	}

	.empty-state p {
		margin: 0.5rem 0;
		font-size: 0.875rem;
	}

	.empty-state p:last-child {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.empty-state code {
		border-radius: 0.25rem;
		background-color: #f3f4f6;
		padding: 0.125rem 0.375rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.75rem;
	}

	.email-list {
		margin: 0;
		padding: 0.5rem;
		flex: 1;
		list-style: none;
		overflow-y: auto;
	}

	.email-list li {
		list-style: none;
	}

	.email-button {
		display: flex;
		width: 100%;
		cursor: pointer;
		align-items: center;
		gap: 0.75rem;
		border-radius: 0.5rem;
		border: 0;
		background-color: transparent;
		padding: 0.75rem;
		text-align: left;
		font-size: 0.875rem;
		color: #374151;
		transition: all 0.15s;
	}

	.email-button:hover {
		background-color: #f3f4f6;
	}

	.email-button.active {
		background-color: #eff6ff;
		color: #1e3a8a;
		font-weight: 500;
	}

	.email-icon {
		flex-shrink: 0;
		font-size: 1.25rem;
	}

	.email-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.main-content {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background-color: white;
	}

	.centered-state {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		background-color: #f9fafb;
	}

	.centered-content {
		max-width: 28rem;
		padding: 2rem;
		text-align: center;
	}

	.emoji-large {
		margin-bottom: 1rem;
		font-size: 3.75rem;
	}

	.emoji-xlarge {
		margin-bottom: 1rem;
		font-size: 4rem;
	}

	.spinner {
		margin: 0 auto 1rem;
		height: 3rem;
		width: 3rem;
		border-radius: 9999px;
		border: 4px solid #e5e7eb;
		border-top-color: #3b82f6;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.heading {
		margin-bottom: 0.5rem;
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
	}

	.text-gray {
		margin: 0;
		color: #6b7280;
	}

	.btn {
		margin-top: 1rem;
		cursor: pointer;
		border-radius: 0.375rem;
		border: 0;
		background-color: #3b82f6;
		padding: 0.5rem 1rem;
		font-weight: 500;
		color: white;
		transition: background-color 0.15s;
	}

	.btn:hover {
		background-color: #2563eb;
	}

	.preview-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid #e5e7eb;
		background-color: white;
		padding: 1rem 1.5rem;
	}

	.preview-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
	}

	.btn-secondary {
		display: flex;
		cursor: pointer;
		align-items: center;
		gap: 0.375rem;
		border-radius: 0.375rem;
		border: 1px solid #d1d5db;
		background-color: white;
		padding: 0.5rem 0.875rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		transition: all 0.15s;
	}

	.btn-secondary:hover {
		border-color: #9ca3af;
		background-color: #f9fafb;
	}

	.btn-primary {
		display: flex;
		cursor: pointer;
		align-items: center;
		gap: 0.375rem;
		border-radius: 0.375rem;
		border: 0;
		background-color: #3b82f6;
		padding: 0.5rem 0.875rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: white;
		transition: all 0.15s;
	}

	.btn-primary:hover {
		background-color: #2563eb;
	}

	.btn-icon {
		font-size: 1rem;
	}

	.preview-container {
		flex: 1;
		overflow: hidden;
		background-color: #f9fafb;
		padding: 1rem;
	}

	.preview-iframe {
		height: 100%;
		width: 100%;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
		background-color: white;
	}

	.code-section {
		overflow: auto;
		border-top: 1px solid #e5e7eb;
		background-color: #f9fafb;
	}

	.code-summary {
		cursor: pointer;
		padding: 0.75rem 1.5rem;
		font-weight: 500;
		color: #374151;
		user-select: none;
	}

	.code-summary:hover {
		background-color: #f3f4f6;
	}

	.code-content {
		height: 100%;
		overflow-y: scroll;
		font-size: 0.75rem;
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.5);
	}

	.modal {
		width: 100%;
		max-width: 28rem;
		border-radius: 0.5rem;
		background-color: white;
		padding: 1.5rem;
		box-shadow:
			0 20px 25px -5px rgb(0 0 0 / 0.1),
			0 8px 10px -6px rgb(0 0 0 / 0.1);
	}

	.modal-title {
		margin-bottom: 1rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
	}

	.success-message {
		margin-bottom: 1rem;
		border-radius: 0.375rem;
		background-color: #f0fdf4;
		padding: 1rem;
		text-align: center;
	}

	.success-icon {
		margin-bottom: 0.5rem;
		font-size: 1.875rem;
	}

	.success-text {
		margin: 0;
		font-weight: 500;
		color: #166534;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-label {
		display: block;
		margin-bottom: 0.25rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.form-input {
		width: 100%;
		border-radius: 0.375rem;
		border: 1px solid #d1d5db;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
	}

	.form-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
	}

	.form-help {
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: #6b7280;
	}

	.error-message {
		margin-bottom: 1rem;
		border-radius: 0.375rem;
		background-color: #fef2f2;
		padding: 0.75rem;
		font-size: 0.875rem;
		color: #991b1b;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.btn-cancel {
		cursor: pointer;
		border-radius: 0.375rem;
		border: 1px solid #d1d5db;
		background-color: white;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		transition: all 0.15s;
	}

	.btn-cancel:hover {
		background-color: #f9fafb;
	}

	.btn-cancel:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.btn-submit {
		cursor: pointer;
		border-radius: 0.375rem;
		border: 0;
		background-color: #3b82f6;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: white;
		transition: all 0.15s;
	}

	.btn-submit:hover {
		background-color: #2563eb;
	}

	.btn-submit:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
