# Renderer API

Render Svelte email templates to production-ready HTML and plain text using the utilities in `better-svelte-email/render`.

```ts
import Renderer, { toPlainText, type RenderOptions } from 'better-svelte-email/render';
```

## Renderer

### Constructor

`const renderer = new Renderer(options?)`

- `options?`:
  - `tailwindConfig?` — Partial Tailwind config. Use it to extend the default theme, using tailwindcss v3 syntax.
  - `customCSS?` — Custom CSS string to inject into email rendering.

### renderer.render

`await renderer.render(component, options?)`

- `component` — The compiled Svelte component to render (e.g. `WelcomeEmail`).
- `options?` — Object with the same shape as [`RenderOptions`](#renderoptions).
- Returns a `Promise<string>` containing email-safe HTML with Tailwind utilities inlined and necessary media queries injected into `<head>`.

```ts
const html = await renderer.render(WelcomeEmail, {
	props: { name: 'John' }
});
```

## RenderOptions

`type RenderOptions = { props?: Record<string, unknown>; context?: Map<any, any>; idPrefix?: string; }`

- `props?` — Props forwarded to the Svelte component. Slot and event props are omitted automatically.
- `context?` — Custom context map that becomes available through Svelte’s `getContext`.
- `idPrefix?` — Prefix appended to generated element ids to avoid collisions when embedding multiple renders.

## Plain text output

`toPlainText(markup: string)`

- Strips non-readable markup (images, preview text) and returns a plain text version of the rendered HTML.
- Helpful for adding the `text` field when sending emails via providers like Resend or SendGrid.
