<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div class="-mx-1 my-6 overflow-x-auto px-1">
	<table
		class="w-full min-w-lg border-collapse border border-border text-sm [&_tbody_tr:hover]:bg-muted/25 [&_td]:border-t [&_td]:border-border [&_td]:px-4 [&_td]:py-2.5 [&_td]:align-top [&_td]:leading-relaxed [&_td_code]:text-[12px] [&_td:first-child]:font-mono [&_td:first-child]:text-[13px] [&_td:first-child]:text-foreground/90 [&_th]:border-b [&_th]:border-border [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground [&_th_code]:text-[12px] [&_th:first-child]:font-mono [&_th:first-child]:text-[13px] [&_th:first-child]:text-foreground/90 [&_thead]:bg-muted/50"
	>
		{@render children?.()}
	</table>
</div>
