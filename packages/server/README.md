# @better-svelte-email/server

<!-- > [!WARNING]
> This package is still in **beta**; APIs and behavior may change before a stable release. -->

Server-side renderer for Better Svelte Email: compile Tailwind-aware Svelte components into **email-safe HTML** (styles inlined, markup adapted for clients).

## Install

```bash
npm i @better-svelte-email/server
```

**Peer dependency:** `svelte` >= **5.14.3**

## Usage

Please refer to the [documentation](https://better-svelte-email.konixy.dev/docs) for a usage guide and implementation examples.

## Exports

The main entry exposes:

- **`Renderer`** — configure Tailwind (`tailwindConfig`), optional injected **`customCSS`** (e.g. theme variables), then **`render(component, options)`** to produce HTML
- **`toPlainText`** — derive a plain-text version from rendered HTML
- **Types** — `TailwindConfig`, `RendererOptions`, `RenderOptions`, `AST`, etc.
- **`pixelBasedPreset`** — Tailwind-related helper for pixel-oriented email styling

See JSDoc in the source and the [project documentation](https://better-svelte-email.konixy.dev/docs/render) for examples.

## Monorepo

[github.com/Konixy/better-svelte-email](https://github.com/Konixy/better-svelte-email) — `packages/server`.

## License

MIT
