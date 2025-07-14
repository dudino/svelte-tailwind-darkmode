<script>
	import { onMount } from 'svelte';
	import WelcomeSection from '$lib/components/WelcomeSection.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { isAuthenticated, currentUser, userRole } from '$lib/stores';
	import { goto } from '$app/navigation';
	
	function handleLogin() {
		goto('/login');
	}
	
	function handleDashboard() {
		// Redirect to role-specific dashboard
		console.log('Home page handleDashboard, user role:', $currentUser?.role);
		if ($currentUser?.role === 'administrator') {
			goto('/admin');
		} else if ($currentUser?.role === 'operator') {
			goto('/operator');
		} else if ($currentUser?.role === 'user') {
			goto('/user');
		} else {
			// Fallback for unknown roles
			console.log('Unknown role, falling back to user dashboard');
			goto('/user');
		}
	}

	// Auto-redirect authenticated users to their dashboard
	onMount(() => {
		if ($isAuthenticated && $currentUser) {
			console.log('Home page auto-redirect for authenticated user with role:', $currentUser.role);
			handleDashboard();
		}
	});
</script>

<svelte:head>
	<title>TimeIt - Massage Parlor Management</title>
</svelte:head>

<!-- Public landing page with welcome section -->
<div class="space-y-12 relative container mx-auto px-4 py-8">
	<!-- Hero Section with enhanced styling -->
	<section class="text-center py-16 relative">
		<div class="absolute inset-0 -z-10 overflow-hidden">
			<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
		</div>
		<h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
			<span class="gradient-text">TimeIt</span>
		</h1>
		<p class="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
			Professional massage parlor management system
		</p>
		
		{#if $isAuthenticated && $currentUser}
			<!-- Show role-specific welcome message -->
			<div class="mb-8 p-6 bg-accent/20 rounded-lg border border-accent/30 max-w-2xl mx-auto">
				<p class="text-lg text-foreground mb-4">
					Welcome back, <span class="font-semibold">{$currentUser.name || $currentUser.email}</span>!
				</p>
				<p class="text-muted-foreground">
					{#if $currentUser.role === 'admin'}
						You have administrator access. Manage users, view reports, and configure system settings.
					{:else if $currentUser.role === 'user'}
						Access your bookings, manage clients, and handle your schedule.
					{:else}
						Welcome to your dashboard.
					{/if}
				</p>
			</div>
		{/if}
		
		<div class="flex gap-6 justify-center flex-wrap">
			{#if $isAuthenticated}
				<Button size="lg" class="glass-button px-8 py-4 text-lg font-semibold" on:click={handleDashboard}>
					{#if $currentUser?.role === 'admin'}
						Go to Admin Dashboard
					{:else}
						Go to Dashboard
					{/if}
				</Button>
			{:else}
				<Button size="lg" class="glass-button px-8 py-4 text-lg font-semibold" on:click={handleLogin}>
					Sign in to access your dashboard
				</Button>
			{/if}
		</div>
	</section>
</div>
