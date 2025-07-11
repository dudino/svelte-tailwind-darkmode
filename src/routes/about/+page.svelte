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
</div>

			<h2 class="text-2xl font-semibold mb-4 text-foreground">Technology</h2>
			<p class="text-muted-foreground mb-6">
				This application is built using cutting-edge web technologies including SvelteKit for the 
				framework, TailwindCSS for styling, and shadcn/ui for beautiful components. The mobile-first 
				approach ensures optimal performance on all devices.
			</p>

			<h2 class="text-2xl font-semibold mb-4 text-foreground">Features</h2>
			<ul class="text-muted-foreground space-y-2">
				<li>• Responsive mobile navigation</li>
				<li>• Dark pink theme with light/dark mode toggle</li>
				<li>• Modern component library</li>
				<li>• Accessible design patterns</li>
				<li>• Fast performance and loading times</li>
			</ul>
		</div>
	</section>
</div>
