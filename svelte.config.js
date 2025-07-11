import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: false
		}),
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
