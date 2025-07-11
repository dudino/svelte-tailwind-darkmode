<script lang="ts">
	import MasseuseProfile from '$lib/components/masseuse/MasseuseProfile.svelte';
</script>

<svelte:head>
	<title>Professional Profile - Masseuse Portal</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Professional Profile</h1>
			<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
				Manage your professional information, specializations, and public profile
			</p>
		</div>
	</div>
	
	<!-- Profile Component -->
	<MasseuseProfile />
</div>
