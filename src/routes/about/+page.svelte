<script>
	import { _ } from 'svelte-i18n';
</script>

<svelte:head>
	<title>{$_('nav.about')} - {$_('common.darkPink')}</title>
</svelte:head>

<div class="space-y-8">
	<section class="text-center py-12">
		<h1 class="text-4xl md:text-6xl font-bold text-foreground mb-4">
			{$_('about.title')}
		</h1>
		<p class="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
			{$_('about.description')}
		</p>
	</section>

	<section class="prose prose-lg max-w-none dark:prose-invert">
		<div class="bg-card border border-border rounded-lg p-8">
			<h2 class="text-2xl font-semibold mb-4 text-foreground">{$_('about.mission')}</h2>
			<p class="text-muted-foreground mb-6">
				{$_('about.missionText')}
			</p>

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
