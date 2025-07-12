<script lang="ts">
	import { isAuthenticated } from '$lib/stores';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
</script>

{#if $isAuthenticated}
	<slot />
{:else}
	<LoginForm />
{/if}
