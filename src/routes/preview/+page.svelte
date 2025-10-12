<script lang="ts">
	import { EmailPreview } from '$lib/preview/index.js';
	import type { PreviewData } from '$lib/preview/index.js';

	let { data }: { data: { emails: PreviewData } } = $props();
</script>

<svelte:head>
	<title>Email Preview | better-svelte-email</title>
</svelte:head>

<EmailPreview emailList={data.emails} />
