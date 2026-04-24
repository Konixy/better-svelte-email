<aside class="docs-beta-notice">
<p><strong>Beta.</strong> <code>@better-svelte-email/cli</code> and related tooling are in beta; defaults and flags may change.</p>
</aside>

# Email dev server (beta)

For **v2**, the recommended workflow is the **`@better-svelte-email/cli`** command-line tool. It starts a dedicated **email preview server** in any project folder: file watching, live reload, HTML/source views, and rendering through [**@better-svelte-email/server**](./render-beta). You do **not** need a SvelteKit preview route.

Right now, **`dev`** is the only command the CLI provides; other subcommands may be added later.

> **Try it live!** The hosted docs use the same preview UI—open [/preview](/preview) to explore sample templates.

## `@better-svelte-email/preview` (deprecated)

The **`@better-svelte-email/preview`** package (`EmailPreview`, `createEmail`, `sendEmail`, SvelteKit `+page.server.ts` wiring) is **deprecated**. It remains published for **backward compatibility** with apps that already embed the inline preview. **New projects should use `@better-svelte-email/cli`** instead.

For the classic SvelteKit-integrated flow (v1-style, stable package), see [Email Preview](./email-preview).

## Install the CLI

Pick one (or combine dev dependency + `npx` for CI).

### Dev dependency (typical)

```bash
npm install -D @better-svelte-email/cli
```

The package exposes the **`bse`** binary in `node_modules/.bin`. Use npm scripts (see [Run the dev server](#run-the-dev-server)) or:

```bash
npx @better-svelte-email/cli dev
```

### One-off / no install

```bash
npx @better-svelte-email/cli dev
```

This downloads and runs the CLI without adding it to `package.json`.

### Global install

```bash
npm install -g @better-svelte-email/cli
bse dev
```

Your email templates should import primitives from [`@better-svelte-email/components`](./components-beta). The CLI uses **`@better-svelte-email/server`** internally to render those components.

## Run the dev server

From the **project root** (where `package.json` lives).

**Without installing the package** (uses npx):

```bash
npx @better-svelte-email/cli dev
```

**After `npm install -D @better-svelte-email/cli`:**

```bash
bse dev
```

**After a global install:**

```bash
bse dev
```

This watches **`src/lib/emails`** by default and serves the preview UI (bundled **preview-server** build) on **port 3000**, with JSON APIs under `/api/*` on the same origin.

### `package.json` script

```js
// package.json — "scripts"
{
	"scripts": {
		"email:dev": "npx @better-svelte-email/cli dev"
	}
}
```

Equivalent if the CLI is installed locally (resolves `node_modules/.bin/bse`):

```js
{
	"scripts": {
		"email:dev": "bse dev"
	}
}
```

Then:

```bash
npm run email:dev
```

## CLI options

| Option                         | Description                                                                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-p, --port <port>`            | Port for the preview server (default `3000`)                                                                                                                                 |
| `-d, --dir <directory>`        | Folder of `.svelte` email templates to watch (default `src/lib/emails`)                                                                                                      |
| `-c, --custom-css-path <path>` | File whose contents are passed as `customCSS` to the renderer (Tailwind v4 / theme parity). If omitted, the CLI tries `src/app.css` or `src/routes/layout.css` when present. |
| `--preview-dev`                | Run the preview UI from a local **preview-server** Vite dev server (monorepo / CLI development) instead of the bundled app.                                                  |
| `--preview-port <port>`        | Port for `--preview-dev` UI (default `3001`; must differ from `--port`).                                                                                                     |
| `--no-hmr`                     | Disable live reload when templates or watched CSS change.                                                                                                                    |

### Custom emails directory

```bash
npx @better-svelte-email/cli dev -d src/emails
```

### Tailwind / app styles

```bash
npx @better-svelte-email/cli dev -c src/app.css
```

### Two-port mode (`--preview-dev`)

For working on the preview app itself (e.g. in this monorepo), the API and UI run on separate ports. The CLI prints both URLs—for example:

- Preview API: `http://localhost:3000`
- Preview UI: `http://localhost:3001`

## HTTP API (used by the preview UI)

The dev server exposes a small JSON API (also used by the bundled preview):

- **`GET /api/emails`** — lists template files under the configured emails directory.
- **`GET /api/source?file=…`** — returns source for a template path.
- **`POST /api/render`** — body `{ "file": "…", "props": { … }, "includeSource"?: boolean }` — returns rendered HTML (and optional source).

There is **no built-in “send test email”** endpoint in the CLI server; use your provider (Resend, etc.) from your own app or scripts if you need outbound mail.

## Troubleshooting

### No templates in the list

1. Confirm `.svelte` files exist under the directory passed to `-d` (default `src/lib/emails`).
2. Run the CLI from the repository root that contains that path (`npx @better-svelte-email/cli dev`, or `bse dev` if the CLI is installed globally).
3. Check the path is relative to the project root, not an absolute path unless intended.

### Styles look wrong

Pass **`-c`** to the same CSS entry you use for Tailwind v4 / variables in the app, or ensure `src/app.css` / `src/routes/layout.css` exists so the CLI can pick it up automatically.

### Port already in use

```bash
npx @better-svelte-email/cli dev -p 3005
```

With `--preview-dev`, also set `--preview-port` to a free port different from `-p`.

## Legacy package reference

If you must keep **`@better-svelte-email/preview`** in a SvelteKit app, the API surface is described in the [v1 Email Preview](./email-preview#api-reference) doc (`createEmail`, `sendEmail`, `emailList`, etc.). Prefer migrating to **`npx @better-svelte-email/cli dev`** (or a local/global **`bse`**) when you can.
