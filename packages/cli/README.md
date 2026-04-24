# @better-svelte-email/cli

> [!WARNING]
> This package is still in **beta**; APIs, CLI behavior, and defaults may change before a stable release.

Command-line tool for Better Svelte Email: run a **local email preview** with file watching, Tailwind-aware rendering (via [`@better-svelte-email/server`](../server)), and an embedded or dev preview app.

## Install

```bash
npm i -D @better-svelte-email/cli
```

The executable is **`bse`**.

**Optional peer:** `@sveltejs/kit` ^2 — used when integrating with Kit-powered preview workflows.

## Usage

```bash
bse dev [options]
```

Common options:

| Option                         | Description                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `-p, --port <port>`            | Main server port (default `3000`)                                                                         |
| `-d, --dir <directory>`        | Directory of email templates to watch (default `src/lib/emails`)                                          |
| `-c, --custom-css-path <path>` | Raw CSS path for `customCSS` / theme parity                                                               |
| `--preview-dev`                | Use the local [`preview-server`](../preview-server) Vite dev server instead of the bundled preview bundle |
| `--preview-port <port>`        | Port for preview-dev (default `3001`)                                                                     |
| `--no-hmr`                     | Disable live reload                                                                                       |

## Build note (maintainers)

The published CLI depends on the internal [`@better-svelte-email/preview-server`](../preview-server) runtime package. `bun run build` in this package only builds the CLI itself; the preview runtime is built and published from `packages/preview-server`.

## Monorepo

[github.com/Konixy/better-svelte-email](https://github.com/Konixy/better-svelte-email) — `packages/cli`.

## Development

```bash
bun run dev
```

Runs `bse` in watch mode with paths suitable for this repo’s docs app (see `dev` script in `package.json`).

```bash
bun run build
bun run test
bun run lint
```

## License

MIT
