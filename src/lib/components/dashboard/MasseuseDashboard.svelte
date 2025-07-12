<script lang="ts">
	import { Calendar, Clock, Star, Users, TrendingUp, CheckCircle, XCircle, Plus, Settings, User, BarChart3, BookOpen, Activity } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { authStore } from '$lib/stores/auth';
	import { masseuseData } from '$lib/stores/masseuse';
	import ClientPortal from '$lib/components/ClientPortal.svelte';
	import MasseuseScheduleManager from '$lib/components/masseuse/MasseuseScheduleManager.svelte';
	import MasseuseBookings from '$lib/components/masseuse/MasseuseBookings.svelte';
	import MasseuseAnalytics from '$lib/components/masseuse/MasseuseAnalytics.svelte';
	import MasseuseProfile from '$lib/components/masseuse/MasseuseProfile.svelte';
	
	$: currentMasseuse = $masseuseData.find(m => m.email === $authStore.user?.email);
	
	// Mock data for demonstration
	let todaysAppointments = [
		{
			id: 1,
			clientName: 'John Smith',
			time: '09:00',
			duration: 60,
			service: 'Deep Tissue Massage',
			status: 'confirmed',
			room: 'Rose Room'
		},
		{
			id: 2,
			clientName: 'Sarah Johnson',
			time: '10:30',
			duration: 90,
			service: 'Relaxation Massage',
			status: 'in-progress',
			room: 'Lotus Room'
		},
		{
			id: 3,
			clientName: 'Michael Brown',
			time: '14:30',
			duration: 75,
			service: 'Sports Massage',
			status: 'upcoming',
			room: 'Zen Room'
		}
	];
	
	let recentReviews = [
		{
			id: 1,
			clientName: 'Emma Wilson',
			rating: 5,
			comment: 'Excellent massage! Very professional and skilled.',
			date: '2024-01-19',
			service: 'Swedish Massage'
		},
		{
			id: 2,
			clientName: 'David Lee',
			rating: 4,
			comment: 'Great experience, will definitely come back.',
			date: '2024-01-18',
			service: 'Deep Tissue Massage'
		}
	];
	
	let activeView = 'dashboard'; // dashboard, schedule, bookings, analytics, profile
	let showClientPortal = false;
	
	const navigationItems = [
		{ id: 'dashboard', label: 'Dashboard', icon: Activity },
		{ id: 'schedule', label: 'Schedule', icon: Calendar },
		{ id: 'bookings', label: 'Bookings', icon: BookOpen },
		{ id: 'analytics', label: 'Analytics', icon: BarChart3 },
		{ id: 'profile', label: 'Profile', icon: User }
	];
	
	function formatTime(timeStr: string) {
		return timeStr;
	}
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'confirmed': return 'text-blue-600 bg-blue-100';
			case 'in-progress': return 'text-green-600 bg-green-100';
			case 'upcoming': return 'text-yellow-600 bg-yellow-100';
			default: return 'text-gray-600 bg-gray-100';
		}
	}
	
	function setActiveView(view: string) {
		activeView = view;
	}
	
	function openClientPortal() {
		showClientPortal = true;
	}
	
	function closeClientPortal() {
		showClientPortal = false;
	}
</script>

