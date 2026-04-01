import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = ({ error }) => {
	console.error(error);
	return {
		message: error instanceof Error ? error.message : (error as string),
		status: 500
	};
};
