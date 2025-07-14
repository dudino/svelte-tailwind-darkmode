<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser, getPocketBaseClient } from '$lib/stores';
	import Card from '$lib/components/ui/card/card.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Calendar, Clock, MapPin, User, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// State variables
	let bookings = [];
	let loading = true;

	// Load user bookings
	async function loadBookings() {
		if (!$currentUser) return;
		
		try {
			const pb = getPocketBaseClient();
			if (!pb) throw new Error('PocketBase not initialized');

			const result = await pb.collection('bookings').getList(1, 50, {
				filter: `user_id = "${$currentUser.id}"`,
				expand: 'client_id,room_id,room_id.location_id,service_id,confirmed_by,cancelled_by',
				sort: '-date,-start_time'
			});

			bookings = result.items;
		} catch (error) {
			console.error('Error loading bookings:', error);
			toast.error('Failed to load bookings');
		}
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

	// Format time for display
	function formatTime(timeStr) {
		if (!timeStr) return '';
		return timeStr;
	}

	// Get booking status
	function getBookingStatus(booking) {
		if (booking.cancelled_at) {
			return {
				label: 'Cancelled',
				variant: 'destructive',
				icon: XCircle
			};
		}
		if (booking.is_confirmed) {
			return {
				label: 'Confirmed',
				variant: 'default',
				icon: CheckCircle
			};
		}
		return {
			label: 'Pending',
			variant: 'secondary',
			icon: AlertCircle
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
					View all your client bookings and appointments
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
	{:else if bookings.length === 0}
		<Card class="p-8 text-center">
			<Calendar class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
			<h3 class="text-lg font-semibold mb-2">No Bookings Found</h3>
			<p class="text-muted-foreground">
				You don't have any bookings yet. Bookings will appear here when clients book appointments with you.
			</p>
		</Card>
	{:else}
		<!-- Bookings List -->
		<div class="space-y-4">
			{#each bookings as booking}
				{@const status = getBookingStatus(booking)}
				<Card class="p-6">
					<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
						<div class="flex-1 space-y-3">
							<!-- Booking Header -->
							<div class="flex items-start justify-between">
								<div>
									<h3 class="text-lg font-semibold">
										Booking #{booking.booking_number}
									</h3>
									<div class="flex items-center gap-2 mt-1">
										<Badge variant={status.variant} class="flex items-center gap-1">
											<svelte:component this={status.icon} class="h-3 w-3" />
											{status.label}
										</Badge>
									</div>
								</div>
							</div>

							<!-- Booking Details -->
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<!-- Date & Time -->
								<div class="space-y-2">
									<div class="flex items-center gap-2 text-sm">
										<Calendar class="h-4 w-4 text-muted-foreground" />
										<span class="font-medium">Date:</span>
										<span>{formatDate(booking.date)}</span>
									</div>
									<div class="flex items-center gap-2 text-sm">
										<Clock class="h-4 w-4 text-muted-foreground" />
										<span class="font-medium">Time:</span>
										<span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
									</div>
								</div>

								<!-- Location & Room -->
								<div class="space-y-2">
									<div class="flex items-center gap-2 text-sm">
										<MapPin class="h-4 w-4 text-muted-foreground" />
										<span class="font-medium">Location:</span>
										<span>{booking.expand?.room_id?.expand?.location_id?.name || 'Unknown'}</span>
									</div>
									<div class="flex items-center gap-2 text-sm">
										<span class="font-medium">Room:</span>
										<span>{booking.expand?.room_id?.name || 'Unknown'}</span>
									</div>
								</div>
							</div>

							<!-- Client Information -->
							<div class="border-t pt-3">
								<div class="flex items-center gap-2 text-sm mb-2">
									<User class="h-4 w-4 text-muted-foreground" />
									<span class="font-medium">Client:</span>
									<span>{getClientName(booking)}</span>
								</div>
								{#if booking.expand?.client_id?.phone_number}
									<div class="flex items-center gap-2 text-sm">
										<Phone class="h-4 w-4 text-muted-foreground" />
										<span class="font-medium">Phone:</span>
										<span>{booking.expand.client_id.phone_number}</span>
									</div>
								{/if}
							</div>

							<!-- Service Information -->
							{#if booking.expand?.service_id}
								<div class="border-t pt-3">
									<div class="text-sm">
										<span class="font-medium">Service:</span>
										<span>{booking.expand.service_id.name}</span>
									</div>
									{#if booking.expand.service_id.description}
										<p class="text-xs text-muted-foreground mt-1">
											{booking.expand.service_id.description}
										</p>
									{/if}
								</div>
							{/if}

							<!-- Special Requests -->
							{#if booking.special_requests}
								<div class="border-t pt-3">
									<div class="text-sm">
										<span class="font-medium">Special Requests:</span>
									</div>
									<p class="text-sm text-muted-foreground mt-1">
										{booking.special_requests}
									</p>
								</div>
							{/if}

							<!-- Cancellation Info -->
							{#if booking.cancelled_at}
								<div class="border-t pt-3 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
									<div class="text-sm text-red-800 dark:text-red-200">
										<span class="font-medium">Cancelled:</span>
										{new Date(booking.cancelled_at).toLocaleDateString()}
									</div>
									{#if booking.cancellation_reason}
										<p class="text-sm text-red-700 dark:text-red-300 mt-1">
											Reason: {booking.cancellation_reason}
										</p>
									{/if}
								</div>
							{/if}
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
