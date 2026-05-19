<!-- <aside class="docs-beta-notice">
<p><strong>Beta.</strong> Import UI primitives from <code>@better-svelte-email/components</code> instead of <code>better-svelte-email</code>. Props and behavior match the stable components unless release notes say otherwise.</p>
</aside> -->

# Components

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

## Document shell

### Html

| Prop | Description |
| ---- | ----------- |
| `lang? = 'en'` | Language attribute |
| `dir? = 'ltr'` | Text direction |
| *(default slot)* | Nested components |
| *(attributes)* | All `<html>` attributes |

### Head

| Prop | Description |
| ---- | ----------- |
| *(default slot)* | Meta tags, styles, or fonts |
| *(children)* | Standard `<head>` children only; no custom props |

### Body

| Prop | Description |
| ---- | ----------- |
| *(default slot)* | Email content |
| *(attributes)* | All `<body>` attributes (`class`, `style`, etc.) |

### Preview

| Prop | Description |
| ---- | ----------- |
| `preview: string` | Inbox preview text (required); trimmed to 150 characters |
| *(attributes)* | Standard `<div>` attributes |

## Layout

### Container

| Prop | Description |
| ---- | ----------- |
| *(default slot)* | Inner sections |
| `style` | Merged with a max-width of `37.5em` |
| *(attributes)* | All `<table>` attributes |

### Section

| Prop | Description |
| ---- | ----------- |
| *(default slot)* | Wrapper around content blocks |
| *(attributes)* | All `<table>` attributes |

### Row

| Prop | Description |
| ---- | ----------- |
| *(default slot)* | `Column` components; groups columns horizontally |
| *(attributes)* | All `<table>` attributes |

### Column

| Prop | Description |
| ---- | ----------- |
| *(default slot)* | Cell content |
| *(attributes)* | All `<td>` attributes (`align`, `width`, `style`, etc.) |

## Typography

### Heading

| Prop | Description |
| ---- | ----------- |
| `as?` | Element to render (`h1`–`h6`, default `h1`) |
| `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml` | Margin shorthands |
| *(default slot)* | Heading text |
| *(attributes)* | Remaining `<h*>` attributes |

### Text

| Prop | Description |
| ---- | ----------- |
| `as? = string` | Element type; defaults to `<p>` |
| *(default slot)* | Body copy |
| `style` | Merged with default font size and line height |
| *(attributes)* | All `<p>` attributes |

## Links and buttons

### Link

| Prop | Description |
| ---- | ----------- |
| `href: string` | Destination URL (required) |
| `target? = '_blank'` | Link target |
| *(default slot)* | Link text |
| *(attributes)* | Remaining anchor attributes |

### Button

| Prop | Description |
| ---- | ----------- |
| `href? = '#'` | Destination URL |
| `target? = '_blank'` | Link target |
| `pX? = 0` | Horizontal padding in pixels |
| `pY? = 0` | Vertical padding in pixels |
| *(default slot)* | Button content |
| *(attributes)* | Remaining `<a>` attributes |

## Media and dividers

### Img

| Prop | Description |
| ---- | ----------- |
| `src: string` | Image URL (required) |
| `alt: string` | Alt text (required) |
| `width: string` | Width (required) |
| `height: string` | Height (required) |
| *(attributes)* | Additional `<img>` attributes; custom styles are merged |

### Hr

| Prop | Description |
| ---- | ----------- |
| *(attributes)* | All `<hr>` attributes; provided styles are merged |
