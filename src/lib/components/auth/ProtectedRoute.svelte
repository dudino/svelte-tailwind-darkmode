<script lang="ts">
	import { isAuthenticated } from '$lib/stores/auth';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
</script>

{#if $isAuthenticated}
	<slot />
{:else}
	<LoginForm />
{/if}
