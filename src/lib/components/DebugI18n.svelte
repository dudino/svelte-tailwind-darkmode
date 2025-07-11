<script lang="ts">
	import { _, locale, isLoading } from 'svelte-i18n';
	import { onMount } from 'svelte';

	let debugInfo: any = {};

	onMount(() => {
		// Debug current state
		const updateDebugInfo = () => {
			debugInfo = {
				currentLocale: $locale,
				isLoading: $isLoading,
				homeTitleTranslation: $_('home.title'),
				homeSubtitleTranslation: $_('home.subtitle'),
				navHomeTranslation: $_('nav.home'),
				localStorage: typeof window !== 'undefined' ? localStorage.getItem('preferred-language') : 'N/A'
			};
		};

		updateDebugInfo();
		
		// Update debug info when locale changes
		const unsubscribe = locale.subscribe(() => {
			setTimeout(updateDebugInfo, 100);
		});

		return unsubscribe;
	});
</script>

<div class="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-md">
	<h3 class="font-bold mb-2">i18n Debug Info</h3>
	{#each Object.entries(debugInfo) as [key, value]}
		<div><span class="text-yellow-300">{key}:</span> {value}</div>
	{/each}
	
	<div class="mt-2 pt-2 border-t border-gray-600">
		<button 
			on:click={() => locale.set('en')}
			class="bg-blue-600 px-2 py-1 rounded mr-1"
		>EN</button>
		<button 
			on:click={() => locale.set('cs')}
			class="bg-green-600 px-2 py-1 rounded mr-1"
		>CS</button>
		<button 
			on:click={() => locale.set('ru')}
			class="bg-red-600 px-2 py-1 rounded"
		>RU</button>
	</div>
</div>
