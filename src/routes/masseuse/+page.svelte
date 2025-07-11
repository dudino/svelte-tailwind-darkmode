<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	// Redirect to dashboard when accessing /masseuse
	onMount(() => {
		goto('/masseuse/dashboard', { replaceState: true });
	});
</script>

<svelte:head>
	<title>Masseuse Portal - Redirecting...</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen">
	<div class="text-center">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
		<p class="text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
	</div>
</div>
