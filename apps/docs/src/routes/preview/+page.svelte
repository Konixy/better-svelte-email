<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import Github from '$lib/components/github.svelte';
	import { MoonIcon, SunIcon, Construction } from '@lucide/svelte';
</script>

<div class="relative mr-2 flex min-h-dvh flex-col">
	<div class="flex flex-1 items-center justify-center overflow-hidden">
		<div class="relative z-10 mx-auto max-w-md px-6 text-center">
			<div class="mb-6 flex justify-center">
				<div class="rounded-full bg-muted p-4">
					<Construction class="size-8 text-muted-foreground" />
				</div>
			</div>

			<h1 class="mb-3 text-2xl font-bold tracking-tight text-foreground">Under Development</h1>

			<p class="mb-8 font-mono text-sm leading-relaxed text-foreground/80">
				The preview demo is not yet available on the new docs.
				<br />
				You can still try it out on your own project, see the <Button
					variant="link"
					class="text-foreground/80"
					href="/docs/email-dev-server"
				>
					Email dev server
				</Button> documentation for more information.
			</p>

			<Button variant="outline" href="/" class="font-mono text-sm">Return Home</Button>
		</div>
	</div>
</div>
