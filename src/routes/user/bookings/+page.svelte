<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser, getPocketBaseClient } from '$lib/stores';
	import Card from '$lib/components/ui/card/card.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Calendar, Clock, MapPin, User, Phone, CheckCircle, XCircle, AlertCircle, TrendingUp, Users, Target, Award, ChevronRight } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// State variables
	let allBookings = [];
	let todayBookings = [];
	let upcomingBookings = [];
	let pastBookings = [];
	let loading = true;
	let stats = {
		totalBookings: 0,
		todayCount: 0,
		weekCount: 0,
		monthCount: 0,
		confirmedRate: 0,
		cancelledRate: 0,
		avgDuration: 0,
		uniqueClients: 0
	};

	// Load user bookings
	async function loadBookings() {
		if (!$currentUser) return;
		
		try {
			const pb = getPocketBaseClient();
			if (!pb) throw new Error('PocketBase not initialized');

			const result = await pb.collection('bookings').getList(1, 200, {
				filter: `user_id = "${$currentUser.id}"`,
				expand: 'client_id,room_id,room_id.location_id,service_id,confirmed_by,cancelled_by',
				sort: '-date,-start_time'
			});

			allBookings = result.items;
			organizeBookings();
			calculateStats();
		} catch (error) {
			console.error('Error loading bookings:', error);
			toast.error('Failed to load bookings');
		}
	}

	// Organize bookings by date
	function organizeBookings() {
		const today = new Date();
		const todayStr = today.toISOString().split('T')[0];
		
		todayBookings = allBookings.filter(booking => {
			const bookingDate = booking.date.split('T')[0];
			return bookingDate === todayStr;
		});

		upcomingBookings = allBookings.filter(booking => {
			const bookingDate = new Date(booking.date);
			return bookingDate > today && !booking.cancelled_at;
		}).slice(0, 5); // Show next 5 upcoming

		pastBookings = allBookings.filter(booking => {
			const bookingDate = new Date(booking.date);
			return bookingDate < today;
		});
	}

	// Calculate statistics
	function calculateStats() {
		const today = new Date();
		const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
		const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
		
		stats.totalBookings = allBookings.length;
		stats.todayCount = todayBookings.length;
		
		stats.weekCount = allBookings.filter(booking => {
			const bookingDate = new Date(booking.date);
			return bookingDate >= oneWeekAgo;
		}).length;
		
		stats.monthCount = allBookings.filter(booking => {
			const bookingDate = new Date(booking.date);
			return bookingDate >= oneMonthAgo;
		}).length;

		const confirmed = allBookings.filter(booking => booking.is_confirmed && !booking.cancelled_at).length;
		const cancelled = allBookings.filter(booking => booking.cancelled_at).length;
		
		stats.confirmedRate = allBookings.length > 0 ? Math.round((confirmed / allBookings.length) * 100) : 0;
		stats.cancelledRate = allBookings.length > 0 ? Math.round((cancelled / allBookings.length) * 100) : 0;

		// Calculate average duration
		const totalDuration = allBookings.reduce((sum, booking) => sum + (booking.duration_minutes || 0), 0);
		stats.avgDuration = allBookings.length > 0 ? Math.round(totalDuration / allBookings.length) : 0;

		// Count unique clients
		const uniqueClientIds = new Set(allBookings.map(booking => booking.client_id));
		stats.uniqueClients = uniqueClientIds.size;
	}

	// Format date for display
	function formatDate(dateStr) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// Format short date
	function formatShortDate(dateStr) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}

	// Format time for display
	function formatTime(timeStr) {
		if (!timeStr) return '';
		return timeStr;
	}

	// Check if booking is today
	function isToday(dateStr) {
		const today = new Date().toISOString().split('T')[0];
		return dateStr.split('T')[0] === today;
	}

	// Check if booking is upcoming today
	function isUpcomingToday(booking) {
		if (!isToday(booking.date)) return false;
		
		const now = new Date();
		const [hours, minutes] = booking.start_time.split(':').map(Number);
		const bookingTime = new Date();
		bookingTime.setHours(hours, minutes, 0, 0);
		
		return bookingTime > now;
	}

	// Get booking status
	function getBookingStatus(booking) {
		if (booking.cancelled_at) {
			return {
				label: 'Cancelled',
				variant: 'destructive',
				icon: XCircle,
				color: 'border-red-500'
			};
		}
		if (booking.is_confirmed) {
			return {
				label: 'Confirmed',
				variant: 'default',
				icon: CheckCircle,
				color: 'border-green-500'
			};
		}
		return {
			label: 'Pending',
			variant: 'secondary',
			icon: AlertCircle,
			color: 'border-orange-500'
		};
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

	onMount(async () => {
		await loadBookings();
		loading = false;
	});
</script>

<div class="space-y-6">
	<!-- Bookings Header -->
	<Card class="p-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold flex items-center gap-2">
					<Calendar class="h-5 w-5" />
					My Bookings
				</h2>
				<p class="text-sm text-muted-foreground mt-1">
					Manage your client appointments and track your booking performance
				</p>
			</div>
		</div>
	</Card>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-center">
				<div class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
				<p class="text-muted-foreground">Loading bookings...</p>
			</div>
		</div>
	{:else}
		<!-- Stats Overview -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
						<Calendar class="h-5 w-5 text-blue-600 dark:text-blue-400" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Total Bookings</p>
						<p class="text-2xl font-bold">{stats.totalBookings}</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
						<Target class="h-5 w-5 text-green-600 dark:text-green-400" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">This Month</p>
						<p class="text-2xl font-bold">{stats.monthCount}</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
						<Users class="h-5 w-5 text-purple-600 dark:text-purple-400" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Unique Clients</p>
						<p class="text-2xl font-bold">{stats.uniqueClients}</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
						<Award class="h-5 w-5 text-orange-600 dark:text-orange-400" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Confirm Rate</p>
						<p class="text-2xl font-bold">{stats.confirmedRate}%</p>
					</div>
				</div>
			</Card>
		</div>

		<!-- Today's Bookings - Highlighted Section -->
		{#if todayBookings.length > 0}
			<Card class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
				<div class="flex items-center gap-2 mb-4">
					<div class="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
						<Clock class="h-5 w-5 text-blue-600 dark:text-blue-400" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100">Today's Schedule</h3>
						<p class="text-sm text-blue-700 dark:text-blue-300">You have {todayBookings.length} appointment{todayBookings.length !== 1 ? 's' : ''} today</p>
					</div>
				</div>

				<div class="space-y-3">
					{#each todayBookings as booking}
						{@const status = getBookingStatus(booking)}
						{@const isUpcoming = isUpcomingToday(booking)}
						<Card class="p-4 {isUpcoming ? 'bg-white dark:bg-gray-900 border-2 border-blue-300 dark:border-blue-600 shadow-md' : 'bg-white/80 dark:bg-gray-900/80'}">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-4">
									<div class="text-center min-w-[60px]">
										<div class="text-lg font-bold {isUpcoming ? 'text-blue-600 dark:text-blue-400' : ''}">
											{formatTime(booking.start_time)}
										</div>
										<div class="text-xs text-muted-foreground">
											{booking.duration_minutes}min
										</div>
									</div>
									
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-1">
											<h4 class="font-semibold">{getClientName(booking)}</h4>
											{#if isUpcoming}
												<Badge variant="outline" class="text-blue-600 border-blue-300">
													Upcoming
												</Badge>
											{/if}
										</div>
										<div class="flex items-center gap-4 text-sm text-muted-foreground">
											<span class="flex items-center gap-1">
												<MapPin class="h-3 w-3" />
												{booking.expand?.room_id?.name || 'Unknown Room'}
											</span>
											{#if booking.expand?.service_id}
												<span>{booking.expand.service_id.name}</span>
											{/if}
										</div>
									</div>
								</div>
								
								<Badge variant={status.variant} class="flex items-center gap-1">
									<svelte:component this={status.icon} class="h-3 w-3" />
									{status.label}
								</Badge>
							</div>
						</Card>
					{/each}
				</div>
			</Card>
		{:else}
			<Card class="p-6 text-center bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
				<div class="flex flex-col items-center gap-2">
					<div class="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
						<CheckCircle class="h-6 w-6 text-green-600 dark:text-green-400" />
					</div>
					<h3 class="text-lg font-semibold text-green-900 dark:text-green-100">No Appointments Today</h3>
					<p class="text-sm text-green-700 dark:text-green-300">Enjoy your free day!</p>
				</div>
			</Card>
		{/if}

		<!-- Upcoming Bookings -->
		{#if upcomingBookings.length > 0}
			<Card class="p-6">
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg font-semibold flex items-center gap-2">
						<TrendingUp class="h-5 w-5" />
						Upcoming Appointments
					</h3>
					<Badge variant="outline">{upcomingBookings.length} upcoming</Badge>
				</div>
				
				<div class="space-y-3">
					{#each upcomingBookings.slice(0, 5) as booking}
						{@const status = getBookingStatus(booking)}
						<div class="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
							<div class="flex items-center gap-3">
								<div class="text-center min-w-[80px]">
									<div class="text-sm font-medium">{formatShortDate(booking.date)}</div>
									<div class="text-xs text-muted-foreground">{formatTime(booking.start_time)}</div>
								</div>
								<div>
									<div class="font-medium">{getClientName(booking)}</div>
									<div class="text-sm text-muted-foreground flex items-center gap-2">
										<span>{booking.expand?.room_id?.name}</span>
										{#if booking.expand?.service_id}
											<span>• {booking.expand.service_id.name}</span>
										{/if}
									</div>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<Badge variant={status.variant} class="flex items-center gap-1">
									<svelte:component this={status.icon} class="h-3 w-3" />
									{status.label}
								</Badge>
								<ChevronRight class="h-4 w-4 text-muted-foreground" />
							</div>
						</div>
					{/each}
				</div>
			</Card>
		{/if}

		<!-- Booking History & Additional Stats -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Quick Stats -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-4">Quick Stats</h3>
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">This Week</span>
						<span class="font-semibold">{stats.weekCount} bookings</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Avg Duration</span>
						<span class="font-semibold">{stats.avgDuration} min</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Cancellation Rate</span>
						<span class="font-semibold text-red-600 dark:text-red-400">{stats.cancelledRate}%</span>
					</div>
				</div>
			</Card>

			<!-- Recent Activity -->
			<Card class="lg:col-span-2 p-6">
				<h3 class="text-lg font-semibold mb-4">Recent Bookings</h3>
				<div class="space-y-3">
					{#each allBookings.slice(0, 6) as booking}
						{@const status = getBookingStatus(booking)}
						<div class="flex items-center justify-between p-3 border rounded-lg">
							<div class="flex items-center gap-3">
								<div class="text-center min-w-[80px]">
									<div class="text-sm font-medium">{formatShortDate(booking.date)}</div>
									<div class="text-xs text-muted-foreground">{formatTime(booking.start_time)}</div>
								</div>
								<div>
									<div class="font-medium">{getClientName(booking)}</div>
									<div class="text-sm text-muted-foreground">
										{booking.expand?.room_id?.expand?.location_id?.name} • {booking.expand?.room_id?.name}
									</div>
								</div>
							</div>
							<Badge variant={status.variant} class="flex items-center gap-1">
								<svelte:component this={status.icon} class="h-3 w-3" />
								{status.label}
							</Badge>
						</div>
					{/each}
				</div>
			</Card>
		</div>

		{#if allBookings.length === 0}
			<Card class="p-8 text-center">
				<Calendar class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
				<h3 class="text-lg font-semibold mb-2">No Bookings Found</h3>
				<p class="text-muted-foreground">
					You don't have any bookings yet. Bookings will appear here when clients book appointments with you.
				</p>
			</Card>
		{/if}
	{/if}
</div>
