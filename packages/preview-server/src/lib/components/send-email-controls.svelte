<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import Mail from '@lucide/svelte/icons/mail';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import { getSendEmailConfig, saveSendEmailConfig, sendTestEmail } from '$lib/preview-api-client';
	import type { SendEmailConfig } from '$lib/send-email-config';

	const DEFAULT_FROM = 'onboarding@resend.dev';
	const RECIPIENT_STORAGE_KEY = 'bse_send_email_to';

	type Props = {
		previewApiOrigin: string;
		sendEmailConfig: SendEmailConfig;
		selectedFile: string | null;
		html: string;
	};

	let { previewApiOrigin, sendEmailConfig, selectedFile, html }: Props = $props();

	// svelte-ignore state_referenced_locally
	let configuredFrom = $state<string | null>(sendEmailConfig.from);

	let setupDialogOpen = $state(false);
	let sendPopoverOpen = $state(false);

	let apiKey = $state('');
	let fromAddress = $state(DEFAULT_FROM);
	let persistCredentials = $state(true);
	let setupLoading = $state(false);
	let setupError = $state<string | null>(null);

	let recipientEmail = $state('');
	let sendLoading = $state(false);
	let sendError = $state<string | null>(null);
	let sendSuccess = $state(false);

	const sendDisabled = $derived(!html || !selectedFile || !previewApiOrigin);

	function loadStoredRecipient() {
		if (!browser) {
			return;
		}
		const stored = localStorage.getItem(RECIPIENT_STORAGE_KEY);
		if (stored) {
			recipientEmail = stored;
		}
	}

	function storeRecipient(value: string) {
		if (!browser) {
			return;
		}
		localStorage.setItem(RECIPIENT_STORAGE_KEY, value);
	}

	async function refreshConfig(): Promise<SendEmailConfig | null> {
		if (!previewApiOrigin) {
			return null;
		}
		try {
			const config = await getSendEmailConfig(previewApiOrigin);
			configuredFrom = config.from;
			if (config.from) {
				fromAddress = config.from;
			}
			return config;
		} catch {
			configuredFrom = null;
			return null;
		}
	}

	$effect(() => {
		configuredFrom = sendEmailConfig.from;
		if (sendEmailConfig.from) {
			fromAddress = sendEmailConfig.from;
		}
	});

	onMount(() => {
		loadStoredRecipient();
	});

	async function handleSendEmailClick(event: MouseEvent) {
		event.preventDefault();
		if (sendDisabled) {
			return;
		}

		sendError = null;
		sendSuccess = false;
		setupError = null;
		sendPopoverOpen = false;

		const config = await refreshConfig();
		if (!config?.configured) {
			setupDialogOpen = true;
			return;
		}

		sendPopoverOpen = true;
	}

	async function handleSaveSetup() {
		if (!previewApiOrigin) {
			return;
		}

		setupLoading = true;
		setupError = null;
		try {
			const config = await saveSendEmailConfig(previewApiOrigin, {
				apiKey: apiKey.trim(),
				from: fromAddress.trim() || DEFAULT_FROM,
				persist: persistCredentials
			});
			configuredFrom = config.from;
			apiKey = '';
			setupDialogOpen = false;
			sendPopoverOpen = true;
			await invalidateAll();
		} catch (error) {
			setupError = error instanceof Error ? error.message : 'Failed to save Resend settings.';
		} finally {
			setupLoading = false;
		}
	}

	async function handleSend() {
		if (!previewApiOrigin || !selectedFile || !html.trim()) {
			return;
		}

		const to = recipientEmail.trim();
		if (!to) {
			sendError = 'Recipient email is required.';
			return;
		}

		sendLoading = true;
		sendError = null;
		sendSuccess = false;
		try {
			await sendTestEmail(previewApiOrigin, {
				to,
				file: selectedFile,
				html
			});
			storeRecipient(to);
			sendSuccess = true;
		} catch (error) {
			sendError = error instanceof Error ? error.message : 'Failed to send email.';
		} finally {
			sendLoading = false;
		}
	}
</script>

<Popover.Root bind:open={sendPopoverOpen}>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				size="sm"
				disabled={sendDisabled}
				onclick={handleSendEmailClick}
			>
				<Mail class="size-3" />
				Send Email
			</Button>
		{/snippet}
	</Popover.Trigger>

	<Popover.Content class="w-80" align="end">
		<Popover.Header>
			<Popover.Title>Send test email</Popover.Title>
			{#if configuredFrom}
				<Popover.Description>From {configuredFrom}</Popover.Description>
			{/if}
		</Popover.Header>

		<div class="grid gap-3 py-2">
			<div class="grid gap-2">
				<Label for="send-to">To</Label>
				<Input
					id="send-to"
					type="email"
					placeholder="you@example.com"
					bind:value={recipientEmail}
					onkeydown={(event) => {
						if (event.key === 'Enter' && !sendLoading) {
							void handleSend();
						}
					}}
				/>
			</div>
			{#if sendError}
				<p class="text-sm text-destructive">{sendError}</p>
			{/if}
			{#if sendSuccess}
				<p class="text-sm text-green-600 dark:text-green-500">Email sent successfully.</p>
			{/if}
			<Button class="w-full" onclick={handleSend} disabled={sendLoading || !recipientEmail.trim()}>
				{sendLoading ? 'Sending…' : 'Send'}
			</Button>
		</div>
	</Popover.Content>
</Popover.Root>

<Dialog.Root bind:open={setupDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Resend setup</Dialog.Title>
			<Dialog.Description>
				Connect Resend to send test emails from the preview. Your API key is only used by the local
				CLI server.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-2">
			<div class="grid gap-2">
				<Label for="resend-api-key">API key</Label>
				<Input
					id="resend-api-key"
					type="password"
					autocomplete="off"
					placeholder="re_..."
					bind:value={apiKey}
				/>
			</div>
			<div class="grid gap-2">
				<Label for="resend-from">From</Label>
				<Input id="resend-from" type="email" bind:value={fromAddress} placeholder={DEFAULT_FROM} />
			</div>
			<div class="flex items-start gap-2">
				<Checkbox id="resend-persist" bind:checked={persistCredentials} />
				<div class="grid gap-1 leading-none">
					<Label for="resend-persist" class="font-normal">Save credentials in .bse/</Label>
					<p class="text-xs text-muted-foreground">
						Stores <code class="text-xs">.bse/resend.json</code> in your project (gitignored). When unchecked,
						credentials last until you stop the dev server.
					</p>
				</div>
			</div>
			{#if setupError}
				<p class="text-sm text-destructive">{setupError}</p>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (setupDialogOpen = false)} disabled={setupLoading}>
				Cancel
			</Button>
			<Button onclick={handleSaveSetup} disabled={setupLoading || !apiKey.trim()}>
				{setupLoading ? 'Saving…' : 'Save & continue'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
