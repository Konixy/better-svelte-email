# Migrating to v1

If you are using v0.x.x of Better Svelte Email, you can migrate to v1.x.x by following these steps.

## Update your dependencies

```bash
npm install better-svelte-email@latest
```

If you are using Tailwind CSS:

```bash
npm install tailwindcss@latest
```

## New Renderer class

Previously, you would add the `betterSvelteEmailPreprocessor` to your `svelte.config.js` file. This is now deprecated; you will need to remove it to make the new version work.

To render email in v1, you will need to replace the `render` function from `svelte/server` with the new `Renderer` class.

```typescript
import Renderer from 'better-svelte-email/render';

const { renderer } = new Renderer();

const html = await render(emailComponent);
```

## Tailwind configuration

To use a custom Tailwind v3 config like in v0.x.x, you can pass it to the `Renderer` class:

```typescript
import Renderer from 'better-svelte-email/render';

const renderer = new Renderer({ tailwindConfig });
```

Since v1.2, you can also use a Tailwind v4 config.
To do so, you will need to pass your main CSS file where your config lives (e.g. `src/routes/layout.css` or `src/app.css`) to the `Renderer` class.

```typescript
import appStyles from 'src/routes/layout.css?raw';

const renderer = new Renderer({ customCSS: appStyles });
```

Better Svelte Email will inject the Tailwind config into the email rendering process, so you can use the same config in your app and your emails.

## Tailwind classes

Since v1 now uses Tailwind CSS v4, you will need to update all your tailwind classes to the new syntax. See the [tailwindcss v4 migration guide](https://tailwindcss.com/docs/upgrade-guide) for more information.

Another change is that you can now use inline classes in your email templates:

```svelte
<Text class="text-sm {textColor}">Hello</Text>
<Heading as="h1" class={headingClass}>World</Heading>
```

This works too with the `style` prop.

## Plain text rendering

The `renderAsPlainText` function has been deprecated in favor of the `toPlainText` function from the `better-svelte-email/render` package.

```typescript
import { toPlainText } from 'better-svelte-email/render';

const plainText = toPlainText(html);
```

## Email Preview

In v1, the preview system now uses a route-based approach instead. For that to work, you will need to move your `+page.svelte` and `+page.server.ts` files from the `src/routes/email-preview` directory to the `src/routes/email-preview/[...email]` directory.

```
// Before
src/routes/email-preview
├── +page.svelte
└── +page.server.ts
// After
src/routes/email-preview/[...email]
├── +page.svelte
└── +page.server.ts
```

In the `+page.server.ts` file, the `createEmail` action is now a function that needs to be called like the `sendEmail` function:

```typescript
// src/routes/email-preview/[...email]/+page.server.ts
export const actions = {
  // Before
  ...createEmail,
  ...sendEmail()
  // After
  ...createEmail(),
  ...sendEmail()
};
```

You will also need to update the `+page.svelte` like so:

```svelte
<!-- src/routes/email-preview/[...email]/+page.svelte -->
<script lang="ts">
	import { EmailPreview, type PreviewData } from 'better-svelte-email/preview';
	import { page } from '$app/state';
</script>

<EmailPreview {page} />
```

### Using a Tailwind config

To use a custom Tailwind v3 or v4 config, you will need to pass an instance of the `Renderer` class to the `createEmail` and `sendEmail` functions:

```typescript
// src/routes/email-preview/[...email]/+page.server.ts
import Renderer from 'better-svelte-email/render';
import appStyles from 'src/routes/layout.css?raw';

const renderer = new Renderer({ tailwindConfig, customCSS: appStyles });

export const actions = {
	...createEmail({ renderer }),
	...sendEmail({ renderer })
};
```

See the [email preview documentation](./email-preview) for more information.
