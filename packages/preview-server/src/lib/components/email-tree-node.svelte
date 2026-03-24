<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import FileCode2 from '@lucide/svelte/icons/file-code-2';
	import Folder from '@lucide/svelte/icons/folder';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import EmailTreeNode from './email-tree-node.svelte';
	import { cn } from '$lib/utils';
	import type { DirectoryEntry, EmailTreeEntry } from '$lib/email-tree';
	import SvelteIcon from '$lib/svelte-icon.svelte';

	type Props = {
		node: EmailTreeEntry;
		depth?: number;
		selectedFile?: string | null;
		searchActive?: boolean;
		toEmailHref: (path: string) => string;
	};

	let { node, depth = 0, selectedFile = null, searchActive = false, toEmailHref }: Props = $props();

	let manuallyExpanded = $state(false);
	let manuallyCollapsed = $state(false);
	let isDirectory = $derived(node.type === 'directory');
	let isActiveFile = $derived(node.type === 'file' && selectedFile === node.path);
	let containsSelected = $derived(
		node.type === 'directory' &&
			!!selectedFile &&
			(selectedFile === node.path || selectedFile.startsWith(`${node.path}/`))
	);
	let directoryItems = $derived(isDirectory ? (node as DirectoryEntry).items : []);
	let expanded = $derived(
		searchActive || containsSelected || manuallyExpanded || (!manuallyCollapsed && depth < 1)
	);

	function toggleDirectory() {
		if (isDirectory) {
			if (expanded) {
				manuallyExpanded = false;
				manuallyCollapsed = true;
				return;
			}

			manuallyCollapsed = false;
			manuallyExpanded = true;
		}
	}

	function indentation(depth: number) {
		return `${0.5 + depth * 1}rem`;
	}
</script>

<li class="list-none">
	{#if isDirectory}
		<button
			type="button"
			class={cn(
				'group flex w-full items-center gap-2 py-1.5 pr-3 text-left text-xs transition-colors',
				containsSelected
					? 'font-medium text-foreground'
					: 'text-muted-foreground hover:text-foreground'
			)}
			style={`padding-left: ${indentation(depth)};`}
			onclick={toggleDirectory}
			aria-expanded={expanded}
		>
			<span
				class="flex size-4 shrink-0 items-center justify-center opacity-50 transition-opacity group-hover:opacity-100"
			>
				{#if expanded}
					<ChevronDown class="size-3" />
				{:else}
					<ChevronRight class="size-3" />
				{/if}
			</span>
			{#if expanded || containsSelected}
				<FolderOpen class="size-3.5 shrink-0" />
			{:else}
				<Folder class="size-3.5 shrink-0" />
			{/if}
			<span class="truncate">{node.name}</span>
		</button>

		{#if expanded && directoryItems.length > 0}
			<ul class="flex flex-col gap-px">
				{#each directoryItems as child (child.path)}
					<EmailTreeNode
						node={child}
						depth={depth + 1}
						{selectedFile}
						{searchActive}
						{toEmailHref}
					/>
				{/each}
			</ul>
		{/if}
	{:else}
		<a
			href={toEmailHref(node.path)}
			class={cn(
				'group relative flex w-full items-center gap-2 py-1.5 pr-3 text-left text-xs transition-colors',
				isActiveFile
					? 'bg-foreground font-medium text-background'
					: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
			)}
			style={`padding-left: ${indentation(depth)}`}
			aria-current={isActiveFile ? 'page' : undefined}
		>
			{#if isActiveFile}
				<div class="absolute top-0 bottom-0 left-0 w-0.5 bg-svelte"></div>
			{/if}
			<SvelteIcon
				class={cn(
					'size-3.5 shrink-0',
					isActiveFile ? 'text-svelte' : 'opacity-70 group-hover:opacity-100'
				)}
			/>
			<span class="truncate">{node.name}</span>
		</a>
	{/if}
</li>
