<script>
	import { page } from '$app/state';
</script>

<div class="flex min-h-dvh flex-col items-center justify-center gap-2 text-center">
	<h1 class="text-4xl font-bold">{page.status ?? 'Error'}</h1>
	<p class="text-lg">{page.error?.message ?? 'An unknown error occurred'}</p>
	<a
		href="/"
		class="text-sm text-muted-foreground underline decoration-muted-foreground/20 underline-offset-2 transition-colors hover:decoration-muted-foreground/40"
	>
		Go back to the home page
	</a>
</div>
