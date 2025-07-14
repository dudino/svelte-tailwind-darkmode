<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser, isAuthenticated } from '$lib/stores';

	let { children } = $props();

	onMount(() => {
		// Check if user is authenticated and has user role
		if (!$isAuthenticated) {
			goto('/login');
			return;
		}

		if ($currentUser?.role !== 'user') {
			goto('/'); // Redirect to appropriate dashboard based on role
			return;
		}
	});
</script>

{#if $isAuthenticated && $currentUser?.role === 'user'}
	{@render children()}
{:else}
	<div class="flex items-center justify-center min-h-[50vh]">
		<div class="text-center">
			<div class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
			<p class="text-muted-foreground">Checking permissions...</p>
		</div>
	</div>
{/if}
