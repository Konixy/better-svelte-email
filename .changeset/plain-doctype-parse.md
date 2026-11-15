---
'@better-svelte-email/cli': patch
'@better-svelte-email/components': patch
'@better-svelte-email/preview': patch
'@better-svelte-email/preview-server': patch
'@better-svelte-email/server': patch
'better-svelte-email': patch
---

Fixed components with a literal `<!DOCTYPE html>` being parsed in quirks mode. The doctype is now replaced before the rendered HTML is parsed.
