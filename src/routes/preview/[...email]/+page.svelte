<script lang="ts">
	import { EmailPreview } from '$lib/preview/index.js';
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Email Preview · Better Svelte Email</title>
</svelte:head>

<EmailPreview {page} />
