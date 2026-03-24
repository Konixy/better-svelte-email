<script lang="ts">
	import { browser } from '$app/environment';
	import Copy from '@lucide/svelte/icons/copy';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import MoonStar from '@lucide/svelte/icons/moon-star';
	import PanelLeftOpen from '@lucide/svelte/icons/panel-left-open';
	import Search from '@lucide/svelte/icons/search';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import SunMedium from '@lucide/svelte/icons/sun-medium';
	import Tablet from '@lucide/svelte/icons/tablet';
	import Monitor from '@lucide/svelte/icons/monitor';
	import WandSparkles from '@lucide/svelte/icons/wand-sparkles';
	import { createSearchParamsSchema, useSearchParams } from 'runed/kit';
	import { useTheme } from 'svelte-themes';
	import EmailTreeNode from '$lib/components/email-tree-node.svelte';
	import ShikiCode from '$lib/components/shiki-code.svelte';
	import { buildEmailTree, filterEmailTree, type EmailTreeEntry } from '$lib/email-tree';
	import { cn } from '$lib/utils';
	import { Check, CodeIcon, PanelLeftClose } from '@lucide/svelte';
	import SvelteIcon from '$lib/svelte-icon.svelte';
	import * as Tooltip from './ui/tooltip';

	type Props = {
		files: string[];
		emailPath: string;
		emailsError: string | null;
		selectedFile: string | null;
		html: string;
		source: string;
		renderTimeMs: number | null;
		renderError: string | null;
	};

	type ViewMode = 'render' | 'html' | 'source';

	type ViewportPresetKey = 'mobile' | 'tablet' | 'desktop';

	const VIEWPORT_DEVICE_PRESETS: Record<ViewportPresetKey, { width: number; height: number }> = {
		mobile: { width: 390, height: 580 },
		tablet: { width: 768, height: 700 },
		desktop: { width: 1200, height: 640 }
	};

	/** Widest first (iteration / tie-break order). */
	const VIEWPORT_PRESET_KEYS: readonly ViewportPresetKey[] = ['desktop', 'tablet', 'mobile'];

	/** Pixels within which resize snaps to the nearest preset width or height. */
	const VIEWPORT_SNAP_PX = 18;

	function effectiveBreakpointWidth(w: number, minW: number, maxW: number): number {
		return Math.max(minW, Math.min(maxW, w));
	}

	function effectiveBreakpointHeight(h: number, minH: number, maxH: number): number {
		return Math.max(minH, Math.min(maxH, h));
	}

	function snapToPresetWidths(raw: number, minW: number, maxW: number): number {
		const clamped = Math.max(minW, Math.min(maxW, raw));
		let best: number | null = null;
		let bestDist = VIEWPORT_SNAP_PX + 1;
		for (const key of VIEWPORT_PRESET_KEYS) {
			const p = VIEWPORT_DEVICE_PRESETS[key];
			const target = effectiveBreakpointWidth(p.width, minW, maxW);
			const d = Math.abs(clamped - target);
			if (d <= VIEWPORT_SNAP_PX && d < bestDist) {
				bestDist = d;
				best = target;
			}
		}
		return best !== null ? best : clamped;
	}

	function snapToPresetHeights(raw: number, minH: number, maxH: number): number {
		const clamped = Math.max(minH, Math.min(maxH, raw));
		let best: number | null = null;
		let bestDist = VIEWPORT_SNAP_PX + 1;
		for (const key of VIEWPORT_PRESET_KEYS) {
			const p = VIEWPORT_DEVICE_PRESETS[key];
			const target = effectiveBreakpointHeight(p.height, minH, maxH);
			const d = Math.abs(clamped - target);
			if (d <= VIEWPORT_SNAP_PX && d < bestDist) {
				bestDist = d;
				best = target;
			}
		}
		return best !== null ? best : clamped;
	}

	function magneticPresetFromWidth(
		raw: number,
		minW: number,
		maxW: number
	): ViewportPresetKey | null {
		const clamped = Math.max(minW, Math.min(maxW, raw));
		let bestKey: ViewportPresetKey | null = null;
		let bestDist = VIEWPORT_SNAP_PX + 1;
		for (const key of VIEWPORT_PRESET_KEYS) {
			const p = VIEWPORT_DEVICE_PRESETS[key];
			const tw = effectiveBreakpointWidth(p.width, minW, maxW);
			const d = Math.abs(clamped - tw);
			if (d <= VIEWPORT_SNAP_PX && d < bestDist) {
				bestDist = d;
				bestKey = key;
			}
		}
		return bestKey;
	}

	function magneticPresetFromHeight(
		raw: number,
		minH: number,
		maxH: number
	): ViewportPresetKey | null {
		const clamped = Math.max(minH, Math.min(maxH, raw));
		let bestKey: ViewportPresetKey | null = null;
		let bestDist = VIEWPORT_SNAP_PX + 1;
		for (const key of VIEWPORT_PRESET_KEYS) {
			const p = VIEWPORT_DEVICE_PRESETS[key];
			const th = effectiveBreakpointHeight(p.height, minH, maxH);
			const d = Math.abs(clamped - th);
			if (d <= VIEWPORT_SNAP_PX && d < bestDist) {
				bestDist = d;
				bestKey = key;
			}
		}
		return bestKey;
	}

	function magneticRectForPreset(
		key: ViewportPresetKey,
		minW: number,
		maxW: number,
		minH: number,
		maxH: number
	): { w: number; h: number } {
		const p = VIEWPORT_DEVICE_PRESETS[key];
		return {
			w: effectiveBreakpointWidth(p.width, minW, maxW),
			h: effectiveBreakpointHeight(p.height, minH, maxH)
		};
	}

	/** Corner drag: snap both axes to the same preset when pointer is near that preset's box. */
	function snapCornerWithGuide(
		rawW: number,
		rawH: number,
		minW: number,
		maxW: number,
		minH: number,
		maxH: number
	): { w: number; h: number; guideKey: ViewportPresetKey | null } {
		const cw = Math.max(minW, Math.min(maxW, rawW));
		const ch = Math.max(minH, Math.min(maxH, rawH));
		let bestKey: ViewportPresetKey | null = null;
		let bestScore = Infinity;
		for (const key of VIEWPORT_PRESET_KEYS) {
			const p = VIEWPORT_DEVICE_PRESETS[key];
			const tw = effectiveBreakpointWidth(p.width, minW, maxW);
			const th = effectiveBreakpointHeight(p.height, minH, maxH);
			const dw = Math.abs(cw - tw);
			const dh = Math.abs(ch - th);
			if (dw <= VIEWPORT_SNAP_PX && dh <= VIEWPORT_SNAP_PX) {
				const score = dw * dw + dh * dh;
				if (score < bestScore) {
					bestScore = score;
					bestKey = key;
				}
			}
		}
		if (bestKey !== null) {
			const r = magneticRectForPreset(bestKey, minW, maxW, minH, maxH);
			return { w: r.w, h: r.h, guideKey: bestKey };
		}
		const w = snapToPresetWidths(rawW, minW, maxW);
		const h = snapToPresetHeights(rawH, minH, maxH);
		const rawW2 = Math.max(minW, Math.min(maxW, rawW));
		const rawH2 = Math.max(minH, Math.min(maxH, rawH));
		const kw = magneticPresetFromWidth(rawW2, minW, maxW);
		const kh = magneticPresetFromHeight(rawH2, minH, maxH);
		const guideKey = kw ?? kh;
		return { w, h, guideKey };
	}

	const previewSearchSchema = createSearchParamsSchema({
		view: { type: 'string', default: 'render' },
		vpw: { type: 'number', default: 896 },
		vph: { type: 'number', default: 600 }
	});

	const params = useSearchParams(previewSearchSchema, {
		pushHistory: false,
		noScroll: true
	});

	let {
		files,
		emailPath,
		emailsError,
		selectedFile,
		html,
		source,
		renderTimeMs,
		renderError
	}: Props = $props();

	function formatRenderTimeMs(ms: number): string {
		if (ms < 1) return `${ms.toFixed(2)} ms`;
		if (ms < 10) return `${ms.toFixed(1)} ms`;
		return `${Math.round(ms)} ms`;
	}

	const themeStore = useTheme();
	let searchQuery = $state('');
	let sidebarVisible = $state(true);
	let copied = $state(false);

	let viewportHostEl: HTMLDivElement | undefined = $state();
	let layoutMaxWidth = $state(2400);
	let layoutMaxHeight = $state(2000);

	let resizing = $state(false);
	let resizingV = $state(false);
	let resizingD = $state(false);

	// Plain (non-reactive) drag state
	let dragStartX = 0;
	let dragStartY = 0;
	let dragStartWidth = 0;
	let dragStartHeight = 0;
	// +1 = dragging right handle, -1 = dragging left handle
	let resizingHDir = $state<1 | -1>(1);

	let isResizing = $derived(resizing || resizingV || resizingD);

	/** Dashed guides in the magnetic snap zone (width → vertical lines only, height → horizontal only). */
	let magneticGuide = $state<{ verticalW: number | null; horizontalH: number | null } | null>(null);

	function coerceView(v: string): ViewMode {
		return v === 'html' || v === 'source' ? v : 'render';
	}

	let viewMode = $derived(coerceView(params.view));

	let storedVpw = $derived(
		typeof params.vpw === 'number' && !Number.isNaN(params.vpw) ? params.vpw : 896
	);
	let viewportWidth = $derived(Math.max(320, Math.min(layoutMaxWidth, storedVpw)));

	let storedVph = $derived(
		typeof params.vph === 'number' && !Number.isNaN(params.vph) ? params.vph : 600
	);
	let viewportHeight = $derived(Math.max(200, Math.min(layoutMaxHeight, storedVph)));

	$effect(() => {
		if (!browser || !viewportHostEl) {
			return;
		}

		const el = viewportHostEl;

		const update = () => {
			layoutMaxWidth = Math.max(320, el.clientWidth - 64);
			layoutMaxHeight = Math.max(200, el.clientHeight - 64);
		};

		update();
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	});

	function setViewportPreset(key: ViewportPresetKey) {
		const p = VIEWPORT_DEVICE_PRESETS[key];
		params.vpw = p.width;
		params.vph = p.height;
	}

	function isPresetActive(key: ViewportPresetKey) {
		const p = VIEWPORT_DEVICE_PRESETS[key];
		const tw = effectiveBreakpointWidth(p.width, 320, layoutMaxWidth);
		const th = effectiveBreakpointHeight(p.height, 200, layoutMaxHeight);
		return Math.abs(viewportWidth - tw) < 0.5 && Math.abs(viewportHeight - th) < 0.5;
	}

	// ── Width resize (left + right handles share these handlers) ─────────────
	// The card is horizontally centered, so dragging an edge by X px shifts that
	// edge only X/2 px (the other side expands by the same amount). Multiplying
	// delta by 2 makes the handle track the pointer exactly.
	// dir: +1 = right handle (drag right → grow), -1 = left handle (drag left → grow)

	function onResizeHPointerDown(e: PointerEvent, dir: 1 | -1) {
		e.preventDefault();
		const el = e.currentTarget as HTMLElement;
		el.setPointerCapture(e.pointerId);
		resizing = true;
		resizingHDir = dir;
		dragStartX = e.clientX;
		dragStartWidth = viewportWidth;
	}

	function onResizeHPointerMove(e: PointerEvent) {
		if (!resizing) return;
		const delta = (e.clientX - dragStartX) * resizingHDir * 2;
		const raw = Math.max(320, Math.min(layoutMaxWidth, dragStartWidth + delta));
		const mk = magneticPresetFromWidth(raw, 320, layoutMaxWidth);
		magneticGuide = mk
			? {
					verticalW: magneticRectForPreset(mk, 320, layoutMaxWidth, 200, layoutMaxHeight).w,
					horizontalH: null
				}
			: null;
		params.vpw = snapToPresetWidths(raw, 320, layoutMaxWidth);
	}

	function onResizeHPointerUp(e: PointerEvent) {
		if (!resizing) return;
		resizing = false;
		magneticGuide = null;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			/* already released */
		}
	}

	// ── Height resize (top + bottom handles share these handlers) ───────────────
	// The card is vertically centered, so dragging an edge by X px shifts that
	// edge only X/2 px. Multiplying delta by 2 makes the handle track the pointer.
	// dir: +1 = bottom handle (drag down → grow), -1 = top handle (drag up → grow)

	let resizingVDir = $state<1 | -1>(1);

	function onResizeVPointerDown(e: PointerEvent, dir: 1 | -1) {
		e.preventDefault();
		const el = e.currentTarget as HTMLElement;
		el.setPointerCapture(e.pointerId);
		resizingV = true;
		resizingVDir = dir;
		dragStartY = e.clientY;
		dragStartHeight = viewportHeight;
	}

	function onResizeVPointerMove(e: PointerEvent) {
		if (!resizingV) return;
		const delta = (e.clientY - dragStartY) * resizingVDir * 2;
		const raw = Math.max(200, Math.min(layoutMaxHeight, dragStartHeight + delta));
		const mk = magneticPresetFromHeight(raw, 200, layoutMaxHeight);
		magneticGuide = mk
			? {
					verticalW: null,
					horizontalH: magneticRectForPreset(mk, 320, layoutMaxWidth, 200, layoutMaxHeight).h
				}
			: null;
		params.vph = snapToPresetHeights(raw, 200, layoutMaxHeight);
	}

	function onResizeVPointerUp(e: PointerEvent) {
		if (!resizingV) return;
		resizingV = false;
		magneticGuide = null;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			/* already released */
		}
	}

	// ── Corner (width + height) resize ───────────────────────────────────────
	// Both axes use ×2 since the card is centered on both axes.

	function onResizeDPointerDown(e: PointerEvent) {
		e.preventDefault();
		const el = e.currentTarget as HTMLElement;
		el.setPointerCapture(e.pointerId);
		resizingD = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		dragStartWidth = viewportWidth;
		dragStartHeight = viewportHeight;
	}

	function onResizeDPointerMove(e: PointerEvent) {
		if (!resizingD) return;
		const rawW = Math.max(
			320,
			Math.min(layoutMaxWidth, dragStartWidth + (e.clientX - dragStartX) * 2)
		);
		const rawH = Math.max(
			200,
			Math.min(layoutMaxHeight, dragStartHeight + (e.clientY - dragStartY) * 2)
		);
		const { w, h, guideKey } = snapCornerWithGuide(
			rawW,
			rawH,
			320,
			layoutMaxWidth,
			200,
			layoutMaxHeight
		);
		params.vpw = w;
		params.vph = h;
		if (guideKey) {
			const r = magneticRectForPreset(guideKey, 320, layoutMaxWidth, 200, layoutMaxHeight);
			magneticGuide = { verticalW: r.w, horizontalH: r.h };
		} else {
			magneticGuide = null;
		}
	}

	function onResizeDPointerUp(e: PointerEvent) {
		if (!resizingD) return;
		resizingD = false;
		magneticGuide = null;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			/* already released */
		}
	}

	let emailTree = $derived(buildEmailTree(files));
	let filteredTree = $derived(filterEmailTree(emailTree, searchQuery));
	let selectedSegments = $derived(selectedFile ? selectedFile.split('/') : []);
	let iframeContent = $derived.by(() => withSansFont(html));
	let totalEmails = $derived(files.length);
	let filteredCount = $derived(countFiles(filteredTree));

	const docsUrl = 'https://better-svelte-email.konixy.dev/docs';

	function toEmailHref(path: string) {
		return `/${path
			.split('/')
			.map((segment) => encodeURIComponent(segment))
			.join('/')}`;
	}

	function toggleTheme() {
		themeStore.theme = themeStore.resolvedTheme === 'dark' ? 'light' : 'dark';
	}

	async function copyHtml() {
		if (!html) {
			return;
		}

		await navigator.clipboard.writeText(html);
		copied = true;
		window.setTimeout(() => {
			copied = false;
		}, 1500);
	}

	function withSansFont(markup: string) {
		if (!markup) {
			return '';
		}

		const fontStyle = `<style>body{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;}</style>`;
		if (markup.includes('<head>')) {
			return markup.replace('<head>', `<head>${fontStyle}`);
		}

		if (markup.includes('<body')) {
			const bodyTagEnd = markup.indexOf('>', markup.indexOf('<body'));
			if (bodyTagEnd !== -1) {
				return `${markup.slice(0, bodyTagEnd + 1)}${fontStyle}${markup.slice(bodyTagEnd + 1)}`;
			}
		}

		return `${fontStyle}${markup}`;
	}

	function countFiles(nodes: readonly EmailTreeEntry[]): number {
		return nodes.reduce((total, node) => {
			if (node.type === 'file') {
				return total + 1;
			}

			return total + countFiles(node.items);
		}, 0);
	}
