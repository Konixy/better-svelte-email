# Migrating to v2

If you are using v1.x.x of Better Svelte Email, migrate to v2 by replacing the old single package (`better-svelte-email`) with the new split packages.

## What changed in v2

v2 moves the project to a monorepo and ships isolated packages:

- `@better-svelte-email/components`
- `@better-svelte-email/server`
- `@better-svelte-email/preview`

This gives better modularity and lets you install only what you need.

## 1) Update your dependencies

First, remove the old package:

```bash
npm uninstall better-svelte-email
```

Then install the new packages:

```bash
npm install @better-svelte-email/components @better-svelte-email/server
```

If you use the preview route/UI, also install:

```bash
npm install @better-svelte-email/preview
```

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

### Email Preview

```typescript
// Before
import { EmailPreview, emailList, createEmail, sendEmail } from 'better-svelte-email/preview';

// After
import { EmailPreview, emailList, createEmail, sendEmail } from '@better-svelte-email/preview';
```

## 3) Preview route example

```typescript
// src/routes/email-preview/[...email]/+page.server.ts
import { emailList, createEmail, sendEmail } from '@better-svelte-email/preview';
import { Renderer } from '@better-svelte-email/server';
import appStyles from 'src/routes/layout.css?raw';
import { env } from '$env/dynamic/private';

const renderer = new Renderer({ customCSS: appStyles });

export function load() {
	return { emails: emailList() };
}

export const actions = {
	...createEmail({ renderer }),
	...sendEmail({ renderer, resendApiKey: env.RESEND_API_KEY })
};
```

## 4) Tailwind usage

No v2-specific Tailwind syntax migration is required. Keep using your existing Tailwind setup with `Renderer`, including:

- `tailwindConfig` for Tailwind v3-style config extension
- `customCSS` for Tailwind v4/CSS-variable-based setup

See [Renderer API](./render) and [Email Preview](./email-preview) for more examples.
