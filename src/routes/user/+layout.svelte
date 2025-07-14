<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser, isAuthenticated, logout } from '$lib/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { User } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { children } = $props();

	// Handle logout
	async function handleLogout() {
		try {
			await logout();
		} catch (error) {
			console.error('Logout error:', error);
			toast.error('Failed to logout');
		}
	}

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
	<div class="user-layout pt-16">
		<!-- User Panel Header -->
		<div class="user-header bg-gradient-to-r from-primary/20 to-primary/10 border-b mb-6 p-4 rounded-lg">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-primary flex items-center gap-2">
						<User class="h-6 w-6" />
						User Panel
					</h1>
					<p class="text-sm text-muted-foreground mt-1">
						Manage your personal schedule, bookings, and profile settings
					</p>
					<p class="text-muted-foreground mt-2">
						Logged in as: <span class="font-bold">{$currentUser?.name || 'User'}</span>
						<span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded ml-2">
							<User class="h-3 w-3 inline mr-1" />
							User
						</span>
					</p>
				</div>
				<Button on:click={handleLogout} variant="outline" size="sm">
					Logout
				</Button>
			</div>
		</div>
		
		<!-- Page Content -->
		<div class="max-w-7xl mx-auto">
			{@render children()}
		</div>
	</div>
{:else}
	<div class="flex items-center justify-center min-h-[50vh]">
		<div class="text-center">
			<div class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
			<p class="text-muted-foreground">Checking permissions...</p>
		</div>
	</div>
{/if}
