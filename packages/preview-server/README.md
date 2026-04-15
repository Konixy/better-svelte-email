# @better-svelte-email/preview-server

**Private** workspace package: the SvelteKit + Vite **preview UI** that the [`@better-svelte-email/cli`](../cli) ships (or runs in dev via `--preview-dev`).

It is **not published to npm** on its own. Consumers use the CLI (`bse`) or the SvelteKit integration in [`@better-svelte-email/preview`](../preview).

## Role in the monorepo

- **`bun run dev`** — local Vite/SvelteKit dev server for iterating on the preview workbench
- **`bun run build`** — production build (adapter-node), then the CLI copies artifacts into its `dist` preview runtime

The root `turbo` build excludes this package from the default `build` filter (see root `package.json`) because it is built as part of the CLI release pipeline.

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
