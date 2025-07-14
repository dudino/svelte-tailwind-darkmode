<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser, getPocketBaseClient } from '$lib/stores';
	import Card from '$lib/components/ui/card/card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Calendar, FileText, User, Clock, MapPin, TrendingUp } from 'lucide-svelte';

	// State variables
	let stats = {
		upcomingBookings: 0,
		pendingSchedules: 0,
		totalBookings: 0,
		confirmedSchedules: 0
	};
	let recentBookings = [];
	let upcomingSchedules = [];
	let loading = true;

	// Load dashboard data
	async function loadDashboardData() {
		if (!$currentUser) return;
		
		try {
			const pb = getPocketBaseClient();
			if (!pb) throw new Error('PocketBase not initialized');

			// Load upcoming bookings (next 7 days)
			const today = new Date();
			const nextWeek = new Date();
			nextWeek.setDate(today.getDate() + 7);

			const bookingsResult = await pb.collection('bookings').getList(1, 10, {
				filter: `user_id = "${$currentUser.id}" && date >= "${today.toISOString().split('T')[0]}" && date <= "${nextWeek.toISOString().split('T')[0]}"`,
				expand: 'client_id,room_id,room_id.location_id',
				sort: 'date,start_time'
			});

			recentBookings = bookingsResult.items;
			stats.upcomingBookings = bookingsResult.items.length;

			// Load total bookings count
			const totalBookingsResult = await pb.collection('bookings').getList(1, 1, {
				filter: `user_id = "${$currentUser.id}"`,
			});
			stats.totalBookings = totalBookingsResult.totalItems;

			// Load upcoming schedules (next 7 days)
			const schedulesResult = await pb.collection('schedules').getList(1, 10, {
				filter: `user_id = "${$currentUser.id}" && date >= "${today.toISOString().split('T')[0]}" && date <= "${nextWeek.toISOString().split('T')[0]}"`,
				expand: 'room_id,room_id.location_id',
				sort: 'date,start_time'
			});

			upcomingSchedules = schedulesResult.items;
			stats.pendingSchedules = schedulesResult.items.filter(s => !s.confirmed_by).length;
			stats.confirmedSchedules = schedulesResult.items.filter(s => s.confirmed_by).length;

		} catch (error) {
			console.error('Error loading dashboard data:', error);
		}
	}

	// Format date for display
	function formatDate(dateStr) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			weekday: 'short'
		});
	}

	// Format time for display
	function formatTime(timeStr) {
		if (!timeStr) return '';
		return timeStr;
	}

	// Get client display name
	function getClientName(booking) {
		const client = booking.expand?.client_id;
		if (!client) return 'Unknown Client';
		
		if (client.nickname) return client.nickname;
		if (client.first_name && client.last_name) {
			return `${client.first_name} ${client.last_name}`;
		}
		if (client.first_name) return client.first_name;
		return client.phone_number || 'Unknown Client';
	}

	// Get schedule status
	function getScheduleStatus(schedule) {
		if (!schedule.is_active && schedule.confirmed_by) {
			return { label: 'Cancelled', variant: 'destructive' };
		}
		if (schedule.confirmed_by) {
			return { label: 'Confirmed', variant: 'default' };
		}
		return { label: 'Pending', variant: 'secondary' };
	}

	onMount(async () => {
		await loadDashboardData();
		loading = false;
	});
</script>

