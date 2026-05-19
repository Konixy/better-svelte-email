export type SendEmailConfig = {
	configured: boolean;
	from: string | null;
	persisted: boolean;
};

export const emptySendEmailConfig = (): SendEmailConfig => ({
	configured: false,
	from: null,
	persisted: false
});
