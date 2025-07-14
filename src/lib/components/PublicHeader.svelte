<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { isAuthenticated, currentUser, logout } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { User, LogOut, Settings, Sun, Moon } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	let isDark = $state(false);

	function toggleTheme() {
		isDark = !isDark;
		document.documentElement.classList.toggle('dark', isDark);
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
	}
	
	function handleLogin() {
		goto('/login');
	}
	
	function handleHome() {
		goto('/');
	}
	
	function handleDashboard() {
		// Redirect to role-specific dashboard
		console.log('handleDashboard called, user role:', $currentUser?.role);
		if ($currentUser?.role === 'administrator') {
			goto('/admin');
		} else if ($currentUser?.role === 'operator') {
			goto('/operator');
		} else if ($currentUser?.role === 'user') {
			goto('/user');
		} else {
			// Fallback for unknown roles
			console.log('Unknown role, falling back to user dashboard');
			goto('/user');
		}
	}

	async function handleLogout() {
		try {
			await logout();
			toast.success('Logged out successfully');
			goto('/');
		} catch (error) {
			console.error('Logout error:', error);
			toast.error('Failed to logout');
		}
	}

	onMount(() => {
		// Get saved theme or check system preference
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			isDark = savedTheme === 'dark';
		} else {
			isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
		
		document.documentElement.classList.toggle('dark', isDark);
	});
</script>

<header class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
	<div class="container mx-auto px-4 h-16 flex items-center justify-between">
		<button on:click={handleHome} class="flex items-center space-x-2">
			<div class="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
				<span class="text-primary-foreground font-bold text-lg">A</span>
			</div>
			<span class="text-xl font-bold">TimeIt</span>
		</button>
		
		<div class="flex items-center space-x-4">
			<!-- Theme Toggle -->
			<Button
				variant="ghost"
				size="icon"
				on:click={toggleTheme}
				class="relative h-9 w-9"
				aria-label="Toggle theme"
			>
				<div class="absolute inset-0 flex items-center justify-center transition-transform duration-300 {isDark ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}">
					<Sun class="h-4 w-4" />
				</div>
				<div class="absolute inset-0 flex items-center justify-center transition-transform duration-300 {isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}">
					<Moon class="h-4 w-4" />
				</div>
			</Button>

			{#if $isAuthenticated && $currentUser}
				<!-- User info and role indicator -->
				<div class="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
					<User class="h-4 w-4" />
					<span>{$currentUser.name || $currentUser.email}</span>
					{#if $currentUser.role === 'administrator'}
						<span class="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
							Admin
						</span>
					{:else if $currentUser.role === 'user'}
						<span class="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
							User
						</span>
					{/if}
				</div>
				
				<!-- Dashboard button -->
				<Button variant="outline" on:click={handleDashboard}>
					{#if $currentUser.role === 'administrator'}
						<Settings class="h-4 w-4 mr-2" />
						Admin Panel
					{:else}
						Dashboard
					{/if}
				</Button>
				
				<!-- Logout button -->
				<Button variant="ghost" size="sm" on:click={handleLogout}>
					<LogOut class="h-4 w-4" />
					<span class="hidden sm:inline ml-2">Logout</span>
				</Button>
			{:else}
				<Button on:click={handleLogin}>
					Sign In
				</Button>
			{/if}
		</div>
	</div>
</header>