</script>

<div
	class="flex h-dvh w-full overflow-hidden bg-background font-mono text-sm text-foreground selection:bg-svelte selection:text-white"
>
	<!-- Sidebar -->
	{#if sidebarVisible}
		<aside class="flex w-80 shrink-0 flex-col border-r border-border bg-muted/30">
			<!-- Header -->
			<div class="flex h-16 items-center justify-between border-b border-border p-4">
				<div class="flex items-center gap-3">
					<div class="flex size-8 items-center justify-center">
						<img src="/favicon.svg" alt="Better Svelte Email" class="size-8" />
					</div>
					<div>
						<h1 class="font-sans text-lg leading-none font-bold tracking-tight">
							Better Svelte Email
						</h1>
						<p class="text-xs text-muted-foreground">Email Preview</p>
					</div>
				</div>
				<button
					onclick={toggleTheme}
					class="text-muted-foreground transition-colors hover:text-foreground"
					aria-label="Toggle theme"
				>
					{#if themeStore.resolvedTheme === 'dark'}
						<SunMedium class="size-4" />
					{:else}
						<MoonStar class="size-4" />
					{/if}
				</button>
			</div>

			<!-- Search -->
			<div class="border-b border-border p-4">
				<div class="relative flex items-center">
					<Search class="absolute left-3 size-3 text-muted-foreground" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search templates..."
						class="w-full border border-border bg-transparent py-2 pr-4 pl-8 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-svelte focus:ring-offset-0"
					/>
				</div>
				<div class="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
					<span>{emailPath || 'src/lib/emails'}</span>
					<span>{filteredCount} / {totalEmails}</span>
				</div>
			</div>

			<!-- Tree -->
			<div class="flex-1 overflow-y-auto p-2">
				{#if emailsError}
					<div class="border border-destructive/20 bg-destructive/5 p-4 text-destructive">
						Failed to load: {emailsError}
					</div>
				{:else if totalEmails === 0}
					<div class="p-4 text-center text-muted-foreground">
						No templates found in {emailPath}.
					</div>
				{:else if filteredTree.length === 0}
					<div class="p-4 text-center text-muted-foreground">
						No matches for "{searchQuery}".
					</div>
				{:else}
					<ul class="flex flex-col gap-0.5">
						{#each filteredTree as node (node.path)}
							<EmailTreeNode {node} {selectedFile} searchActive={!!searchQuery} {toEmailHref} />
						{/each}
					</ul>
				{/if}
			</div>

			<!-- Footer -->
			<div class="border-t border-border p-4">
				<a
					href={docsUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					<ExternalLink class="size-3" />
					Documentation
				</a>
			</div>
		</aside>
	{/if}

	<!-- Main Content -->
	<main class="flex min-w-0 flex-1 flex-col bg-background">
		<!-- Topbar -->
		<header class="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
			<div class="flex items-center gap-4">
				<button
					class="text-muted-foreground transition-colors hover:text-foreground"
					onclick={() => (sidebarVisible = !sidebarVisible)}
				>
					{#if sidebarVisible}
						<PanelLeftClose class="size-4" />
					{:else}
						<PanelLeftOpen class="size-4" />
					{/if}
				</button>

				{#if selectedFile}
					<div class="flex items-center gap-2">
						<span class="text-muted-foreground">/</span>
						{#each selectedSegments as segment, i}
							<span
								class={i === selectedSegments.length - 1
									? 'font-medium text-foreground'
									: 'text-muted-foreground'}
							>
								{segment}
							</span>
							{#if i < selectedSegments.length - 1}
								<span class="text-muted-foreground">/</span>
							{/if}
						{/each}
						{#if renderTimeMs != null && !renderError}
							<Tooltip.Provider>
								<Tooltip.Root delayDuration={300}>
									<Tooltip.Trigger class="ml-1 flex items-center gap-2">
										<span class="size-1 animate-pulse rounded-full bg-green-500"></span>
										<span class="text-xs text-green-500 tabular-nums" title="SSR render time">
											{formatRenderTimeMs(renderTimeMs)}
										</span>
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>HMR enabled</p>
									</Tooltip.Content>
								</Tooltip.Root>
							</Tooltip.Provider>
						{/if}
					</div>
				{:else}
					<span class="text-muted-foreground">No file selected</span>
				{/if}
			</div>

			{#if selectedFile}
				<div class="flex items-center gap-4">
					<div class="flex items-center border border-border bg-muted/30 p-1">
						<button
							class={cn(
								'px-3 py-1 text-xs transition-colors',
								viewMode === 'render'
									? 'bg-foreground text-background'
									: 'text-muted-foreground hover:text-foreground'
							)}
							onclick={() => (params.view = 'render')}
						>
							Render
						</button>
						<button
							class={cn(
								'px-3 py-1 text-xs transition-colors',
								viewMode === 'html'
									? 'bg-foreground text-background'
									: 'text-muted-foreground hover:text-foreground'
							)}
							onclick={() => (params.view = 'html')}
						>
							HTML
						</button>
						<button
							class={cn(
								'px-3 py-1 text-xs transition-colors',
								viewMode === 'source'
									? 'bg-foreground text-background'
									: 'text-muted-foreground hover:text-foreground'
							)}
							onclick={() => (params.view = 'source')}
						>
							Source
						</button>
					</div>

					<button
						class="flex items-center gap-2 border border-border bg-background px-3 py-1.5 text-xs transition-colors hover:bg-muted disabled:opacity-50"
						onclick={copyHtml}
						disabled={!html || viewMode !== 'render'}
					>
						{#if copied}
							<Check class="size-3" />
						{:else}
							<Copy class="size-3" />
						{/if}
						Copy HTML
					</button>
				</div>
			{/if}
		</header>

		<!-- Content Area -->
		<div class="relative flex-1 overflow-hidden">
			{#if !selectedFile}
				<div class="flex h-full items-center justify-center p-8">
					<div class="text-center">
						<img
							src="/favicon.svg"
							alt="Better Svelte Email"
							class="mx-auto mb-8 size-24 drop-shadow-xl"
						/>

						<h2 class="mb-4 font-sans text-3xl font-bold tracking-tight">Select a template</h2>
						<p class="leading-relaxed text-muted-foreground">
							Welcome to Better Svelte Email!<br />Select a template in the sidebar to get started.
						</p>
					</div>
				</div>
			{:else if renderError}
				<div class="flex h-full items-center justify-center p-8">
					<div
						class="max-w-2xl border border-destructive bg-background p-8 text-destructive shadow-[8px_8px_0px_0px_var(--destructive)]"
					>
						<div class="mb-4 flex items-center gap-3">
							<WandSparkles class="size-6" />
							<h3 class="font-sans text-xl font-bold">Render Error</h3>
						</div>
						<pre
							class="overflow-auto border border-destructive/20 bg-destructive/10 p-4 text-xs whitespace-pre-wrap">{renderError}</pre>
					</div>
				</div>
			{:else}
				<!-- Render View -->
				<div
					class={cn(
						'absolute inset-0 flex h-full w-full flex-col overflow-hidden bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px]',
						viewMode === 'render' ? '' : 'hidden'
					)}
				>
					{#if !html}
						<div class="flex flex-1 items-center justify-center overflow-y-auto p-4 md:p-8">
							<div
								class="mx-auto flex h-full min-h-[400px] w-full max-w-4xl animate-pulse flex-col items-center justify-center border border-border bg-background shadow-2xl"
							>
								<div class="text-muted-foreground">Rendering...</div>
							</div>
						</div>
					{:else}
						<!-- Viewport toolbar -->
						<div
							class="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-4 py-2"
						>
							<span class="text-[10px] tracking-wide text-muted-foreground">Viewport</span>
							<div class="flex items-center gap-1 border border-border bg-background p-0.5">
								<button
									type="button"
									class={cn(
										'flex items-center gap-1.5 px-2.5 py-1 text-xs transition-colors',
										isPresetActive('mobile')
											? 'bg-foreground text-background'
											: 'text-muted-foreground hover:text-foreground'
									)}
									onclick={() => setViewportPreset('mobile')}
									aria-label="Mobile viewport ({VIEWPORT_DEVICE_PRESETS.mobile
										.width}×{VIEWPORT_DEVICE_PRESETS.mobile.height})"
									title="Mobile ({VIEWPORT_DEVICE_PRESETS.mobile.width}×{VIEWPORT_DEVICE_PRESETS
										.mobile.height})"
								>
									<Smartphone class="size-3.5" />
									<span class="hidden sm:inline">Mobile</span>
								</button>
								<button
									type="button"
									class={cn(
										'flex items-center gap-1.5 px-2.5 py-1 text-xs transition-colors',
										isPresetActive('tablet')
											? 'bg-foreground text-background'
											: 'text-muted-foreground hover:text-foreground'
									)}
									onclick={() => setViewportPreset('tablet')}
									aria-label="Tablet viewport ({VIEWPORT_DEVICE_PRESETS.tablet
										.width}×{VIEWPORT_DEVICE_PRESETS.tablet.height})"
									title="Tablet ({VIEWPORT_DEVICE_PRESETS.tablet.width}×{VIEWPORT_DEVICE_PRESETS
										.tablet.height})"
								>
									<Tablet class="size-3.5" />
									<span class="hidden sm:inline">Tablet</span>
								</button>
								<button
									type="button"
									class={cn(
										'flex items-center gap-1.5 px-2.5 py-1 text-xs transition-colors',
										isPresetActive('desktop')
											? 'bg-foreground text-background'
											: 'text-muted-foreground hover:text-foreground'
									)}
									onclick={() => setViewportPreset('desktop')}
									aria-label="Desktop viewport ({VIEWPORT_DEVICE_PRESETS.desktop
										.width}×{VIEWPORT_DEVICE_PRESETS.desktop.height})"
									title="Desktop ({VIEWPORT_DEVICE_PRESETS.desktop.width}×{VIEWPORT_DEVICE_PRESETS
										.desktop.height})"
								>
									<Monitor class="size-3.5" />
									<span class="hidden sm:inline">Desktop</span>
								</button>
							</div>
							<span class="ml-auto font-mono text-[10px] text-muted-foreground tabular-nums">
								{Math.round(viewportWidth)} × {Math.round(viewportHeight)}
								{#if Math.round(viewportWidth) !== Math.round(storedVpw)}
									<span class="text-muted-foreground/50">
										({Math.round(storedVpw)} × {Math.round(storedVph)})
									</span>
								{/if}
							</span>
						</div>

						<!-- Viewport canvas -->
						<!-- outer: scrollable container; inner: full-size flex so the widget
						     is centered when it fits and scrollable when it overflows -->
						<div class="min-h-0 flex-1 overflow-auto" bind:this={viewportHostEl}>
							<div class="relative flex min-h-full min-w-full items-center justify-center">
								{#if magneticGuide && (magneticGuide.verticalW != null || magneticGuide.horizontalH != null)}
									<div class="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
										{#if magneticGuide.verticalW != null}
											<div
												class="absolute top-0 bottom-0 border-x border-dashed border-muted-foreground/35 transition-opacity duration-150"
												style:left="50%"
												style:width="{magneticGuide.verticalW}px"
												style:transform="translateX(-50%)"
											></div>
										{/if}
										{#if magneticGuide.horizontalH != null}
											<div
												class="absolute right-0 left-0 border-y border-dashed border-muted-foreground/35 transition-opacity duration-150"
												style:top="50%"
												style:height="{magneticGuide.horizontalH}px"
												style:transform="translateY(-50%)"
											></div>
										{/if}
									</div>
								{/if}
								<div class="relative z-10 flex flex-col">
									<!--
										Row 0: [left spacer] [top handle] [right spacer]
										Top handle mirrors the bottom handle — dir=-1 so dragging up grows the card.
									-->
									<div class="flex">
										<div class="w-6 shrink-0"></div>
										<button
											type="button"
											class={cn(
												'group flex h-6 cursor-ns-resize touch-none flex-row items-center justify-center gap-0.5',
												'border-b border-b-transparent transition-colors hover:border-b-border',
												resizingV && resizingVDir === -1 && 'border-b-border'
											)}
											style:width="{viewportWidth}px"
											aria-label="Drag to resize preview height"
											onpointerdown={(e) => onResizeVPointerDown(e, -1)}
											onpointermove={onResizeVPointerMove}
											onpointerup={onResizeVPointerUp}
											onpointercancel={onResizeVPointerUp}
										>
											<Ellipsis
												class={cn(
													'size-3.5 transition-colors',
													resizingV && resizingVDir === -1
														? 'text-foreground'
														: 'text-muted-foreground/40 group-hover:text-muted-foreground'
												)}
											/>
										</button>
										<div class="w-6 shrink-0"></div>
									</div>

									<!--
										Row 1: [left handle] [iframe card] [right handle]
										Left + right handles are symmetric — both use ×2 delta so that
										the dragged edge tracks the pointer exactly even though the card is centered.
									-->
									<div class="flex items-stretch">
										<!-- Left (width) handle -->
										<button
											type="button"
											class={cn(
												'group flex w-6 shrink-0 cursor-ew-resize touch-none flex-col items-center justify-center gap-0.5',
												'border-r border-r-transparent transition-colors hover:border-r-border',
												resizing && resizingHDir === -1 && 'border-r-border'
											)}
											aria-label="Drag to resize preview width"
											onpointerdown={(e) => onResizeHPointerDown(e, -1)}
											onpointermove={onResizeHPointerMove}
											onpointerup={onResizeHPointerUp}
											onpointercancel={onResizeHPointerUp}
										>
											<EllipsisVertical
												class={cn(
													'size-3.5 transition-colors',
													resizing && resizingHDir === -1
														? 'text-foreground'
														: 'text-muted-foreground/40 group-hover:text-muted-foreground'
												)}
											/>
										</button>

										<!-- iframe card -->
										<div
											class={cn(
												'relative overflow-hidden rounded-[16px] border border-border bg-white shadow-xl',
												!isResizing && 'transition-[width,height] duration-150 ease-out'
											)}
											style:width="{viewportWidth}px"
											style:height="{viewportHeight}px"
										>
											<iframe
												title="Rendered email preview"
												srcdoc={iframeContent}
												class="block h-full w-full rounded-xl bg-white"
												sandbox="allow-popups allow-same-origin allow-scripts"
											></iframe>

											<!-- Live dimension badge -->
											{#if isResizing}
												<div
													class="pointer-events-none absolute top-2 left-1/2 z-10 -translate-x-1/2 rounded border border-black/5 bg-white px-2 py-0.5 font-mono text-[10px] text-black tabular-nums"
												>
													{Math.round(viewportWidth)} × {Math.round(viewportHeight)}
												</div>
											{/if}
										</div>

										<!-- Right (width) handle -->
										<button
											type="button"
											class={cn(
												'group flex w-6 shrink-0 cursor-ew-resize touch-none flex-col items-center justify-center gap-0.5',
												'border-l border-l-transparent transition-colors hover:border-l-border',
												resizing && resizingHDir === 1 && 'border-l-border'
											)}
											aria-label="Drag to resize preview width"
											onpointerdown={(e) => onResizeHPointerDown(e, 1)}
											onpointermove={onResizeHPointerMove}
											onpointerup={onResizeHPointerUp}
											onpointercancel={onResizeHPointerUp}
										>
											<EllipsisVertical
												class={cn(
													'size-3.5 transition-colors',
													resizing && resizingHDir === 1
														? 'text-foreground'
														: 'text-muted-foreground/40 group-hover:text-muted-foreground'
												)}
											/>
										</button>
									</div>

									<!--
										Row 2: [left handle spacer] [bottom handle] [corner handle]
										Spacer matches the left handle width so the bottom handle aligns with the card.
									-->
									<div class="flex">
										<!-- Spacer matching left handle -->
										<div class="w-6 shrink-0"></div>

										<!-- Bottom (height) handle -->
										<button
											type="button"
											class={cn(
												'group flex h-6 cursor-ns-resize touch-none flex-row items-center justify-center gap-0.5',
												'border-t border-t-transparent transition-colors hover:border-t-border',
												resizingV && resizingVDir === 1 && 'border-t-border'
											)}
											style:width="{viewportWidth}px"
											aria-label="Drag to resize preview height"
											onpointerdown={(e) => onResizeVPointerDown(e, 1)}
											onpointermove={onResizeVPointerMove}
											onpointerup={onResizeVPointerUp}
											onpointercancel={onResizeVPointerUp}
										>
											<Ellipsis
												class={cn(
													'size-3.5 transition-colors',
													resizingV && resizingVDir === 1
														? 'text-foreground'
														: 'text-muted-foreground/40 group-hover:text-muted-foreground'
												)}
											/>
										</button>

										<!-- Corner (width + height) handle -->
										<button
											type="button"
											class="group flex size-6 shrink-0 cursor-nwse-resize touch-none items-start justify-start"
											aria-label="Drag corner to resize preview"
											onpointerdown={onResizeDPointerDown}
											onpointermove={onResizeDPointerMove}
											onpointerup={onResizeDPointerUp}
											onpointercancel={onResizeDPointerUp}
										>
											<svg
												class={cn(
													'size-3 transition-colors',
													resizingD
														? 'text-foreground'
														: 'text-muted-foreground/40 group-hover:text-muted-foreground'
												)}
												viewBox="0 0 12 12"
												fill="currentColor"
												aria-hidden="true"
											>
												<circle cx="10" cy="10" r="1" />
												<circle cx="10" cy="6" r="1" />
												<circle cx="6" cy="10" r="1" />
											</svg>
										</button>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- HTML View -->
				<div
					class={cn(
						'absolute inset-0 flex h-full w-full flex-col overflow-hidden bg-background/95 backdrop-blur',
						viewMode === 'html' ? '' : 'hidden'
					)}
				>
					<div class="flex min-h-0 flex-1 flex-col p-6 md:p-12">
						<div
							class="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden border border-border bg-muted/30 shadow-2xl"
						>
							<div
								class="flex shrink-0 items-center justify-between border-b border-border px-6 py-4"
							>
								<div class="flex items-center gap-2">
									<CodeIcon class="size-4" />
									<h3 class="font-sans text-base font-semibold">Rendered HTML</h3>
								</div>
								<span class="text-xs text-muted-foreground">Exact markup returned by the CLI</span>
							</div>
							<div class="min-h-0 flex-1 overflow-auto">
								<ShikiCode code={html || 'No HTML available.'} lang="html" />
							</div>
						</div>
					</div>
				</div>

				<!-- Source View -->
				<div
					class={cn(
						'absolute inset-0 flex h-full w-full flex-col overflow-hidden bg-background/95 backdrop-blur',
						viewMode === 'source' ? '' : 'hidden'
					)}
				>
					<div class="flex min-h-0 flex-1 flex-col p-6 md:p-12">
						<div
							class="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden border border-border bg-muted/30 shadow-2xl"
						>
							<div
								class="flex shrink-0 items-center justify-between border-b border-border px-6 py-4"
							>
								<div class="flex items-center gap-2">
									<SvelteIcon class="size-4" />
									<h3 class="font-sans text-base font-semibold">Source Code</h3>
								</div>
								<span class="text-xs text-muted-foreground">Svelte component source</span>
							</div>
							<div class="min-h-0 flex-1 overflow-auto">
								<ShikiCode code={source || 'Source could not be loaded.'} lang="svelte" />
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</main>
</div>
