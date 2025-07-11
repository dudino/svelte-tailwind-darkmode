<script lang="ts">
	import MasseuseAnalytics from '$lib/components/masseuse/MasseuseAnalytics.svelte';
</script>

<svelte:head>
	<title>Analytics & Performance - Masseuse Portal</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Performance</h1>
			<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
				Track your performance metrics, earnings, and business insights
			</p>
		</div>
	</div>
	
	<!-- Analytics Component -->
	<MasseuseAnalytics />
</div>
