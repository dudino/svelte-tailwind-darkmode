<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Calendar, Clock, Phone, User, MapPin, Star, MessageCircle, CheckCircle, AlertCircle, XCircle } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { authStore } from '$lib/stores/auth';
	import { masseuseData } from '$lib/stores/masseuse';
	
	const dispatch = createEventDispatcher();
	
	// Helper function to get textarea values
	function getTextAreaValue(id: string): string {
		return (document.getElementById(id) as HTMLTextAreaElement)?.value || '';
	}
	
	$: currentMasseuse = $masseuseData.find(m => m.email === $authStore.user?.email);
	
	// Mock booking data for the current masseuse
	let bookings = [
		{
			id: 'booking-1',
			clientName: 'John Smith',
			clientPhone: '+420 123 456 789',
			clientEmail: 'john.smith@email.com',
			service: 'Deep Tissue Massage',
			date: '2024-01-20',
			time: '09:00',
			duration: 60,
			price: 3000,
			status: 'confirmed',
			room: 'Rose Room',
			pinCode: '1234',
			notes: 'Client prefers firm pressure on shoulders',
			specialRequests: ['Hot stones', 'Aromatherapy'],
			clientHistory: {
				totalVisits: 5,
				lastVisit: '2024-01-10',
				preferredPressure: 'firm',
				allergies: 'None'
			}
		},
		{
			id: 'booking-2',
			clientName: 'Sarah Johnson',
			clientPhone: '+420 987 654 321',
			clientEmail: 'sarah.johnson@email.com',
			service: 'Relaxation Massage',
			date: '2024-01-20',
			time: '10:30',
			duration: 90,
			price: 4200,
			status: 'in-progress',
			room: 'Lotus Room',
			pinCode: '5678',
			notes: 'First-time client, very nervous',
			specialRequests: ['Soft music', 'Light pressure'],
			clientHistory: {
				totalVisits: 1,
				lastVisit: null,
				preferredPressure: 'light',
				allergies: 'Lavender oil'
			}
		},
		{
			id: 'booking-3',
			clientName: 'Michael Brown',
			clientPhone: '+420 555 111 222',
			clientEmail: 'michael.brown@email.com',
			service: 'Sports Massage',
			date: '2024-01-20',
			time: '14:30',
			duration: 75,
			price: 3500,
			status: 'upcoming',
			room: 'Zen Room',
			pinCode: '9012',
			notes: 'Athletic client, runner with tight calves',
			specialRequests: ['Focus on legs', 'Stretching'],
			clientHistory: {
				totalVisits: 8,
				lastVisit: '2024-01-15',
				preferredPressure: 'firm',
				allergies: 'None'
			}
		},
		{
			id: 'booking-4',
			clientName: 'Emma Wilson',
			clientPhone: '+420 444 333 555',
			clientEmail: 'emma.wilson@email.com',
			service: 'Swedish Massage',
			date: '2024-01-19',
			time: '16:00',
			duration: 60,
			price: 2800,
			status: 'completed',
			room: 'Rose Room',
			pinCode: '3456',
			notes: 'Regular client, very satisfied',
			specialRequests: ['Medium pressure', 'Essential oils'],
			clientHistory: {
				totalVisits: 12,
				lastVisit: '2024-01-05',
				preferredPressure: 'medium',
				allergies: 'None'
			},
			clientRating: 5,
			clientFeedback: 'Excellent as always! Very professional and skilled.'
		}
	];
	
	let selectedDate = new Date().toISOString().split('T')[0];
	let statusFilter = 'all';
	let showBookingDetails = false;
	let selectedBooking: any = null;
	let isLoading = false;
	
	$: statusOptions = [
		{ value: 'all', label: 'All Bookings' },
		{ value: 'upcoming', label: 'Upcoming' },
		{ value: 'in-progress', label: 'In Progress' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'cancelled', label: 'Cancelled' }
	];
	
	$: filteredBookings = bookings.filter(booking => {
		if (statusFilter !== 'all' && booking.status !== statusFilter) {
			return false;
		}
		
		if (selectedDate && booking.date !== selectedDate) {
			return false;
		}
		
		return true;
	});
	
	$: todaysBookings = bookings.filter(b => b.date === new Date().toISOString().split('T')[0]);
	$: upcomingBookings = bookings.filter(b => b.status === 'upcoming');
	$: completedToday = bookings.filter(b => b.date === new Date().toISOString().split('T')[0] && b.status === 'completed');
	$: todaysRevenue = completedToday.reduce((sum, b) => sum + b.price, 0);
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'in-progress': return 'bg-green-100 text-green-800 border-green-200';
			case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
			case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
			default: return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	}
	
	function getStatusIcon(status: string) {
		switch (status) {
			case 'upcoming': return Clock;
			case 'in-progress': return AlertCircle;
			case 'completed': return CheckCircle;
			case 'cancelled': return XCircle;
			default: return Clock;
		}
	}
	
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}
	
	function formatPrice(price: number) {
		return `${price.toLocaleString()} CZK`;
	}
	
	function openBookingDetails(booking: any) {
		selectedBooking = booking;
		showBookingDetails = true;
	}
	
	function closeBookingDetails() {
		selectedBooking = null;
		showBookingDetails = false;
	}
	
	async function updateBookingStatus(bookingId: string, newStatus: string) {
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 500));
			
			bookings = bookings.map(booking =>
				booking.id === bookingId ? { ...booking, status: newStatus } : booking
			);
		} catch (error) {
			console.error('Failed to update booking status:', error);
		} finally {
			isLoading = false;
		}
	}
	
	async function addClientNotes(bookingId: string, notes: string) {
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 500));
			
			bookings = bookings.map(booking =>
				booking.id === bookingId 
					? { ...booking, masseuseNotes: notes } 
					: booking
			);
		} catch (error) {
			console.error('Failed to add notes:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">My Bookings</h1>
			<p class="text-sm text-muted-foreground">Manage your appointments and client interactions</p>
		</div>
	</div>
	
	<!-- Filters -->
	<div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-accent/20 p-4 rounded-lg">
		<div class="flex-1">
			<label for="date-filter" class="block text-sm font-medium text-foreground mb-2">Select Date</label>
			<input
				id="date-filter"
				type="date"
				bind:value={selectedDate}
				class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
			/>
		</div>
		
		<div class="flex-1">
			<label for="status-filter" class="block text-sm font-medium text-foreground mb-2">Filter by Status</label>
			<select
				id="status-filter"
				bind:value={statusFilter}
				class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
			>
				{#each statusOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>
	
	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-primary mb-2">{todaysBookings.length}</div>
			<div class="text-sm text-muted-foreground">Today's Appointments</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-blue-600 mb-2">{upcomingBookings.length}</div>
			<div class="text-sm text-muted-foreground">Upcoming</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-green-600 mb-2">{completedToday.length}</div>
			<div class="text-sm text-muted-foreground">Completed Today</div>
		</div>
		<div class="enhanced-card p-4 rounded-lg text-center">
			<div class="text-2xl font-bold text-yellow-600 mb-2">{formatPrice(todaysRevenue)}</div>
			<div class="text-sm text-muted-foreground">Today's Revenue</div>
		</div>
	</div>
	
	<!-- Bookings List -->
	<div class="space-y-4">
		{#each filteredBookings as booking}
			<div class="enhanced-card p-6 rounded-xl">
				<div class="flex items-start justify-between mb-4">
					<div class="flex items-start space-x-4">
						<div class="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
							<User class="h-6 w-6 text-primary" />
						</div>
						<div class="flex-1">
							<div class="flex items-center space-x-3 mb-1">
								<h3 class="text-lg font-semibold text-foreground">{booking.clientName}</h3>
								<span class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
									<svelte:component this={getStatusIcon(booking.status)} class="h-3 w-3 mr-1" />
									{booking.status}
								</span>
							</div>
							<div class="text-sm text-muted-foreground mb-2">
								{booking.service} • {booking.duration} minutes • {formatPrice(booking.price)}
							</div>
							<div class="flex items-center space-x-4 text-sm text-muted-foreground">
								<div class="flex items-center space-x-1">
									<Calendar class="h-4 w-4" />
									<span>{formatDate(booking.date)} at {booking.time}</span>
								</div>
								<div class="flex items-center space-x-1">
									<MapPin class="h-4 w-4" />
									<span>{booking.room}</span>
								</div>
								<div class="flex items-center space-x-1">
									<Phone class="h-4 w-4" />
									<span>PIN: {booking.pinCode}</span>
								</div>
							</div>
						</div>
					</div>
					
					<div class="flex items-center space-x-2">
						{#if booking.status === 'upcoming'}
							<Button
								on:click={() => updateBookingStatus(booking.id, 'in-progress')}
								class="glass-button"
								disabled={isLoading}
							>
								Start Session
							</Button>
						{:else if booking.status === 'in-progress'}
							<Button
								on:click={() => updateBookingStatus(booking.id, 'completed')}
								class="glass-button"
								disabled={isLoading}
							>
								Complete
							</Button>
						{/if}
						<Button
							on:click={() => openBookingDetails(booking)}
							variant="outline"
							class="glass-button"
						>
							View Details
						</Button>
					</div>
				</div>
				
				<!-- Client History Summary -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-accent/20 rounded-lg">
					<div class="text-center">
						<div class="text-lg font-bold text-primary">{booking.clientHistory.totalVisits}</div>
						<div class="text-xs text-muted-foreground">Total Visits</div>
					</div>
					<div class="text-center">
						<div class="text-lg font-bold text-green-600">{booking.clientHistory.preferredPressure}</div>
						<div class="text-xs text-muted-foreground">Preferred Pressure</div>
					</div>
					<div class="text-center">
						<div class="text-lg font-bold text-purple-600">
							{booking.clientHistory.allergies === 'None' ? 'No Allergies' : booking.clientHistory.allergies}
						</div>
						<div class="text-xs text-muted-foreground">Allergies</div>
					</div>
				</div>
				
				<!-- Special Requests & Notes -->
				{#if booking.specialRequests?.length > 0 || booking.notes}
					<div class="space-y-2">
						{#if booking.specialRequests?.length > 0}
							<div>
								<span class="text-sm font-medium text-foreground">Special Requests: </span>
								<span class="text-sm text-muted-foreground">{booking.specialRequests.join(', ')}</span>
							</div>
						{/if}
						{#if booking.notes}
							<div>
								<span class="text-sm font-medium text-foreground">Client Notes: </span>
								<span class="text-sm text-muted-foreground">{booking.notes}</span>
							</div>
						{/if}
					</div>
				{/if}
				
				<!-- Client Feedback (for completed bookings) -->
				{#if booking.status === 'completed' && booking.clientRating}
					<div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
						<div class="flex items-center space-x-2 mb-2">
							<span class="text-sm font-medium text-green-800">Client Feedback:</span>
							<div class="flex items-center space-x-1">
								{#each Array(5) as _, i}
									<Star class={`h-4 w-4 ${i < booking.clientRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
								{/each}
							</div>
						</div>
						{#if booking.clientFeedback}
							<p class="text-sm text-green-700">"{booking.clientFeedback}"</p>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
		
		{#if filteredBookings.length === 0}
			<div class="text-center py-12">
				<Calendar class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
				<h3 class="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
				<p class="text-muted-foreground">Try adjusting your date or status filter</p>
			</div>
		{/if}
	</div>
</div>

<!-- Booking Details Modal -->
{#if showBookingDetails && selectedBooking}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-border">
				<div class="flex items-center justify-between">
					<h2 class="text-2xl font-bold text-foreground">Booking Details</h2>
					<Button on:click={closeBookingDetails} variant="outline" class="glass-button">
						Close
					</Button>
				</div>
			</div>
			
			<div class="p-6 space-y-6">
				<!-- Client Information -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<h3 class="font-semibold text-foreground mb-3">Client Information</h3>
						<div class="space-y-2">
							<div class="flex justify-between">
								<span class="text-muted-foreground">Name:</span>
								<span class="font-medium text-foreground">{selectedBooking.clientName}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground">Phone:</span>
								<span class="text-foreground">{selectedBooking.clientPhone}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground">Email:</span>
								<span class="text-foreground">{selectedBooking.clientEmail}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground">PIN Code:</span>
								<span class="font-bold text-primary">{selectedBooking.pinCode}</span>
							</div>
						</div>
					</div>
					
					<div>
						<h3 class="font-semibold text-foreground mb-3">Booking Details</h3>
						<div class="space-y-2">
							<div class="flex justify-between">
								<span class="text-muted-foreground">Service:</span>
								<span class="font-medium text-foreground">{selectedBooking.service}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground">Date & Time:</span>
								<span class="text-foreground">{formatDate(selectedBooking.date)} at {selectedBooking.time}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground">Duration:</span>
								<span class="text-foreground">{selectedBooking.duration} minutes</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground">Room:</span>
								<span class="text-foreground">{selectedBooking.room}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground">Price:</span>
								<span class="font-semibold text-foreground">{formatPrice(selectedBooking.price)}</span>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Client History -->
				<div>
					<h3 class="font-semibold text-foreground mb-3">Client History</h3>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div class="text-center p-3 bg-accent/20 rounded-lg">
							<div class="text-lg font-bold text-primary">{selectedBooking.clientHistory.totalVisits}</div>
							<div class="text-xs text-muted-foreground">Total Visits</div>
						</div>
						<div class="text-center p-3 bg-accent/20 rounded-lg">
							<div class="text-lg font-bold text-green-600">{selectedBooking.clientHistory.preferredPressure}</div>
							<div class="text-xs text-muted-foreground">Preferred Pressure</div>
						</div>
						<div class="text-center p-3 bg-accent/20 rounded-lg">
							<div class="text-lg font-bold text-purple-600">
								{selectedBooking.clientHistory.lastVisit ? formatDate(selectedBooking.clientHistory.lastVisit) : 'First time'}
							</div>
							<div class="text-xs text-muted-foreground">Last Visit</div>
						</div>
						<div class="text-center p-3 bg-accent/20 rounded-lg">
							<div class="text-lg font-bold text-orange-600">
								{selectedBooking.clientHistory.allergies === 'None' ? 'None' : selectedBooking.clientHistory.allergies}
							</div>
							<div class="text-xs text-muted-foreground">Allergies</div>
						</div>
					</div>
				</div>
				
				<!-- Special Requests -->
				{#if selectedBooking.specialRequests?.length > 0}
					<div>
						<h3 class="font-semibold text-foreground mb-3">Special Requests</h3>
						<div class="flex flex-wrap gap-2">
							{#each selectedBooking.specialRequests as request}
								<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
									{request}
								</span>
							{/each}
						</div>
					</div>
				{/if}
				
				<!-- Notes -->
				{#if selectedBooking.notes}
					<div>
						<h3 class="font-semibold text-foreground mb-3">Client Notes</h3>
						<div class="p-3 bg-accent/20 rounded-lg">
							<p class="text-foreground">{selectedBooking.notes}</p>
						</div>
					</div>
				{/if}
				
				<!-- Add Masseuse Notes -->
				<div>
					<h3 class="font-semibold text-foreground mb-3">Session Notes</h3>
					<textarea
						id="masseuse-notes"
						placeholder="Add your notes about this session..."
						value={selectedBooking.masseuseNotes || ''}
						class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none resize-none"
						rows="3"
					></textarea>
					<div class="mt-2 flex justify-end">
						<Button
							on:click={() => addClientNotes(selectedBooking.id, getTextAreaValue('masseuse-notes'))}
							class="glass-button"
							disabled={isLoading}
						>
							Save Notes
						</Button>
					</div>
				</div>
				
				<!-- Client Feedback -->
				{#if selectedBooking.clientRating}
					<div>
						<h3 class="font-semibold text-foreground mb-3">Client Feedback</h3>
						<div class="p-4 bg-green-50 border border-green-200 rounded-lg">
							<div class="flex items-center space-x-2 mb-2">
								<span class="font-medium text-green-800">Rating:</span>
								<div class="flex items-center space-x-1">
									{#each Array(5) as _, i}
										<Star class={`h-4 w-4 ${i < selectedBooking.clientRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
									{/each}
								</div>
							</div>
							{#if selectedBooking.clientFeedback}
								<p class="text-green-700">"{selectedBooking.clientFeedback}"</p>
							{/if}
						</div>
					</div>
				{/if}
				
				<!-- Status Update Actions -->
				{#if selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled'}
					<div class="flex justify-end space-x-3 pt-4 border-t border-border">
						{#if selectedBooking.status === 'upcoming'}
							<Button
								on:click={() => updateBookingStatus(selectedBooking.id, 'in-progress')}
								class="glass-button"
								disabled={isLoading}
							>
								Start Session
							</Button>
						{:else if selectedBooking.status === 'in-progress'}
							<Button
								on:click={() => updateBookingStatus(selectedBooking.id, 'completed')}
								class="glass-button"
								disabled={isLoading}
							>
								Complete Session
							</Button>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