<div class="max-w-6xl mx-auto space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold gradient-text">Welcome back, {$currentUser?.name || 'User'}!</h1>
		<p class="text-muted-foreground mt-1">
			Here's an overview of your schedule and bookings
		</p>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-center">
				<div class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
				<p class="text-muted-foreground">Loading dashboard...</p>
			</div>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
						<FileText class="h-5 w-5 text-blue-600 dark:text-blue-400" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Upcoming Bookings</p>
						<p class="text-2xl font-bold">{stats.upcomingBookings}</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
						<Clock class="h-5 w-5 text-orange-600 dark:text-orange-400" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Pending Schedules</p>
						<p class="text-2xl font-bold">{stats.pendingSchedules}</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
						<Calendar class="h-5 w-5 text-green-600 dark:text-green-400" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Confirmed Schedules</p>
						<p class="text-2xl font-bold">{stats.confirmedSchedules}</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
						<TrendingUp class="h-5 w-5 text-purple-600 dark:text-purple-400" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Total Bookings</p>
						<p class="text-2xl font-bold">{stats.totalBookings}</p>
					</div>
				</div>
			</Card>
		</div>

		<!-- Quick Actions -->
		<Card class="p-6">
			<h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
			<div class="flex flex-wrap gap-3">
				<Button href="/user/schedule" class="flex items-center gap-2">
					<Calendar class="h-4 w-4" />
					View Schedule
				</Button>
				<Button href="/user/bookings" variant="outline" class="flex items-center gap-2">
					<FileText class="h-4 w-4" />
					View Bookings
				</Button>
				<Button href="/user/profile" variant="outline" class="flex items-center gap-2">
					<User class="h-4 w-4" />
					Edit Profile
				</Button>
			</div>
		</Card>

		<!-- Content Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Upcoming Bookings -->
			<Card class="p-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold">Upcoming Bookings</h2>
					<Button href="/user/bookings" variant="outline" size="sm">
						View All
					</Button>
				</div>
				
				{#if recentBookings.length === 0}
					<div class="text-center py-8 text-muted-foreground">
						<FileText class="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p class="text-sm">No upcoming bookings</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each recentBookings.slice(0, 5) as booking}
							<div class="p-3 border rounded-lg">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-1">
											<span class="font-medium text-sm">#{booking.booking_number}</span>
											<Badge variant={booking.is_confirmed ? 'default' : 'secondary'}>
												{booking.is_confirmed ? 'Confirmed' : 'Pending'}
											</Badge>
										</div>
										
										<div class="space-y-1 text-xs text-muted-foreground">
											<div class="flex items-center gap-1">
												<Calendar class="h-3 w-3" />
												<span>{formatDate(booking.date)}</span>
											</div>
											<div class="flex items-center gap-1">
												<Clock class="h-3 w-3" />
												<span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
											</div>
											<div class="flex items-center gap-1">
												<User class="h-3 w-3" />
												<span>{getClientName(booking)}</span>
											</div>
											<div class="flex items-center gap-1">
												<MapPin class="h-3 w-3" />
												<span>{booking.expand?.room_id?.expand?.location_id?.name || 'Unknown'}</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card>

			<!-- Upcoming Schedules -->
			<Card class="p-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold">Upcoming Schedules</h2>
					<Button href="/user/schedule" variant="outline" size="sm">
						View All
					</Button>
				</div>
				
				{#if upcomingSchedules.length === 0}
					<div class="text-center py-8 text-muted-foreground">
						<Calendar class="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p class="text-sm">No upcoming schedules</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each upcomingSchedules.slice(0, 5) as schedule}
							{@const status = getScheduleStatus(schedule)}
							<div class="p-3 border rounded-lg">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-1">
											<Badge variant={status.variant}>{status.label}</Badge>
										</div>
										
										<div class="space-y-1 text-xs text-muted-foreground">
											<div class="flex items-center gap-1">
												<Calendar class="h-3 w-3" />
												<span>{formatDate(schedule.date)}</span>
											</div>
											<div class="flex items-center gap-1">
												<Clock class="h-3 w-3" />
												<span>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
											</div>
											<div class="flex items-center gap-1">
												<MapPin class="h-3 w-3" />
												<span>{schedule.expand?.room_id?.expand?.location_id?.name || 'Unknown'}</span>
											</div>
											<div class="text-xs font-medium">
												{schedule.expand?.room_id?.name || 'Unknown Room'}
											</div>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card>
		</div>
	{/if}
</div>
