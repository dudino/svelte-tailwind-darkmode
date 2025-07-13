<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { isAuthenticated } from '$lib/stores';
	import { goto } from '$app/navigation';
	
	function handleLogin() {
		goto('/login');
	}
	
	function handleHome() {
		goto('/');
	}
	
	function handleDashboard() {
		goto('/user-management');
	}
</script>

<header class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
	<div class="container mx-auto px-4 h-16 flex items-center justify-between">
		<button on:click={handleHome} class="flex items-center space-x-2">
			<div class="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
				<span class="text-primary-foreground font-bold text-lg">A</span>
			</div>
			<span class="text-xl font-bold">Affinity</span>
		</button>
		
		<div class="flex items-center space-x-4">
			{#if $isAuthenticated}
				<Button variant="outline" on:click={handleDashboard}>
					Dashboard
				</Button>
			{:else}
				<Button on:click={handleLogin}>
					Sign In
				</Button>
			{/if}
		</div>
	</div>
</header>
