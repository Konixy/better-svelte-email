<script>
	import { styleToString, pxToPt } from '$lib/utils/index.js';

	let {
		href = '#',
		target = '_blank',
		styleString = '',
		pX = 0,
		pY = 0,
		children,
		...restProps
	} = $props();

	const y = pY * 2;
	const textRaise = pxToPt(y.toString());

	// Button link styles
	const buttonStyle = styleToString({
		lineHeight: '100%',
		textDecoration: 'none',
		display: 'inline-block',
		maxWidth: '100%',
		padding: pY || pX ? `${pY}px ${pX}px` : undefined
	});

	// Button text styles with MSO support
	const buttonTextStyle = styleToString({
		maxWidth: '100%',
		display: 'inline-block',
		lineHeight: '120%',
		textDecoration: 'none',
		textTransform: 'none',
		msoPaddingAlt: '0px',
		msoTextRaise: pY ? pxToPt(pY.toString()) : undefined
	});

	const finalStyle = buttonStyle + (styleString ? ';' + styleString : '');
</script>

<a {...restProps} {href} {target} style={finalStyle}>
	{#if pX}
		<span>
			{@html `<!--[if mso]><i style="letter-spacing: ${pX}px;mso-font-width:-100%;mso-text-raise:${textRaise}" hidden>&nbsp;</i><![endif]-->`}
		</span>
	{/if}
	<span style={buttonTextStyle}>
		{@render children?.()}
	</span>
	{#if pX}
		<span>
			{@html `<!--[if mso]><i style="letter-spacing: ${pX}px;mso-font-width:-100%" hidden>&nbsp;</i><![endif]-->`}
		</span>
	{/if}
</a>
