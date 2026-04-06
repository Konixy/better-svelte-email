# @better-svelte-email/preview

> [!WARNING]
> This package is still in **beta**; APIs and behavior may change before a stable release.

**Preview and test-send** utilities for Better Svelte Email inside **SvelteKit**: UI component, form actions to render templates on demand, and optional **Resend** integration for sending test messages.

Builds on `[@better-svelte-email/server](../server)` (`Renderer`).

## Install

```bash
npm i @better-svelte-email/preview
```

**Peer dependencies:** `svelte` **>= 5.14.3**; `@sveltejs/kit` **>= 2** (optional peer for non-Kit builds)

## Main exports

- `**EmailPreview`\*\* — Svelte component for browsing and previewing templates (also available as `@better-svelte-email/preview/EmailPreview.svelte`)
- `**createEmail**` — returns SvelteKit actions that render a selected template to HTML (and source) using `Renderer`
- `**sendEmail**` — actions that render and send via **Resend** (API key server-side) or a custom send function
- **Filesystem helpers** — `emailList`, `getEmailComponent`, `getFiles`, etc. for wiring a local emails directory

Typical pattern: spread `createEmail({ renderer })` and `sendEmail({ resendApiKey, renderer })` into `+page.server.ts` `actions`, and mount `EmailPreview` on a dev-only route. See JSDoc in `src/index.ts` and the [docs](https://better-svelte-email.konixy.dev/docs).

## Umbrella package

`[better-svelte-email](../better-svelte-email)` re-exports this package’s preview surface for a single dependency.

## Monorepo

[github.com/Konixy/better-svelte-email](https://github.com/Konixy/better-svelte-email) — `packages/preview`.

## Development

```bash
bun run build --filter=@better-svelte-email/preview
bun run test --filter=@better-svelte-email/preview
```

## License

MIT
