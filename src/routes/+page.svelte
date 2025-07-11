<script>
	import { locale, isLoading } from 'svelte-i18n';
	import { isAuthenticated } from '$lib/stores/auth';
	import DashboardRouter from '$lib/components/dashboard/DashboardRouter.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { onMount } from 'svelte';
	import { reactiveLocale, refreshTranslations } from '$lib/stores/i18n';
	
	// Import translation files directly
	import enTranslations from '$lib/i18n/locales/en.json';
	import csTranslations from '$lib/i18n/locales/cs.json';
	import ruTranslations from '$lib/i18n/locales/ru.json';
	
	const allTranslations = {
		en: enTranslations,
		cs: csTranslations,
		ru: ruTranslations
	};
	
	let forceUpdate = 0;
	let currentTranslations = enTranslations;
	
	// Direct translation function that bypasses svelte-i18n
	function getTranslation(key) {
		const keys = key.split('.');
		let value = currentTranslations;
		
		for (const k of keys) {
			if (value && typeof value === 'object' && k in value) {
				value = value[k];
			} else {
				console.warn(`Translation key not found: ${key}`);
				return key; // Return key if translation not found
			}
		}
		
		return value;
	}
	
	// Update translations when locale changes
	$: if ($locale && allTranslations[$locale]) {
		console.log('Updating translations for locale:', $locale);
		currentTranslations = allTranslations[$locale];
		forceUpdate++;
	}
	
	// Also update on reactive locale changes
	$: if ($reactiveLocale) {
		console.log('Reactive locale change detected:', $reactiveLocale);
		if ($reactiveLocale.locale && allTranslations[$reactiveLocale.locale]) {
			currentTranslations = allTranslations[$reactiveLocale.locale];
			forceUpdate++;
		}
	}
	
	// Listen for manual language change events
	onMount(() => {
		const handleLanguageChange = (event) => {
			console.log('Custom language change event received:', event.detail);
			refreshTranslations();
			forceUpdate++;
		};
		
		if (typeof window !== 'undefined') {
			window.addEventListener('languageChanged', handleLanguageChange);
			
			return () => {
				window.removeEventListener('languageChanged', handleLanguageChange);
			};
		}
	});
	
	// Debug current state
	$: console.log('Page state:', {
		locale: $locale,
		isLoading: $isLoading,
		forceUpdate,
		homeSubtitle: getTranslation('home.subtitle'),
		currentLocale: $locale
	});
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
				{getTranslation('home.subtitle')}
			</p>
			<div class="flex gap-6 justify-center flex-wrap">
				<Button size="lg" class="glass-button px-8 py-4 text-lg font-semibold">
					{getTranslation('auth.signInToAccess')}
				</Button>
			</div>
		</section>
	</div>
	{/key}
{/if}
