<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import { isAuthenticated } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	// Redirect to dashboard if already authenticated
	onMount(() => {
		if ($isAuthenticated) {
			goto('/admin');
		}
	});
	
	// Watch for authentication changes using $effect rune
	$effect(() => {
		if ($isAuthenticated) {
			goto('/admin');
		}
	});
</script>

<svelte:head>
	<title>Sign In - Affinity</title>
	<meta name="description" content="Sign in to your Affinity massage management account" />
</svelte:head>

<LoginForm />
