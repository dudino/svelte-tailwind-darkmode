<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser, isAuthenticated } from '$lib/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import { 
		Menu, X, User, Settings, Calendar, 
		Users, MapPin, FileText, Star, Building,
		Key, Home, Shield
	} from 'lucide-svelte';

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

	// Navigation items based on user role
	$: navigationItems = $isAuthenticated ? getNavigationItems($currentUser?.role) : [];

	function getNavigationItems(role: string | undefined) {
		if (!role) return [];

		const baseItems = [
			{ href: '/login', icon: Key, labelKey: 'Login', show: true }
		];

		switch (role) {
			case 'administrator':
				return [
					{ href: '/admin', icon: Settings, labelKey: 'Dashboard', show: true },
					{ href: '/admin/users', icon: Users, labelKey: 'Users', show: true },
					{ href: '/admin/locations', icon: MapPin, labelKey: 'Locations', show: true },
					{ href: '/admin/rooms', icon: Building, labelKey: 'Rooms', show: true },
					{ href: '/admin/services', icon: Settings, labelKey: 'Services', show: true },
					{ href: '/admin/schedules', icon: Calendar, labelKey: 'Schedules', show: true },
					{ href: '/admin/bookings', icon: FileText, labelKey: 'Bookings', show: true },
					{ href: '/admin/clients', icon: User, labelKey: 'Clients', show: true },
					{ href: '/admin/reviews', icon: Star, labelKey: 'Reviews', show: true }
				];

			case 'operator':
				return [
					{ href: '/operator', icon: Home, labelKey: 'Dashboard', show: true },
					{ href: '/operator/bookings', icon: FileText, labelKey: 'Bookings', show: true },
					{ href: '/admin/clients', icon: User, labelKey: 'Clients', show: true },
					{ href: '/admin/schedules', icon: Calendar, labelKey: 'Schedules', show: true },
					{ href: '/admin/reviews', icon: Star, labelKey: 'Reviews', show: true }
				];

			case 'user':
				return [
					{ href: '/user', icon: Home, labelKey: 'Dashboard', show: true },
					{ href: '/user/bookings', icon: FileText, labelKey: 'My Bookings', show: true },
					{ href: '/user/schedule', icon: Calendar, labelKey: 'My Schedule', show: true },
					{ href: '/user/confirm-booking', icon: Shield, labelKey: 'Confirm Booking', show: true },
					{ href: '/user/profile', icon: User, labelKey: 'Profile', show: true }
				];

			default:
				return baseItems;
		}
	}
</script>

<nav class="mobile-nav fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
	<!-- Mobile Header -->
	<div class="flex items-center justify-between p-4">
		<!-- Logo/Brand with enhanced styling -->
		<button 
			type="button"
			class="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity" 
			on:click={() => window.location.href = '/'}
		>
			<div class="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
				<span class="text-primary-foreground font-bold text-lg">A</span>
			</div>
			<span class="text-xl font-bold gradient-text">App</span>
		</button>

		<!-- Desktop Navigation with glass effect -->
		<div class="hidden md:flex md:items-center md:space-x-8">
			{#each navigationItems.filter(item => item.show) as item}
				<a href={item.href} class="flex items-center space-x-2 text-foreground/80 hover:text-primary transition-all duration-300 hover:scale-105">
					<svelte:component this={item.icon} class="h-4 w-4" />
					<span class="font-medium">{item.labelKey}</span>
				</a>
			{/each}
		</div>

		<!-- Right side actions -->
		<div class="flex items-center space-x-2">
			{#if !$isAuthenticated}
				<LanguageSelector />
			{/if}
			<ThemeToggle />
			{#if $isAuthenticated}
				<Button on:click={toggleMenu} variant="ghost" size="icon" class="md:hidden">
					{#if isOpen}
						<X class="h-5 w-5" />
					{:else}
						<Menu class="h-5 w-5" />
					{/if}
					<span class="sr-only">Toggle menu</span>
				</Button>
			{/if}
		</div>
	</div>

	<!-- Mobile Menu Overlay with glass effect -->
	{#if isOpen && $isAuthenticated}
		<div class="absolute top-full left-0 right-0 md:hidden menu-overlay">
			<!-- Menu Items -->
			<div class="px-6 py-4 space-y-2">
				{#each navigationItems.filter(item => item.show) as item}
					<a 
						href={item.href} 
						class="flex items-center space-x-4 px-4 py-4 rounded-xl text-foreground/80 hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 hover:scale-105"
						on:click={closeMenu}
					>
						<svelte:component this={item.icon} class="h-5 w-5" />
						<span class="font-medium text-lg">{item.labelKey}</span>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</nav>
