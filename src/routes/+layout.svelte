<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import '$styles/app.css';
	import ProtectedRoute from '$lib/components/auth/ProtectedRoute.svelte';
	import MobileNavbar from '$lib/components/MobileNavbar.svelte';
	import PublicHeader from '$lib/components/PublicHeader.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import StatusFooter from '$lib/components/StatusFooter.svelte';
	import { initPocketBase, isAuthenticated } from '$lib/stores';
	import { Toaster } from 'svelte-sonner';

	// Import debug utilities in development
	import '$lib/utils/debugUtils';

	// Get the locale data from the load function
	let { data, children } = $props();
	
	let appLoaded = $state(false);

	// Routes that don't require authentication
	const publicRoutes = ['/', '/about', '/login'];
	
	const currentPath = $derived($page?.url?.pathname || '/');
	const isPublicRoute = $derived(publicRoutes.includes(currentPath));
	const shouldShowProtected = $derived($isAuthenticated && !isPublicRoute);

	onMount(async () => {
		// Initialize auth state and stores
		try {
			await initPocketBase();
		} catch (err) {
			console.warn('Failed to initialize PocketBase:', err);
		}
		appLoaded = true;
	});
</script>

<svelte:head>
	<title>Affinity - Massage Parlor Management</title>
</svelte:head>

{#if appLoaded}
	<div class="min-h-screen bg-gradient-to-br from-muted/40 via-muted/60 to-primary/20 dark:from-muted/60 dark:via-muted/80 dark:to-primary/30">
		<ThemeToggle />
		{#if shouldShowProtected}
			<ProtectedRoute>
				<MobileNavbar />
				<main class="container mx-auto px-4 py-6 pb-20">
					{@render children()}
				</main>
			</ProtectedRoute>
		{:else}
			<!-- Public pages -->
			<PublicHeader />
			<main class="min-h-screen pb-20">
				{@render children()}
			</main>
		{/if}
		
		<!-- Status Footer - shown on all pages when authenticated -->
		<StatusFooter />
		
		<!-- Toast Notifications -->
		<Toaster />
	</div>
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
