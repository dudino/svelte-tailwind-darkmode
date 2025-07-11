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
		if (!target.closest('.mobile-nav')) {
			closeMenu();
		}
	}

	$: if (mounted && isOpen) {
		document.addEventListener('click', handleOutsideClick);
	} else if (mounted) {
		document.removeEventListener('click', handleOutsideClick);
	}
</script>

<nav class="mobile-nav fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
	<!-- Mobile Header -->
	<div class="flex items-center justify-between p-4">
		<!-- Logo/Brand -->
		<div class="flex items-center space-x-2">
			<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
				<span class="text-primary-foreground font-bold text-sm">A</span>
			</div>
			<span class="text-lg font-semibold text-foreground">App</span>
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

	<!-- Desktop Navigation (hidden on mobile) -->
	<div class="hidden md:flex md:items-center md:justify-center md:space-x-8 md:pb-4">
		<a href="/" class="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
			<Home class="h-4 w-4" />
			<span>{$isLoading ? 'Home' : $_('nav.home')}</span>
		</a>
		<a href="/about" class="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
			<Info class="h-4 w-4" />
			<span>{$isLoading ? 'About' : $_('nav.about')}</span>
		</a>
		<a href="/profile" class="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
			<User class="h-4 w-4" />
			<span>{$isLoading ? 'Profile' : $_('nav.profile')}</span>
		</a>
		<a href="/settings" class="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
			<Settings class="h-4 w-4" />
			<span>{$isLoading ? 'Settings' : $_('nav.settings')}</span>
		</a>
	</div>

	<!-- Mobile Menu Overlay -->
	{#if isOpen}
		<div class="md:hidden menu-overlay">
			<!-- Menu Items -->
			<div class="bg-background border-t border-border">
				<div class="px-4 py-2 space-y-1">
					<a 
						href="/" 
						class="flex items-center space-x-3 px-3 py-3 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
						on:click={closeMenu}
					>
						<Home class="h-5 w-5" />
						<span class="font-medium">{$isLoading ? 'Home' : $_('nav.home')}</span>
					</a>
					<a 
						href="/about" 
						class="flex items-center space-x-3 px-3 py-3 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
						on:click={closeMenu}
					>
						<Info class="h-5 w-5" />
						<span class="font-medium">{$isLoading ? 'About' : $_('nav.about')}</span>
					</a>
					<a 
						href="/profile" 
						class="flex items-center space-x-3 px-3 py-3 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
						on:click={closeMenu}
					>
						<User class="h-5 w-5" />
						<span class="font-medium">{$isLoading ? 'Profile' : $_('nav.profile')}</span>
					</a>
					<a 
						href="/settings" 
						class="flex items-center space-x-3 px-3 py-3 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
						on:click={closeMenu}
					>
						<Settings class="h-5 w-5" />
						<span class="font-medium">{$isLoading ? 'Settings' : $_('nav.settings')}</span>
					</a>
				</div>
			</div>
		</div>
	{/if}
</nav>

<!-- Spacer to prevent content from going under fixed navbar -->
<div class="h-16 md:h-24"></div>
