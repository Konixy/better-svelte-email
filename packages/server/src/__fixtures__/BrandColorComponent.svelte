<script>
	let {
		// The doctype the `Html` component writes; without one the document renders in quirks mode
		doctype = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
		theme = undefined,
		htmlClass = undefined,
		htmlStyle = undefined,
		bodyClass = undefined,
		textClass = 'text-brand'
	} = $props();
</script>

{@html doctype}
<html lang="en" data-theme={theme} class={htmlClass} style={htmlStyle}>
	<head></head>
	<body class={bodyClass}>
		<p class={textClass}>Brand</p>
	</body>
</html>
