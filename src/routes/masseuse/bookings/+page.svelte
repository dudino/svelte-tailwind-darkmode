<script lang="ts">
	import MasseuseBookings from '$lib/components/masseuse/MasseuseBookings.svelte';
</script>

<svelte:head>
	<title>Booking Management - Affinity</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Booking Management</h1>
			<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
				View and manage your appointments
			</p>
		</div>
	</div>
	
	<!-- Bookings Manager Component -->
	<MasseuseBookings />
</div>
