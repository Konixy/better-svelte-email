---
'@better-svelte-email/cli': patch
'@better-svelte-email/components': patch
'@better-svelte-email/preview': patch
'@better-svelte-email/preview-server': patch
'@better-svelte-email/server': patch
'better-svelte-email': patch
---

Fixed CSS variables resolving to their first declaration when a later or more specific one applies. A variable whose declarations all sit in top-level rules matching the rendered `<html>` or no element now takes its cascaded value. Variables registered with `@property`, declared in a document `<style>` or inline style, inside conditional or nested rules, competing layers or a `properties` layer, or using escapes, `var()`, `attr()`, `if()` or CSS-wide keywords keep the previous behaviour, as do documents in quirks mode and stylesheets with `@namespace`.
