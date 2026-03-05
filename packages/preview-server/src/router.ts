import { createRouter } from 'sv-router';
import Home from './components/Home.svelte';
import Preview from './components/Preview.svelte';

export const { p, navigate, isActive, route } = createRouter({
	'/': Home,
	'*email': Preview
});
