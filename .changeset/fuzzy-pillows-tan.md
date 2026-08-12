---
'@better-svelte-email/cli': patch
'@better-svelte-email/components': patch
'@better-svelte-email/preview': patch
'@better-svelte-email/preview-server': patch
'@better-svelte-email/server': patch
'better-svelte-email': patch
---

Fixed cli dev not working because the sveltekit version update required additionnal env vars which were not added to the runtime injected vars.
