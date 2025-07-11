<script>
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { locale, waitLocale, isLoading } from 'svelte-i18n';
	import '$lib/i18n';
	import '$styles/app.css';
	import { authStore } from '$lib/stores/auth';
	import ProtectedRoute from '$lib/components/auth/ProtectedRoute.svelte';
	import MobileNavbar from '$lib/components/MobileNavbar.svelte';

	let i18nLoaded = false;

	onMount(async () => {
		// Initialize auth state
		authStore.init();
		
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
	<title>Affinity - Massage Parlor Management</title>
</svelte:head>

<ModeWatcher />
{#if i18nLoaded}
	<ProtectedRoute>
		<MobileNavbar />
		<main class="container mx-auto px-4 py-6">
			<slot />
		</main>
	</ProtectedRoute>
{:else}
	<!-- Loading state while i18n initializes -->
	<div class="fixed inset-0 flex items-center justify-center bg-background">
		<div class="text-center">
			<div class="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
				<span class="text-primary-foreground font-bold text-2xl">A</span>
			</div>
			<div class="text-lg font-medium text-foreground mb-2">Loading Affinity...</div>
			<div class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
		</div>
	</div>
{/if}
