import adapterAuto from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto automatically selects the appropriate adapter based on deployment environment
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapterAuto(),
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Handle errors during prerendering
				console.log(`Could not prerender ${path} (${message})`);
			},
			handleMissingId: ({ path, id }) => {
				// Handle missing IDs
				console.warn(`Missing ID ${id} on page ${path}`);
			}
		},
		alias: {
			$styles: './src/styles',
			'@/*': './path/to/lib/*'
		}
	}
};

export default config;
