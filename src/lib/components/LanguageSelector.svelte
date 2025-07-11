<script lang="ts">
	import { locale, locales, isLoading, waitLocale } from 'svelte-i18n';
	import { ChevronDown, Globe } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let isOpen = false;

	const languages = [
		{ code: 'en', name: 'English', flag: '🇺🇸' },
		{ code: 'cs', name: 'Čeština', flag: '🇨🇿' },
		{ code: 'ru', name: 'Русский', flag: '🇷🇺' }
	];

	$: currentLanguage = languages.find(lang => lang.code === $locale) || languages[0];

	async function selectLanguage(langCode: string) {
		// Prevent unnecessary updates
		if ($locale === langCode) {
			isOpen = false;
			return;
		}
		
		console.log('Selecting language:', langCode);
		
		// Store language preference first
		if (typeof window !== 'undefined') {
			localStorage.setItem('preferred-language', langCode);
		}
		
		// Set the locale and wait for it to load
		locale.set(langCode);
		await waitLocale(langCode);
		
		isOpen = false;
		dispatch('languageChanged', langCode);
		
		// Debug logging
		setTimeout(() => {
			console.log('Language switched to:', langCode);
			console.log('Current $locale:', $locale);
			console.log('localStorage:', localStorage.getItem('preferred-language'));
		}, 100);
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target?.closest('.language-selector')) {
			isOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="language-selector relative">
	<button
		on:click={toggleDropdown}
		class="flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
		aria-label="Select language"
		disabled={$isLoading}
	>
		<Globe size={16} />
		<span class="hidden sm:inline">{currentLanguage.flag}</span>
		<span class="hidden md:inline">{currentLanguage.name}</span>
		<ChevronDown size={14} class="transition-transform {isOpen ? 'rotate-180' : ''}" />
	</button>

	{#if isOpen}
		<div 
			class="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-50 py-1"
		>
			{#each languages as language}
				<button
					on:click={() => selectLanguage(language.code)}
					class="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
					class:bg-accent={$locale === language.code}
					class:text-accent-foreground={$locale === language.code}
				>
					<span class="text-lg">{language.flag}</span>
					<span>{language.name}</span>
					{#if language.code === 'en'}
						<span class="text-xs text-muted-foreground ml-auto">EN</span>
					{:else if language.code === 'cs'}
						<span class="text-xs text-muted-foreground ml-auto">CS</span>
					{:else if language.code === 'ru'}
						<span class="text-xs text-muted-foreground ml-auto">RU</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.language-selector {
		user-select: none;
	}
</style>
