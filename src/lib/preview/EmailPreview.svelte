<script lang="ts">
	import type { PreviewData } from './index.js';
	import type { ActionResult } from '@sveltejs/kit';
	import { deserialize } from '$app/forms';
	import { goto } from '$app/navigation';
	import { codeToHtml } from 'shiki';
	import './theme.css';
	import EmailTreeNode from './EmailTreeNode.svelte';
	import { buildEmailTree } from './email-tree.js';
	import { onMount } from 'svelte';
	import Favicon from './Favicon.svelte';

	type Page = {
		params: {
			email?: string | null;
		};
		data: {
			emails?: PreviewData;
		};
		url: URL;
	};

	type ViewMode = 'render' | 'code' | 'source';

	function parseViewMode(url: URL): ViewMode {
		const viewParam = url.searchParams.get('view');
		if (viewParam === 'code' || viewParam === 'source') {
			return viewParam;
		}
		return 'render';
	}

	let { page }: { page: Page } = $props();
	let emailList = $derived(page.data.emails ?? { files: null, path: null });
	let emailTree = $derived.by(() => buildEmailTree(emailList.files ?? []));

	// Derive selected email from URL params
	let selectedEmail = $derived(page.params.email || null);

	// Derive the base path for navigation by removing the email param from current path
	let basePath = $derived.by(() => {
		const pathname = page.url.pathname;
		if (selectedEmail) {
			// Remove the selected email from the path
			return pathname.replace(`/${selectedEmail}`, '').replace(/\/$/, '');
		}
		// If no email selected, remove trailing slash if any
		return pathname.replace(/\/$/, '');
	});

	let renderedHtml = $state<string>('');
	let highlightedHtml = $state<string>('');
	let highlightedSource = $state<string>('');
	let iframeContent = $state<string>('');
	let loading = $state(false);
	let error = $state<string | null>(null);
	let showSendModal = $state(false);
	let sendLoading = $state(false);
	let sendSuccess = $state(false);
	let sendError = $state<string | null>(null);
	let recipientEmail = $state('');
	let viewMode = $derived<ViewMode>(parseViewMode(page.url));

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

	// Navigate to the email's URL instead of updating state
	function selectEmail(fileName: string) {
		const search = page.url.search;
		const hash = page.url.hash;
		goto(`${basePath}/${fileName}${search}${hash}`);
	}

	// Load the email content when selectedEmail changes
	async function loadEmailContent(fileName: string) {
		loading = true;
		error = null;
		renderedHtml = '';
		highlightedHtml = '';
		highlightedSource = '';
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

			const result: ActionResult<{ body: string; source?: string | null }> = deserialize(
				await response.text()
			);

			if (result.type === 'success' && result.data?.body) {
				renderedHtml = result.data.body;
				iframeContent = withFontSans(result.data.body);
				highlightedHtml = await codeToHtml(result.data.body, {
					lang: 'html',
					theme: 'vesper'
				});
				const source = result.data.source ?? '';
				highlightedSource = source
					? await codeToHtml(source, {
							lang: 'svelte',
							theme: 'vesper'
						})
					: '';
			} else if (result.type === 'error') {
				error = result.error?.message || 'Failed to render email';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to preview email';
		} finally {
			loading = false;
		}
	}

	// Effect to load email content when the URL changes
	$effect(() => {
		if (selectedEmail) {
			loadEmailContent(selectedEmail);
		}
	});

	$effect(() => {
		const parsed = parseViewMode(page.url);
		if (parsed !== viewMode) {
			viewMode = parsed;
		}
	});

	function updateViewMode(mode: ViewMode) {
		if (viewMode === mode) return;

		viewMode = mode;

		const url = new URL(page.url);
		url.searchParams.set('view', mode);

		void goto(`${url.pathname}${url.search}${url.hash}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
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
					path: emailList.path || '/src/lib/emails',
					file: selectedEmail as string
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

	onMount(() => {
		const html = document.querySelector('html');
		if (window.localStorage.getItem('bse_preview_mode') === 'dark') {
			if (html && !html.classList.contains('dark')) {
				setTimeout(() => {
					html.classList.toggle('dark');
				}, 100);
			}
		} else {
			if (html && html.classList.contains('dark')) {
				setTimeout(() => {
					html.classList.remove('dark');
				}, 100);
			}
		}
	});

	function toggleMode() {
		const html = document.querySelector('html');
		html?.classList.toggle('dark');
		window.localStorage.setItem(
			'bse_preview_mode',
			html?.classList.contains('dark') ? 'dark' : 'light'
		);
	}
</script>

<div class="container">
	<div class="sidebar">
		<div class="sidebar-header">
			<div class="sidebar-brand">
				<Favicon class="brand-logo" />

				<h2 class="sidebar-title">Email Preview</h2>
			</div>
			<div class="sidebar-header-right">
				<a
					class="sidebar-header-docs-link"
					href="https://better-svelte-email.konixy.fr/docs"
					title="Documentation"
					target="_blank"
					rel="noopener noreferrer"
				>
					<svg
						class="sidebar-header-docs-link-icon"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="M12 7v14" /><path
							d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"
						/></svg
					>
				</a>
				<button class="theme-toggle-btn" onclick={toggleMode} aria-label="Toggle theme">
					<svg
						class="theme-icon theme-icon-dark"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
						/>
					</svg>
					<svg
						class="theme-icon theme-icon-light"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="4" />
						<path d="M12 2v2" />
						<path d="M12 20v2" />
						<path d="m4.93 4.93 1.41 1.41" />
						<path d="m17.66 17.66 1.41 1.41" />
						<path d="M2 12h2" />
						<path d="M20 12h2" />
						<path d="m6.34 17.66-1.41 1.41" />
						<path d="m19.07 4.93-1.41 1.41" />
					</svg>
				</button>
			</div>
		</div>

		{#if emailTree.length === 0}
			<div class="empty-state">
				<p>No email templates found</p>
				<p>
					Create email components in <code>{emailList.path || '/src/lib/emails'}</code>
				</p>
			</div>
		{:else}
			<ul class="email-list email-tree">
				{#each emailTree as node (node.path)}
					<EmailTreeNode {node} {selectedEmail} onSelect={selectEmail} />
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
					<button class="btn" onclick={() => selectedEmail && loadEmailContent(selectedEmail)}>
						Try Again
					</button>
				</div>
			</div>
		{:else if renderedHtml}
			<div class="preview-header">
				<h3 class="preview-title">
					<svg
						class="preview-title-icon"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect
							x="2"
							y="4"
							width="20"
							height="16"
							rx="2"
						/></svg
					>
					{selectedEmail}
				</h3>
				<div class="preview-actions">
					<div class="view-toggle" role="group" aria-label="Preview view selection">
						<button
							class="view-toggle-btn"
							class:active={viewMode === 'render'}
							onclick={() => updateViewMode('render')}
							aria-pressed={viewMode === 'render'}
							type="button"
						>
							Render
						</button>
						<button
							class="view-toggle-btn"
							class:active={viewMode === 'code'}
							onclick={() => updateViewMode('code')}
							aria-pressed={viewMode === 'code'}
							type="button"
						>
							Code
						</button>
						<button
							class="view-toggle-btn"
							class:active={viewMode === 'source'}
							onclick={() => updateViewMode('source')}
							aria-pressed={viewMode === 'source'}
							type="button"
						>
							Source
						</button>
					</div>

					<button class="btn-primary send-btn" onclick={openSendModal} title="Send Test Email">
						<svg
							class="send-btn-icon"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path
								d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
							/><path d="m21.854 2.147-10.94 10.939" /></svg
						>
						Send Test Email
					</button>
				</div>
			</div>

			{#if viewMode === 'render'}
				<div class="preview-container">
					<iframe
						title="Email Preview"
						srcdoc={iframeContent}
						class="preview-iframe"
						sandbox="allow-same-origin allow-scripts"
					></iframe>
				</div>
			{:else if viewMode === 'code'}
				<div class="code-view">
					<div class="code-view-content">
						<div class="code-content">
							{@html highlightedHtml}
						</div>
					</div>
				</div>
			{:else}
				<div class="code-view">
					<div class="code-view-content">
						{#if highlightedSource}
							<div class="code-content">
								{@html highlightedSource}
							</div>
						{:else}
							<div class="code-empty">Source could not be loaded.</div>
						{/if}
					</div>
				</div>
			{/if}
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
		max-width: none;
		background-color: var(--background);
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
		border-right: 1px solid var(--border);
		background-color: var(--card);
	}

	@media (max-width: 768px) {
		.sidebar {
			max-height: 40vh;
			border-right: 0;
			border-bottom: 1px solid var(--border);
		}
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-inline: 1rem;
		height: 4rem;
		border-bottom: 1px solid var(--border);
	}

	.sidebar-brand {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.sidebar-brand > :global(.brand-logo) {
		width: 1.5rem;
		height: 1.5rem;
	}

	.sidebar-title {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.025em;
		color: var(--card-foreground);
	}
	.sidebar-header-right {
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}

	.sidebar-header-docs-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		border-radius: 0.75rem;
		border: 0;
		background-color: transparent;
		padding: 0.5rem;
		font-size: 0.875rem;
		color: var(--muted-foreground);
		transition: all 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.sidebar-header-docs-link:hover {
		background-color: var(--muted);
		color: var(--foreground);
	}

	.sidebar-header-docs-link-icon {
		width: 1rem;
		height: 1rem;
	}

	.theme-toggle-btn {
		cursor: pointer;
		border-radius: 0.75rem;
		border: 0;
		background-color: transparent;
		padding: 0.5rem;
		font-size: 0.875rem;
		color: var(--muted-foreground);
		transition: all 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.theme-toggle-btn:hover {
		background-color: var(--muted);
		color: var(--foreground);
	}

	.theme-icon {
		width: 1rem;
		height: 1rem;
	}

	:global(html:not(.dark)) .theme-icon-dark {
		display: none;
	}

	:global(html.dark) .theme-icon-light {
		display: none;
	}

	:global(html.dark) .theme-icon-dark {
		display: block;
	}

	:global(html:not(.dark)) .theme-icon-light {
		display: block;
	}

	.empty-state {
		padding: 2rem 1.5rem;
		text-align: center;
		color: var(--muted-foreground);
	}

	.empty-state p {
		margin: 0.5rem 0;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.empty-state p:first-child {
		font-weight: 500;
		color: var(--foreground);
	}

	.empty-state p:last-child {
		font-size: 0.8125rem;
		color: var(--muted-foreground);
		opacity: 0.8;
	}

	.empty-state code {
		border-radius: 0.375rem;
		background-color: var(--muted);
		padding: 0.125rem 0.375rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.email-list {
		margin: 0;
		padding: 0.5rem;
		flex: 1;
		list-style: none;
		overflow-y: auto;
	}

	.email-tree {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.main-content {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background-color: var(--card);
		width: 100%;
		min-width: 0;
	}

	.centered-state {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		background-color: var(--background);
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
		border: 4px solid var(--border);
		border-top-color: var(--svelte);
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.heading {
		margin-bottom: 0.5rem;
		margin-top: 0;
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.2;
		color: var(--foreground);
	}

	.text-gray {
		margin: 0;
		color: var(--muted-foreground);
	}

	.btn {
		margin-top: 1rem;
		cursor: pointer;
		border-radius: 0.75rem;
		border: 0;
		background-color: color-mix(in srgb, var(--svelte) 90%, transparent);
		padding: 0.5rem 1rem;
		font-weight: 600;
		color: var(--primary-foreground);
		transition: all 0.15s;
		box-shadow: 0 1px 3px 0 color-mix(in srgb, var(--svelte) 50%, transparent);
	}

	.btn:hover {
		background-color: var(--svelte);
		box-shadow: 0 4px 6px -1px color-mix(in srgb, var(--svelte) 50%, transparent);
	}

	.preview-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--border);
		background-color: var(--card);
		padding-inline: 1rem;
		height: 4rem;
	}

	.preview-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--card-foreground);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-left: 0.5rem;
	}

	.preview-title-icon {
		color: var(--muted-foreground);
		width: 1.15rem;
		height: 1.15rem;
	}

	.preview-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.view-toggle {
		display: inline-flex;
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		background-color: var(--muted);
		padding: 0.25rem;
	}

	.view-toggle-btn {
		cursor: pointer;
		border: 0;
		background-color: transparent;
		padding: 0.375rem 0.75rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--secondary-foreground);
		border-radius: 0.6rem;
		transition: all 0.15s;
	}

	.view-toggle-btn:hover {
		color: var(--foreground);
	}

	.view-toggle-btn.active {
		background-color: var(--card);
		color: var(--card-foreground);
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
	}

	.btn-primary {
		display: flex;
		cursor: pointer;
		align-items: center;
		gap: 0.5rem;
		border-radius: 0.75rem;
		border: 0;
		background-color: color-mix(in srgb, var(--svelte) 90%, transparent);
		padding: 0.5rem 1rem;
		font-size: 0.85rem;
		font-weight: 500;
		color: white;
		transition: all 0.15s;
		box-shadow: 0 1px 3px 0 color-mix(in srgb, var(--svelte) 50%, transparent);
	}

	.btn-primary:hover {
		background-color: var(--svelte);
		box-shadow: 0 4px 6px -1px color-mix(in srgb, var(--svelte) 50%, transparent);
	}

	.send-btn-icon {
		width: 1rem;
		height: 1rem;
	}

	.preview-container {
		flex: 1;
		overflow: hidden;
		background-color: var(--background);
		padding: 1rem;
	}

	.preview-iframe {
		height: 100%;
		width: 100%;
		border-radius: 0.75rem;
		border: 1px solid var(--border);
		background-color: var(--card);
	}

	.code-view {
		flex: 1;
		overflow: auto;
		background-color: var(--background);
		padding: 1rem;
	}

	.code-view-content {
		height: 100%;
		width: 100%;
		border-radius: 0.75rem;
		border: 1px solid var(--border);
		background-color: #101010;
		overflow: auto;
	}

	.code-content {
		font-size: 0.75rem;
		padding: 1rem 1.25rem;
	}

	.code-empty {
		padding: 1.5rem;
		font-size: 0.875rem;
		color: var(--muted-foreground);
		text-align: center;
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
		border-radius: 0.75rem;
		background-color: var(--card);
		padding: 1.5rem;
		box-shadow:
			0 20px 25px -5px rgb(0 0 0 / 0.1),
			0 8px 10px -6px rgb(0 0 0 / 0.1);
	}

	.modal-title {
		margin: 0 0 1.5rem;
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: -0.01em;
		color: var(--card-foreground);
	}

	.success-message {
		margin-bottom: 1rem;
		border-radius: 0.75rem;
		background-color: #f0fdf4;
		border: 1px solid #bbf7d0;
		padding: 1.25rem;
		text-align: center;
	}

	.success-icon {
		margin-bottom: 0.75rem;
		font-size: 2rem;
	}

	.success-text {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.5;
		color: #166534;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.form-input {
		width: 100%;
		border-radius: 0.75rem;
		border: 1px solid var(--input);
		padding: 0.625rem 0.875rem;
		font-size: 0.875rem;
		background-color: var(--card);
		color: var(--card-foreground);
		transition: all 0.15s;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}

	.form-input:focus {
		outline: none;
		border-color: var(--svelte);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--svelte) 10%, transparent);
	}

	.form-help {
		margin-top: 0.5rem;
		font-size: 0.8125rem;
		line-height: 1.5;
		color: var(--muted-foreground);
	}

	.error-message {
		margin-bottom: 1rem;
		border-radius: 0.75rem;
		background-color: #fef2f2;
		border: 1px solid #fecaca;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.5;
		color: #991b1b;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.btn-cancel {
		cursor: pointer;
		border-radius: 0.75rem;
		border: 1px solid var(--border);
		background-color: var(--muted);
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--secondary-foreground);
		transition: all 0.15s;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}

	.btn-cancel:hover:not(:disabled) {
		background-color: var(--secondary);
		color: var(--foreground);
	}

	.btn-cancel:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.btn-submit {
		cursor: pointer;
		border-radius: 0.75rem;
		border: 0;
		background-color: color-mix(in srgb, var(--svelte) 90%, transparent);
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: white;
		transition: all 0.15s;
		box-shadow: 0 1px 3px 0 color-mix(in srgb, var(--svelte) 50%, transparent);
	}

	.btn-submit:hover:not(:disabled) {
		background-color: var(--svelte);
		box-shadow: 0 4px 6px -1px color-mix(in srgb, var(--svelte) 50%, transparent);
	}

	.btn-submit:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
