<script lang="ts">
	import { styleToString } from '$lib/utils/index.js';
	import type { HTMLAttributes } from 'svelte/elements';

	const PREVIEW_MAX_LENGTH = 150;

	let { preview, ...restProps }: { preview: string } & HTMLAttributes<HTMLDivElement> = $props();

	let text = $derived(preview.substring(0, PREVIEW_MAX_LENGTH));

	const renderWhiteSpace = (text: string) => {
		if (text.length >= PREVIEW_MAX_LENGTH) return '';
		const whiteSpaceCodes = '\xa0\u200C\u200B\u200D\u200E\u200F\uFEFF';
		return whiteSpaceCodes.repeat(PREVIEW_MAX_LENGTH - text.length);
	};
</script>

<div
	id="__better-svelte-email-preview"
	style={styleToString({
		display: 'none',
		overflow: 'hidden',
		lineHeight: '1px',
		opacity: 0,
		maxHeight: 0,
		maxWidth: 0
	})}
	data-skip-in-text={true}
	{...restProps}
>
	{text}
	<div>
		{renderWhiteSpace(text)}
	</div>
</div>
