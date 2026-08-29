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

| Prop             | Description             |
| ---------------- | ----------------------- |
| `lang? = 'en'`   | Language attribute      |
| `dir? = 'ltr'`   | Text direction          |
| _(default slot)_ | Nested components       |
| _(attributes)_   | All `<html>` attributes |

### Head

| Prop             | Description                                      |
| ---------------- | ------------------------------------------------ |
| _(default slot)_ | Meta tags, styles, or fonts                      |
| _(children)_     | Standard `<head>` children only; no custom props |

### Body

| Prop             | Description                                      |
| ---------------- | ------------------------------------------------ |
| _(default slot)_ | Email content                                    |
| _(attributes)_   | All `<body>` attributes (`class`, `style`, etc.) |

### Preview

| Prop              | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `preview: string` | Inbox preview text (required); trimmed to 150 characters |
| _(attributes)_    | Standard `<div>` attributes                              |

## Layout

### Container

| Prop             | Description                         |
| ---------------- | ----------------------------------- |
| _(default slot)_ | Inner sections                      |
| `style`          | Merged with a max-width of `37.5em` |
| _(attributes)_   | All `<table>` attributes            |

### Section

| Prop             | Description                   |
| ---------------- | ----------------------------- |
| _(default slot)_ | Wrapper around content blocks |
| _(attributes)_   | All `<table>` attributes      |

### Row

| Prop             | Description                                      |
| ---------------- | ------------------------------------------------ |
| _(default slot)_ | `Column` components; groups columns horizontally |
| _(attributes)_   | All `<table>` attributes                         |

### Column

| Prop             | Description                                             |
| ---------------- | ------------------------------------------------------- |
| _(default slot)_ | Cell content                                            |
| _(attributes)_   | All `<td>` attributes (`align`, `width`, `style`, etc.) |

## Typography

### Heading

| Prop                                    | Description                                 |
| --------------------------------------- | ------------------------------------------- |
| `as?`                                   | Element to render (`h1`–`h6`, default `h1`) |
| `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml` | Margin shorthands                           |
| _(default slot)_                        | Heading text                                |
| _(attributes)_                          | Remaining `<h*>` attributes                 |

### Text

| Prop             | Description                                   |
| ---------------- | --------------------------------------------- |
| `as? = string`   | Element type; defaults to `<p>`               |
| _(default slot)_ | Body copy                                     |
| `style`          | Merged with default font size and line height |
| _(attributes)_   | All `<p>` attributes                          |

## Links and buttons

### Link

| Prop                 | Description                 |
| -------------------- | --------------------------- |
| `href: string`       | Destination URL (required)  |
| `target? = '_blank'` | Link target                 |
| _(default slot)_     | Link text                   |
| _(attributes)_       | Remaining anchor attributes |

### Button

| Prop                 | Description                  |
| -------------------- | ---------------------------- |
| `href? = '#'`        | Destination URL              |
| `target? = '_blank'` | Link target                  |
| `pX? = 0`            | Horizontal padding in pixels |
| `pY? = 0`            | Vertical padding in pixels   |
| _(default slot)_     | Button content               |
| _(attributes)_       | Remaining `<a>` attributes   |

## Media and dividers

### Img

| Prop             | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `src: string`    | Image URL (required)                                    |
| `alt: string`    | Alt text (required)                                     |
| `width: string`  | Width (required)                                        |
| `height: string` | Height (required)                                       |
| _(attributes)_   | Additional `<img>` attributes; custom styles are merged |

### Hr

| Prop           | Description                                       |
| -------------- | ------------------------------------------------- |
| _(attributes)_ | All `<hr>` attributes; provided styles are merged |
