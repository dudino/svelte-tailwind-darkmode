<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import { setMode } from 'mode-watcher';
	import Button from '$lib/components/ui/button/button.svelte';
	import { onMount } from 'svelte';

	let isDark = false;

	onMount(() => {
		// Check if dark mode is currently active
		isDark = document.documentElement.classList.contains('dark');
		
		// Listen for changes to the dark class
		const observer = new MutationObserver(() => {
			isDark = document.documentElement.classList.contains('dark');
		});
		
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});
		
		return () => observer.disconnect();
	});

	function toggleTheme() {
		if (isDark) {
			setMode('light');
		} else {
			setMode('dark');
		}
	}
</script>

<Button on:click={toggleTheme} variant="outline" size="icon">
	<Sun
		class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
	/>
	<Moon
		class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
	/>
	<span class="sr-only">{$_('theme.toggle')}</span>
</Button>
