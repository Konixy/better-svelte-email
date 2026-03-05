<script lang="ts">
	import EmailTreeNodeComponent from './EmailTreeNode.svelte';
	import type { DirectoryEntry, EmailTreeEntry } from './email-tree.js';

	type Props = {
		node: EmailTreeEntry;
		depth?: number;
		selectedEmail?: string | null;
		onSelect: (path: string) => void;
	};

	let { node, depth = 0, selectedEmail = null, onSelect }: Props = $props();

	let expanded = $state(true);
	let isDirectory = $derived(node.type === 'directory');
	let isActiveFile = $derived(node.type === 'file' && selectedEmail === node.path);
	let isActiveDirectory = $derived(
		node.type === 'directory' && !!selectedEmail && selectedEmail.startsWith(`${node.path}/`)
	);
	let containsSelected = $derived(
		isDirectory &&
			selectedEmail !== null &&
			(selectedEmail === node.path || selectedEmail.startsWith(`${node.path}/`))
	);
	let directoryItems = $derived(isDirectory ? (node as DirectoryEntry).items : []);

	function toggleDirectory() {
		if (isDirectory) {
			expanded = !expanded;
		}
	}

	$effect(() => {
		if (containsSelected && !expanded) {
			expanded = true;
		}
	});

	function handleSelect() {
		if (node.type === 'file') {
			onSelect(node.path);
		}
	}
</script>

