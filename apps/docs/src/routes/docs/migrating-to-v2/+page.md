<!-- <aside class="docs-beta-notice">
<p><strong>Beta.</strong> v2 scoped packages (<code>@better-svelte-email/*</code>) are in beta. For production, prefer the stable <code>better-svelte-email</code> package until v2 is finalized.</p>
</aside> -->

# Migrating to v2

If you are using v1.x.x of Better Svelte Email, migrate to v2 by replacing the old single package (`better-svelte-email`) with the new split packages.

## What changed in v2

v2 moves the project to a monorepo and ships isolated packages:

- `@better-svelte-email/components`
- `@better-svelte-email/server`
- `@better-svelte-email/cli` — **email dev server** (`npx @better-svelte-email/cli dev`, or install as a dev dependency / globally). **Use this for preview in new projects.**

**`@better-svelte-email/preview`** is **deprecated**: the SvelteKit inline preview (`EmailPreview`, `createEmail`, `sendEmail`, …) is only kept for **compatibility** with apps that already use it. **Do not add it for new work** — use the CLI instead.

## 1) Update your dependencies

Remove the old package:

```bash
npm uninstall better-svelte-email
```

Install the v2 runtime packages:

```bash
npm install @better-svelte-email/components @better-svelte-email/server
```

Add the **CLI** for the preview workbench (dev dependency is typical):

```bash
npm install -D @better-svelte-email/cli
```

You only need **`@better-svelte-email/preview`** if you are **temporarily** keeping an existing SvelteKit preview route; plan to replace it with **`npx @better-svelte-email/cli dev`** (or `bse dev` after a global install). Details: [Email dev server](./email-dev-server).

## 2) Update imports

### Renderer and plain text

```typescript
// Before
import Renderer from 'better-svelte-email/render';
import { toPlainText } from 'better-svelte-email/render';

// After
import { Renderer, toPlainText } from '@better-svelte-email/server';
```

### Components

```typescript
// Before
import { Html, Head, Body, Container, Section, Text, Button } from 'better-svelte-email';

// After
import {
	Html,
	Head,
	Body,
	Container,
	Section,
	Text,
	Button
} from '@better-svelte-email/components';
```

### Email preview

**Recommended:** run the standalone dev server (no SvelteKit route required):

```bash
npx @better-svelte-email/cli dev
```

If the CLI is a **dev dependency**, you can also run the **`bse`** binary from `node_modules` (e.g. via an npm script — see below) or use the same `npx` form. With a **global** install: `bse dev`.

See [Email dev server](./email-dev-server) for `-d`, `-c`, ports, and other flags.

**Legacy (compat only):** `@better-svelte-email/preview` still exports `EmailPreview`, `emailList`, `createEmail`, and `sendEmail` for existing `+page.server.ts` wiring.

```typescript
// Legacy — compatibility only; prefer the CLI for new code
import { EmailPreview, emailList, createEmail, sendEmail } from '@better-svelte-email/preview';
```

## 3) Preview: CLI instead of form actions

Replace (or retire) SvelteKit preview actions with the CLI. After `npm install -D @better-svelte-email/cli`, add a script that invokes the local binary:

```js
// package.json — "scripts"
{
	"scripts": {
		"email:dev": "bse dev -c src/app.css"
	}
}
```

Or call the package explicitly without relying on `PATH`:

```js
{
	"scripts": {
		"email:dev": "npx @better-svelte-email/cli dev -c src/app.css"
	}
}
```

Then `npm run email:dev`. Adjust `-c` / `-d` to match your CSS entry and emails folder. The CLI serves the preview UI and `/api/render` — see [Email dev server](./email-dev-server).

## 4) Tailwind usage

No v2-specific Tailwind syntax migration is required. Keep using your existing Tailwind setup with `Renderer`, including:

- `tailwindConfig` for Tailwind v3-style config extension
- `customCSS` for Tailwind v4/CSS-variable-based setup

Pass the same CSS file to **`npx @better-svelte-email/cli dev -c …`** (or `bse dev -c …`) so the preview matches production rendering.

See [Renderer API](./render) and [Email dev server](./email-dev-server) for more detail.
