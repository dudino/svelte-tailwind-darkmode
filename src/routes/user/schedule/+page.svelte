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
	import { currentUser, getPocketBaseClient } from '$lib/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { Calendar, Plus, Clock, MapPin, AlertCircle, CheckCircle, XCircle, User, Grid3X3 } from 'lucide-svelte';
	import AddScheduleModal from '$lib/components/user/AddScheduleModal.svelte';
	import ScheduleDetailsModal from '$lib/components/user/ScheduleDetailsModal.svelte';
	import { toast } from 'svelte-sonner';

	// Local state
	let showAddModal = false;
	let viewMode: 'calendar' | 'grid' = 'calendar'; // 'calendar' or 'grid'
	let selectedSchedule: any = null;
	let showScheduleDetails = false;
	
	// Format time for display
	function formatTime(timeStr: string | null | undefined): string {
		if (!timeStr) return '';
		return timeStr;
	}

	// Handle optimistic update when schedule is created
	async function handleScheduleCreated(newSchedule: any) {
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

	// Handle schedule click for details/edit
	function handleScheduleClick(schedule: any) {
		selectedSchedule = schedule;
		showScheduleDetails = true;
	}

	// Group schedules by location and room for grid view with weekly calendar
	function getSchedulesByLocationAndRoom(): Record<string, any> {
		const grouped: Record<string, any> = {};
		
		$locations.forEach(location => {
			grouped[location.id] = {
				location,
				rooms: {} as Record<string, any>
			};
			
			// Get rooms for this location
			const locationRooms = $rooms.filter(room => room.location_id === location.id);
			locationRooms.forEach(room => {
				grouped[location.id].rooms[room.id] = {
					room,
					weeklySchedule: {} as Record<string, any[]>
				};
				
				// Initialize each day of the week using schedulesByDate (same as calendar view)
				$weekDays.forEach(day => {
					const dayStr = day.toISOString().split('T')[0];
					const daySchedules = $schedulesByDate.get(dayStr) || [];
					
					// Filter schedules for this specific room
					const roomSchedules = daySchedules.filter(schedule => schedule.room_id === room.id);
					grouped[location.id].rooms[room.id].weeklySchedule[dayStr] = roomSchedules;
				});
			});
		});

		return grouped;
	}

	// Handle schedule creation through store
	async function handleCreateSchedule(scheduleData: any) {
		try {
			const newSchedule = await createSchedule(scheduleData);
			
			// Add optimistically first
			await handleScheduleCreated(newSchedule);
			
			// Then refresh with expanded data
			await refreshSchedulesWithExpanded(newSchedule.id);
			
			return newSchedule;
		} catch (error) {
			console.error('Error creating schedule:', error);
			throw error;
		}
	}

	// Handle schedule update
	async function handleScheduleUpdate(updatedSchedule: any) {
		try {
			const pb = getPocketBaseClient();
			if (!pb) throw new Error('PocketBase not initialized');

			await pb.collection('schedules').update(updatedSchedule.id, {
				notes: updatedSchedule.notes
			});

			// Update the schedule in the store
			schedules.update(current => {
				const index = current.findIndex(s => s.id === updatedSchedule.id);
				if (index !== -1) {
					current[index] = { ...current[index], ...updatedSchedule };
					return [...current];
				}
				return current;
			});
		} catch (error) {
			console.error('Error updating schedule:', error);
			throw error;
		}
	}

	// Handle schedule delete
	async function handleScheduleDelete(scheduleId: string) {
		try {
			const pb = getPocketBaseClient();
			if (!pb) throw new Error('PocketBase not initialized');

			await pb.collection('schedules').delete(scheduleId);

			// Remove from store
			schedules.update(current => current.filter(s => s.id !== scheduleId));
		} catch (error) {
			console.error('Error deleting schedule:', error);
			throw error;
		}
	}

	// Close schedule details modal
	function closeScheduleDetails() {
		selectedSchedule = null;
		showScheduleDetails = false;
	}

	onMount(async () => {
		await initializeUserSchedule();
	});
</script>

<div class="space-y-6">
	<!-- Schedule Header with View Toggle -->
	<Card class="p-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold flex items-center gap-2">
					<Calendar class="h-5 w-5" />
					My Schedule
				</h2>
				<p class="text-sm text-muted-foreground mt-1">
					Manage your weekly schedule across all locations and rooms
				</p>
			</div>
			<div class="flex items-center gap-2">
				<Button 
					variant={viewMode === 'calendar' ? 'default' : 'outline'} 
					size="sm"
					on:click={() => viewMode = 'calendar'}
				>
					<Calendar class="h-4 w-4 mr-2" />
					Calendar
				</Button>
				<Button 
					variant={viewMode === 'grid' ? 'default' : 'outline'} 
					size="sm"
					on:click={() => viewMode = 'grid'}
				>
					<Grid3X3 class="h-4 w-4 mr-2" />
					Grid
				</Button>
				<Button on:click={() => showAddModal = true} disabled={$scheduleRefreshing}>
					<Plus class="h-4 w-4 mr-2" />
					{$scheduleRefreshing ? 'Refreshing...' : 'Add Schedule'}
				</Button>
			</div>
		</div>
	</Card>

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

		<!-- Content Based on View Mode -->
		{#if viewMode === 'calendar'}
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
						
						{#if daySchedules.length === 0}
							<div class="text-center py-8 text-muted-foreground">
								<Calendar class="h-8 w-8 mx-auto mb-2 opacity-50" />
								<p class="text-sm">No schedule</p>
							</div>
						{:else}
							<div class="space-y-2">
								{#each daySchedules as schedule}
									{@const status = getScheduleStatus(schedule)}
									<button 
										class="w-full p-3 rounded-lg border-l-4 {status.color} hover:bg-accent/50 transition-colors text-left"
										on:click={() => handleScheduleClick(schedule)}
									>
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
													
													{#if schedule.expand?.confirmed_by?.name}
														<div class="flex items-center gap-1 text-xs text-muted-foreground">
															<User class="h-3 w-3" />
															<span class="truncate">
																{schedule.expand.confirmed_by.name}
															</span>
														</div>
													{/if}
												</div>
											</div>
										</div>
									</button>
								{/each}
							</div>
						{/if}
					</Card>
				{/each}
			</div>
		{:else if viewMode === 'grid'}
			<!-- Grid View by Location and Room with Weekly Calendar -->
			<div class="space-y-6">
				{#each Object.entries(getSchedulesByLocationAndRoom()) as [locationId, locationData] (locationId)}
					<Card class="p-6">
						<h2 class="text-xl font-bold mb-4 flex items-center gap-2">
							<MapPin class="h-5 w-5" />
							{locationData.location.name}
						</h2>
						
						<div class="space-y-6">
							{#each Object.entries(locationData.rooms) as [roomId, roomData] (roomId)}
								{@const roomInfo = roomData as any}
								<Card class="p-4 border-2">
									<h3 class="font-semibold mb-4 text-center text-lg">
										{roomInfo.room.name}
									</h3>
									
									<!-- Weekly Calendar Grid -->
									<div class="grid grid-cols-7 gap-2">
										<!-- Day Headers -->
										{#each $weekDays as day (day.toISOString())}
											<div class="text-center p-2 bg-muted/50 rounded-md">
												<div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
													{day.toLocaleDateString('en-US', { weekday: 'short' })}
												</div>
												<div class="text-sm font-bold mt-1">
													{day.getDate()}
												</div>
											</div>
										{/each}
										
										<!-- Schedule Cells -->
										{#each $weekDays as day (day.toISOString())}
											{@const dayStr = day.toISOString().split('T')[0]}
											{@const daySchedules = roomInfo.weeklySchedule[dayStr] || []}
											<div class="min-h-[120px] p-2 border rounded-md bg-background">
												{#if daySchedules.length === 0}
													<div class="text-xs text-muted-foreground text-center py-4">
														No schedules
													</div>
												{:else}
													<div class="space-y-1">
														{#each daySchedules as schedule (schedule.id)}
															{@const status = getScheduleStatus(schedule)}
															<button 
																class="w-full p-1 rounded text-xs border-l-2 {status.color} hover:bg-accent/50 transition-colors text-left"
																on:click={() => handleScheduleClick(schedule)}
															>
																<div class="space-y-0.5">
																	<div class="flex items-center gap-1">
																		<svelte:component this={status.status === 'Cancelled' ? XCircle : status.status === 'Confirmed' ? CheckCircle : AlertCircle} class="h-2 w-2" />
																		<span class="font-medium text-xs">{status.status}</span>
																	</div>
																	
																	<div class="flex items-center gap-1 text-xs">
																		<Clock class="h-2 w-2" />
																		<span>{formatTime(schedule.start_time)}</span>
																	</div>
																	
																	{#if schedule.expand?.confirmed_by?.name}
																		<div class="flex items-center gap-1 text-xs text-muted-foreground">
																			<User class="h-2 w-2" />
																			<span class="truncate text-xs">{schedule.expand.confirmed_by.name}</span>
																		</div>
																	{/if}
																</div>
															</button>
														{/each}
													</div>
												{/if}
											</div>
										{/each}
									</div>
								</Card>
							{/each}
						</div>
					</Card>
				{/each}
			</div>
		{/if}

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
		onCancel={() => showAddModal = false}
	/>
{/if}

<!-- Schedule Details Modal -->
{#if showScheduleDetails && selectedSchedule}
	<ScheduleDetailsModal
		schedule={selectedSchedule}
		on:update={({ detail }) => handleScheduleUpdate(detail)}
		on:delete={({ detail }) => handleScheduleDelete(detail.id)}
		on:close={closeScheduleDetails}
	/>
{/if}
