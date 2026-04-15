<aside class="docs-beta-notice">
<p><strong>Beta.</strong> Import UI primitives from <code>@better-svelte-email/components</code> instead of <code>better-svelte-email</code>. Props and behavior match the stable components unless release notes say otherwise.</p>
</aside>

# Components (beta)

```svelte
<script>
	import {
		Html,
		Head,
		Body,
		Preview,
		Container,
		Section,
		Row,
		Column,
		Heading,
		Text,
		Button,
		Link,
		Img,
		Hr
	} from '@better-svelte-email/components';
</script>
```

Use `Html`, `Head`, and `Body` at the root, then mix layout and content components for the rest of your email.

For **Html**, **Head**, **Body**, **Preview**, layout, typography, links, buttons, **Img**, and **Hr** — including props and slots — see the full reference on [Components](./components#document-shell).
