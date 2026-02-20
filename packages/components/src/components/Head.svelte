<script lang="ts">
	let { children }: { children?: any } = $props();
</script>

<head>
	<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="x-apple-disable-message-reformatting" />
	<!--[if !mso]><!-->
	<meta http-equiv="x-ua-compatible" content="IE=edge" />
	<!--<![endif]-->
	{@render children?.()}
</head>
