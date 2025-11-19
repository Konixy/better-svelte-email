# Components

Better Svelte Email provides Svelte components with sensible defaults for building email layouts. They all forward regular HTML attributes, merge inline styles, and take props tuned for email-friendly rendering.

## Quick start

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
	} from 'better-svelte-email';
</script>
```

Use `Html`, `Head`, and `Body` at the root, then mix layout and content components for the rest of your email.

## Document shell

### Html

- `lang? = 'en'` — language attribute.
- `dir? = 'ltr'` — text direction.
- Accepts all `<html>` attributes plus a default slot for nested components.

### Head

- Default slot for meta tags, styles, or fonts.
- No custom props beyond standard `<head>` children.

### Body

- Default slot for your email content.
- Accepts all `<body>` attributes (`class`, `style`, etc.).

### Preview

- `preview: string` (required) — text shown in inbox previews, trimmed to 150 characters.
- Forwards standard `<div>` attributes.

## Layout

### Container

- Default slot for inner sections.
- Merges `style` with a max-width of `37.5em`; accepts all `<table>` attributes.

### Section

- Wrapper around content blocks.
- Accepts all `<table>` attributes and a default slot.

### Row

- Groups columns horizontally.
- Default slot for `Column` components, plus `<table>` attributes.

### Column

- Wraps content inside a table cell.
- Accepts all `<td>` attributes, including `align`, `width`, and `style`.

## Typography

### Heading

- `as? = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'` — element to render.
- Margin shorthands: `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml`.
- Default slot for heading text; forwards remaining `<h*>` attributes.

### Text

- `as? = string` — element type, defaults to `<p>`.
- Default slot for body copy and all `<p>` attributes.
- Merges `style` with default font size/line height.

## Links and buttons

### Link

- `href: string` (required).
- `target? = '_blank'`.
- Default slot for link text; all other anchor attributes pass through.

### Button

- `href? = '#'`.
- `target? = '_blank'`.
- `pX? = 0`, `pY? = 0` — horizontal and vertical padding in pixels.
- Default slot for button content; forwards remaining `<a>` attributes.

## Media and dividers

### Img

- `src: string`, `alt: string`, `width: string`, `height: string` (all required).
- Forwards additional `<img>` attributes and merges custom styles.

### Hr

- Accepts all `<hr>` attributes and merges any styles you provide.