<li class="tree-node" data-node-type={node.type}>
	{#if isDirectory}
		<button
			class="email-directory"
			class:active={isActiveDirectory}
			class:collapsed={!expanded}
			style={`--node-depth: ${depth};`}
			type="button"
			onclick={toggleDirectory}
			aria-expanded={expanded}
		>
			<span class="email-icon caret" aria-hidden="true">
				{#if expanded}
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
						<path
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m6 9 6 6 6-6"
						/>
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
						<path
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m9 6 6 6-6 6"
						/>
					</svg>
				{/if}
			</span>
			<span class="email-icon folder" aria-hidden="true">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M4 4h5l2 3h9a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
				</svg>
			</span>
			<span class="email-directory-name">{node.name}</span>
		</button>
		{#if expanded && directoryItems.length > 0}
			<ul class="email-children">
				{#each directoryItems as child (child.path)}
					<EmailTreeNodeComponent node={child} depth={depth + 1} {selectedEmail} {onSelect} />
				{/each}
			</ul>
		{/if}
	{:else}
		<button
			class="email-button"
			class:active={isActiveFile}
			style={`--node-depth: ${depth};`}
			type="button"
			onclick={handleSelect}
		>
			<span class="email-icon" aria-hidden="true">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 93.2 112">
					<path
						fill="currentColor"
						d="M87.3,14.8L87.3,14.8C76.9-0.1,56.3-4.5,41.5,5L15.4,21.6c-7.1,4.5-12,11.8-13.5,20c-1.2,6.9-0.2,14,3.1,20.2
          c-2.2,3.4-3.8,7.2-4.5,11.2C-1,81.5,1,90.2,5.9,97.2c10.4,14.9,30.9,19.3,45.8,9.8l26.1-16.6c7.1-4.5,12-11.8,13.5-20
          c1.2-6.9,0.2-14-3.1-20.2c2.2-3.4,3.8-7.2,4.5-11.2C94.2,30.5,92.2,21.8,87.3,14.8z M79.8,36.2c-0.2,0.8-0.4,1.6-0.6,2.4l-0.5,1.5
          l-1.3-1c-3.1-2.3-6.5-4-10.2-5.1l-1-0.3l0.1-1c0.1-1.4-0.3-2.7-1.1-3.9c-1.5-2.2-4.2-3.1-6.7-2.5c-0.6,0.2-1.1,0.4-1.6,0.7
          L30.8,43.7c-1.3,0.8-2.2,2.1-2.4,3.6c-0.3,1.5,0.1,3.1,1,4.4c1.5,2.2,4.2,3.1,6.7,2.5c0.6-0.2,1.1-0.4,1.6-0.7l10-6.3
          c1.6-1,3.4-1.8,5.3-2.3c8.4-2.2,17.3,1.1,22.2,8.2c3,4.2,4.2,9.4,3.3,14.5c-0.9,5-3.8,9.4-8.1,12.1L44.2,96.3
          c-1.6,1-3.4,1.8-5.3,2.3h0c-8.4,2.2-17.3-1.1-22.2-8.2c-3-4.2-4.2-9.4-3.3-14.5c0.2-0.8,0.4-1.6,0.6-2.4l0.5-1.5l1.3,1
          c3.1,2.3,6.5,4,10.2,5.1l1,0.3l-0.1,1c-0.1,1.4,0.3,2.8,1.1,3.9c1.5,2.2,4.2,3.1,6.7,2.5c0.6-0.2,1.1-0.4,1.6-0.7l26.1-16.6
          c1.3-0.8,2.2-2.1,2.5-3.6c0.3-1.5-0.1-3.1-1-4.4c-1.5-2.2-4.2-3.1-6.7-2.5c-0.6,0.2-1.1,0.4-1.6,0.7l-10,6.3c-1.6,1-3.4,1.8-5.3,2.3
          C31.9,69.4,23,66.1,18,58.9c-3-4.2-4.2-9.4-3.3-14.5c0.9-5,3.8-9.4,8.1-12.1L49,15.7c1.6-1,3.4-1.8,5.3-2.3
          c8.4-2.2,17.3,1.1,22.2,8.2C79.5,25.9,80.7,31.1,79.8,36.2z"
					/>
				</svg>
			</span>
			<span class="email-name">{node.name}</span>
		</button>
	{/if}
</li>

<style>
	.tree-node {
		list-style: none;
	}

	.email-directory {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.375rem 0.75rem;
		padding-left: calc(0.75rem + var(--node-depth, 0) * 1rem);
		border-radius: 0.5rem;
		border: 0;
		background-color: transparent;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--secondary-foreground);
		cursor: pointer;
		transition: all 0.15s;
		justify-content: flex-start;
	}

	.email-directory .email-icon.folder {
		display: block;
	}

	.email-directory .email-icon.caret {
		display: none;
	}

	.email-directory:hover {
		background-color: var(--muted);
	}

	.email-directory:not(.active):hover .email-icon.folder {
		display: none;
	}

	.email-directory:not(.active):hover .email-icon.caret {
		display: block;
	}

	.email-button {
		display: flex;
		width: 100%;
		cursor: pointer;
		align-items: center;
		gap: 0.75rem;
		border-radius: 0.75rem;
		border: 0;
		background-color: transparent;
		padding: 0.5rem 0.75rem;
		padding-left: calc(0.75rem + var(--node-depth, 0) * 1rem);
		text-align: left;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--secondary-foreground);
		transition: all 0.15s;
	}

	.email-button:hover {
		background-color: var(--muted);
	}

	.email-button.active {
		background-color: color-mix(in srgb, var(--svelte) 10%, transparent);
		color: var(--svelte);
		font-weight: 500;
	}

	.email-button.active:hover {
		background-color: color-mix(in srgb, var(--svelte) 15%, transparent);
	}

	.email-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.email-directory.active {
		color: var(--foreground);
		background-color: color-mix(in srgb, var(--muted) 80%, transparent);
	}

	/* .email-directory.collapsed .folder {
		opacity: 0.7;
	} */

	/* .email-directory.collapsed .email-directory-name {
		color: var(--muted-foreground);
	} */

	.email-children {
		margin: 0.125rem 0 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.email-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--muted-foreground);
		min-width: 1rem;
		min-height: 1rem;
	}

	.email-icon.caret {
		color: var(--muted-foreground);
	}

	.email-directory.active .email-icon {
		color: var(--foreground);
	}

	.email-directory.active .email-icon.caret {
		color: var(--foreground);
	}

	.email-button.active .email-icon {
		color: var(--svelte);
	}

	.email-icon svg {
		width: 1rem;
		height: 1rem;
	}
</style>
