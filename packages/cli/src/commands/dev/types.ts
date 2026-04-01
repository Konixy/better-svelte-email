export type DevOptions = {
	port: number | string;
	dir: string;
	customCssPath?: string;
	previewDev?: boolean;
	previewPort?: number | string;
	/** False when `--no-hmr` is passed; default true. */
	hmr?: boolean;
};
