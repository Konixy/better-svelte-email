---
'better-svelte-email': major
'@better-svelte-email/components': major
'@better-svelte-email/preview': major
'@better-svelte-email/server': major
---

# New in v2

In v2, we have migrated to a monorepo with new isolated packages (ex: @better-svelte-email/preview, @better-svelte-email/server, @better-svelte-email/components) instead of a single package. This allows for better isolation and modularity, making it easier to maintain and update the different parts of the library. It also reduces the bundle size of the library, when you only need to install the packages you need.

## Migration Guide

### Update your dependencies

First, uninstall the old package:

```bash
npm uninstall better-svelte-email
```

Then, install the new packages:

```bash
npm install @better-svelte-email/components @better-svelte-email/server
```

If you are using the preview system, you will need to install the preview package:

```bash
npm install @better-svelte-email/preview
```

### Update your imports

You will need to update all your imports across your project to use the new packages.

For the renderer, import it from the server package:

```typescript
import { Renderer } from '@better-svelte-email/server';
```

For the components, import them from the components package:

```typescript
import { Button, Text, Heading, Container, Section } from '@better-svelte-email/components';
```

For the preview, import it from the preview package:

```typescript
import { EmailPreview } from '@better-svelte-email/preview';
```

And that's it!
