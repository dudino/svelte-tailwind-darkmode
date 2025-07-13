<script>
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import { isAuthenticated } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount, $effect } from 'svelte';
	
	// Redirect to dashboard if already authenticated
	onMount(() => {
		if ($isAuthenticated) {
			goto('/user-management');
		}
	});
	
	// Watch for authentication changes using $effect
	$effect(() => {
		if ($isAuthenticated) {
			goto('/user-management');
		}
	});
</script>

<svelte:head>
	<title>Login - Affinity</title>
</svelte:head>

<LoginForm />
