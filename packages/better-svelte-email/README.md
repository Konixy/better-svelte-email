# better-svelte-email

> [!WARNING]
> **Compatibility package:** this npm name exists mainly for a **single-install** workflow. It **re-exports** `[@better-svelte-email/server](../server)` and `[@better-svelte-email/components](../components)`, and depends on `[@better-svelte-email/preview](../preview)` so versions stay aligned. It does **not** add its own runtime beyond those re-exports.
>
> **Maintenance:** active development targets the scoped packages below. This meta-package **may receive less attention over time** and is not guaranteed to track every new export from the underlying packages—prefer depending on `**@better-svelte-email/*`** directly when you want the clearest upgrade path.

---

Published meta-package for **Better Svelte Email**: render Svelte 5 email templates to HTML with Tailwind CSS inlined for email clients, plus optional preview and send helpers.

The **published main entry** re-exports **components** plus `**Renderer`**, `**toPlainText**`, and related types from the server package. Import preview and SvelteKit helpers from `**@better-svelte-email/preview**` directly. For maximal control you can depend on the scoped packages only and skip this meta-package.

## Documentation

Full usage, guides, and examples: [better-svelte-email.konixy.dev](https://better-svelte-email.konixy.dev/docs)

## Install

```bash
npm i better-svelte-email
```

Minimum **Svelte** version: **5.14.3**.

## What you get

From `**better-svelte-email`** (main export):

- `**Renderer**` and `**toPlainText**` — server-side HTML (+ optional plain text) from `.svelte` templates, with Tailwind inlined for email clients
- **Email layout components** — `Html`, `Body`, `Container`, `Section`, `Text`, `Button`, … (same as `[@better-svelte-email/components](../components)`)

From `**@better-svelte-email/preview`** (installed as a dependency; import this module name):

- `**EmailPreview**`, `**createEmail**`, `**sendEmail**`, `**emailList**`, … for local preview and test sends in SvelteKit

## Monorepo

Source: [github.com/Konixy/better-svelte-email](https://github.com/Konixy/better-svelte-email) — this directory is `packages/better-svelte-email`.

## Development

From the repository root:

```bash
bun run build --filter=better-svelte-email
bun run test --filter=better-svelte-email
```

Or from this package:

```bash
bun run build
bun run test
```

## License

MIT