import { mount } from 'svelte';
import App from './App.svelte';
import './router';
import './app.css';

mount(App, { target: document.querySelector('#app')! });
