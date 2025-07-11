<script>
	import { _ } from 'svelte-i18n';
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<svelte:head>
	<title>{$_('nav.home')} - {$_('common.darkPink')}</title>
</svelte:head>

<div class="space-y-8">
	<!-- Hero Section -->
	<section class="text-center py-12">
		<h1 class="text-4xl md:text-6xl font-bold text-foreground mb-4">
			{$_('home.title', { values: { theme: $_('common.darkPink') } })}
		</h1>
		<p class="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
			{$_('home.subtitle')}
		</p>
		<div class="flex gap-4 justify-center flex-wrap">
			<Button size="lg" class="bg-primary hover:bg-primary/90 text-primary-foreground">
				{$_('home.getStarted')}
			</Button>
			<Button variant="outline" size="lg">
				{$_('home.learnMore')}
			</Button>
		</div>
	</section>

	<!-- Features Section -->
	<section class="grid md:grid-cols-3 gap-6">
		<div class="p-6 bg-card border border-border rounded-lg">
			<h3 class="text-xl font-semibold mb-3 text-foreground">{$_('home.features.mobileFirst.title')}</h3>
			<p class="text-muted-foreground">
				{$_('home.features.mobileFirst.description')}
			</p>
		</div>
		
		<div class="p-6 bg-card border border-border rounded-lg">
			<h3 class="text-xl font-semibold mb-3 text-foreground">{$_('home.features.darkPinkTheme.title')}</h3>
			<p class="text-muted-foreground">
				{$_('home.features.darkPinkTheme.description')}
			</p>
		</div>
		
		<div class="p-6 bg-card border border-border rounded-lg">
			<h3 class="text-xl font-semibold mb-3 text-foreground">{$_('home.features.modernStack.title')}</h3>
			<p class="text-muted-foreground">
				{$_('home.features.modernStack.description')}
			</p>
		</div>
	</section>

	<!-- Technology Stack -->
	<section class="py-8">
		<h2 class="text-3xl font-bold text-center mb-8 text-foreground">{$_('home.builtWith')}</h2>
		<div class="flex gap-7 items-center justify-center flex-wrap">
			<div class="dark:border-border border rounded-xl overflow-hidden p-4 bg-card">
				<img
					src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUcVEcrchgondgnYPoUm2TSOdcfqwLUdl3Qg&s"
					alt="shadcn"
					class="w-12 md:w-20"
				/>
			</div>
			<p class="text-3xl text-primary">+</p>

			<div class="p-4 bg-card border rounded-xl">
				<img
					src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/svelte/svelte-original.svg"
					alt="svelte"
					class="w-12 md:w-20"
				/>
			</div>
			<p class="text-3xl text-primary">+</p>

			<div class="p-4 bg-card border rounded-xl">
				<img
					src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg"
					alt="tailwind"
					class="w-12 md:w-20"
				/>
			</div>
		</div>
	</section>
</div>
