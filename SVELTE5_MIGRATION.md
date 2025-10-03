# Svelte 5 Syntax Guide

This library is built specifically for **Svelte 5** and uses modern Svelte 5 syntax throughout.

## Key Svelte 5 Changes

### 1. Props Declaration

**Svelte 4 (Old):**

```svelte
<script>
	export let name = 'Default';
	export let email;
</script>
```

**Svelte 5 (New):**

```svelte
<script>
	let { name = 'Default', email } = $props();
</script>
```

### 2. Reactive Declarations

**Svelte 4 (Old):**

```svelte
<script>
	export let count = 0;
	$: doubled = count * 2;
</script>
```

**Svelte 5 (New):**

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>
```

### 3. Server-Side Rendering

**Svelte 4 (Old):**

```typescript
import { render } from 'svelte/server';
const { html } = render(Component, { props: { name } });
```

**Svelte 5 (New):**

```typescript
import { render } from 'svelte/server';
const result = render(Component, { props: { name } });
// Access: result.body, result.head
```

## Email Component Examples

### Simple Email

```svelte
<!-- src/lib/emails/simple.svelte -->
<script>
	let { subject = 'Hello!' } = $props();
</script>

<Html>
	<Head />
	<Body class="bg-gray-100 font-sans">
		<Container class="mx-auto max-w-2xl p-8">
			<Text class="text-2xl font-bold">{subject}</Text>
		</Container>
	</Body>
</Html>
```

### Email with Props

```svelte
<!-- src/lib/emails/welcome.svelte -->
<script>
	let { userName, verifyUrl, companyName = 'Our Company' } = $props();
</script>

<Html>
	<Head />
	<Body class="bg-gray-100">
		<Container class="mx-auto max-w-2xl bg-white p-8">
			<Text class="mb-4 text-2xl font-bold">
				Welcome to {companyName}, {userName}!
			</Text>

			<Button href={verifyUrl} class="rounded bg-blue-600 px-6 py-3 text-white">
				Verify Email
			</Button>
		</Container>
	</Body>
</Html>
```

### Email with Reactive State (if needed)

```svelte
<!-- src/lib/emails/dynamic.svelte -->
<script>
	let { items = [] } = $props();

	// Reactive derivation
	let itemCount = $derived(items.length);
	let hasItems = $derived(itemCount > 0);
</script>

<Html>
	<Head />
	<Body class="bg-gray-100">
		<Container class="mx-auto p-8">
			{#if hasItems}
				<Text class="mb-4">You have {itemCount} items:</Text>
				{#each items as item}
					<Text class="mb-2">{item.name}</Text>
				{/each}
			{:else}
				<Text>No items found.</Text>
			{/if}
		</Container>
	</Body>
</Html>
```

## Rendering Emails in Svelte 5

### API Route Example

```typescript
// src/routes/api/send-email/+server.ts
import { render } from 'svelte/server';
import WelcomeEmail from '$lib/emails/welcome.svelte';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { userName, email, verifyUrl } = await request.json();

	// Render the email component
	const result = render(WelcomeEmail, {
		props: {
			userName,
			verifyUrl,
			companyName: 'My Company'
		}
	});

	// Send the email using your email service
	// await emailService.send({
	//   to: email,
	//   subject: 'Welcome!',
	//   html: result.body
	// });

	return json({ success: true });
}
```

### Server Action Example (using Form Actions)

```typescript
// src/routes/contact/+page.server.ts
import { render } from 'svelte/server';
import ContactEmail from '$lib/emails/contact.svelte';
import { fail } from '@sveltejs/kit';

export const actions = {
	sendContact: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		const message = data.get('message');

		if (!name || !message) {
			return fail(400, { missing: true });
		}

		// Render email
		const result = render(ContactEmail, {
			props: { name, message }
		});

		// Send email...

		return { success: true };
	}
};
```

## Component Snippets (Svelte 5 Feature)

Svelte 5 introduces snippets for reusable template chunks:

```svelte
<!-- src/lib/emails/newsletter.svelte -->
<script>
	let { articles = [] } = $props();
</script>

{#snippet articleCard(article)}
	<Container class="mb-4 rounded border border-gray-200 p-4">
		<Text class="mb-2 font-bold">{article.title}</Text>
		<Text class="mb-2 text-gray-600">{article.excerpt}</Text>
		<Button href={article.url} class="rounded bg-blue-500 px-4 py-2 text-white">Read More</Button>
	</Container>
{/snippet}

<Html>
	<Head />
	<Body class="bg-gray-100">
		<Container class="mx-auto max-w-2xl p-8">
			<Text class="mb-6 text-3xl font-bold">Newsletter</Text>

			{#each articles as article}
				{@render articleCard(article)}
			{/each}
		</Container>
	</Body>
</Html>
```

## Important Notes

1. **Props are read-only** in Svelte 5 - you cannot reassign them directly
2. **Use `$state()`** for local reactive state
3. **Use `$derived()`** for computed values
4. **Use `$effect()`** for side effects (though rarely needed in email templates)
5. **Snippets replace slots** in most cases for reusable markup

## Migration from Svelte 4

If you're migrating from Svelte 4, the main changes in your email templates will be:

1. Update prop declarations: `export let` → `let { } = $props()`
2. Update reactive statements: `$:` → `$derived()` or `$effect()`
3. Update component rendering in server code to use the new `render()` API

The preprocessor handles the rest automatically!

## Resources

- [Official Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
- [Runes Documentation](https://svelte.dev/docs/svelte/what-are-runes)
