<script lang="ts">
	import { onMount } from 'svelte';

	import { currentUser, permissions, isAuthenticated } from '$lib/stores/auth';
	import Button from '$lib/components/ui/button/button.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import UserProfile from './auth/UserProfile.svelte';
	import { 
		Menu, X, Home, User, Settings, Info, Calendar, 
		Users, MapPin, FileText, Star, BarChart3 
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
	$: navigationItems = $isAuthenticated ? getNavigationItems($currentUser?.role, $permissions) : [];

	function getNavigationItems(role: string | undefined, perms: any) {
		if (!role) return [];

		const baseItems = [
			{ href: '/', icon: Home, labelKey: 'Dashboard', show: true }
		];

		switch (role) {
			case 'Administrator':
				return [
					...baseItems,
					{ href: '/users', icon: Users, labelKey: 'Users', show: perms.canManageUsers },
					{ href: '/locations', icon: MapPin, labelKey: 'Locations', show: perms.canManageLocations },
					{ href: '/schedules', icon: Calendar, labelKey: 'Schedules', show: perms.canManageSchedules },
					{ href: '/bookings', icon: FileText, labelKey: 'Bookings', show: perms.canViewAllBookings },
					{ href: '/reports', icon: BarChart3, labelKey: 'Reports', show: perms.canViewReports },
					{ href: '/clients', icon: User, labelKey: 'Clients', show: perms.canManageClients },
					{ href: '/reviews', icon: Star, labelKey: 'Reviews', show: true },
					{ href: '/settings', icon: Settings, labelKey: 'Settings', show: true }
				];

			case 'Operator':
				return [
					...baseItems,
					{ href: '/schedules', icon: Calendar, labelKey: 'Schedules', show: perms.canManageSchedules },
					{ href: '/bookings', icon: FileText, labelKey: 'Bookings', show: perms.canCreateBookings },
					{ href: '/clients', icon: User, labelKey: 'Clients', show: perms.canManageClients },
					{ href: '/reviews', icon: Star, labelKey: 'Reviews', show: true }
				];

			case 'Masseuse':
				return [
					...baseItems,
					{ href: '/masseuse/dashboard', icon: Home, labelKey: 'Dashboard', show: true },
					{ href: '/masseuse/schedule', icon: Calendar, labelKey: 'My Schedule', show: true },
					{ href: '/masseuse/bookings', icon: FileText, labelKey: 'My Bookings', show: true },
					{ href: '/masseuse/analytics', icon: BarChart3, labelKey: 'Analytics', show: true },
					{ href: '/masseuse/profile', icon: User, labelKey: 'Profile', show: true }
				];

			default:
				return baseItems;
		}
	}
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
			{#each navigationItems.filter(item => item.show) as item}
				<a href={item.href} class="flex items-center space-x-2 text-foreground/80 hover:text-primary transition-all duration-300 hover:scale-105">
					<svelte:component this={item.icon} class="h-4 w-4" />
					<span class="font-medium">{item.labelKey}</span>
				</a>
			{/each}
		</div>

		<!-- Right side actions -->
		<div class="flex items-center space-x-2">
			{#if $isAuthenticated}
				<UserProfile />
			{/if}
			<LanguageSelector />
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

<!-- Spacer to prevent content from going under fixed navbar -->
<div class="h-16"></div>
