<script>
	import { _ } from 'svelte-i18n';
	import Button from '$lib/components/ui/button/button.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { Palette, Bell, Shield, Globe, Smartphone } from 'lucide-svelte';
</script>

<svelte:head>
	<title>{$_('nav.settings')} - {$_('common.darkPink')}</title>
</svelte:head>

<div class="space-y-8">
	<section class="text-center py-8">
		<h1 class="text-4xl font-bold text-foreground mb-4">
			{$_('settings.title')}
		</h1>
		<p class="text-xl text-muted-foreground mb-8">
			Customize your application preferences and settings.
		</p>
	</section>

	<section class="max-w-4xl mx-auto">
		<div class="grid md:grid-cols-2 gap-6">
			<!-- Appearance Settings -->
			<div class="bg-card border border-border rounded-lg p-6">
				<div class="flex items-center space-x-3 mb-4">
					<Palette class="w-6 h-6 text-primary" />
					<h3 class="text-xl font-semibold text-foreground">{$_('settings.appearance')}</h3>
				</div>
				<p class="text-muted-foreground mb-4">
					{$_('settings.themeToggle')}
				</p>
				<div class="space-y-3">
					<label class="flex items-center space-x-3">
						<input type="radio" name="theme" value="light" class="text-primary" />
						<span class="text-foreground">{$_('theme.lightMode')}</span>
					</label>
					<label class="flex items-center space-x-3">
						<input type="radio" name="theme" value="dark" class="text-primary" />
						<span class="text-foreground">{$_('theme.darkMode')}</span>
					</label>
					<label class="flex items-center space-x-3">
						<input type="radio" name="theme" value="system" class="text-primary" />
						<span class="text-foreground">{$_('theme.systemDefault')}</span>
					</label>
				</div>
			</div>

			<!-- Language Settings -->
			<div class="bg-card border border-border rounded-lg p-6">
				<div class="flex items-center space-x-3 mb-4">
					<Globe class="w-6 h-6 text-primary" />
					<h3 class="text-xl font-semibold text-foreground">{$_('settings.language')}</h3>
				</div>
				<p class="text-muted-foreground mb-4">
					{$_('settings.selectLanguage')}
				</p>
				<div class="flex justify-start">
					<LanguageSelector />
				</div>
			</div>

			<!-- Notifications -->
			<div class="bg-card border border-border rounded-lg p-6">
				<div class="flex items-center space-x-3 mb-4">
					<Bell class="w-6 h-6 text-primary" />
					<h3 class="text-xl font-semibold text-foreground">{$_('settings.notifications')}</h3>
				</div>
				<p class="text-muted-foreground mb-4">
					{$_('settings.notificationSettings')}
				</p>
				<div class="space-y-3">
					<label class="flex items-center justify-between">
						<span class="text-foreground">{$_('notifications.email')}</span>
						<input type="checkbox" class="text-primary" checked />
					</label>
					<label class="flex items-center justify-between">
						<span class="text-foreground">{$_('notifications.push')}</span>
						<input type="checkbox" class="text-primary" />
					</label>
					<label class="flex items-center justify-between">
						<span class="text-foreground">{$_('notifications.sms')}</span>
						<input type="checkbox" class="text-primary" />
					</label>
				</div>
			</div>

			<!-- Privacy -->
			<div class="bg-card border border-border rounded-lg p-6">
				<div class="flex items-center space-x-3 mb-4">
					<Shield class="w-6 h-6 text-primary" />
					<h3 class="text-xl font-semibold text-foreground">{$_('settings.privacy')}</h3>
				</div>
				<p class="text-muted-foreground mb-4">
					{$_('settings.privacySettings')}
				</p>
				<div class="space-y-3">
					<label class="flex items-center justify-between">
						<span class="text-foreground">{$_('privacy.profileVisibility')}</span>
						<input type="checkbox" class="text-primary" checked />
					</label>
					<label class="flex items-center justify-between">
						<span class="text-foreground">{$_('privacy.dataCollection')}</span>
						<input type="checkbox" class="text-primary" />
					</label>
					<label class="flex items-center justify-between">
						<span class="text-foreground">{$_('privacy.analytics')}</span>
						<input type="checkbox" class="text-primary" checked />
					</label>
				</div>
			</div>

			<!-- Language & Region -->
			<div class="bg-card border border-border rounded-lg p-6">
				<div class="flex items-center space-x-3 mb-4">
					<Globe class="w-6 h-6 text-primary" />
					<h3 class="text-xl font-semibold text-foreground">Language & Region</h3>
				</div>
				<p class="text-muted-foreground mb-4">
					Set your language and regional preferences.
				</p>
				<div class="space-y-3">
					<div>
						<label class="block text-foreground mb-1">Language</label>
						<select class="w-full p-2 border border-border rounded bg-background text-foreground">
							<option>English</option>
							<option>Spanish</option>
							<option>French</option>
							<option>German</option>
						</select>
					</div>
					<div>
						<label class="block text-foreground mb-1">Region</label>
						<select class="w-full p-2 border border-border rounded bg-background text-foreground">
							<option>United States</option>
							<option>Canada</option>
							<option>United Kingdom</option>
							<option>Australia</option>
						</select>
					</div>
				</div>
			</div>
		</div>

		<!-- Save Button -->
		<div class="flex justify-center mt-8">
			<Button size="lg" class="px-8">
				{$_('settings.save')}
			</Button>
		</div>
	</section>
</div>
