<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { Calendar, FileText, User, Plus, Clock } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	
	$: user = $currentUser;
	
	const operatorActions = [
		{ title: 'Create New Booking', description: 'Schedule a massage appointment for a client', icon: Plus, href: '/bookings/new', color: 'bg-primary' },
		{ title: 'Schedule Management', description: 'View and adjust masseuse schedules', icon: Calendar, href: '/schedules', color: 'bg-blue-500' },
		{ title: 'Client Profiles', description: 'Manage client information and history', icon: User, href: '/clients', color: 'bg-green-500' },
		{ title: 'Today\'s Bookings', description: 'Monitor today\'s appointments', icon: FileText, href: '/bookings/today', color: 'bg-orange-500' }
	];
	
	const todaysBookings = [
		{ time: '09:00', client: 'John Smith', masseuse: 'Monika', room: 'Room 1', status: 'confirmed' },
		{ time: '10:30', client: 'Sarah Johnson', masseuse: 'Melissa', room: 'Room 2', status: 'confirmed' },
		{ time: '12:00', client: 'Michael Brown', masseuse: 'Silvia', room: 'Room 3', status: 'pending' },
		{ time: '14:30', client: 'Emma Wilson', masseuse: 'Mia', room: 'Room 1', status: 'confirmed' },
		{ time: '16:00', client: 'David Lee', masseuse: 'Kiki', room: 'Room 2', status: 'confirmed' }
	];
	
	const availableMasseuses = [
		{ name: 'Monika', available: 'Until 20:00', room: 'Room 1' },
		{ name: 'Melissa', available: 'Until 16:00', room: 'Room 2' },
		{ name: 'Silvia', available: 'From 16:00', room: 'Room 3' },
		{ name: 'Mia', available: 'Until 16:00', room: 'Room 1' }
	];
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
			<a href={action.href} class="enhanced-card p-6 rounded-xl hover:scale-105 transition-all duration-300 group">
				<div class="text-center">
					<div class={`w-16 h-16 ${action.color} rounded-xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform`}>
						<svelte:component this={action.icon} class="h-8 w-8" />
					</div>
					<h3 class="text-lg font-semibold text-foreground mb-2">{action.title}</h3>
					<p class="text-sm text-muted-foreground">{action.description}</p>
				</div>
			</a>
		{/each}
	</div>
	
	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Today's Bookings -->
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-bold text-foreground">Today's Bookings</h2>
				<Button href="/bookings/new" class="glass-button">
					<Plus class="h-4 w-4 mr-2" />
					New Booking
				</Button>
			</div>
			<div class="space-y-3">
				{#each todaysBookings as booking}
					<div class="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
						<div class="flex items-center space-x-4">
							<div class="flex items-center space-x-2">
								<Clock class="h-4 w-4 text-muted-foreground" />
								<span class="font-medium text-foreground">{booking.time}</span>
							</div>
							<div>
								<p class="font-medium text-foreground">{booking.client}</p>
								<p class="text-sm text-muted-foreground">{booking.masseuse} • {booking.room}</p>
							</div>
						</div>
						<div class={`px-3 py-1 rounded-full text-xs font-medium ${
							booking.status === 'confirmed' 
								? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
								: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
						}`}>
							{booking.status}
						</div>
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Available Masseuses -->
		<div class="enhanced-card p-6 rounded-xl">
			<h2 class="text-xl font-bold text-foreground mb-6">Available Masseuses</h2>
			<div class="space-y-3">
				{#each availableMasseuses as masseuse}
					<div class="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
						<div class="flex items-center space-x-4">
							<div class="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
								<span class="text-primary-foreground font-medium text-sm">{masseuse.name[0]}</span>
							</div>
							<div>
								<p class="font-medium text-foreground">{masseuse.name}</p>
								<p class="text-sm text-muted-foreground">{masseuse.room}</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-medium text-green-600">{masseuse.available}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
	
	<!-- Quick Stats -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="enhanced-card p-6 rounded-xl text-center">
			<div class="text-3xl font-bold text-primary mb-2">23</div>
			<div class="text-sm text-muted-foreground">Bookings Today</div>
		</div>
		<div class="enhanced-card p-6 rounded-xl text-center">
			<div class="text-3xl font-bold text-green-600 mb-2">12</div>
			<div class="text-sm text-muted-foreground">Available Slots</div>
		</div>
		<div class="enhanced-card p-6 rounded-xl text-center">
			<div class="text-3xl font-bold text-blue-600 mb-2">8</div>
			<div class="text-sm text-muted-foreground">Active Masseuses</div>
		</div>
	</div>
</div>
