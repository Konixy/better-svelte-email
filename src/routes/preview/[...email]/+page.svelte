<script lang="ts">
	import { EmailPreview } from '$lib/preview/index.js';
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Email Preview | better-svelte-email</title>
</svelte:head>

<EmailPreview {page} />
