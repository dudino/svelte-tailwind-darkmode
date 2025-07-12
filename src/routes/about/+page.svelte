<script>
	// No imports needed for Wuchale - plain text will be extracted
</script>

<svelte:head>
	<title>About - Affinity</title>
</svelte:head>

<div class="space-y-12">
	<section class="text-center py-16 relative">
		<div class="absolute inset-0 -z-10 overflow-hidden">
			<div class="absolute top-1/2 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
		</div>
		<h1 class="text-5xl md:text-6xl font-bold mb-6">
			<span class="gradient-text">About Us</span>
		</h1>
		<p class="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
			Learn more about our massage parlor management platform
		</p>
	</section>

	<section class="max-w-4xl mx-auto">
		<div class="enhanced-card p-10 rounded-2xl">
			<h2 class="text-3xl font-bold mb-6 gradient-text">Our Mission</h2>
			<p class="text-lg text-muted-foreground leading-relaxed">
				We provide a comprehensive management solution for massage parlors, combining modern technology with intuitive design to streamline operations and enhance the customer experience.
			</p>
		</div>
	</section>

	<section class="max-w-4xl mx-auto">
		<div class="enhanced-card p-10 rounded-2xl">
			<h2 class="text-2xl font-semibold mb-4 text-foreground">Technology</h2>
			<p class="text-muted-foreground mb-6">
				Built with SvelteKit, TypeScript, and TailwindCSS for a modern, fast, and responsive experience.
			</p>

			<h2 class="text-2xl font-semibold mb-4 text-foreground">Key Features</h2>
			<ul class="text-muted-foreground space-y-2">
				<li>• Mobile-first responsive design</li>
				<li>• Dark and light theme support</li>
				<li>• Modern component architecture</li>
				<li>• Accessible and user-friendly interface</li>
				<li>• Fast performance and smooth animations</li>
			</ul>
		</div>
	</section>
</div>
