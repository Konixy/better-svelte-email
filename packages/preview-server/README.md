# @better-svelte-email/preview-server

Internal published runtime package: the SvelteKit + Vite **preview UI** that powers [`@better-svelte-email/cli`](../cli).

It is published to npm so the CLI can depend on it, but it is **not meant to be installed or used directly by end users**. Use the CLI (`bse`) instead, or the SvelteKit integration in [`@better-svelte-email/preview`](../preview).

## Role in the monorepo

- **`bun run dev`** — local Vite/SvelteKit dev server for iterating on the preview workbench
- **`bun run build`** — production build (adapter-node) for the published preview runtime package

In this monorepo, `--preview-dev` exists for working on the preview UI itself. Outside the monorepo, the CLI consumes the published runtime package automatically.

## Scripts

| Script        | Purpose                       |
| ------------- | ----------------------------- |
| `dev`         | `vite dev`                    |
| `build`       | `vite build` (Bun)            |
| `build:watch` | Rebuild on changes            |
| `start`       | `node build` (adapter output) |
| `test`        | `vitest run`                  |

## Monorepo

[github.com/Konixy/better-svelte-email](https://github.com/Konixy/better-svelte-email) — `packages/preview-server`.

## License

MIT
