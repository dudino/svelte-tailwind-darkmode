<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore, isAuthenticated } from '$lib/stores/auth';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-svelte';
	
	let email = '';
	let password = '';
	let showPassword = false;
	let isLoading = false;
	let error: string | null = null;
	
	// Demo credentials for easy testing
	const demoCredentials = [
		{ role: 'Administrator', email: 'admin@affinity.com', password: 'admin123' },
		{ role: 'Operator', email: 'operator@affinity.com', password: 'operator123' },
		{ role: 'Masseuse (Tiffany)', email: 'tiffany@affinity.com', password: 'tiffany123' },
		{ role: 'Masseuse (Monika)', email: 'monika@affinity.com', password: 'monika123' }
	];
	
	async function handleLogin() {
		if (!email || !password) {
			error = 'Please enter both email and password';
			return;
		}
		
		isLoading = true;
		error = null;
		
		const result = await authStore.login(email, password);
		
		if (!result.success) {
			error = result.error || 'Login failed';
		}
		
		isLoading = false;
	}
	
	function fillDemoCredentials(demoEmail: string, demoPassword: string) {
		email = demoEmail;
		password = demoPassword;
		error = null;
	}
	
	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}
	
	onMount(() => {
		authStore.init();
	});
</script>

<div class="min-h-screen flex items-center justify-center relative overflow-hidden">
	<!-- Background gradient -->
	<div class="absolute inset-0 -z-10">
		<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
		<div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
	</div>
	
	<div class="w-full max-w-md p-8">
		<!-- Logo and Title -->
		<div class="text-center mb-8">
			<div class="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
				<span class="text-primary-foreground font-bold text-2xl">A</span>
			</div>
			<h1 class="text-3xl font-bold gradient-text mb-2">Affinity</h1>
			<p class="text-muted-foreground">Massage Parlor Management</p>
		</div>
		
		<!-- Login Form -->
		<div class="enhanced-card p-8 rounded-2xl">
			<form on:submit|preventDefault={handleLogin} class="space-y-6">
				<!-- Email Field -->
				<div class="space-y-2">
					<label for="email" class="text-sm font-medium text-foreground">Email Address</label>
					<div class="relative">
						<Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="Enter your email"
							class="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background/50 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
							disabled={isLoading}
							required
						/>
					</div>
				</div>
				
				<!-- Password Field -->
				<div class="space-y-2">
					<label for="password" class="text-sm font-medium text-foreground">Password</label>
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						{#if showPassword}
							<input
								id="password"
								type="text"
								bind:value={password}
								placeholder="Enter your password"
								class="w-full pl-10 pr-12 py-3 border border-border rounded-lg bg-background/50 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
								disabled={isLoading}
								required
							/>
						{:else}
							<input
								id="password"
								type="password"
								bind:value={password}
								placeholder="Enter your password"
								class="w-full pl-10 pr-12 py-3 border border-border rounded-lg bg-background/50 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
								disabled={isLoading}
								required
							/>
						{/if}
						<button
							type="button"
							on:click={togglePasswordVisibility}
							class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
							disabled={isLoading}
						>
							{#if showPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</button>
					</div>
				</div>
				
				<!-- Error Message -->
				{#if error}
					<div class="flex items-center space-x-2 text-destructive text-sm">
						<AlertCircle class="h-4 w-4" />
						<span>{error}</span>
					</div>
				{/if}
				
				<!-- Login Button -->
				<Button
					type="submit"
					class="w-full glass-button py-3 text-lg font-semibold"
					disabled={isLoading}
				>
					{#if isLoading}
						<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
						Signing In...
					{:else}
						Sign In
					{/if}
				</Button>
			</form>
		</div>
		
		<!-- Demo Credentials -->
		<div class="mt-8 enhanced-card p-6 rounded-xl">
			<h3 class="text-lg font-semibold mb-4 text-center">Demo Accounts</h3>
			<div class="space-y-3">
				{#each demoCredentials as demo}
					<button
						on:click={() => fillDemoCredentials(demo.email, demo.password)}
						class="w-full text-left p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors border border-border/50"
						disabled={isLoading}
					>
						<div class="font-medium text-sm text-foreground">{demo.role}</div>
						<div class="text-xs text-muted-foreground">{demo.email}</div>
					</button>
				{/each}
			</div>
			<p class="text-xs text-muted-foreground mt-3 text-center">
				Click any account above to auto-fill credentials
			</p>
		</div>
	</div>
</div>
