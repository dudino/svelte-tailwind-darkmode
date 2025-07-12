<script lang="ts">

	import { ChevronDown, Globe } from 'lucide-svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { browser } from '$app/environment';

	const dispatch = createEventDispatcher();

	let isOpen = $state(false);
	let currentLocale = $state('en');

	const languages = [
		{ code: 'en', name: 'English', flag: '🇺🇸' },
		{ code: 'cs', name: 'Čeština', flag: '🇨🇿' },
		{ code: 'ru', name: 'Русский', flag: '🇷🇺' }
	];

	let currentLanguage = $derived(languages.find(lang => lang.code === currentLocale) || languages[0]);

	onMount(() => {
		// Get initial locale from localStorage or browser
		if (browser) {
			const saved = localStorage.getItem('wuchale-locale');
			if (saved && languages.some(l => l.code === saved)) {
				currentLocale = saved;
			}
		}
	});

	async function selectLanguage(langCode: string) {
		if (currentLocale === langCode) {
			isOpen = false;
			return;
		}
		
		console.log('Selecting language:', langCode);
		currentLocale = langCode;
		
		// Store language preference
		if (browser) {
			localStorage.setItem('wuchale-locale', langCode);
		}
		
		// Trigger Wuchale locale change
		if (browser && window.wuchale) {
			window.wuchale.setLocale(langCode);
		}
		
		isOpen = false;
		dispatch('languageChanged', { language: langCode });
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.language-selector')) {
			isOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="language-selector relative">  <button
	on:click={toggleDropdown}
    class="flex items-center space-x-2 px-3 py-2 rounded-lg bg-card border border-border text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
		aria-label="Select Language"
	>
		<Globe class="w-4 h-4" />
		<span class="hidden sm:inline text-sm font-medium">{currentLanguage.name}</span>
		<span class="sm:hidden text-lg" role="img" aria-label={currentLanguage.name}>
			{currentLanguage.flag}
		</span>
		<ChevronDown class="w-4 h-4 transition-transform {isOpen ? 'rotate-180' : ''}" />
	</button>

	{#if isOpen}
		<div class="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
			{#each languages as language}        <button
		  on:click={() => selectLanguage(language.code)}
          class="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-lg last:rounded-b-lg"
					class:bg-accent={currentLocale === language.code}
					class:text-accent-foreground={currentLocale === language.code}
				>
					<span class="text-xl" role="img" aria-label={language.name}>{language.flag}</span>
					<span class="text-sm font-medium">{language.name}</span>
					{#if currentLocale === language.code}
						<span class="ml-auto text-primary">✓</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.language-selector {
		z-index: 50;
	}
</style>
