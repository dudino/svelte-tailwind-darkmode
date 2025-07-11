<script lang="ts">
	import { onMount } from 'svelte';
	import { _, isLoading } from 'svelte-i18n';
	import Button from '$lib/components/ui/button/button.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import { Menu, X, Home, User, Settings, Info } from 'lucide-svelte';

	let isOpen = false;
	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	function toggleMenu() {
		isOpen = !isOpen;
	}

	function closeMenu() {
		isOpen = false;
	}

	// Close menu when clicking outside
	function handleOutsideClick(event: Event) {
		const target = event.target as HTMLElement;
		if (!target.closest('.mobile-nav') && !target.closest('.language-selector')) {
			closeMenu();
		}
	}

	$: if (mounted && isOpen) {
		document.addEventListener('click', handleOutsideClick);
	} else if (mounted) {
		document.removeEventListener('click', handleOutsideClick);
	}

	// Clean up event listener on component destroy
	import { onDestroy } from 'svelte';
	onDestroy(() => {
		if (mounted) {
			document.removeEventListener('click', handleOutsideClick);
		}
	});
</script>

<nav class="mobile-nav fixed top-0 left-0 right-0 z-50">
	<!-- Mobile Header -->
	<div class="flex items-center justify-between p-4">
		<!-- Logo/Brand with enhanced styling -->
		<div class="flex items-center space-x-3">
			<div class="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
				<span class="text-primary-foreground font-bold text-lg">A</span>
			</div>
			<span class="text-xl font-bold gradient-text">App</span>
		</div>

		<!-- Desktop Navigation with glass effect -->
		<div class="hidden md:flex md:items-center md:space-x-8">
			<a href="/" class="flex items-center space-x-2 text-foreground/80 hover:text-primary transition-all duration-300 hover:scale-105">
				<Home class="h-4 w-4" />
				<span class="font-medium">{$isLoading ? 'Home' : $_('nav.home')}</span>
			</a>
			<a href="/about" class="flex items-center space-x-2 text-foreground/80 hover:text-primary transition-all duration-300 hover:scale-105">
				<Info class="h-4 w-4" />
				<span class="font-medium">{$isLoading ? 'About' : $_('nav.about')}</span>
			</a>
			<a href="/profile" class="flex items-center space-x-2 text-foreground/80 hover:text-primary transition-all duration-300 hover:scale-105">
				<User class="h-4 w-4" />
				<span class="font-medium">{$isLoading ? 'Profile' : $_('nav.profile')}</span>
			</a>
			<a href="/settings" class="flex items-center space-x-2 text-foreground/80 hover:text-primary transition-all duration-300 hover:scale-105">
				<Settings class="h-4 w-4" />
				<span class="font-medium">{$isLoading ? 'Settings' : $_('nav.settings')}</span>
			</a>
		</div>

		<!-- Right side actions -->
		<div class="flex items-center space-x-2">
			<LanguageSelector />
			<ThemeToggle />
			<Button on:click={toggleMenu} variant="ghost" size="icon" class="md:hidden">
				{#if isOpen}
					<X class="h-5 w-5" />
				{:else}
					<Menu class="h-5 w-5" />
				{/if}
				<span class="sr-only">Toggle menu</span>
			</Button>
		</div>
	</div>

	<!-- Mobile Menu Overlay with glass effect -->
	{#if isOpen}
		<div class="absolute top-full left-0 right-0 md:hidden menu-overlay">
			<!-- Menu Items -->
			<div class="px-6 py-4 space-y-2">
				<a 
					href="/" 
					class="flex items-center space-x-4 px-4 py-4 rounded-xl text-foreground/80 hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 hover:scale-105"
					on:click={closeMenu}
				>
					<Home class="h-5 w-5" />
					<span class="font-medium text-lg">{$isLoading ? 'Home' : $_('nav.home')}</span>
				</a>
				<a 
					href="/about" 
					class="flex items-center space-x-4 px-4 py-4 rounded-xl text-foreground/80 hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 hover:scale-105"
					on:click={closeMenu}
				>
					<Info class="h-5 w-5" />
					<span class="font-medium text-lg">{$isLoading ? 'About' : $_('nav.about')}</span>
				</a>
				<a 
					href="/profile" 
					class="flex items-center space-x-4 px-4 py-4 rounded-xl text-foreground/80 hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 hover:scale-105"
					on:click={closeMenu}
				>
					<User class="h-5 w-5" />
					<span class="font-medium text-lg">{$isLoading ? 'Profile' : $_('nav.profile')}</span>
				</a>
				<a 
					href="/settings" 
					class="flex items-center space-x-4 px-4 py-4 rounded-xl text-foreground/80 hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 hover:scale-105"
					on:click={closeMenu}
				>
					<Settings class="h-5 w-5" />
					<span class="font-medium text-lg">{$isLoading ? 'Settings' : $_('nav.settings')}</span>
				</a>
			</div>
		</div>
	{/if}
</nav>

<!-- Spacer to prevent content from going under fixed navbar -->
<div class="h-16"></div>
