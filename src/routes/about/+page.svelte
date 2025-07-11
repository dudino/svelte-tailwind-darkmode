<script>
	import { _ } from 'svelte-i18n';
</script>

<svelte:head>
	<title>{$_('nav.about')} - {$_('common.darkPink')}</title>
</svelte:head>

<div class="space-y-12">
	<section class="text-center py-16 relative">
		<div class="absolute inset-0 -z-10 overflow-hidden">
			<div class="absolute top-1/2 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
		</div>
		<h1 class="text-5xl md:text-6xl font-bold mb-6">
			<span class="gradient-text">{$_('about.title')}</span>
		</h1>
		<p class="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
			{$_('about.description')}
		</p>
	</section>

	<section class="max-w-4xl mx-auto">
		<div class="enhanced-card p-10 rounded-2xl">
			<h2 class="text-3xl font-bold mb-6 gradient-text">{$_('about.mission')}</h2>
			<p class="text-lg text-muted-foreground leading-relaxed">
				{$_('about.missionText')}
			</p>
		</div>
	</section>

	<section class="max-w-4xl mx-auto">
		<div class="enhanced-card p-10 rounded-2xl">
			<h2 class="text-2xl font-semibold mb-4 text-foreground">{$_('about.technology')}</h2>
			<p class="text-muted-foreground mb-6">
				{$_('about.technologyText')}
			</p>

			<h2 class="text-2xl font-semibold mb-4 text-foreground">{$_('home.featuresTitle')}</h2>
			<ul class="text-muted-foreground space-y-2">
				<li>• {$_('home.features.mobileFirst.description')}</li>
				<li>• {$_('home.features.darkPinkTheme.description')}</li>
				<li>• {$_('about.modernComponents')}</li>
				<li>• {$_('about.accessibleDesign')}</li>
				<li>• {$_('about.fastPerformance')}</li>
			</ul>
		</div>
	</section>
</div>
