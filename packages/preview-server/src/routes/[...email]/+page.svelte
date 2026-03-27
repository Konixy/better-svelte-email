<script lang="ts">
	import PreviewWorkbench from '$lib/components/preview-workbench.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PreviewWorkbench {...data} />
