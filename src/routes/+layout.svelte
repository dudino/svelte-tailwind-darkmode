<script>
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { locale, waitLocale, isLoading } from 'svelte-i18n';
	import '$lib/i18n';
	import '$styles/app.css';
	import MobileNavbar from '$lib/components/MobileNavbar.svelte';

	let i18nLoaded = false;

	onMount(async () => {
		// Load saved language preference
		if (typeof window !== 'undefined') {
			const savedLanguage = localStorage.getItem('preferred-language');
			if (savedLanguage) {
				locale.set(savedLanguage);
			}
		}
		await waitLocale();
		i18nLoaded = true;
	});
</script>

<svelte:head>
	<title>sveltekit darkmode + tailwindcss</title>
</svelte:head>

<ModeWatcher />
{#if i18nLoaded}
	<MobileNavbar />
	<main class="container mx-auto px-4 py-6">
		<slot />
	</main>
{:else}
	<!-- Loading state while i18n initializes -->
	<div class="fixed inset-0 flex items-center justify-center bg-background">
		<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
	</div>
{/if}
