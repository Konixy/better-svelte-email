<script lang="ts">
	import EmailPreview from '@better-svelte-email/preview/EmailPreview.svelte';
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Email Preview · Better Svelte Email</title>
</svelte:head>

<EmailPreview {page} />
