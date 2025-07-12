<script>
    import Button from '$lib/components/ui/button/button.svelte';
    import LanguageSelector from '$lib/components/LanguageSelector.svelte';
    import ThemeToggle from '$lib/components/ThemeToggle.svelte';
    import { Palette, Globe } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Settings - Wuchale i18n Test</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-4">Settings</h1>
    
    <div class="card p-6 bg-card rounded-lg">
        <div class="grid gap-8 md:grid-cols-2">
            <div>
                <div class="flex items-center space-x-3 mb-4">
                    <Palette class="w-5 h-5 text-primary" />
                    <h2 class="text-xl font-semibold">Appearance</h2>
                </div>
                
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium">Theme</label>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
            
            <div>
                <div class="flex items-center space-x-3 mb-4">
                    <Globe class="w-5 h-5 text-primary" />
                    <h2 class="text-xl font-semibold">Language</h2>
                </div>
                
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium">Select Language</label>
                        <LanguageSelector />
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-6">
            <a href="/" class="text-primary hover:underline">← Back to Home</a>
        </div>
    </div>
</div>

	<section class="max-w-4xl mx-auto">
		<div class="grid md:grid-cols-2 gap-6">
			<!-- Appearance Settings -->
			<div class="bg-card border border-border rounded-lg p-6">
				<div class="flex items-center space-x-3 mb-4">
					<Palette class="w-6 h-6 text-primary" />
					<h3 class="text-xl font-semibold text-foreground">Appearance</h3>
				</div>
				<p class="text-muted-foreground mb-4">
					Choose your preferred theme
				</p>
				<div class="space-y-3">
					<label class="flex items-center space-x-3">
						<input type="radio" name="theme" value="light" class="text-primary" />
						<span class="text-foreground">Light Mode</span>
					</label>
					<label class="flex items-center space-x-3">
						<input type="radio" name="theme" value="dark" class="text-primary" />
						<span class="text-foreground">Dark Mode</span>
					</label>
					<label class="flex items-center space-x-3">
						<input type="radio" name="theme" value="system" class="text-primary" />
						<span class="text-foreground">System Default</span>
					</label>
				</div>
			</div>

			<!-- Language Settings -->
			<div class="bg-card border border-border rounded-lg p-6">
				<div class="flex items-center space-x-3 mb-4">
					<Globe class="w-6 h-6 text-primary" />
					<h3 class="text-xl font-semibold text-foreground">Language</h3>
				</div>
				<p class="text-muted-foreground mb-4">
					Select your preferred language
				</p>
				<div class="flex justify-start">
					<LanguageSelector />
				</div>
			</div>

			<!-- Notifications -->
			<div class="bg-card border border-border rounded-lg p-6">
				<div class="flex items-center space-x-3 mb-4">
					<Bell class="w-6 h-6 text-primary" />
					<h3 class="text-xl font-semibold text-foreground">Notifications</h3>
				</div>
				<p class="text-muted-foreground mb-4">
					Manage your notification preferences
				</p>
				<div class="space-y-3">
					<label class="flex items-center justify-between">
						<span class="text-foreground">Email Notifications</span>
						<input type="checkbox" class="text-primary" checked />
					</label>
					<label class="flex items-center justify-between">
						<span class="text-foreground">Push Notifications</span>
						<input type="checkbox" class="text-primary" />
					</label>
					<label class="flex items-center justify-between">
						<span class="text-foreground">SMS Notifications</span>
						<input type="checkbox" class="text-primary" />
					</label>
				</div>
			</div>

			<!-- Privacy -->
			<div class="bg-card border border-border rounded-lg p-6">
				<div class="flex items-center space-x-3 mb-4">
					<Shield class="w-6 h-6 text-primary" />
					<h3 class="text-xl font-semibold text-foreground">Privacy</h3>
				</div>
				<p class="text-muted-foreground mb-4">
					Control your privacy settings
				</p>
				<div class="space-y-3">
					<label class="flex items-center justify-between">
						<span class="text-foreground">Profile Visibility</span>
						<input type="checkbox" class="text-primary" checked />
					</label>
					<label class="flex items-center justify-between">
						<span class="text-foreground">Data Collection</span>
						<input type="checkbox" class="text-primary" />
					</label>
					<label class="flex items-center justify-between">
						<span class="text-foreground">Analytics</span>
						<input type="checkbox" class="text-primary" checked />
					</label>
				</div>
			</div>
	</div>

	<!-- Save Button -->
	<div class="flex justify-center mt-8">
		<Button size="lg" class="px-8">
			Save Settings
		</Button>
	</div>
</section>
