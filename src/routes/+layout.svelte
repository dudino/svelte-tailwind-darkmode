<script>
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import '$styles/app.css';
	import { authStore } from '$lib/stores/auth';
	import ProtectedRoute from '$lib/components/auth/ProtectedRoute.svelte';
	import MobileNavbar from '$lib/components/MobileNavbar.svelte';

	// Get the locale data from the load function
	let { data, children } = $props();
	
	// Use the locale data
	let currentLocale = $derived(data?.locale || 'en');
	
	let appLoaded = $state(false);

	onMount(async () => {
		// Initialize auth state
		authStore.init();
		appLoaded = true;
	});
</script>

<svelte:head>
	<title>Affinity - Massage Parlor Management</title>
</svelte:head>

<ModeWatcher />
{#if appLoaded}
	<ProtectedRoute>
		<MobileNavbar />
		<main class="container mx-auto px-4 py-6">
			{@render children()}
		</main>
	</ProtectedRoute>
{:else}
	<!-- Loading state while app initializes -->
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