<div class="min-h-screen bg-background">
	<!-- Navigation -->
	<nav class="bg-background border-b border-border sticky top-0 z-40">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex">
					<div class="flex-shrink-0 flex items-center">
						<h1 class="text-xl font-bold text-foreground">Masseuse Portal</h1>
					</div>
					<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
						{#each navigationItems as item}
							<button
								on:click={() => setActiveView(item.id)}
								class={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
									activeView === item.id
										? 'border-primary text-primary'
										: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
								}`}
							>
								<svelte:component this={item.icon} class="h-4 w-4 mr-2" />
								{item.label}
							</button>
						{/each}
					</div>
				</div>
				<div class="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
					<Button
						on:click={openClientPortal}
						variant="outline"
						class="glass-button"
					>
						<Users class="h-4 w-4 mr-2" />
						Client Portal
					</Button>
					<div class="flex items-center space-x-2">
						<div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
							<User class="h-4 w-4 text-primary" />
						</div>
						<span class="text-sm text-foreground">{currentMasseuse?.name || 'Masseuse'}</span>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Mobile menu -->
		<div class="sm:hidden">
			<div class="pt-2 pb-3 space-y-1 border-t border-border">
				{#each navigationItems as item}
					<button
						on:click={() => setActiveView(item.id)}
						class={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
							activeView === item.id
								? 'bg-primary/10 border-primary text-primary'
								: 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/20 hover:border-border'
						}`}
					>
						<div class="flex items-center">
							<svelte:component this={item.icon} class="h-4 w-4 mr-3" />
							{item.label}
						</div>
					</button>
				{/each}
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			{#if activeView === 'dashboard'}
				<!-- Dashboard Content -->
				<div class="space-y-6">
					<!-- Welcome Section -->
					<div class="enhanced-card p-6 rounded-xl">
						<div class="flex items-center justify-between">
							<div>
								<h2 class="text-2xl font-bold text-foreground">Welcome back, {currentMasseuse?.name || 'Masseuse'}!</h2>
								<p class="text-muted-foreground">Here's what's happening today</p>
							</div>
							<div class="flex items-center space-x-4">
								<div class="text-center">
									<div class="text-lg font-bold text-primary">{todaysAppointments.length}</div>
									<div class="text-xs text-muted-foreground">Today's Sessions</div>
								</div>
								<div class="text-center">
									<div class="text-lg font-bold text-green-600">4.8</div>
									<div class="text-xs text-muted-foreground">Avg Rating</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Quick Actions -->
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<button
							on:click={() => setActiveView('schedule')}
							class="enhanced-card p-6 rounded-xl text-left hover:shadow-lg transition-all duration-200 group"
						>
							<div class="flex items-center space-x-3">
								<div class="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
									<Calendar class="h-6 w-6 text-primary" />
								</div>
								<div>
									<h3 class="font-semibold text-foreground">Schedule</h3>
									<p class="text-sm text-muted-foreground">Manage your availability</p>
								</div>
							</div>
						</button>

						<button
							on:click={() => setActiveView('bookings')}
							class="enhanced-card p-6 rounded-xl text-left hover:shadow-lg transition-all duration-200 group"
						>
							<div class="flex items-center space-x-3">
								<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
									<BookOpen class="h-6 w-6 text-blue-600" />
								</div>
								<div>
									<h3 class="font-semibold text-foreground">Bookings</h3>
									<p class="text-sm text-muted-foreground">View all appointments</p>
								</div>
							</div>
						</button>

						<button
							on:click={() => setActiveView('analytics')}
							class="enhanced-card p-6 rounded-xl text-left hover:shadow-lg transition-all duration-200 group"
						>
							<div class="flex items-center space-x-3">
								<div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
									<BarChart3 class="h-6 w-6 text-green-600" />
								</div>
								<div>
									<h3 class="font-semibold text-foreground">Analytics</h3>
									<p class="text-sm text-muted-foreground">Track performance</p>
								</div>
							</div>
						</button>

						<button
							on:click={() => setActiveView('profile')}
							class="enhanced-card p-6 rounded-xl text-left hover:shadow-lg transition-all duration-200 group"
						>
							<div class="flex items-center space-x-3">
								<div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
									<User class="h-6 w-6 text-purple-600" />
								</div>
								<div>
									<h3 class="font-semibold text-foreground">Profile</h3>
									<p class="text-sm text-muted-foreground">Update your info</p>
								</div>
							</div>
						</button>
					</div>

					<!-- Today's Appointments -->
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div class="enhanced-card p-6 rounded-xl">
							<div class="flex items-center justify-between mb-4">
								<h3 class="text-lg font-semibold text-foreground flex items-center space-x-2">
									<Calendar class="h-5 w-5 text-primary" />
									<span>Today's Appointments</span>
								</h3>
								<Button
									on:click={() => setActiveView('bookings')}
									variant="outline"
									size="sm"
									class="glass-button"
								>
									View All
								</Button>
							</div>
							
							<div class="space-y-3">
								{#each todaysAppointments as appointment}
									<div class="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
										<div class="flex items-center space-x-3">
											<div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
												<User class="h-5 w-5 text-primary" />
											</div>
											<div>
												<div class="font-medium text-foreground">{appointment.clientName}</div>
												<div class="text-sm text-muted-foreground">
													{appointment.service} • {appointment.duration}min
												</div>
											</div>
										</div>
										<div class="text-right">
											<div class="font-medium text-foreground">{formatTime(appointment.time)}</div>
											<div class={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
												{appointment.status}
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<!-- Recent Reviews -->
						<div class="enhanced-card p-6 rounded-xl">
							<div class="flex items-center justify-between mb-4">
								<h3 class="text-lg font-semibold text-foreground flex items-center space-x-2">
									<Star class="h-5 w-5 text-yellow-500" />
									<span>Recent Reviews</span>
								</h3>
								<div class="text-sm text-muted-foreground">4.8/5 Average Rating</div>
							</div>
							
							<div class="space-y-4">
								{#each recentReviews as review}
									<div class="p-3 bg-accent/10 rounded-lg">
										<div class="flex items-center justify-between mb-2">
											<div class="font-medium text-foreground">{review.clientName}</div>
											<div class="flex items-center space-x-1">
												{#each Array(5) as _, i}
													<Star class={`h-3 w-3 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
												{/each}
											</div>
										</div>
										<p class="text-sm text-muted-foreground italic">"{review.comment}"</p>
										<div class="text-xs text-muted-foreground mt-1">
											{review.service} • {review.date}
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{:else if activeView === 'schedule'}
				<MasseuseScheduleManager />
			{:else if activeView === 'bookings'}
				<MasseuseBookings />
			{:else if activeView === 'analytics'}
				<MasseuseAnalytics />
			{:else if activeView === 'profile'}
				<MasseuseProfile />
			{/if}
		</div>
	</main>
</div>

<!-- Client Portal Modal -->
{#if showClientPortal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-background border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
			<div class="p-6 border-b border-border">
				<div class="flex items-center justify-between">
					<h2 class="text-2xl font-bold text-foreground">Client Portal</h2>
					<Button on:click={closeClientPortal} variant="outline" class="glass-button">
						Close
					</Button>
				</div>
			</div>
			<div class="overflow-y-auto">
				<ClientPortal />
			</div>
		</div>
	</div>
{/if}

<style>
	.enhanced-card {
		@apply bg-background border border-border shadow-sm;
	}
	
	.glass-button {
		@apply bg-background/80 backdrop-blur-sm border-border hover:bg-accent/50 transition-all duration-200;
	}
</style>
