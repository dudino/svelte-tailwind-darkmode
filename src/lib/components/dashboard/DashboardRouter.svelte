<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import AdminDashboard from './AdminDashboard.svelte';
	import OperatorDashboard from './OperatorDashboard.svelte';
	import MasseuseDashboard from './MasseuseDashboard.svelte';
	
	$: user = $currentUser;
	$: userRole = user?.role;
</script>

{#if userRole === 'Administrator'}
	<AdminDashboard />
{:else if userRole === 'Operator'}
	<OperatorDashboard />
{:else if userRole === 'Masseuse'}
	<MasseuseDashboard />
{:else}
	<div class="text-center py-16">
		<h2 class="text-2xl font-bold text-foreground mb-4">Welcome to Affinity</h2>
		<p class="text-muted-foreground">Please contact your administrator for access.</p>
	</div>
{/if}
