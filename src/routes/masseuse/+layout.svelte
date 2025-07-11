<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { 
		Home, 
		Calendar, 
		BookOpen, 
		BarChart3, 
		User, 
		Bell, 
		Settings, 
		Menu,
		X,
		Clock,
		Users,
		TrendingUp
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import Breadcrumbs from '$lib/components/navigation/Breadcrumbs.svelte';
	
	// Navigation items for masseuse routes with enhanced data
	const navItems = [
		{ 
			href: '/masseuse/dashboard', 
			label: 'Dashboard', 
			icon: Home,
			description: 'Overview & quick actions',
			badge: null
		},
		{ 
			href: '/masseuse/schedule', 
			label: 'Schedule', 
			icon: Calendar,
			description: 'Manage availability',
			badge: null
		},
		{ 
			href: '/masseuse/bookings', 
			label: 'Bookings', 
			icon: BookOpen,
			description: 'View appointments',
			badge: '3'
		},
		{ 
			href: '/masseuse/analytics', 
			label: 'Analytics', 
			icon: BarChart3,
			description: 'Performance metrics',
			badge: null
		},
		{ 
			href: '/masseuse/profile', 
			label: 'Profile', 
			icon: User,
			description: 'Professional info',
			badge: null
		}
	];
	
	// Quick stats for header
	let quickStats = {
		todayBookings: 3,
		weeklyEarnings: 2450,
		rating: 4.9,
		newNotifications: 2
	};
	
	// Mobile menu state
	let isMobileMenuOpen = false;
	
	$: currentPath = $page.url.pathname;
	
	// Close mobile menu when route changes
	$: if (currentPath) {
		isMobileMenuOpen = false;
	}
	
	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}
	
	function handleQuickAction(action: string) {
		switch (action) {
			case 'notifications':
				// Handle notifications
				console.log('Show notifications');
				break;
			case 'settings':
				goto('/masseuse/settings');
				break;
			case 'logout':
				// Handle logout
				console.log('Logout');
				break;
		}
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Enhanced Navigation Header -->
	<header class="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Logo and Title -->
				<div class="flex items-center space-x-4">
					<div class="flex items-center">
						<div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
							<span class="text-white text-lg font-bold">A</span>
						</div>
						<div>
							<h1 class="text-xl font-bold text-gray-900 dark:text-white">
								Affinity Masseuse
							</h1>
							<p class="text-xs text-gray-500 dark:text-gray-400">Professional Portal</p>
						</div>
					</div>
					<Badge variant="secondary" class="hidden sm:inline-flex">Pro</Badge>
				</div>
				
				<!-- Quick Stats (Desktop) -->
				<div class="hidden lg:flex items-center space-x-6 text-sm">
					<div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
						<Clock class="w-4 h-4" />
						<span>Today: {quickStats.todayBookings}</span>
					</div>
					<div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
						<TrendingUp class="w-4 h-4" />
						<span>€{quickStats.weeklyEarnings}</span>
					</div>
					<div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
						<span class="text-yellow-500">⭐</span>
						<span>{quickStats.rating}</span>
					</div>
				</div>
				
				<!-- Quick Actions -->
				<div class="flex items-center space-x-3">
					<!-- Notifications -->
					<button 
						on:click={() => handleQuickAction('notifications')}
						class="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
					>
						<Bell class="w-5 h-5" />
						{#if quickStats.newNotifications > 0}
							<span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
								{quickStats.newNotifications}
							</span>
						{/if}
					</button>
					
					<!-- Settings -->
					<button 
						on:click={() => handleQuickAction('settings')}
						class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
					>
						<Settings class="w-5 h-5" />
					</button>
					
					<!-- Mobile Menu Toggle -->
					<button 
						on:click={toggleMobileMenu}
						class="sm:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
					>
						{#if isMobileMenuOpen}
							<X class="w-5 h-5" />
						{:else}
							<Menu class="w-5 h-5" />
						{/if}
					</button>
				</div>
			</div>
		</div>
	</header>
	
	<!-- Enhanced Navigation Tabs -->
	<nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
		<!-- Desktop Navigation -->
		<div class="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex space-x-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="group relative flex items-center px-4 py-4 text-sm font-medium transition-all duration-200
							{currentPath === item.href 
								? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-500' 
								: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
							}"
					>
						<svelte:component this={item.icon} class="w-4 h-4 mr-2" />
						<span>{item.label}</span>
						
						{#if item.badge}
							<Badge variant="destructive" class="ml-2 text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5">
								{item.badge}
							</Badge>
						{/if}
						
						<!-- Tooltip -->
						<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
							{item.description}
						</div>
					</a>
				{/each}
			</div>
		</div>
		
		<!-- Mobile Navigation -->
		{#if isMobileMenuOpen}
			<div class="sm:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
				<div class="px-4 py-2 space-y-1">
					{#each navItems as item}
						<a
							href={item.href}
							class="flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors
								{currentPath === item.href 
									? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
									: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
								}"
						>
							<div class="flex items-center">
								<svelte:component this={item.icon} class="w-5 h-5 mr-3" />
								<div>
									<div>{item.label}</div>
									<div class="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
								</div>
							</div>
							{#if item.badge}
								<Badge variant="destructive" class="text-xs">
									{item.badge}
								</Badge>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</nav>
	
	<!-- Breadcrumbs -->
	<Breadcrumbs />
	
	<!-- Page Content -->
	<main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
		<slot />
	</main>
</div>
