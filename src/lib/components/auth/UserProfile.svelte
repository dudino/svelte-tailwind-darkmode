<script lang="ts">
	import { currentUser, userRole, logout } from '$lib/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { LogOut, User, Settings } from 'lucide-svelte';
	
	function handleLogout() {
		logout();
	}
	
	$: user = $currentUser;
	$: role = $userRole;
	
	function getRoleBadgeColor(role: string) {
		switch (role) {
			case 'administrator':
				return 'bg-red-500/10 text-red-600 border-red-500/20';
			case 'operator':
				return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
			case 'user':
				return 'bg-green-500/10 text-green-600 border-green-500/20';
			default:
				return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
		}
	}
</script>

{#if user}
	<div class="flex items-center space-x-3">
		<!-- User Info -->
		<div class="hidden md:flex md:items-center md:space-x-3">
			<div class="text-right">
				<div class="text-sm font-medium text-foreground">
					{user.contact_details?.firstName || user.name || user.nickname || 'User'} {user.contact_details?.lastName || ''}
				</div>
				<div class="flex items-center space-x-2">
					<span class={`text-xs px-2 py-1 rounded-full border ${getRoleBadgeColor(user.role)}`}>
						{user.role}
					</span>
				</div>
			</div>
			<div class="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
				<User class="h-4 w-4 text-primary-foreground" />
			</div>
		</div>
		
		<!-- Mobile User Badge -->
		<div class="md:hidden">
			<div class="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
				<User class="h-4 w-4 text-primary-foreground" />
			</div>
		</div>
		
		<!-- Logout Button -->
		<Button
			on:click={handleLogout}
			variant="ghost"
			size="icon"
			class="text-muted-foreground hover:text-foreground"
		>
			<LogOut class="h-4 w-4" />
			<span class="sr-only">Logout</span>
		</Button>
	</div>
{/if}
