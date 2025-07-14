<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { createSchedule, getPocketBaseClient, currentUser } from '$lib/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { X, Calendar, Clock, MapPin, AlertTriangle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// Props
	export let locations = [];
	export let rooms = [];
	export let selectedDate = new Date(); // Remove const to make it reactive
	export let onSuccess = () => {};
	export let onCancel = () => {};
	export let onScheduleCreated = undefined; // Optional callback to pass the created schedule data

	// Handle escape key
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			onCancel();
		}
	}

	// Form state
	let formData = {
		date: '',
		location_id: '',
		room_id: '',
		timeslot: 'morning',
		start_time: '',
		end_time: '',
		notes: ''
	};

	let loading = false;
	let conflictWarning = '';
	let filteredRooms = [];
	let selectedRoom = null;
	let availableTimeslots = [];
	let conflictCheckTimeout: number;

	// Initialize form with selected date or current date  
	function initializeForm() {
		// Use selectedDate if provided, otherwise default to today
		const dateToUse = selectedDate || new Date();
		const dateString = dateToUse.toISOString().split('T')[0];
		formData.date = dateString;
		
		// Initialize filtered rooms if location is already set
		if (formData.location_id) {
			updateFilteredRooms();
		}
	}

	// Filter rooms based on selected location
	function updateFilteredRooms() {
		if (formData.location_id) {
			filteredRooms = rooms.filter(room => room.location_id === formData.location_id);
			// Reset room selection if current room is not in filtered list
			if (formData.room_id && !filteredRooms.find(r => r.id === formData.room_id)) {
				formData.room_id = '';
				selectedRoom = null;
				availableTimeslots = [];
			}
		} else {
			filteredRooms = [];
			formData.room_id = '';
			selectedRoom = null;
			availableTimeslots = [];
		}
	}

	// Update selected room and available timeslots when room changes
	function updateSelectedRoom() {
		if (formData.room_id && filteredRooms.length > 0) {
			selectedRoom = filteredRooms.find(room => room.id === formData.room_id);
			updateAvailableTimeslots();
		} else {
			selectedRoom = null;
			availableTimeslots = [];
		}
	}

	// Function to update available timeslots based on room type
	function updateAvailableTimeslots() {
		if (!selectedRoom) {
			availableTimeslots = [];
			return;
		}

		if (selectedRoom.type === 'dynamic') {
			// Dynamic rooms allow all timeslots including custom
			availableTimeslots = [
				{ value: 'morning', label: 'Morning (09:00 - 16:00)', start: '09:00', end: '16:00' },
				{ value: 'evening', label: 'Evening (16:00 - 23:00)', start: '16:00', end: '23:00' },
				{ value: 'full_day', label: 'Full Day (09:00 - 23:00)', start: '09:00', end: '23:00' },
				{ value: 'custom', label: 'Custom Times', start: '', end: '' }
			];
		} else {
			// Regular rooms only allow preset timeslots
			availableTimeslots = [
				{ value: 'morning', label: 'Morning (09:00 - 16:00)', start: '09:00', end: '16:00' },
				{ value: 'evening', label: 'Evening (16:00 - 23:00)', start: '16:00', end: '23:00' },
				{ value: 'full_day', label: 'Full Day (09:00 - 23:00)', start: '09:00', end: '23:00' }
			];
		}

		// Reset timeslot if current selection is not available
		const currentTimeslot = availableTimeslots.find(t => t.value === formData.timeslot);
		if (!currentTimeslot) {
			formData.timeslot = availableTimeslots[0]?.value || 'morning';
		}
		
		// Update times based on current timeslot
		updateTimesForTimeslot();
	}

	// Function to update times when timeslot changes
	function updateTimesForTimeslot() {
		if (formData.timeslot === 'custom') {
			// Don't override custom times
			return;
		}

		const timeslot = availableTimeslots.find(t => t.value === formData.timeslot);
		if (timeslot) {
			formData.start_time = timeslot.start;
			formData.end_time = timeslot.end;
			
			// Trigger conflict check after a brief delay to avoid infinite loops
			setTimeout(() => {
				if (formData.date && formData.room_id && formData.start_time && formData.end_time) {
					checkConflicts();
				}
			}, 100);
		}
	}

	// Handle timeslot change
	function handleTimeslotChange() {
		updateTimesForTimeslot();
	}

	// Check for schedule conflicts
	async function checkConflicts() {
		if (!formData.date || !formData.room_id || !formData.start_time || !formData.end_time) {
			conflictWarning = '';
			return;
		}

		try {
			const pb = getPocketBaseClient();
			if (!pb) return;

			// Check for overlapping schedules
			const result = await pb.collection('schedules').getList(1, 50, {
				filter: `room_id = "${formData.room_id}" && date = "${formData.date}"`,
				expand: 'user_id'
			});

			const conflicts = result.items.filter(schedule => {
				// Skip checking against own schedules
				if (schedule.user_id === $currentUser?.id) return false;

				const existingStart = schedule.start_time;
				const existingEnd = schedule.end_time;
				const newStart = formData.start_time;
				const newEnd = formData.end_time;

				// Check for time overlap
				return (newStart < existingEnd && newEnd > existingStart);
			});

			if (conflicts.length > 0) {
				// Check for active conflicts (is_available = true)
				const activeConflicts = conflicts.filter(c => c.is_available !== false);
				const inactiveConflicts = conflicts.filter(c => c.is_available === false);

				if (activeConflicts.length > 0) {
					const conflictUser = activeConflicts[0].expand?.user_id?.name || 'Another user';
					conflictWarning = `⚠️ Active schedule conflict with ${conflictUser} (${activeConflicts[0].start_time} - ${activeConflicts[0].end_time}). Request will be rejected.`;
				} else if (inactiveConflicts.length > 0) {
					const conflictUser = inactiveConflicts[0].expand?.user_id?.name || 'Another user';
					conflictWarning = `ℹ️ Overlaps with inactive schedule from ${conflictUser} (${inactiveConflicts[0].start_time} - ${inactiveConflicts[0].end_time}). This is allowed.`;
				}
			} else {
				conflictWarning = '';
			}
		} catch (error) {
			console.error('Error checking conflicts:', error);
			conflictWarning = '';
		}
	}

	// Handle location change
	function handleLocationChange() {
		updateFilteredRooms();
	}

	// Handle room change
	function handleRoomChange() {
		updateSelectedRoom();
		handleFieldChange();
	}
	function handleFieldChange() {
		if (formData.date && formData.room_id && formData.start_time && formData.end_time) {
			// Debounce conflict checking to avoid excessive API calls
			clearTimeout(conflictCheckTimeout);
			conflictCheckTimeout = setTimeout(() => {
				checkConflicts();
			}, 300);
		}
	}

	// Validate form
	function validateForm() {
		if (!formData.date) {
			toast.error('Please select a date');
			return false;
		}
		if (!formData.location_id) {
			toast.error('Please select a location');
			return false;
		}
		if (!formData.room_id) {
			toast.error('Please select a room');
			return false;
		}
		if (!formData.start_time || !formData.end_time) {
			toast.error('Please set start and end times');
			return false;
		}
		if (formData.start_time >= formData.end_time) {
			toast.error('End time must be after start time');
			return false;
		}

		// Check for active conflicts
		if (conflictWarning.includes('⚠️')) {
			toast.error('Cannot submit due to active schedule conflict');
			return false;
		}

		return true;
	}

	// Submit form
	async function handleSubmit() {
		if (!validateForm()) return;

		loading = true;
		try {
			const scheduleData = {
				date: formData.date,
				location_id: formData.location_id,
				room_id: formData.room_id,
				timeslot: formData.timeslot,
				start_time: formData.start_time,
				end_time: formData.end_time,
				notes: formData.notes.trim() || undefined
			};

			// Create the schedule through the store
			const result = await createSchedule(scheduleData);
			
			// Call the optimistic update callback to add to UI immediately
			if (onScheduleCreated && typeof onScheduleCreated === 'function') {
				try {
					await onScheduleCreated(result);
				} catch (error) {
					console.error('Error in onScheduleCreated callback:', error);
				}
			}
			
			// Call success callback to close modal
			onSuccess();
		} catch (error) {
			console.error('Error creating schedule:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			toast.error('Failed to create schedule: ' + errorMessage);
		} finally {
			loading = false;
		}
	}

	// Initialize form on mount
	initializeForm();

	// Reactive statement to update form date when selectedDate changes
	$: {
		if (selectedDate && formData) {
			const dateToUse = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
			const newDateString = dateToUse.toISOString().split('T')[0];
			if (formData.date !== newDateString) {
				formData.date = newDateString;
			}
		}
	}
</script>

<!-- Modal Overlay -->
<div 
	class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
	on:click|self={onCancel}
	on:keydown={handleKeydown}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
	<Card class="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-border bg-background">
		<div class="p-6">
			<!-- Header -->
			<div class="flex items-center justify-between mb-6">
				<div>
					<h2 class="text-2xl font-bold">Add Schedule</h2>
					<p class="text-muted-foreground">Create a new schedule entry</p>
				</div>
				<Button variant="ghost" size="icon" on:click={onCancel}>
					<X class="h-4 w-4" />
				</Button>
			</div>

			<!-- Form -->
			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				<!-- Date Selection -->
				<div class="space-y-2">
					<Label for="date">Date</Label>
					<div class="relative">
						<Calendar class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							id="date"
							type="date"
							bind:value={formData.date}
							on:change={handleFieldChange}
							class="pl-10"
							required
						/>
					</div>
				</div>

				<!-- Location Selection -->
				<div class="space-y-2">
					<Label for="location">Location</Label>
					<div class="relative">
						<MapPin class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<select
							id="location"
							bind:value={formData.location_id}
							on:change={handleLocationChange}
							class="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
							required
						>
							<option value="">Select a location...</option>
							{#each locations as location}
								<option value={location.id}>{location.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Room Selection -->
				<div class="space-y-2">
					<Label for="room">Room</Label>
					<select
						id="room"
						bind:value={formData.room_id}
						on:change={handleRoomChange}
						class="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
						required
						disabled={!formData.location_id}
					>
						<option value="">Select a room...</option>
						{#each filteredRooms as room}
							<option value={room.id}>
								{room.name} ({room.type === 'dynamic' ? 'Dynamic' : 'Regular'})
							</option>
						{/each}
					</select>
					{#if selectedRoom}
						<p class="text-xs text-muted-foreground">
							{selectedRoom.type === 'dynamic' 
								? 'Dynamic room - Custom time ranges available' 
								: 'Regular room - Preset time slots only'}
						</p>
					{/if}
				</div>

				<!-- Timeslot Selection -->
				<div class="space-y-2">
					<Label for="timeslot">Timeslot</Label>
					<select
						id="timeslot"
						bind:value={formData.timeslot}
						on:change={handleTimeslotChange}
						class="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
						disabled={!selectedRoom}
					>
						{#each availableTimeslots as timeslot}
							<option value={timeslot.value}>{timeslot.label}</option>
						{/each}
					</select>
				</div>
				<!-- Custom Time Selection -->
				{#if formData.timeslot === 'custom'}
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="start_time">Start Time</Label>
							<div class="relative">
								<Clock class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="start_time"
									type="time"
									bind:value={formData.start_time}
									on:change={handleFieldChange}
									class="pl-10"
									required
								/>
							</div>
						</div>
						<div class="space-y-2">
							<Label for="end_time">End Time</Label>
							<div class="relative">
								<Clock class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="end_time"
									type="time"
									bind:value={formData.end_time}
									on:change={handleFieldChange}
									class="pl-10"
									required
								/>
							</div>
						</div>
					</div>
				{:else}
					<!-- Display computed times for non-custom timeslots -->
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label>Start Time</Label>
							<div class="px-3 py-2 bg-muted rounded-md text-sm">
								{formData.start_time}
							</div>
						</div>
						<div class="space-y-2">
							<Label>End Time</Label>
							<div class="px-3 py-2 bg-muted rounded-md text-sm">
								{formData.end_time}
							</div>
						</div>
					</div>
				{/if}

				<!-- Conflict Warning -->
				{#if conflictWarning}
					<div class="p-3 rounded-md border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
						<div class="flex items-start gap-2">
							<AlertTriangle class="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
							<p class="text-sm text-orange-800 dark:text-orange-200">
								{conflictWarning}
							</p>
						</div>
					</div>
				{/if}

				<!-- Notes -->
				<div class="space-y-2">
					<Label for="notes">Notes (Optional)</Label>
					<Textarea
						id="notes"
						bind:value={formData.notes}
						placeholder="Add any additional notes or requirements..."
						rows={3}
					/>
				</div>

				<!-- Actions -->
				<div class="flex flex-col-reverse sm:flex-row gap-3 pt-4">
					<Button variant="outline" type="button" on:click={onCancel} class="w-full sm:w-auto">
						Cancel
					</Button>
					<Button 
						type="submit" 
						disabled={loading || conflictWarning.includes('⚠️')}
						class="w-full sm:w-auto"
					>
						{loading ? 'Creating...' : 'Create Schedule'}
					</Button>
				</div>
			</form>
		</div>
	</Card>
</div>
