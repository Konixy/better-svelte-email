#!/usr/bin/env node

import { Command } from 'commander';
import packageJson from '../package.json' with { type: 'json' };
import { dev } from './commands/dev';

const program = new Command();

program
	.name('bse')
	.description('CLI for better-svelte-email')
	.version(`v${packageJson.version}`, '-v, --version');

program
	.command('dev')
	.description('Start the email preview server')
	.option('-p, --port <port>', 'Port to listen on', '3000')
	.option(
		'--preview-dev',
		'Start the local preview-server Vite dev server instead of the published preview runtime'
	)
	.option('--preview-port <port>', 'Port for the local preview-server dev server', '3001')
	.option('-d, --dir <directory>', 'Directory to watch', 'src/lib/emails')
	.option(
		'-c, --custom-css-path <path>',
		'Path to CSS injected as raw customCSS (defaults to src/app.css or src/routes/layout.css if available)'
	)
	.option('--no-hmr', 'Disable live reload when email templates or preview CSS change')
	.option('--resend-api-key <key>', 'Resend API key for sending test emails from the preview UI')
	.option(
		'--resend-from <address>',
		'Sender address for test emails (default onboarding@resend.dev)'
	)
	.option(
		'--resend-persist',
		'When used with --resend-api-key, save credentials to .bse/resend.json in the project'
	)
	.action(dev);

program.parse(process.argv);
