<script lang="ts">
	import MasseuseScheduleManager from '$lib/components/masseuse/MasseuseScheduleManager.svelte';
	import { _ } from 'svelte-i18n';
</script>

<svelte:head>
	<title>{$_('pageTitles.scheduleManagementPortal')}</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{$_('pageHeaders.scheduleManagement')}</h1>
			<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
				{$_('pageHeaders.scheduleManagementDescription')}
			</p>
		</div>
	</div>
	
	<!-- Schedule Manager Component -->
	<MasseuseScheduleManager />
</div>
