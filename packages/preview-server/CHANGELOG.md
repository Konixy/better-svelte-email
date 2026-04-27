# @better-svelte-email/preview-server

## 2.0.0

### Major Changes

- b41cc08: # New in v2

  A CLI (`npx @better-svelte-email/cli`) has been added to preview your emails locally. It replaces the old preview system.

  I also have migrated the codebase to a monorepo with new isolated packages (ex: @better-svelte-email/preview, @better-svelte-email/server, @better-svelte-email/components) instead of a single package. This allows for better isolation and modularity, making it easier to maintain and update the different parts of the library. It also reduces the bundle size of the library, when you only need to install the packages you need.

  ## Breaking Changes

  The `better-svelte-email` package is now deprecated. You should use the new isolated packages instead.
  See the migration guide below for more details.

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

- 4825786: # New in v2

  A CLI (`npx @better-svelte-email/cli`) has been added to preview your emails locally. It replaces the old preview system.

  I also have migrated the codebase to a monorepo with new isolated packages (ex: @better-svelte-email/preview, @better-svelte-email/server, @better-svelte-email/components) instead of a single package. This allows for better isolation and modularity, making it easier to maintain and update the different parts of the library. It also reduces the bundle size of the library, when you only need to install the packages you need.

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

### Patch Changes

- add02f8: externalized the preview-server package to fix dependency management problems
- b52268f: fixed the export of 'better-svelte-email/render' and fixed the cli not working at all
- 0173ede: fixed missing dependencies in cli
- c13aeaa: Fix unresolved "workspace:\*" depencencies
- 780d23a: Added README.md for each packages

## 2.0.0-beta.5

### Patch Changes

- add02f8: externalized the preview-server package to fix dependency management problems

## 2.0.0-beta.4

### Patch Changes

- 0173ede: fixed missing dependencies in cli

## 2.0.0-beta.3

### Patch Changes

- b52268f: fixed the export of 'better-svelte-email/render' and fixed the cli not working at all

## 2.0.0-beta.2

### Patch Changes

- c13aeaa: Fix unresolved "workspace:\*" dependencies

## 2.0.0-beta.1

### Patch Changes

- Added README.md for each package

## 2.0.0-beta.0

### Major Changes

- 4825786: # New in v2

  A CLI (`npx @better-svelte-email/cli`) has been added to preview your emails locally. It replaces the old preview system.

  I've also migrated the codebase to a monorepo with new isolated packages (ex: @better-svelte-email/preview, @better-svelte-email/server, @better-svelte-email/components) instead of a single package. This allows for better isolation and modularity, making it easier to maintain and update the different parts of the library. It also reduces the bundle size of the library, when you only need to install the packages you need.

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
