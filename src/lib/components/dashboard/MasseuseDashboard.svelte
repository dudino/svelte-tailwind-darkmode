
<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { Calendar, FileText, User, Clock, Star, Settings } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	
	$: user = $currentUser;
	
	const masseuseActions = [
		{ title: 'My Schedule', description: 'View and manage your working hours', icon: Calendar, href: '/my-schedule', color: 'bg-primary' },
		{ title: 'My Bookings', description: 'See your upcoming appointments', icon: FileText, href: '/my-bookings', color: 'bg-blue-500' },
		{ title: 'Client Portal', description: 'Help clients check in and leave reviews', icon: User, href: '/client-portal', color: 'bg-green-500' },
		{ title: 'Profile Settings', description: 'Update your profile and preferences', icon: Settings, href: '/profile', color: 'bg-purple-500' }
	];
	
	const todaysBookings = [
		{ time: '09:00', client: 'John S.', duration: '60 min', status: 'upcoming', pinCode: '1234' },
		{ time: '10:30', client: 'Sarah J.', duration: '90 min', status: 'in-progress', pinCode: '5678' },
		{ time: '12:30', client: 'Michael B.', duration: '60 min', status: 'upcoming', pinCode: '9012' },
		{ time: '14:30', client: 'Emma W.', duration: '45 min', status: 'upcoming', pinCode: '3456' }
	];
	
	const recentReviews = [
		{ client: 'Anonymous', rating: 5, comment: 'Excellent massage, very relaxing!', date: '2 hours ago' },
		{ client: 'Anonymous', rating: 4, comment: 'Good technique, will book again.', date: '1 day ago' },
		{ client: 'Anonymous', rating: 5, comment: 'Amazing experience, highly recommended!', date: '2 days ago' }
	];
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
			case 'in-progress': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
			case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="space-y-8">
	<!-- Welcome Header -->
	<div class="text-center py-8">
		<h1 class="text-4xl md:text-5xl font-bold mb-4">
			<span class="gradient-text">Welcome, {user?.firstName}!</span>
		</h1>
		<p class="text-xl text-muted-foreground">
			Your personal dashboard for managing appointments and schedule.
		</p>
	</div>
	
	<!-- Quick Actions -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each masseuseActions as action}
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
		<!-- Today's Appointments -->
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-bold text-foreground">Today's Appointments</h2>
				<Button href="/my-schedule" variant="outline" class="glass-button">
					<Calendar class="h-4 w-4 mr-2" />
					View Schedule
				</Button>
			</div>
			<div class="space-y-3">
				{#each todaysBookings as booking}
					<div class="p-4 bg-accent/20 rounded-lg">
						<div class="flex items-center justify-between mb-2">
							<div class="flex items-center space-x-3">
								<Clock class="h-4 w-4 text-muted-foreground" />
								<span class="font-medium text-foreground">{booking.time}</span>
								<span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
									{booking.status}
								</span>
							</div>
							<span class="text-sm text-muted-foreground">{booking.duration}</span>
						</div>
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-foreground">{booking.client}</p>
								<p class="text-sm text-muted-foreground">PIN: {booking.pinCode}</p>
							</div>
							{#if booking.status === 'in-progress'}
								<Button href="/client-portal" class="glass-button text-sm">
									Client Portal
								</Button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Recent Reviews -->
		<div class="enhanced-card p-6 rounded-xl">
			<h2 class="text-xl font-bold text-foreground mb-6">Recent Reviews</h2>
			<div class="space-y-4">
				{#each recentReviews as review}
					<div class="p-4 bg-accent/20 rounded-lg">
						<div class="flex items-center justify-between mb-2">
							<div class="flex items-center space-x-2">
								{#each Array(5) as _, i}
									<Star class={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
								{/each}
							</div>
							<span class="text-xs text-muted-foreground">{review.date}</span>
						</div>
						<p class="text-sm text-foreground mb-1">"{review.comment}"</p>
						<p class="text-xs text-muted-foreground">- {review.client}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
	
	<!-- Daily Stats -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
		<div class="enhanced-card p-6 rounded-xl text-center">
			<div class="text-3xl font-bold text-primary mb-2">4</div>
			<div class="text-sm text-muted-foreground">Appointments Today</div>
		</div>
		<div class="enhanced-card p-6 rounded-xl text-center">
			<div class="text-3xl font-bold text-green-600 mb-2">6.5</div>
			<div class="text-sm text-muted-foreground">Hours Scheduled</div>
		</div>
		<div class="enhanced-card p-6 rounded-xl text-center">
			<div class="text-3xl font-bold text-yellow-600 mb-2">4.8</div>
			<div class="text-sm text-muted-foreground">Average Rating</div>
		</div>
		<div class="enhanced-card p-6 rounded-xl text-center">
			<div class="text-3xl font-bold text-blue-600 mb-2">23</div>
			<div class="text-sm text-muted-foreground">Total Reviews</div>
		</div>
	</div>
	
	<!-- Quick Access Panel -->
	<div class="enhanced-card p-8 rounded-xl">
		<h2 class="text-2xl font-bold text-foreground mb-6">Quick Access</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<h3 class="text-lg font-semibold text-foreground">Schedule Management</h3>
				<div class="space-y-2">
					<Button href="/my-schedule/edit" variant="outline" class="w-full justify-start glass-button">
						<Calendar class="h-4 w-4 mr-2" />
						Update Availability
					</Button>
					<Button href="/my-schedule/block" variant="outline" class="w-full justify-start glass-button">
						<Clock class="h-4 w-4 mr-2" />
						Block Time Slot
					</Button>
				</div>
			</div>
			<div class="space-y-4">
				<h3 class="text-lg font-semibold text-foreground">Client Interaction</h3>
				<div class="space-y-2">
					<Button href="/client-portal" class="w-full justify-start glass-button">
						<User class="h-4 w-4 mr-2" />
						Open Client Portal
					</Button>
					<Button href="/client-history" variant="outline" class="w-full justify-start glass-button">
						<FileText class="h-4 w-4 mr-2" />
						View Client History
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>
