<script lang="ts">
	import { page } from '$app/stores';
	import { authStore } from '$lib/stores/auth';
	import { Users, MapPin, Calendar, UserCheck, BarChart3, Settings, Bell, Search } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import UserManagement from '$lib/components/crud/UserManagement.svelte';
	import LocationManagement from '$lib/components/crud/LocationManagement.svelte';
	import BookingManagement from '$lib/components/crud/BookingManagement.svelte';
	import ClientManagement from '$lib/components/crud/ClientManagement.svelte';
	import ReportsDashboard from '$lib/components/crud/ReportsDashboard.svelte';
	
	let activeTab = 'reports';
	
	const tabs = [
		{
			id: 'reports',
			label: 'Reports & Analytics',
			icon: BarChart3,
			component: ReportsDashboard,
			description: 'Business insights and performance metrics'
		},
		{
			id: 'users',
			label: 'User Management',
			icon: Users,
			component: UserManagement,
			description: 'Manage system users and permissions'
		},
		{
			id: 'locations',
			label: 'Locations & Rooms',
			icon: MapPin,
			component: LocationManagement,
			description: 'Manage parlor locations and massage rooms'
		},
		{
			id: 'bookings',
			label: 'Booking Management',
			icon: Calendar,
			component: BookingManagement,
			description: 'Manage client appointments and bookings'
		},
		{
			id: 'clients',
			label: 'Client Management',
			icon: UserCheck,
			component: ClientManagement,
			description: 'Manage client profiles and preferences'
		}
	];
	
	$: currentTab = tabs.find(tab => tab.id === activeTab);
	$: CurrentComponent = currentTab?.component;
</script>

<svelte:head>
	<title>Admin Dashboard - Affinity</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
	<!-- Header -->
	<header class="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-4">
					<div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
						<Settings class="h-6 w-6 text-white" />
					</div>
					<div>
						<h1 class="text-2xl font-bold text-foreground">Admin Dashboard</h1>
						<p class="text-sm text-muted-foreground">Comprehensive system management</p>
					</div>
				</div>
				
				<div class="flex items-center space-x-4">
					<div class="relative">
						<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							placeholder="Quick search..."
							class="pl-10 pr-4 py-2 w-64 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<Button variant="outline" size="sm" class="glass-button">
						<Bell class="h-4 w-4" />
					</Button>
					
					<div class="text-sm text-foreground">
						Welcome, <span class="font-semibold">{$authStore.user?.firstName}</span>
					</div>
				</div>
			</div>
		</div>
	</header>
	
	<!-- Navigation Tabs -->
	<div class="bg-background/60 backdrop-blur-sm border-b border-border sticky top-[73px] z-30">
		<div class="container mx-auto px-4">
			<nav class="flex space-x-1 overflow-x-auto">
				{#each tabs as tab}
					<button
						on:click={() => activeTab = tab.id}
						class="flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 {activeTab === tab.id 
							? 'text-primary border-primary bg-primary/5' 
							: 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
						}"
					>
						<svelte:component this={tab.icon} class="h-4 w-4" />
						<span>{tab.label}</span>
					</button>
				{/each}
			</nav>
		</div>
	</div>
	
	<!-- Tab Description -->
	{#if currentTab}
		<div class="bg-accent/20 border-b border-border">
			<div class="container mx-auto px-4 py-3">
				<p class="text-sm text-muted-foreground">{currentTab.description}</p>
			</div>
		</div>
	{/if}
	
	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		{#if CurrentComponent}
			<svelte:component this={CurrentComponent} />
		{:else}
			<div class="text-center py-12">
				<Settings class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
				<h3 class="text-lg font-semibold text-foreground mb-2">Select a Management Tool</h3>
				<p class="text-muted-foreground">Choose from the tabs above to manage different aspects of the system</p>
			</div>
		{/if}
	</main>
</div>

<style>
	/* Custom scrollbar for navigation */
	nav::-webkit-scrollbar {
		height: 2px;
	}
	
	nav::-webkit-scrollbar-track {
		background: transparent;
	}
	
	nav::-webkit-scrollbar-thumb {
		background: hsl(var(--border));
		border-radius: 2px;
	}
	
	nav::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--primary));
	}
</style>
