import { defineEnvVars } from '@sveltejs/kit/env';

// Optional. An empty string means the variable was not set.
export const variables = defineEnvVars({
	PREVIEW_HMR: { schema: (input) => input ?? '' },
	PREVIEW_API_ORIGIN: { schema: (input) => input ?? '' }
});
