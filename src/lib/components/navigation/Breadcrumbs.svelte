<script lang="ts">
	import { page } from '$app/stores';
	import { ChevronRight, Home } from 'lucide-svelte';
	
	$: currentPath = $page.url.pathname;
	
	$: breadcrumbs = (() => {
		const segments = currentPath.split('/').filter(Boolean);
		const crumbs = [];
		
		// Always start with home
		crumbs.push({
			label: 'Home',
			href: '/',
			icon: Home
		});
		
		if (segments[0] === 'masseuse') {
			crumbs.push({
				label: 'Masseuse Portal',
				href: '/masseuse',
				icon: null
			});
			
			if (segments[1]) {
				const pageNames = {
					dashboard: 'Dashboard',
					schedule: 'Schedule Management',
					bookings: 'Bookings & Appointments',
					analytics: 'Analytics & Reports',
					profile: 'Professional Profile'
				};
				
				crumbs.push({
					label: pageNames[segments[1] as keyof typeof pageNames] || segments[1],
					href: currentPath,
					icon: null
				});
			}
		}
		
		return crumbs;
	})();
</script>

<nav class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 py-2">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<ol class="flex items-center space-x-2 text-sm">
			{#each breadcrumbs as crumb, index}
				<li class="flex items-center">
					{#if index > 0}
						<ChevronRight class="w-4 h-4 text-gray-400 mx-2" />
					{/if}
					
					{#if index === breadcrumbs.length - 1}
						<!-- Current page -->
						<span class="flex items-center text-gray-900 dark:text-white font-medium">
							{#if crumb.icon}
								<svelte:component this={crumb.icon} class="w-4 h-4 mr-1" />
							{/if}
							{crumb.label}
						</span>
					{:else}
						<!-- Clickable breadcrumb -->
						<a 
							href={crumb.href} 
							class="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							{#if crumb.icon}
								<svelte:component this={crumb.icon} class="w-4 h-4 mr-1" />
							{/if}
							{crumb.label}
						</a>
					{/if}
				</li>
			{/each}
		</ol>
	</div>
</nav>
