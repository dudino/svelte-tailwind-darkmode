<script>
	import { _, locale, isLoading } from 'svelte-i18n';
	import { isAuthenticated } from '$lib/stores/auth';
	import DashboardRouter from '$lib/components/dashboard/DashboardRouter.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { onMount } from 'svelte';
	
	let forceUpdate = 0;
	let previousLocale = '';
	
	// Force re-evaluation when locale changes
	$: if ($locale && $locale !== previousLocale) {
		previousLocale = $locale;
		forceUpdate++;
		console.log('Locale changed, forceUpdate:', forceUpdate, 'from', previousLocale, 'to', $locale);
	}
	
	// Listen for manual language change events
	onMount(() => {
		const handleLanguageChange = (event) => {
			console.log('Custom language change event received:', event.detail);
			forceUpdate++;
		};
		
		window.addEventListener('languageChanged', handleLanguageChange);
		
		return () => {
			window.removeEventListener('languageChanged', handleLanguageChange);
		};
	});
	
	// Force reactivity by making translations dependent on locale, loading state, and forceUpdate
	$: translations = ($locale && !$isLoading && forceUpdate >= 0) ? {
		homeSubtitle: $_('home.subtitle'),
		signIn: $_('auth.signInToAccess'),
		navHome: $_('nav.home')
	} : {
		homeSubtitle: 'Loading...',
		signIn: 'Loading...',
		navHome: 'Loading...'
	};
	
	// Debug translations
	$: console.log('Current translations:', translations);
	$: console.log('Current locale in page:', $locale, 'forceUpdate:', forceUpdate);
</script>

<svelte:head>
	<title>Affinity - Massage Parlor Management</title>
</svelte:head>

{#if $isAuthenticated}
	<DashboardRouter />
{:else}
	<!-- Public landing page (if somehow accessed) -->
	{#key `${$locale}-${forceUpdate}`}
	<div class="space-y-12 relative">
		<!-- Hero Section with enhanced styling -->
		<section class="text-center py-16 relative">
			<div class="absolute inset-0 -z-10 overflow-hidden">
				<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
			</div>
			<h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
				<span class="gradient-text">Affinity</span>
			</h1>
			<p class="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
				{translations.homeSubtitle}
			</p>
			<div class="flex gap-6 justify-center flex-wrap">
				<Button size="lg" class="glass-button px-8 py-4 text-lg font-semibold">
					{translations.signIn}
				</Button>
			</div>
		</section>
	</div>
	{/key}
{/if}
