// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Vite environment variables
interface ImportMeta {
	readonly env: {
		readonly VITE_POCKETBASE_URL?: string;
		[key: string]: any;
	};
}

export {};
