<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { X, Calendar, Clock, MapPin, User, Edit, Save, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// Props
	export let schedule = null;
	export let onClose = () => {};
	export let onUpdate = (schedule) => {};
	export let onDelete = (scheduleId) => {};

	// State
	let isEditing = false;
	let loading = false;
	let editData = {};

	// Initialize edit data when schedule changes
	$: if (schedule) {
		editData = {
			notes: schedule.notes || ''
		};
	}

	// Handle escape key
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			if (isEditing) {
				isEditing = false;
			} else {
				onClose();
			}
		}
	}

	// Handle save
	async function handleSave() {
		try {
			loading = true;
			const updatedSchedule = {
				...schedule,
				...editData
			};
			await onUpdate(updatedSchedule);
			isEditing = false;
			toast.success('Schedule updated successfully');
		} catch (error) {
			console.error('Error updating schedule:', error);
			toast.error('Failed to update schedule');
		} finally {
			loading = false;
		}
	}

	// Handle delete
	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this schedule?')) {
			return;
		}

		try {
			loading = true;
			await onDelete(schedule.id);
			onClose();
			toast.success('Schedule deleted successfully');
		} catch (error) {
			console.error('Error deleting schedule:', error);
			toast.error('Failed to delete schedule');
		} finally {
			loading = false;
		}
	}

	// Get status info
	function getScheduleStatus(schedule) {
		if (!schedule.is_available && schedule.confirmed_by) {
			return {
				color: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300',
				status: 'Cancelled',
				icon: 'X'
			};
		}
		if (schedule.confirmed_by) {
			return {
				color: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300',
				status: 'Confirmed',
				icon: 'Check'
			};
		}
		return {
			color: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300',
			status: 'Pending',
			icon: 'Clock'
		};
	}

	$: status = schedule ? getScheduleStatus(schedule) : null;
</script>

{#if schedule}
	<!-- Modal Overlay -->
	<div 
		class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
		on:click|self={onClose}
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
						<h2 class="text-2xl font-bold">Schedule Details</h2>
						<p class="text-muted-foreground">View and manage your schedule</p>
					</div>
					<div class="flex items-center gap-2">
						{#if !isEditing}
							<Button variant="outline" size="sm" on:click={() => isEditing = true}>
								<Edit class="h-4 w-4 mr-2" />
								Edit
							</Button>
							<Button variant="destructive" size="sm" on:click={handleDelete} disabled={loading}>
								<Trash2 class="h-4 w-4 mr-2" />
								Delete
							</Button>
						{:else}
							<Button variant="outline" size="sm" on:click={() => isEditing = false}>
								Cancel
							</Button>
							<Button size="sm" on:click={handleSave} disabled={loading}>
								<Save class="h-4 w-4 mr-2" />
								Save
							</Button>
						{/if}
						<Button variant="ghost" size="icon" on:click={onClose}>
							<X class="h-4 w-4" />
						</Button>
					</div>
				</div>

				<!-- Status Badge -->
				{#if status}
					<div class="mb-6">
						<div class="inline-flex items-center gap-2 px-3 py-2 rounded-lg {status.color}">
							<Clock class="h-4 w-4" />
							<span class="font-medium">{status.status}</span>
						</div>
					</div>
				{/if}

				<!-- Schedule Information -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<div class="space-y-4">
						<div>
							<Label class="text-sm font-medium text-muted-foreground">Date</Label>
							<div class="flex items-center gap-2 mt-1">
								<Calendar class="h-4 w-4 text-muted-foreground" />
								<span>{new Date(schedule.date).toLocaleDateString('en-US', { 
									weekday: 'long', 
									year: 'numeric', 
									month: 'long', 
									day: 'numeric' 
								})}</span>
							</div>
						</div>

						<div>
							<Label class="text-sm font-medium text-muted-foreground">Time</Label>
							<div class="flex items-center gap-2 mt-1">
								<Clock class="h-4 w-4 text-muted-foreground" />
								<span>{schedule.start_time} - {schedule.end_time}</span>
							</div>
						</div>

						<div>
							<Label class="text-sm font-medium text-muted-foreground">Location</Label>
							<div class="flex items-center gap-2 mt-1">
								<MapPin class="h-4 w-4 text-muted-foreground" />
								<span>{schedule.expand?.room_id?.expand?.location_id?.name || 'Unknown Location'}</span>
							</div>
						</div>

						<div>
							<Label class="text-sm font-medium text-muted-foreground">Room</Label>
							<div class="mt-1">
								<span class="font-medium">{schedule.expand?.room_id?.name || 'Unknown Room'}</span>
							</div>
						</div>
					</div>

					<div class="space-y-4">
						{#if schedule.timeslot}
							<div>
								<Label class="text-sm font-medium text-muted-foreground">Time Slot</Label>
								<div class="mt-1">
									<span class="capitalize">{schedule.timeslot.replace('_', ' ')}</span>
								</div>
							</div>
						{/if}

						{#if schedule.expand?.user_id?.name}
							<div>
								<Label class="text-sm font-medium text-muted-foreground">Created By</Label>
								<div class="flex items-center gap-2 mt-1">
									<User class="h-4 w-4 text-muted-foreground" />
									<span>{schedule.expand.user_id.name}</span>
								</div>
							</div>
						{/if}

						{#if schedule.confirmed_by}
							<div>
								<Label class="text-sm font-medium text-muted-foreground">Confirmed By</Label>
								<div class="flex items-center gap-2 mt-1">
									<User class="h-4 w-4 text-muted-foreground" />
									<span>{schedule.expand?.confirmed_by?.name || 'System'}</span>
								</div>
							</div>
						{/if}

						<div>
							<Label class="text-sm font-medium text-muted-foreground">Created</Label>
							<div class="mt-1">
								<span class="text-sm">{new Date(schedule.created).toLocaleString()}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Notes Section -->
				<div class="space-y-2">
					<Label for="notes" class="text-sm font-medium">Notes</Label>
					{#if isEditing}
						<Textarea 
							id="notes"
							bind:value={editData.notes}
							placeholder="Add any notes about this schedule..."
							rows={4}
							class="resize-none"
						/>
					{:else}
						<div class="p-3 bg-muted/50 rounded-md min-h-[100px]">
							{#if schedule.notes}
								<p class="text-sm">{schedule.notes}</p>
							{:else}
								<p class="text-sm text-muted-foreground italic">No notes added</p>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</Card>
	</div>
{/if}
