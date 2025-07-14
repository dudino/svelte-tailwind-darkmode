<script lang="ts">
	import { goto } from '$app/navigation';
	import { isAuthenticated, login, currentUser } from '$lib/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { User, Lock, LogIn, Zap, Shield, UserCog, Database, ArrowLeft } from 'lucide-svelte';
	
	let email = '';
	let password = '';
	let loading = false;
	let importingDemo = false;
	let error = '';

	async function handleLogin() {
		if (!email || !password) {
			error = 'Please fill in all fields';
			return;
		}

		loading = true;
		error = '';

		try {
			// Use the actual login function from authStore
			const result = await login(email, password);
			
			if (result.success) {
				// Redirect based on user role
				const redirectPath = $currentUser?.role === 'administrator' ? '/admin' : '/';
				goto(redirectPath);
			} else {
				// Login failed - show error message
				error = result.message || 'Invalid email or password';
			}
		} catch (err) {
			console.error('Login error:', err);
			error = 'Login failed. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function quickLogin(demoEmail: string, demoPassword: string) {
		email = demoEmail;
		password = demoPassword;
		await handleLogin();
	}

	async function importDemoData() {
		importingDemo = true;
		try {
			const response = await fetch('/import-demo-data.js');
			if (response.ok) {
				// Demo data imported successfully
				console.log('Demo data imported successfully');
			}
		} catch (error) {
			console.error('Failed to import demo data:', error);
		} finally {
			importingDemo = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleLogin();
		}
	}

	const demoAccounts = [
		{
			email: 'admin@massage.com',
			password: 'admin123456',
			name: 'Administrator',
			role: 'Full access to all features',
			icon: Shield,
			color: 'from-red-500 to-red-600'
		},
		{
			email: 'operator@massage.com',
			password: 'operator123456',
			name: 'Operator',
			role: 'Manage bookings and clients',
			icon: UserCog,
			color: 'from-blue-500 to-blue-600'
		},
		{
			email: 'massage1@massage.com',
			password: 'user123456',
			name: 'Staff User',
			role: 'View schedules and bookings',
			icon: User,
			color: 'from-green-500 to-green-600'
		}
	];
</script>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
	<!-- Back to home button -->
	<div class="absolute top-6 left-6">
		<Button variant="ghost" href="/" class="text-muted-foreground hover:text-foreground">
			<ArrowLeft class="h-4 w-4 mr-2" />
			Back to Home
		</Button>
	</div>

	<!-- Background decorative elements -->
	<div class="absolute inset-0 -z-10 overflow-hidden">
		<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
		<div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl"></div>
	</div>

	<div class="max-w-6xl w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
		<!-- Left side - Login Form -->
		<div class="max-w-md mx-auto w-full lg:mx-0 order-2 lg:order-1">
			<div class="text-center mb-8">
				<div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl mb-6">
					<LogIn class="h-8 w-8 text-primary-foreground" />
				</div>
				<h1 class="text-3xl font-bold mb-2">
					Welcome to <span class="gradient-text">Affinity</span>
				</h1>
				<p class="text-muted-foreground">
					Sign in to your massage management account
				</p>
			</div>

			<div class="bg-card border rounded-2xl p-6 lg:p-8 shadow-lg">
				<form class="space-y-6" on:submit|preventDefault={handleLogin}>
					<div class="space-y-4">
						<div class="relative">
							<label for="email" class="block text-sm font-medium mb-2">Email address</label>
							<div class="relative">
								<User class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<input
									id="email"
									name="email"
									type="email"
									autocomplete="email"
									required
									bind:value={email}
									on:keypress={handleKeyPress}
									class="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
									placeholder="Enter your email"
								/>
							</div>
						</div>
						
						<div class="relative">
							<label for="password" class="block text-sm font-medium mb-2">Password</label>
							<div class="relative">
								<Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<input
									id="password"
									name="password"
									type="password"
									autocomplete="current-password"
									required
									bind:value={password}
									on:keypress={handleKeyPress}
									class="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
									placeholder="Enter your password"
								/>
							</div>
						</div>
					</div>

					{#if error}
						<div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
							<p class="text-destructive text-sm">{error}</p>
						</div>
					{/if}

					<Button
						type="submit"
						disabled={loading}
						class="w-full py-3 font-semibold"
						size="lg"
					>
						{#if loading}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
							Signing in...
						{:else}
							<LogIn class="h-4 w-4 mr-2" />
							Sign in
						{/if}
					</Button>
				</form>
			</div>
		</div>

		<!-- Right side - Demo Accounts -->
		<div class="max-w-md mx-auto w-full lg:mx-0 order-1 lg:order-2">
			<div class="text-center mb-8">
				<div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl mb-4">
					<Zap class="h-6 w-6 text-primary" />
				</div>
				<h2 class="text-2xl font-semibold mb-2">Quick Demo Access</h2>
				<p class="text-muted-foreground text-sm">
					Try different user roles with one click
				</p>
			</div>

			<div class="space-y-4">
				{#each demoAccounts as account}
					<button
						on:click={() => quickLogin(account.email, account.password)}
						disabled={loading}
						class="w-full bg-card border rounded-xl p-4 lg:p-6 text-left hover:shadow-md transition-all duration-200 hover:border-primary/20 hover:bg-card/80 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
					>
						<!-- Gradient overlay on hover -->
						<div class="absolute inset-0 bg-gradient-to-r {account.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200"></div>
						
						<div class="relative flex items-start justify-between">
							<div class="flex items-center space-x-4">
								<div class="p-2 lg:p-3 rounded-lg bg-gradient-to-r {account.color} flex-shrink-0">
									<svelte:component this={account.icon} class="h-4 w-4 lg:h-5 lg:w-5 text-white" />
								</div>
								<div class="min-w-0 flex-1">
									<h3 class="font-semibold text-foreground group-hover:text-primary transition-colors text-sm lg:text-base">
										{account.name}
									</h3>
									<p class="text-xs lg:text-sm text-muted-foreground">{account.role}</p>
									<p class="text-xs text-muted-foreground mt-1 truncate">
										{account.email}
									</p>
								</div>
							</div>
							<div class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
								<LogIn class="h-4 w-4 text-primary" />
							</div>
						</div>
					</button>
				{/each}
			</div>

			<div class="mt-8 p-4 bg-muted/50 rounded-xl">
				<div class="flex items-center justify-between mb-3">
					<p class="text-xs text-muted-foreground">
						💡 <strong>Demo Mode:</strong> These accounts contain sample data for testing purposes.
					</p>
					<Button
						variant="outline"
						size="sm"
						on:click={importDemoData}
						disabled={importingDemo}
						class="text-xs"
					>
						{#if importingDemo}
							<div class="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
							Importing...
						{:else}
							<Database class="h-3 w-3 mr-1" />
							Import Demo Data
						{/if}
					</Button>
				</div>
				<p class="text-xs text-muted-foreground">
					Administrator access provides full system management capabilities.
				</p>
			</div>
		</div>
	</div>
</div>