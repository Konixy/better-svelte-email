<script lang="ts">
	import { Preview } from '$lib/preview/index.js';
	import type { PreviewData } from '$lib/preview/index.js';

	let { data }: { data: { emails: PreviewData } } = $props();
</script>

<svelte:head>
	<title>Email Preview | better-svelte-email</title>
</svelte:head>

<Preview emailList={data.emails} />
