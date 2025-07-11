<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Plus, Search, Edit, Trash2, Calendar, Clock, User, MapPin, Filter, Eye } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { Booking } from '$lib/types/masseuse';
	import { masseuseData } from '$lib/stores/masseuse';
	
	const dispatch = createEventDispatcher();
	
	// Mock booking data
	let bookings: Booking[] = [
		{
			id: 'booking-1',
			clientId: 'client-1',
			masseuseId: 'masseuse-1',
			serviceType: 'Deep Tissue Massage',
			date: '2024-01-20',
			time: '14:00',
			duration: 60,
			price: 3000,
			status: 'confirmed',
			notes: 'Client prefers firm pressure',
			locationId: 'loc-1',
			roomId: 'room-1'
		},
		{
			id: 'booking-2',
			clientId: 'client-2',
			masseuseId: 'masseuse-2',
			serviceType: 'Relaxation Massage',
			date: '2024-01-20',
			time: '16:30',
			duration: 90,
			price: 4200,
			status: 'pending',
			notes: '',
			locationId: 'loc-1',
			roomId: 'room-2'
		},
		{
			id: 'booking-3',
			clientId: 'client-3',
			masseuseId: 'masseuse-3',
			serviceType: 'Swedish Massage',
			date: '2024-01-21',
			time: '10:00',
			duration: 60,
			price: 2800,
			status: 'completed',
			notes: 'Regular client',
			locationId: 'loc-2',
			roomId: 'room-4'
		},
		{
			id: 'booking-4',
			clientId: 'client-4',
			masseuseId: 'masseuse-1',
			serviceType: 'Hot Stone Massage',
			date: '2024-01-19',
			time: '15:00',
			duration: 75,
			price: 3800,
			status: 'cancelled',
			notes: 'Client requested cancellation',
			locationId: 'loc-1',
			roomId: 'room-3'
		}
	];
	
	let searchQuery = '';
	let statusFilter = 'all';
	let dateFilter = 'all';
	let showCreateBookingModal = false;
	let showEditBookingModal = false;
	let showBookingDetails = false;
	let selectedBooking: Booking | null = null;
	let isLoading = false;
	
	const statusOptions = [
		{ value: 'all', label: 'All Statuses' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'confirmed', label: 'Confirmed' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'cancelled', label: 'Cancelled' }
	];
	
	const dateOptions = [
		{ value: 'all', label: 'All Dates' },
		{ value: 'today', label: 'Today' },
		{ value: 'tomorrow', label: 'Tomorrow' },
		{ value: 'this-week', label: 'This Week' },
		{ value: 'next-week', label: 'Next Week' }
	];
	
	$: filteredBookings = bookings.filter(booking => {
		// Search filter
		if (searchQuery) {
			const masseuse = $masseuseData.find(m => m.id === booking.masseuseId);
			const searchTerm = searchQuery.toLowerCase();
			if (!booking.serviceType.toLowerCase().includes(searchTerm) &&
				!masseuse?.name.toLowerCase().includes(searchTerm) &&
				!booking.clientId.toLowerCase().includes(searchTerm)) {
				return false;
			}
		}
		
		// Status filter
		if (statusFilter !== 'all' && booking.status !== statusFilter) {
			return false;
		}
		
		// Date filter
		if (dateFilter !== 'all') {
			const bookingDate = new Date(booking.date);
			const today = new Date();
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			
			switch (dateFilter) {
				case 'today':
					if (bookingDate.toDateString() !== today.toDateString()) return false;
					break;
				case 'tomorrow':
					if (bookingDate.toDateString() !== tomorrow.toDateString()) return false;
					break;
				case 'this-week':
					const startOfWeek = new Date(today);
					startOfWeek.setDate(today.getDate() - today.getDay());
					const endOfWeek = new Date(startOfWeek);
					endOfWeek.setDate(startOfWeek.getDate() + 6);
					if (bookingDate < startOfWeek || bookingDate > endOfWeek) return false;
					break;
				case 'next-week':
					const nextWeekStart = new Date(today);
					nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
					const nextWeekEnd = new Date(nextWeekStart);
					nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
					if (bookingDate < nextWeekStart || bookingDate > nextWeekEnd) return false;
					break;
			}
		}
		
		return true;
	});
	
	$: bookingStats = {
		total: bookings.length,
		pending: bookings.filter(b => b.status === 'pending').length,
		confirmed: bookings.filter(b => b.status === 'confirmed').length,
		completed: bookings.filter(b => b.status === 'completed').length,
		cancelled: bookings.filter(b => b.status === 'cancelled').length,
		todayRevenue: bookings
			.filter(b => b.date === new Date().toISOString().split('T')[0] && b.status === 'completed')
			.reduce((sum, b) => sum + b.price, 0)
	};
	
	function openCreateBookingModal() {
		selectedBooking = null;
		showCreateBookingModal = true;
	}
	
	function openEditBookingModal(booking: Booking) {
		selectedBooking = booking;
		showEditBookingModal = true;
	}
	
	function openBookingDetails(booking: Booking) {
		selectedBooking = booking;
		showBookingDetails = true;
	}
	
	function closeModals() {
		showCreateBookingModal = false;
		showEditBookingModal = false;
		showBookingDetails = false;
		selectedBooking = null;
	}
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			case 'confirmed': return 'text-blue-600 bg-blue-50 border-blue-200';
			case 'completed': return 'text-green-600 bg-green-50 border-green-200';
			case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
			default: return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	}
	
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
	
	function formatPrice(price: number) {
		return `${price.toLocaleString()} CZK`;
	}
	
	async function handleCreateBooking(bookingData: Partial<Booking>) {
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const newBooking: Booking = {
				id: `booking-${Date.now()}`,
				clientId: bookingData.clientId!,
				masseuseId: bookingData.masseuseId!,
				serviceType: bookingData.serviceType!,
				date: bookingData.date!,
				time: bookingData.time!,
				duration: bookingData.duration!,
				price: bookingData.price!,
				status: 'pending',
				notes: bookingData.notes || '',
				locationId: bookingData.locationId!,
				roomId: bookingData.roomId!
			};
			
			bookings = [...bookings, newBooking];
			closeModals();
		} catch (error) {
			console.error('Failed to create booking:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function handleUpdateBooking(bookingData: Partial<Booking>) {
		if (!selectedBooking) return;
		
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			bookings = bookings.map(booking => 
				booking.id === selectedBooking!.id 
					? { ...booking, ...bookingData }
					: booking
			);
			closeModals();
		} catch (error) {
			console.error('Failed to update booking:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function handleDeleteBooking(bookingId: string) {
		if (!confirm('Are you sure you want to delete this booking?')) return;
		
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 500));
			bookings = bookings.filter(booking => booking.id !== bookingId);
		} catch (error) {
			console.error('Failed to delete booking:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function updateBookingStatus(bookingId: string, newStatus: string) {
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 500));
			
			bookings = bookings.map(booking => 
				booking.id === bookingId 
					? { ...booking, status: newStatus }
					: booking
			);
		} catch (error) {
			console.error('Failed to update booking status:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Header & Controls -->
	<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Booking Management</h1>
			<p class="text-sm text-muted-foreground">Manage client appointments and bookings</p>
		</div>
		
		<Button on:click={openCreateBookingModal} class="glass-button">
			<Plus class="h-4 w-4 mr-2" />
			New Booking
		</Button>
	</div>
	
	<!-- Filters -->
	<div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
		<div class="relative flex-1 max-w-md">
			<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<input
				type="text"
				placeholder="Search bookings..."
				bind:value={searchQuery}
				class="pl-10 pr-4 py-2 w-full border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
			/>
		</div>
		
		<div class="flex gap-3">
			<select
				bind:value={statusFilter}
				class="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
			>
				{#each statusOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			
			<select
				bind:value={dateFilter}
				class="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
			>
				{#each dateOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>
	
	<!-- Stats Cards -->
	<div class="grid grid-cols-2 md:grid-cols-6 gap-4">
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-foreground">{bookingStats.total}</div>
			<div class="text-sm text-muted-foreground">Total Bookings</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-yellow-600">{bookingStats.pending}</div>
			<div class="text-sm text-muted-foreground">Pending</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-blue-600">{bookingStats.confirmed}</div>
			<div class="text-sm text-muted-foreground">Confirmed</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-green-600">{bookingStats.completed}</div>
			<div class="text-sm text-muted-foreground">Completed</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-red-600">{bookingStats.cancelled}</div>
			<div class="text-sm text-muted-foreground">Cancelled</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-primary">{formatPrice(bookingStats.todayRevenue)}</div>
			<div class="text-sm text-muted-foreground">Today's Revenue</div>
		</div>
	</div>
	
	<!-- Bookings Table -->
	<div class="enhanced-card rounded-xl overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-accent/20">
					<tr class="border-b border-border">
						<th class="text-left p-4 font-medium text-foreground">Client & Service</th>
						<th class="text-left p-4 font-medium text-foreground">Masseuse</th>
						<th class="text-left p-4 font-medium text-foreground">Date & Time</th>
						<th class="text-left p-4 font-medium text-foreground">Duration</th>
						<th class="text-left p-4 font-medium text-foreground">Price</th>
						<th class="text-left p-4 font-medium text-foreground">Status</th>
						<th class="text-left p-4 font-medium text-foreground">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredBookings as booking}
						{@const masseuse = $masseuseData.find(m => m.id === booking.masseuseId)}
						<tr class="border-b border-border hover:bg-accent/10 transition-colors">
							<td class="p-4">
								<div>
									<div class="font-medium text-foreground">{booking.serviceType}</div>
									<div class="text-sm text-muted-foreground">Client: {booking.clientId}</div>
								</div>
							</td>
							<td class="p-4">
								<div class="flex items-center space-x-2">
									<div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
										<User class="h-4 w-4 text-primary" />
									</div>
									<div>
										<div class="font-medium text-foreground">{masseuse?.name || 'Unknown'}</div>
									</div>
								</div>
							</td>
							<td class="p-4">
								<div>
									<div class="font-medium text-foreground">{formatDate(booking.date)}</div>
									<div class="text-sm text-muted-foreground">{booking.time}</div>
								</div>
							</td>
							<td class="p-4">
								<span class="text-foreground">{booking.duration} min</span>
							</td>
							<td class="p-4">
								<span class="font-medium text-foreground">{formatPrice(booking.price)}</span>
							</td>
							<td class="p-4">
								<select
									value={booking.status}
									on:change={(e) => updateBookingStatus(booking.id, e.target.value)}
									class={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}
									disabled={isLoading}
								>
									<option value="pending">Pending</option>
									<option value="confirmed">Confirmed</option>
									<option value="completed">Completed</option>
									<option value="cancelled">Cancelled</option>
								</select>
							</td>
							<td class="p-4">
								<div class="flex items-center space-x-2">
									<Button
										on:click={() => openBookingDetails(booking)}
										variant="outline"
										size="sm"
										class="glass-button p-1"
									>
										<Eye class="h-3 w-3" />
									</Button>
									<Button
										on:click={() => openEditBookingModal(booking)}
										variant="outline"
										size="sm"
										class="glass-button p-1"
									>
										<Edit class="h-3 w-3" />
									</Button>
									<Button
										on:click={() => handleDeleteBooking(booking.id)}
										variant="outline"
										size="sm"
										class="glass-button p-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
										disabled={isLoading}
									>
										<Trash2 class="h-3 w-3" />
									</Button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		
		{#if filteredBookings.length === 0}
			<div class="text-center py-12">
				<Calendar class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
				<h3 class="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
				<p class="text-muted-foreground">Try adjusting your filters or create a new booking</p>
			</div>
		{/if}
	</div>
</div>

<!-- Create Booking Modal -->
{#if showCreateBookingModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-border">
				<h2 class="text-2xl font-bold text-foreground">Create New Booking</h2>
			</div>
			<form on:submit|preventDefault={() => handleCreateBooking({
				clientId: document.getElementById('create-booking-client')?.value,
				masseuseId: document.getElementById('create-booking-masseuse')?.value,
				serviceType: document.getElementById('create-booking-service')?.value,
				date: document.getElementById('create-booking-date')?.value,
				time: document.getElementById('create-booking-time')?.value,
				duration: parseInt(document.getElementById('create-booking-duration')?.value || '60'),
				price: parseInt(document.getElementById('create-booking-price')?.value || '0'),
				notes: document.getElementById('create-booking-notes')?.value,
				locationId: 'loc-1',
				roomId: 'room-1'
			})}>
				<div class="p-6 space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="create-booking-client" class="block text-sm font-medium text-foreground mb-2">Client ID</label>
							<input
								id="create-booking-client"
								type="text"
								required
								placeholder="e.g., client-1"
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
						
						<div>
							<label for="create-booking-masseuse" class="block text-sm font-medium text-foreground mb-2">Masseuse</label>
							<select
								id="create-booking-masseuse"
								required
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							>
								<option value="">Select Masseuse</option>
								{#each $masseuseData as masseuse}
									<option value={masseuse.id}>{masseuse.name}</option>
								{/each}
							</select>
						</div>
					</div>
					
					<div>
						<label for="create-booking-service" class="block text-sm font-medium text-foreground mb-2">Service Type</label>
						<select
							id="create-booking-service"
							required
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						>
							<option value="">Select Service</option>
							<option value="Swedish Massage">Swedish Massage</option>
							<option value="Deep Tissue Massage">Deep Tissue Massage</option>
							<option value="Hot Stone Massage">Hot Stone Massage</option>
							<option value="Relaxation Massage">Relaxation Massage</option>
							<option value="Sports Massage">Sports Massage</option>
							<option value="Aromatherapy Massage">Aromatherapy Massage</option>
						</select>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label for="create-booking-date" class="block text-sm font-medium text-foreground mb-2">Date</label>
							<input
								id="create-booking-date"
								type="date"
								required
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
						
						<div>
							<label for="create-booking-time" class="block text-sm font-medium text-foreground mb-2">Time</label>
							<input
								id="create-booking-time"
								type="time"
								required
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
						
						<div>
							<label for="create-booking-duration" class="block text-sm font-medium text-foreground mb-2">Duration (min)</label>
							<select
								id="create-booking-duration"
								required
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							>
								<option value="30">30 minutes</option>
								<option value="60" selected>60 minutes</option>
								<option value="75">75 minutes</option>
								<option value="90">90 minutes</option>
								<option value="120">120 minutes</option>
							</select>
						</div>
					</div>
					
					<div>
						<label for="create-booking-price" class="block text-sm font-medium text-foreground mb-2">Price (CZK)</label>
						<input
							id="create-booking-price"
							type="number"
							min="0"
							step="100"
							required
							placeholder="e.g., 3000"
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
						/>
					</div>
					
					<div>
						<label for="create-booking-notes" class="block text-sm font-medium text-foreground mb-2">Notes</label>
						<textarea
							id="create-booking-notes"
							placeholder="Any special requests or notes..."
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none resize-none"
							rows="3"
						></textarea>
					</div>
				</div>
				
				<div class="p-6 border-t border-border flex justify-end space-x-3">
					<Button on:click={closeModals} variant="outline" class="glass-button">
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading} class="glass-button">
						{#if isLoading}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
						{/if}
						Create Booking
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Booking Details Modal -->
{#if showBookingDetails && selectedBooking}
	{@const masseuse = $masseuseData.find(m => m.id === selectedBooking.masseuseId)}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-border">
				<h2 class="text-2xl font-bold text-foreground">Booking Details</h2>
			</div>
			
			<div class="p-6 space-y-6">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="space-y-4">
						<div>
							<h3 class="font-semibold text-foreground mb-2">Service Information</h3>
							<div class="space-y-2">
								<div class="flex justify-between">
									<span class="text-muted-foreground">Service:</span>
									<span class="font-medium text-foreground">{selectedBooking.serviceType}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Duration:</span>
									<span class="text-foreground">{selectedBooking.duration} minutes</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Price:</span>
									<span class="font-semibold text-foreground">{formatPrice(selectedBooking.price)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Status:</span>
									<span class={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedBooking.status)}`}>
										{selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
									</span>
								</div>
							</div>
						</div>
						
						<div>
							<h3 class="font-semibold text-foreground mb-2">Client Information</h3>
							<div class="space-y-2">
								<div class="flex justify-between">
									<span class="text-muted-foreground">Client ID:</span>
									<span class="text-foreground">{selectedBooking.clientId}</span>
								</div>
							</div>
						</div>
					</div>
					
					<div class="space-y-4">
						<div>
							<h3 class="font-semibold text-foreground mb-2">Schedule</h3>
							<div class="space-y-2">
								<div class="flex justify-between">
									<span class="text-muted-foreground">Date:</span>
									<span class="text-foreground">{formatDate(selectedBooking.date)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Time:</span>
									<span class="text-foreground">{selectedBooking.time}</span>
								</div>
							</div>
						</div>
						
						<div>
							<h3 class="font-semibold text-foreground mb-2">Masseuse</h3>
							<div class="flex items-center space-x-3 p-3 bg-accent/20 rounded-lg">
								<div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
									<User class="h-5 w-5 text-primary" />
								</div>
								<div>
									<div class="font-medium text-foreground">{masseuse?.name || 'Unknown'}</div>
									<div class="text-sm text-muted-foreground">{masseuse?.specialties?.[0] || 'Massage Therapist'}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				{#if selectedBooking.notes}
					<div>
						<h3 class="font-semibold text-foreground mb-2">Notes</h3>
						<div class="p-3 bg-accent/20 rounded-lg">
							<p class="text-foreground">{selectedBooking.notes}</p>
						</div>
					</div>
				{/if}
			</div>
			
			<div class="p-6 border-t border-border flex justify-end space-x-3">
				<Button on:click={closeModals} variant="outline" class="glass-button">
					Close
				</Button>
				<Button on:click={() => { closeModals(); openEditBookingModal(selectedBooking!); }} class="glass-button">
					<Edit class="h-4 w-4 mr-2" />
					Edit Booking
				</Button>
			</div>
		</div>
	</div>
{/if}
