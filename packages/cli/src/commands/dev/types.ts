export type DevOptions = {
	port: number | string;
	dir: string;
	customCssPath?: string;
	previewDev?: boolean;
	previewPort?: number | string;
	/** False when `--no-hmr` is passed; default true. */
	hmr?: boolean;
	resendApiKey?: string;
	resendFrom?: string;
	/** When true with `--resend-api-key`, write credentials to `.bse/resend.json`. */
	resendPersist?: boolean;
};
