<script>
	import { _ } from 'svelte-i18n';
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<svelte:head>
	<title>{$_('nav.home')} - {$_('common.darkPink')}</title>
</svelte:head>

<div class="space-y-12 relative">
	<!-- Hero Section with enhanced styling -->
	<section class="text-center py-16 relative">
		<div class="absolute inset-0 -z-10 overflow-hidden">
			<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
		</div>
		<h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
			<span class="gradient-text">
				{$_('home.title', { values: { theme: $_('common.darkPink') } })}
			</span>
		</h1>
		<p class="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
			{$_('home.subtitle')}
		</p>
		<div class="flex gap-6 justify-center flex-wrap">
			<Button size="lg" class="glass-button px-8 py-4 text-lg font-semibold">
				{$_('home.getStarted')}
			</Button>
			<Button variant="outline" size="lg" class="glass-button px-8 py-4 text-lg font-semibold">
				{$_('home.learnMore')}
			</Button>
		</div>
	</section>

	<!-- Features Section with enhanced cards -->
	<section class="grid md:grid-cols-3 gap-8">
		<div class="enhanced-card p-8 rounded-xl floating" style="animation-delay: 0s;">
			<div class="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center mb-6">
				<svg class="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
				</svg>
			</div>
			<h3 class="text-2xl font-bold mb-4 text-foreground">{$_('home.features.mobileFirst.title')}</h3>
			<p class="text-muted-foreground leading-relaxed">
				{$_('home.features.mobileFirst.description')}
			</p>
		</div>
		
		<div class="enhanced-card p-8 rounded-xl floating" style="animation-delay: 0.2s;">
			<div class="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center mb-6">
				<svg class="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
				</svg>
			</div>
			<h3 class="text-2xl font-bold mb-4 text-foreground">{$_('home.features.darkPinkTheme.title')}</h3>
			<p class="text-muted-foreground leading-relaxed">
				{$_('home.features.darkPinkTheme.description')}
			</p>
		</div>
		
		<div class="enhanced-card p-8 rounded-xl floating" style="animation-delay: 0.4s;">
			<div class="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center mb-6">
				<svg class="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
				</svg>
			</div>
			<h3 class="text-2xl font-bold mb-4 text-foreground">{$_('home.features.modernStack.title')}</h3>
			<p class="text-muted-foreground leading-relaxed">
				{$_('home.features.modernStack.description')}
			</p>
		</div>
	</section>

	<!-- Technology Stack with enhanced styling -->
	<section class="py-16 relative">
		<div class="absolute inset-0 -z-10 overflow-hidden">
			<div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
		</div>
		<h2 class="text-4xl md:text-5xl font-bold text-center mb-12">
			<span class="gradient-text">{$_('home.builtWith')}</span>
		</h2>
		<div class="flex gap-8 items-center justify-center flex-wrap">
			<div class="enhanced-card overflow-hidden p-6 bg-card/80 border rounded-2xl floating" style="animation-delay: 0s;">
				<img
					src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUcVEcrchgondgnYPoUm2TSOdcfqwLUdl3Qg&s"
					alt="shadcn"
					class="w-16 md:w-24 mx-auto"
				/>
			</div>
			<div class="text-4xl font-bold gradient-text">+</div>

			<div class="enhanced-card p-6 bg-card/80 border rounded-2xl floating" style="animation-delay: 0.2s;">
				<img
					src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/svelte/svelte-original.svg"
					alt="svelte"
					class="w-16 md:w-24 mx-auto"
				/>
			</div>
			<div class="text-4xl font-bold gradient-text">+</div>

			<div class="enhanced-card p-6 bg-card/80 border rounded-2xl floating" style="animation-delay: 0.4s;">
				<img
					src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg"
					alt="tailwind"
					class="w-16 md:w-24 mx-auto"
				/>
			</div>
		</div>
	</section>
</div>
