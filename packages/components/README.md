# @better-svelte-email/components

> [!WARNING]
> This package is still in **beta**; component APIs and behavior may change before a stable release.

Svelte **email primitives** for Better Svelte Email: layout and content building blocks (`Html`, `Body`, `Container`, `Section`, `Row`, `Column`, `Text`, `Heading`, `Button`, `Link`, `Img`, `Hr`, `Head`, `Preview`, etc.) designed to work with the server-side `[Renderer](../server)`.

## Install

```bash
npm i @better-svelte-email/components
```

**Peer dependencies:** `svelte` **>= 5.14.3**; `@sveltejs/kit` **>= 2** (optional metadata for Svelte tooling)

This package depends on `[@better-svelte-email/server](../server)` for shared rendering concerns.

## Usage

```svelte
<script>
	import { Html, Head, Body, Container, Section, Text } from '@better-svelte-email/components';
</script>

<Html>
	<Head />
	<Body>
		<Container>
			<Section>
				<Text>Hello</Text>
			</Section>
		</Container>
	</Body>
</Html>
```

Individual `.svelte` files can be imported via the `./ComponentName.svelte` export pattern (see `package.json` `exports`).

**`@better-svelte-email/components/utils`** — shared utilities subpath (see `exports`).

Most users install the umbrella package `[better-svelte-email](../better-svelte-email)` instead, which re-exports these components.

## Documentation

[better-svelte-email.konixy.dev](https://better-svelte-email.konixy.dev/docs)

## Monorepo

[github.com/Konixy/better-svelte-email](https://github.com/Konixy/better-svelte-email) — `packages/components`.

## Development

```bash
bun run build --filter=@better-svelte-email/components
bun run test --filter=@better-svelte-email/components
```

## License

MIT
