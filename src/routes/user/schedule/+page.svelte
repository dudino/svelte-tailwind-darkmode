<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		schedules, 
		locations, 
		rooms, 
		selectedWeek, 
		scheduleLoading, 
		scheduleRefreshing,
		weekStart,
		weekEnd,
		weekDays,
		schedulesByDate,
		loadSchedules,
		createSchedule,
		addScheduleOptimistically,
		refreshSchedulesWithExpanded,
		navigateWeek,
		goToCurrentWeek,
		getSchedulesForDate,
		getLocationName,
		getRoomName,
		getScheduleStatus,
		initializeUserSchedule
	} from '$lib/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { Calendar, Plus, Clock, MapPin, AlertCircle, CheckCircle, XCircle } from 'lucide-svelte';
	import AddScheduleModal from '$lib/components/user/AddScheduleModal.svelte';
	import { toast } from 'svelte-sonner';

	// Local state
	let showAddModal = false;
	
	// Format time for display
	function formatTime(timeStr) {
		if (!timeStr) return '';
		return timeStr;
	}

	// Handle optimistic update when schedule is created
	async function handleScheduleCreated(newSchedule) {
		try {
			// Use the store's optimistic update function
			await addScheduleOptimistically(newSchedule);
		} catch (error) {
			console.error('Error in handleScheduleCreated:', error);
		}
	}

	// Handle add schedule success
	async function handleAddSuccess() {
		showAddModal = false;
	}

	// Handle schedule creation through store
	async function handleCreateSchedule(scheduleData) {
		try {
			const newSchedule = await createSchedule(scheduleData);
			
			// Add optimistically first
			await handleScheduleCreated(newSchedule);
			
			// Then refresh with expanded data
			await refreshSchedulesWithExpanded(newSchedule.id);
			
			return newSchedule;
		} catch (error) {
			console.error('❌ Error creating schedule:', error);
			throw error;
		}
	}

	onMount(async () => {
		await initializeUserSchedule();
	});
</script>

<div class="max-w-7xl mx-auto space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold gradient-text">My Schedule</h1>
			<p class="text-muted-foreground mt-1">
				Manage your weekly schedule across all locations and rooms
			</p>
		</div>
		
		<Button on:click={() => showAddModal = true} class="w-full sm:w-auto" disabled={$scheduleRefreshing}>
			<Plus class="h-4 w-4 mr-2" />
			{$scheduleRefreshing ? 'Refreshing...' : 'Add Schedule'}
		</Button>
	</div>

	<!-- Week Navigation -->
	<Card class="p-4">
		<div class="flex items-center justify-between">
			<Button variant="outline" on:click={() => navigateWeek(-1)}>
				← Previous Week
			</Button>
			
			<div class="text-center flex items-center gap-2">
				<div>
					<h2 class="text-lg font-semibold">
						{$weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 
						{$weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
					</h2>
				</div>
				<Button variant="ghost" size="sm" on:click={goToCurrentWeek}>
					Today
				</Button>
			</div>
			
			<Button variant="outline" on:click={() => navigateWeek(1)}>
				Next Week →
			</Button>
		</div>
	</Card>

	{#if $scheduleLoading}
		<div class="flex items-center justify-center py-12">
			<div class="text-center">
				<div class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
				<p class="text-muted-foreground">Loading schedules...</p>
			</div>
		</div>
	{:else}
		{#if $scheduleRefreshing}
			<div class="flex items-center justify-center py-4">
				<div class="text-center">
					<div class="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
					<p class="text-sm text-muted-foreground">Refreshing schedules...</p>
				</div>
			</div>
		{/if}

		<!-- Weekly Schedule Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
			{#each $weekDays as day}
				{@const dayStr = day.toISOString().split('T')[0]}
				{@const daySchedules = $schedulesByDate.get(dayStr) || []}
				<Card class="p-4 min-h-[200px]">
					<div class="text-center mb-4">
						<h3 class="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
							{day.toLocaleDateString('en-US', { weekday: 'short' })}
						</h3>
						<p class="text-2xl font-bold mt-1">
							{day.getDate()}
						</p>
					</div>
					
					<!-- Debug info -->
					{#if daySchedules.length === 0}
						<div class="text-xs text-muted-foreground mb-2">
							No schedules
						</div>
					{/if}
					
					<div class="space-y-2">
						{#each daySchedules as schedule}
							{@const status = getScheduleStatus(schedule)}
							<div class="p-3 rounded-lg border-l-4 {status.color}">
								<div class="flex items-start justify-between">
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-1 mb-1">
											<svelte:component this={status.status === 'Cancelled' ? XCircle : status.status === 'Confirmed' ? CheckCircle : AlertCircle} class="h-3 w-3" />
											<span class="text-xs font-medium">{status.status}</span>
										</div>
										
										<div class="space-y-1">
											<div class="flex items-center gap-1 text-xs">
												<Clock class="h-3 w-3" />
												<span>
													{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
												</span>
											</div>
											
											<div class="flex items-center gap-1 text-xs">
												<MapPin class="h-3 w-3" />
												<span class="truncate">
													{getLocationName(schedule)}
												</span>
											</div>
											
											<div class="text-xs font-medium truncate">
												{getRoomName(schedule)}
											</div>
											
											{#if schedule.timeslot !== 'custom'}
												<div class="text-xs text-muted-foreground capitalize">
													{schedule.timeslot.replace('_', ' ')}
												</div>
											{/if}
										</div>
									</div>
								</div>
								
								{#if schedule.notes}
									<div class="mt-2 text-xs text-muted-foreground border-t border-current/20 pt-2">
										{schedule.notes}
									</div>
								{/if}
							</div>
						{:else}
							<div class="text-center py-8 text-muted-foreground">
								<Calendar class="h-8 w-8 mx-auto mb-2 opacity-50" />
								<p class="text-sm">No schedule</p>
							</div>
						{/each}
					</div>
				</Card>
			{/each}
		</div>

		<!-- Legend -->
		<Card class="p-4">
			<h3 class="font-semibold mb-3">Schedule Status Legend</h3>
			<div class="flex flex-wrap gap-4">
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 bg-orange-500 rounded-full"></div>
					<span class="text-sm">Pending Confirmation</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 bg-green-500 rounded-full"></div>
					<span class="text-sm">Confirmed</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 bg-red-500 rounded-full"></div>
					<span class="text-sm">Cancelled</span>
				</div>
			</div>
		</Card>
	{/if}
</div>

<!-- Add Schedule Modal -->
{#if showAddModal && !$scheduleRefreshing}
	<AddScheduleModal 
		locations={$locations}
		rooms={$rooms}
		selectedDate={$selectedWeek}
		onSuccess={handleAddSuccess}
		onScheduleCreated={handleScheduleCreated}
		onCancel={() => showAddModal = false}
	/>
{/if}
