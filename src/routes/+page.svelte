<script>
	import WelcomeSection from '$lib/components/WelcomeSection.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { isAuthenticated } from '$lib/stores';
	import { goto } from '$app/navigation';
	
	function handleLogin() {
		goto('/login');
	}
	
	function handleDashboard() {
		goto('/user-management');
	}
</script>

<svelte:head>
	<title>Affinity - Massage Parlor Management</title>
</svelte:head>


	<!-- Public landing page with welcome section -->
	<div class="space-y-12 relative container mx-auto px-4 py-8">
		<!-- Hero Section with enhanced styling -->
		<section class="text-center py-16 relative">
			<div class="absolute inset-0 -z-10 overflow-hidden">
				<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
			</div>
			<h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
				<span class="gradient-text">Affinity</span>
			</h1>
			<p class="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
				Professional massage parlor management system
			</p>
			<div class="flex gap-6 justify-center flex-wrap">
				{#if $isAuthenticated}
					<Button size="lg" class="glass-button px-8 py-4 text-lg font-semibold" on:click={handleDashboard}>
						Go to Dashboard
					</Button>
				{:else}
					<Button size="lg" class="glass-button px-8 py-4 text-lg font-semibold" on:click={handleLogin}>
						Sign in to access your dashboard
					</Button>
				{/if}
			</div>
		</section>
	</div>
