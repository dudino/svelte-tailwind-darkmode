<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { Calendar, FileText, User, Plus, Clock, MapPin, Phone, Star } from 'lucide-svelte';
	import { todaysAvailability, availableMasseuses } from '$lib/stores/masseuse';
	import Button from '$lib/components/ui/button/button.svelte';
	import MasseuseSelector from '$lib/components/MasseuseSelector.svelte';
	
	$: user = $currentUser;
	
	let showMasseuseSelector = false;
	let showBookingForm = false;
	
	const operatorActions = [
		{ title: 'Create New Booking', description: 'Schedule a massage appointment for a client', icon: Plus, href: '#', color: 'bg-primary', action: () => showBookingForm = true },
		{ title: 'Schedule Management', description: 'View and adjust masseuse schedules', icon: Calendar, href: '/schedules', color: 'bg-blue-500' },
		{ title: 'Client Profiles', description: 'Manage client information and history', icon: User, href: '/clients', color: 'bg-green-500' },
		{ title: 'Location Management', description: 'Manage rooms and locations', icon: MapPin, href: '/locations', color: 'bg-orange-500' }
	];
	
	const todaysBookings = [
		{ time: '09:00', client: 'John Smith', masseuse: 'Monika', room: 'Rose Room', status: 'confirmed', phone: '+420 123 456 789', pinCode: '1234' },
		{ time: '10:30', client: 'Sarah Johnson', masseuse: 'Melissa', room: 'Lotus Room', status: 'in-progress', phone: '+420 987 654 321', pinCode: '5678' },
		{ time: '12:00', client: 'Michael Brown', masseuse: 'Silvia', room: 'Zen Room', status: 'pending', phone: '+420 555 111 222', pinCode: '9012' },
		{ time: '14:30', client: 'Emma Wilson', masseuse: 'Mia', room: 'Rose Room', status: 'confirmed', phone: '+420 444 333 555', pinCode: '3456' },
		{ time: '16:00', client: 'David Lee', masseuse: 'Kiki', room: 'Lotus Room', status: 'confirmed', phone: '+420 666 777 888', pinCode: '7890' }
	];
	
	function handleActionClick(action: any) {
		if (action.action) {
			action.action();
		} else if (action.href !== '#') {
			window.location.href = action.href;
		}
	}
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
			case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
			case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
			case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="space-y-8">
	<!-- Welcome Header -->
	<div class="text-center py-8">
		<h1 class="text-4xl md:text-5xl font-bold mb-4">
			<span class="gradient-text">Operator Dashboard</span>
		</h1>
		<p class="text-xl text-muted-foreground">
			Welcome back, {user?.firstName}! Ready to manage bookings and schedules.
		</p>
	</div>
	
	<!-- Quick Actions -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each operatorActions as action}
			<button 
				on:click={() => handleActionClick(action)}
				class="enhanced-card p-6 rounded-xl hover:scale-105 transition-all duration-300 group text-left w-full"
			>
				<div class="text-center">
					<div class={`w-16 h-16 ${action.color} rounded-xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform`}>
						<svelte:component this={action.icon} class="h-8 w-8" />
					</div>
					<h3 class="text-lg font-semibold text-foreground mb-2">{action.title}</h3>
					<p class="text-sm text-muted-foreground">{action.description}</p>
				</div>
			</button>
		{/each}
	</div>
	
	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Today's Bookings -->
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-bold text-foreground">Today's Bookings</h2>
				<Button on:click={() => showBookingForm = true} class="glass-button">
					<Plus class="h-4 w-4 mr-2" />
					New Booking
				</Button>
			</div>
			<div class="space-y-3">
				{#each todaysBookings as booking}
					<div class="p-4 bg-accent/20 rounded-lg space-y-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-4">
								<div class="flex items-center space-x-2">
									<Clock class="h-4 w-4 text-muted-foreground" />
									<span class="font-medium text-foreground">{booking.time}</span>
								</div>
								<div class={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
									{booking.status}
								</div>
							</div>
							<div class="text-right">
								<div class="text-sm font-medium text-foreground">PIN: {booking.pinCode}</div>
							</div>
						</div>
						
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
							<div>
								<div class="text-muted-foreground">Client:</div>
								<div class="font-medium text-foreground">{booking.client}</div>
							</div>
							<div>
								<div class="text-muted-foreground">Phone:</div>
								<div class="font-medium text-foreground flex items-center">
									<Phone class="h-3 w-3 mr-1" />
									{booking.phone}
								</div>
							</div>
							<div>
								<div class="text-muted-foreground">Masseuse:</div>
								<div class="font-medium text-foreground">{booking.masseuse}</div>
							</div>
							<div>
								<div class="text-muted-foreground">Room:</div>
								<div class="font-medium text-foreground flex items-center">
									<MapPin class="h-3 w-3 mr-1" />
									{booking.room}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Available Masseuses Today -->
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-bold text-foreground">Available Today</h2>
				<Button on:click={() => showMasseuseSelector = true} variant="outline" class="glass-button">
					View All Masseuses
				</Button>
			</div>
			<div class="space-y-3">
				{#each $todaysAvailability.slice(0, 6) as masseuse}
					<div class="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
						<div class="flex items-center space-x-4">
							<div class="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
								<span class="text-primary-foreground font-medium text-sm">{masseuse.name[0]}</span>
							</div>
							<div>
								<p class="font-medium text-foreground flex items-center">
									{masseuse.name}
									{#if masseuse.status}
										<span class="ml-2 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs rounded-full">
											{masseuse.status}
										</span>
									{/if}
								</p>
								<p class="text-sm text-muted-foreground">
									{masseuse.age} years • {masseuse.height_cm}cm
								</p>
							</div>
						</div>
						<div class="text-right">
							{#each masseuse.availability as slot}
								{#if slot.date === new Date().toISOString().split('T')[0]}
									<p class="text-sm font-medium text-green-600">{slot.start_time} - {slot.end_time}</p>
								{/if}
							{/each}
							<div class="flex items-center mt-1">
								{#each Array(5) as _, i}
									<Star class={`h-3 w-3 ${i < 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
								{/each}
								<span class="text-xs text-muted-foreground ml-1">4.8</span>
							</div>
						</div>
					</div>
				{/each}
				
				{#if $todaysAvailability.length === 0}
					<div class="text-center py-6 text-muted-foreground">
						No masseuses available today
					</div>
				{/if}
			</div>
		</div>
	</div>
	
	<!-- Quick Stats -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
		<div class="enhanced-card p-6 rounded-xl text-center">
			<div class="text-3xl font-bold text-primary mb-2">{todaysBookings.length}</div>
			<div class="text-sm text-muted-foreground">Bookings Today</div>
		</div>
		<div class="enhanced-card p-6 rounded-xl text-center">
			<div class="text-3xl font-bold text-green-600 mb-2">{$todaysAvailability.length}</div>
			<div class="text-sm text-muted-foreground">Available Today</div>
		</div>
		<div class="enhanced-card p-6 rounded-xl text-center">
			<div class="text-3xl font-bold text-blue-600 mb-2">{$availableMasseuses.length}</div>
			<div class="text-sm text-muted-foreground">Total Available</div>
		</div>
		<div class="enhanced-card p-6 rounded-xl text-center">
			<div class="text-3xl font-bold text-orange-600 mb-2">2</div>
			<div class="text-sm text-muted-foreground">Active Locations</div>
		</div>
	</div>
</div>

<!-- Masseuse Selector Modal -->
{#if showMasseuseSelector}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-border flex items-center justify-between">
				<h2 class="text-2xl font-bold text-foreground">All Masseuses</h2>
				<Button on:click={() => showMasseuseSelector = false} variant="outline" class="glass-button">
					Close
				</Button>
			</div>
			<div class="p-6">
				<MasseuseSelector />
			</div>
		</div>
	</div>
{/if}

<!-- Booking Form Modal -->
{#if showBookingForm}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-border flex items-center justify-between">
				<h2 class="text-2xl font-bold text-foreground">Create New Booking</h2>
				<Button on:click={() => showBookingForm = false} variant="outline" class="glass-button">
					Close
				</Button>
			</div>
			<div class="p-6">
				<div class="space-y-6">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="client-name" class="block text-sm font-medium text-foreground mb-2">Client Name</label>
							<input
								id="client-name"
								type="text"
								placeholder="Enter client name"
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
							/>
						</div>
						<div>
							<label for="client-phone" class="block text-sm font-medium text-foreground mb-2">Phone Number</label>
							<input
								id="client-phone"
								type="tel"
								placeholder="+420 123 456 789"
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
							/>
						</div>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="booking-date" class="block text-sm font-medium text-foreground mb-2">Date</label>
							<input
								id="booking-date"
								type="date"
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
						<div>
							<label for="booking-time" class="block text-sm font-medium text-foreground mb-2">Time</label>
							<input
								id="booking-time"
								type="time"
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							/>
						</div>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="duration" class="block text-sm font-medium text-foreground mb-2">Duration</label>
							<select
								id="duration"
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							>
								<option value="30">30 minutes</option>
								<option value="45">45 minutes</option>
								<option value="60" selected>60 minutes</option>
								<option value="90">90 minutes</option>
								<option value="120">120 minutes</option>
							</select>
						</div>
						<div>
							<label for="room" class="block text-sm font-medium text-foreground mb-2">Room</label>
							<select
								id="room"
								class="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
							>
								<option value="rose">Rose Room</option>
								<option value="lotus">Lotus Room</option>
								<option value="zen">Zen Room</option>
								<option value="serenity">Serenity Suite</option>
								<option value="harmony">Harmony Room</option>
							</select>
						</div>
					</div>
					
					<div>
						<label for="notes" class="block text-sm font-medium text-foreground mb-2">Notes (Optional)</label>
						<textarea
							id="notes"
							placeholder="Any special requests or notes..."
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none resize-none"
							rows="3"
						></textarea>
					</div>
					
					<div class="flex justify-end space-x-3">
						<Button on:click={() => showBookingForm = false} variant="outline" class="glass-button">
							Cancel
						</Button>
						<Button class="glass-button">
							<Plus class="h-4 w-4 mr-2" />
							Create Booking
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
