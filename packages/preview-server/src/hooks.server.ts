import type { HandleServerError } from '@sveltejs/kit/hooks';

export const handleError: HandleServerError = ({ error, kind }) => {
	if (kind !== 'unknown') {
		return { message: error.message };
	}

	console.error(error);
	return {
		message: error instanceof Error ? error.message : 'Internal Error'
	};
};
