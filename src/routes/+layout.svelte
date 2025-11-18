<script>
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<ModeWatcher />
<main>
	{@render children()}
</main>

<style>
	@reference '../app.css';
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}
	:global(::selection) {
		@apply bg-svelte/30;
	}
</style>
