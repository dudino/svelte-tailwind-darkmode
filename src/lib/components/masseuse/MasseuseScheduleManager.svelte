<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Calendar, Clock, Plus, Edit, Trash2, MapPin, Users, Coffee, AlertCircle, CheckCircle } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { authStore } from '$lib/stores/auth';
	import { masseuseData } from '$lib/stores/masseuse';
	
	const dispatch = createEventDispatcher();
	
	$: currentMasseuse = $masseuseData.find(m => m.email === $authStore.user?.email);
	
	// Mock schedule data for the masseuse
	let scheduleData = {
		baselineSlots: [
			{
				id: 'baseline-1',
				type: 'Morning Shift',
				startTime: '09:00',
				endTime: '16:00',
				days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
				room: 'Rose Room',
				isActive: true
			},
			{
				id: 'baseline-2',
				type: 'Evening Shift',
				startTime: '16:00',
				endTime: '23:00',
				days: ['Saturday', 'Sunday'],
				room: 'Lotus Room',
				isActive: false
			}
		],
		customSlots: [
			{
				id: 'custom-1',
				date: '2024-01-22',
				startTime: '10:00',
				endTime: '14:00',
				room: 'Zen Room',
				notes: 'Special availability for weekend',
				status: 'confirmed'
			},
			{
				id: 'custom-2',
				date: '2024-01-23',
				startTime: '18:00',
				endTime: '22:00',
				room: 'Serenity Suite',
				notes: 'Extended evening hours',
				status: 'pending'
			}
		],
		blockedTimes: [
			{
				id: 'block-1',
				date: '2024-01-21',
				startTime: '12:00',
				endTime: '13:00',
				reason: 'Lunch break',
				type: 'break'
			},
			{
				id: 'block-2',
				date: '2024-01-24',
				startTime: '09:00',
				endTime: '17:00',
				reason: 'Personal day off',
				type: 'dayoff'
			}
		]
	};
	
	let activeTab = 'overview';
	let showCreateSlotModal = false;
	let showBlockTimeModal = false;
	let selectedSlot = null;
	let isLoading = false;
	
	const roomOptions = [
		{ value: 'rose', label: 'Rose Room', amenities: ['Aromatherapy', 'Hot stones'] },
		{ value: 'lotus', label: 'Lotus Room', amenities: ['Music therapy', 'Dim lighting'] },
		{ value: 'zen', label: 'Zen Room', amenities: ['Essential oils', 'Sound therapy'] },
		{ value: 'serenity', label: 'Serenity Suite', amenities: ['Jacuzzi', 'Steam room'] },
		{ value: 'harmony', label: 'Harmony Room', amenities: ['Color therapy', 'Meditation'] }
	];
	
	const baselineSlotTypes = [
		{ value: 'morning', label: 'Morning Shift', time: '09:00 - 16:00' },
		{ value: 'evening', label: 'Evening Shift', time: '16:00 - 23:00' },
		{ value: 'full', label: 'Full Day', time: '09:00 - 23:00' },
		{ value: 'custom', label: 'Custom Hours', time: 'Set your own times' }
	];
	
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
			case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
			default: return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	}
	
	function getBlockTypeColor(type: string) {
		switch (type) {
			case 'break': return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'dayoff': return 'bg-purple-100 text-purple-800 border-purple-200';
			case 'sick': return 'bg-red-100 text-red-800 border-red-200';
			default: return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	}
	
	async function toggleBaselineSlot(slotId: string) {
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 500));
			
			scheduleData.baselineSlots = scheduleData.baselineSlots.map(slot =>
				slot.id === slotId ? { ...slot, isActive: !slot.isActive } : slot
			);
		} catch (error) {
			console.error('Failed to update baseline slot:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function createCustomSlot(slotData: any) {
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const newSlot = {
				id: `custom-${Date.now()}`,
				...slotData,
				status: 'pending'
			};
			
			scheduleData.customSlots = [...scheduleData.customSlots, newSlot];
			showCreateSlotModal = false;
		} catch (error) {
			console.error('Failed to create custom slot:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function blockTime(blockData: any) {
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const newBlock = {
				id: `block-${Date.now()}`,
				...blockData
			};
			
			scheduleData.blockedTimes = [...scheduleData.blockedTimes, newBlock];
			showBlockTimeModal = false;
		} catch (error) {
			console.error('Failed to block time:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function deleteSlot(slotId: string, type: 'custom' | 'block') {
		if (!confirm('Are you sure you want to delete this slot?')) return;
		
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 500));
			
			if (type === 'custom') {
				scheduleData.customSlots = scheduleData.customSlots.filter(slot => slot.id !== slotId);
			} else {
				scheduleData.blockedTimes = scheduleData.blockedTimes.filter(block => block.id !== slotId);
			}
		} catch (error) {
			console.error('Failed to delete slot:', error);
		} finally {
			isLoading = false;
		}
	}
	
	$: upcomingSlots = scheduleData.customSlots
		.filter(slot => new Date(slot.date) >= new Date())
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
	
	$: weeklyHours = scheduleData.baselineSlots
		.filter(slot => slot.isActive)
		.reduce((total, slot) => {
			const start = new Date(`1970-01-01T${slot.startTime}:00`);
			const end = new Date(`1970-01-01T${slot.endTime}:00`);
			const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
			return total + (hours * slot.days.length);
		}, 0);
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Schedule Management</h1>
			<p class="text-sm text-muted-foreground">Manage your availability and working hours</p>
		</div>
		
		<div class="flex gap-3">
			<Button on:click={() => showCreateSlotModal = true} class="glass-button">
				<Plus class="h-4 w-4 mr-2" />
				Add Custom Slot
			</Button>
			<Button on:click={() => showBlockTimeModal = true} variant="outline" class="glass-button">
				<Clock class="h-4 w-4 mr-2" />
				Block Time
			</Button>
		</div>
	</div>
	
	<!-- Tabs -->
	<div class="border-b border-border">
		<nav class="flex space-x-8">
			{#each [
				{ id: 'overview', label: 'Overview', icon: Calendar },
				{ id: 'baseline', label: 'Baseline Schedule', icon: Users },
				{ id: 'custom', label: 'Custom Slots', icon: Clock },
				{ id: 'blocked', label: 'Blocked Times', icon: AlertCircle }
			] as tab}
				<button
					on:click={() => activeTab = tab.id}
					class="flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === tab.id 
						? 'border-primary text-primary' 
						: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
					}"
				>
					<svelte:component this={tab.icon} class="h-4 w-4" />
					<span>{tab.label}</span>
				</button>
			{/each}
		</nav>
	</div>
	
	<!-- Tab Content -->
	{#if activeTab === 'overview'}
		<!-- Overview Tab -->
		<div class="space-y-6">
			<!-- Summary Cards -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div class="enhanced-card p-4 rounded-lg text-center">
					<div class="text-2xl font-bold text-primary mb-2">{weeklyHours}</div>
					<div class="text-sm text-muted-foreground">Weekly Hours</div>
				</div>
				<div class="enhanced-card p-4 rounded-lg text-center">
					<div class="text-2xl font-bold text-green-600 mb-2">{scheduleData.baselineSlots.filter(s => s.isActive).length}</div>
					<div class="text-sm text-muted-foreground">Active Baseline Slots</div>
				</div>
				<div class="enhanced-card p-4 rounded-lg text-center">
					<div class="text-2xl font-bold text-blue-600 mb-2">{upcomingSlots.length}</div>
					<div class="text-sm text-muted-foreground">Upcoming Custom Slots</div>
				</div>
				<div class="enhanced-card p-4 rounded-lg text-center">
					<div class="text-2xl font-bold text-red-600 mb-2">{scheduleData.blockedTimes.length}</div>
					<div class="text-sm text-muted-foreground">Blocked Time Periods</div>
				</div>
			</div>
			
			<!-- Quick Actions -->
			<div class="enhanced-card p-6 rounded-xl">
				<h3 class="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					{#each baselineSlotTypes as slotType}
						<button
							on:click={() => {
								// Handle baseline slot selection
								console.log('Selected baseline slot:', slotType.value);
							}}
							class="enhanced-card p-4 rounded-lg cursor-pointer hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-primary/30 text-left"
						>
							<div class="text-lg font-bold text-foreground mb-1">{slotType.label}</div>
							<div class="text-sm text-muted-foreground">{slotType.time}</div>
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Upcoming Schedule Preview -->
			<div class="enhanced-card p-6 rounded-xl">
				<h3 class="text-lg font-semibold text-foreground mb-4">Upcoming Custom Slots</h3>
				{#if upcomingSlots.length > 0}
					<div class="space-y-3">
						{#each upcomingSlots.slice(0, 5) as slot}
							<div class="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
								<div class="flex items-center space-x-3">
									<Calendar class="h-4 w-4 text-muted-foreground" />
									<div>
										<div class="font-medium text-foreground">{formatDate(slot.date)}</div>
										<div class="text-sm text-muted-foreground">{slot.startTime} - {slot.endTime} • {slot.room}</div>
									</div>
								</div>
								<span class={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(slot.status)}`}>
									{slot.status}
								</span>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8">
						<Calendar class="h-12 w-12 text-muted-foreground mx-auto mb-2" />
						<p class="text-muted-foreground">No upcoming custom slots</p>
					</div>
				{/if}
			</div>
		</div>
		
	{:else if activeTab === 'baseline'}
		<!-- Baseline Schedule Tab -->
		<div class="space-y-6">
			<div class="enhanced-card p-6 rounded-xl">
				<h3 class="text-lg font-semibold text-foreground mb-4">Baseline Availability</h3>
				<p class="text-sm text-muted-foreground mb-6">Set your regular working hours that repeat weekly</p>
				
				<div class="space-y-4">
					{#each scheduleData.baselineSlots as slot}
						<div class="p-4 border border-border rounded-lg">
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-4">
									<div class={`w-3 h-3 rounded-full ${slot.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
									<div>
										<div class="font-medium text-foreground">{slot.type}</div>
										<div class="text-sm text-muted-foreground">
											{slot.startTime} - {slot.endTime} • {slot.room}
										</div>
										<div class="text-xs text-muted-foreground mt-1">
											{slot.days.join(', ')}
										</div>
									</div>
								</div>
								
								<div class="flex items-center space-x-3">
									<button
										on:click={() => toggleBaselineSlot(slot.id)}
										disabled={isLoading}
										class={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
											slot.isActive 
												? 'bg-green-100 text-green-800 hover:bg-green-200' 
												: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
										}`}
									>
										{slot.isActive ? 'Active' : 'Inactive'}
									</button>
									<Button variant="outline" size="sm" class="glass-button">
										<Edit class="h-3 w-3" />
									</Button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
		
	{:else if activeTab === 'custom'}
		<!-- Custom Slots Tab -->
		<div class="space-y-6">
			<div class="enhanced-card p-6 rounded-xl">
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg font-semibold text-foreground">Custom Time Slots</h3>
					<Button on:click={() => showCreateSlotModal = true} class="glass-button">
						<Plus class="h-4 w-4 mr-2" />
						Add Custom Slot
					</Button>
				</div>
				
				{#if scheduleData.customSlots.length > 0}
					<div class="space-y-3">
						{#each scheduleData.customSlots as slot}
							<div class="p-4 border border-border rounded-lg">
								<div class="flex items-center justify-between">
									<div class="flex items-center space-x-3">
										<Calendar class="h-5 w-5 text-muted-foreground" />
										<div>
											<div class="font-medium text-foreground">{formatDate(slot.date)}</div>
											<div class="text-sm text-muted-foreground">
												{slot.startTime} - {slot.endTime} • {slot.room}
											</div>
											{#if slot.notes}
												<div class="text-xs text-muted-foreground mt-1">{slot.notes}</div>
											{/if}
										</div>
									</div>
									
									<div class="flex items-center space-x-3">
										<span class={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(slot.status)}`}>
											{slot.status}
										</span>
										<Button
											on:click={() => deleteSlot(slot.id, 'custom')}
											variant="outline"
											size="sm"
											class="glass-button hover:bg-red-50 hover:border-red-200 hover:text-red-600"
											disabled={isLoading}
										>
											<Trash2 class="h-3 w-3" />
										</Button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-12">
						<Clock class="h-12 w-12 text-muted-foreground mx-auto mb-2" />
						<p class="text-muted-foreground">No custom slots created yet</p>
					</div>
				{/if}
			</div>
		</div>
		
	{:else if activeTab === 'blocked'}
		<!-- Blocked Times Tab -->
		<div class="space-y-6">
			<div class="enhanced-card p-6 rounded-xl">
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg font-semibold text-foreground">Blocked Time Periods</h3>
					<Button on:click={() => showBlockTimeModal = true} variant="outline" class="glass-button">
						<AlertCircle class="h-4 w-4 mr-2" />
						Block Time
					</Button>
				</div>
				
				{#if scheduleData.blockedTimes.length > 0}
					<div class="space-y-3">
						{#each scheduleData.blockedTimes as block}
							<div class="p-4 border border-border rounded-lg">
								<div class="flex items-center justify-between">
									<div class="flex items-center space-x-3">
										<AlertCircle class="h-5 w-5 text-muted-foreground" />
										<div>
											<div class="font-medium text-foreground">{formatDate(block.date)}</div>
											<div class="text-sm text-muted-foreground">
												{block.startTime} - {block.endTime}
											</div>
											<div class="text-xs text-muted-foreground mt-1">{block.reason}</div>
										</div>
									</div>
									
									<div class="flex items-center space-x-3">
										<span class={`px-2 py-1 rounded-full text-xs font-medium border ${getBlockTypeColor(block.type)}`}>
											{block.type}
										</span>
										<Button
											on:click={() => deleteSlot(block.id, 'block')}
											variant="outline"
											size="sm"
											class="glass-button hover:bg-red-50 hover:border-red-200 hover:text-red-600"
											disabled={isLoading}
										>
											<Trash2 class="h-3 w-3" />
										</Button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-12">
						<AlertCircle class="h-12 w-12 text-muted-foreground mx-auto mb-2" />
						<p class="text-muted-foreground">No blocked time periods</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Create Custom Slot Modal -->
{#if showCreateSlotModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-md w-full">
			<div class="p-6 border-b border-border">
				<h2 class="text-2xl font-bold text-foreground">Add Custom Time Slot</h2>
			</div>
			<form on:submit|preventDefault={() => createCustomSlot({
				date: document.getElementById('custom-date')?.value,
				startTime: document.getElementById('custom-start')?.value,
				endTime: document.getElementById('custom-end')?.value,
				room: document.getElementById('custom-room')?.value,
				notes: document.getElementById('custom-notes')?.value
			})}>
				<div class="p-6 space-y-4">
					<div>
						<label for="custom-date" class="block text-sm font-medium text-foreground mb-2">Date</label>
						<input
							id="custom-date"
							type="date"
							required
							min={new Date().toISOString().split('T')[0]}
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="custom-start" class="block text-sm font-medium text-foreground mb-2">Start Time</label>
							<input
								id="custom-start"
								type="time"
								required
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
						<div>
							<label for="custom-end" class="block text-sm font-medium text-foreground mb-2">End Time</label>
							<input
								id="custom-end"
								type="time"
								required
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
					</div>
					
					<div>
						<label for="custom-room" class="block text-sm font-medium text-foreground mb-2">Preferred Room</label>
						<select
							id="custom-room"
							required
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						>
							<option value="">Select Room</option>
							{#each roomOptions as room}
								<option value={room.label}>{room.label}</option>
							{/each}
						</select>
					</div>
					
					<div>
						<label for="custom-notes" class="block text-sm font-medium text-foreground mb-2">Notes (Optional)</label>
						<textarea
							id="custom-notes"
							placeholder="Any special notes or requirements..."
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none resize-none"
							rows="3"
						></textarea>
					</div>
				</div>
				
				<div class="p-6 border-t border-border flex justify-end space-x-3">
					<Button on:click={() => showCreateSlotModal = false} variant="outline" class="glass-button">
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading} class="glass-button">
						{#if isLoading}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
						{/if}
						Add Slot
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Block Time Modal -->
{#if showBlockTimeModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-md w-full">
			<div class="p-6 border-b border-border">
				<h2 class="text-2xl font-bold text-foreground">Block Time Period</h2>
			</div>
			<form on:submit|preventDefault={() => blockTime({
				date: document.getElementById('block-date')?.value,
				startTime: document.getElementById('block-start')?.value,
				endTime: document.getElementById('block-end')?.value,
				reason: document.getElementById('block-reason')?.value,
				type: document.getElementById('block-type')?.value
			})}>
				<div class="p-6 space-y-4">
					<div>
						<label for="block-date" class="block text-sm font-medium text-foreground mb-2">Date</label>
						<input
							id="block-date"
							type="date"
							required
							min={new Date().toISOString().split('T')[0]}
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="block-start" class="block text-sm font-medium text-foreground mb-2">Start Time</label>
							<input
								id="block-start"
								type="time"
								required
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
						<div>
							<label for="block-end" class="block text-sm font-medium text-foreground mb-2">End Time</label>
							<input
								id="block-end"
								type="time"
								required
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
					</div>
					
					<div>
						<label for="block-type" class="block text-sm font-medium text-foreground mb-2">Block Type</label>
						<select
							id="block-type"
							required
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						>
							<option value="">Select Type</option>
							<option value="break">Break</option>
							<option value="dayoff">Day Off</option>
							<option value="sick">Sick Leave</option>
							<option value="personal">Personal</option>
						</select>
					</div>
					
					<div>
						<label for="block-reason" class="block text-sm font-medium text-foreground mb-2">Reason</label>
						<textarea
							id="block-reason"
							required
							placeholder="Brief explanation for blocking this time..."
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none resize-none"
							rows="3"
						></textarea>
					</div>
				</div>
				
				<div class="p-6 border-t border-border flex justify-end space-x-3">
					<Button on:click={() => showBlockTimeModal = false} variant="outline" class="glass-button">
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading} class="glass-button">
						{#if isLoading}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
						{/if}
						Block Time
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
