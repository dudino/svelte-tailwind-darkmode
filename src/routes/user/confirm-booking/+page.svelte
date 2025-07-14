<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser, getPocketBaseClient } from '$lib/stores';
	import Card from '$lib/components/ui/card/card.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Shield, Star, Send, CheckCircle, Calendar, Clock, MapPin, User, Phone, AlertCircle, X } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// State variables
	let currentStep: 'pin' | 'review' | 'success' = 'pin';
	let pinCode = '';
	let pinInputs = ['', '', '', ''];
	let booking: any = null;
	let isLoading = false;
	let rating = 0;
	let reviewTitle = '';
	let reviewContent = '';
	let isAnonymous = false;

	// Close modal and go back
	function goBack() {
		window.history.back();
	}

	// Handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			goBack();
		}
	}

	// PIN input handling
	function handlePinInput(event: Event, index: number) {
		const target = event.target as HTMLInputElement;
		if (!target) return;
		
		const value = target.value;
		
		if (!/^\d$/.test(value) && value !== '') {
			target.value = '';
			return;
		}

		pinInputs[index] = value;
		pinCode = pinInputs.join('');

		// Auto-focus next input
		if (value && index < 3) {
			const nextInput = document.getElementById(`pin-${index + 1}`) as HTMLInputElement;
			nextInput?.focus();
		}

		// Auto-submit when all 4 digits are entered
		if (pinCode.length === 4) {
			setTimeout(handlePinSubmit, 300);
		}
	}

	function handlePinKeydown(event: KeyboardEvent, index: number) {
		// Handle backspace
		if (event.key === 'Backspace' && !pinInputs[index] && index > 0) {
			const prevInput = document.getElementById(`pin-${index - 1}`) as HTMLInputElement;
			prevInput?.focus();
		}
	}

	// Verify PIN and load booking
	async function handlePinSubmit() {
		if (pinCode.length !== 4) {
			toast.error('Please enter a 4-digit PIN');
			return;
		}

		if (!$currentUser) {
			toast.error('User not authenticated');
			return;
		}

		isLoading = true;
		try {
			const pb = getPocketBaseClient();
			if (!pb) throw new Error('PocketBase not initialized');

			// Debug: Log current user
			console.log('Current user:', $currentUser);
			console.log('Searching for PIN:', pinCode);

			// Find booking by PIN - more flexible search
			const result = await pb.collection('bookings').getList(1, 10, {
				filter: `pin_code = "${pinCode}"`,
				expand: 'client_id,room_id,room_id.location_id,service_id'
			});

			console.log('Search results:', result);

			if (result.items.length === 0) {
				toast.error('No booking found with this PIN');
				resetPin();
				return;
			}

			// Check if any booking belongs to the current user
			const userBooking = result.items.find(b => b.user_id === $currentUser.id);
			
			if (!userBooking) {
				toast.error('PIN found but not associated with your account');
				resetPin();
				return;
			}

			booking = userBooking;
			console.log('Found booking:', booking);

			// Check if booking is completed
			if (!booking.is_confirmed || booking.cancelled_at) {
				toast.error('This booking is not eligible for review');
				resetPin();
				return;
			}

			// Check if PIN was already used
			if (booking.pin_used_at) {
				toast.error('This PIN has already been used');
				resetPin();
				return;
			}

			// Check if review already exists
			const existingReview = await pb.collection('reviews').getList(1, 1, {
				filter: `booking_id = "${booking.id}"`
			});

			if (existingReview.items.length > 0) {
				toast.error('A review has already been submitted for this booking');
				resetPin();
				return;
			}

			// Mark PIN as used
			await pb.collection('bookings').update(booking.id, {
				pin_used_at: new Date().toISOString()
			});

			currentStep = 'review';
			toast.success('PIN verified! Please leave your review.');

		} catch (error) {
			console.error('Error verifying PIN:', error);
			toast.error('Failed to verify PIN. Please try again.');
			resetPin();
		} finally {
			isLoading = false;
		}
	}

	// Submit review
	async function handleReviewSubmit() {
		if (rating === 0) {
			toast.error('Please select a rating');
			return;
		}

		if (!booking) {
			toast.error('No booking selected');
			return;
		}

		isLoading = true;
		try {
			const pb = getPocketBaseClient();
			if (!pb) throw new Error('PocketBase not initialized');

			// Create review
			await pb.collection('reviews').create({
				booking_id: booking.id,
				client_id: booking.client_id,
				user_id: booking.user_id,
				rating: rating,
				title: reviewTitle.trim() || null,
				content: reviewContent.trim() || null,
				is_anonymous: isAnonymous,
				is_published: true
			});

			currentStep = 'success';
			toast.success('Thank you for your review!');

			// Auto-close and go back after 3 seconds
			setTimeout(() => {
				goBack();
			}, 3000);

		} catch (error) {
			console.error('Error submitting review:', error);
			toast.error('Failed to submit review. Please try again.');
		} finally {
			isLoading = false;
		}
	}

	// Helper functions
	function resetPin() {
		pinCode = '';
		pinInputs = ['', '', '', ''];
		// Clear all inputs
		for (let i = 0; i < 4; i++) {
			const input = document.getElementById(`pin-${i}`) as HTMLInputElement;
			if (input) input.value = '';
		}
		// Focus first input
		setTimeout(() => {
			const firstInput = document.getElementById('pin-0') as HTMLInputElement;
			firstInput?.focus();
		}, 100);
	}

	function resetForm() {
		currentStep = 'pin';
		booking = null;
		rating = 0;
		reviewTitle = '';
		reviewContent = '';
		isAnonymous = false;
		resetPin();
	}

	function setRating(stars: number) {
		rating = stars;
	}

	// Create test booking for development
	async function createTestBooking() {
		if (!$currentUser) {
			toast.error('User not authenticated');
			return;
		}

		try {
			const pb = getPocketBaseClient();
			if (!pb) throw new Error('PocketBase not initialized');

			// First, let's check what we have and create missing data
			console.log('Checking existing data...');
			
			// Get or create a location
			let location;
			const locations = await pb.collection('locations').getList(1, 1);
			if (locations.items.length === 0) {
				console.log('Creating test location...');
				location = await pb.collection('locations').create({
					name: 'Test Location',
					address: '123 Test St',
					city: 'Test City',
					is_active: true
				});
				console.log('Location created:', location.id);
			} else {
				location = locations.items[0];
				console.log('Using existing location:', location.id);
			}

			// Get or create a room
			let room;
			const rooms = await pb.collection('rooms').getList(1, 1, {
				filter: `location_id = "${location.id}"`
			});
			if (rooms.items.length === 0) {
				console.log('Creating test room...');
				room = await pb.collection('rooms').create({
					name: 'Test Room',
					location_id: location.id,
					capacity: 2,
					is_active: true
				});
				console.log('Room created:', room.id);
			} else {
				room = rooms.items[0];
				console.log('Using existing room:', room.id);
			}

			// Get or create a client
			let client;
			const clients = await pb.collection('clients').getList(1, 1);
			if (clients.items.length === 0) {
				console.log('Creating test client...');
				client = await pb.collection('clients').create({
					first_name: 'Test',
					last_name: 'Client',
					email: 'test@example.com',
					phone_number: '+1234567890',
					is_active: true
				});
				console.log('Client created:', client.id);
			} else {
				client = clients.items[0];
				console.log('Using existing client:', client.id);
			}

			const testPin = Math.floor(1000 + Math.random() * 9000).toString();

			// Create test booking
			console.log('Creating test booking...');
			const testBooking = await pb.collection('bookings').create({
				user_id: $currentUser.id,
				client_id: client.id,
				room_id: room.id,
				date: new Date().toISOString().split('T')[0],
				start_time: '10:00',
				end_time: '11:00',
				is_confirmed: true,
				pin_code: testPin,
				notes: 'Test booking for PIN verification'
			});

			console.log('Test booking created:', testBooking);
			toast.success(`Test booking created with PIN: ${testPin}`);
			
			// Auto-fill the PIN
			pinCode = testPin;
			pinInputs = testPin.split('');
			for (let i = 0; i < 4; i++) {
				const input = document.getElementById(`pin-${i}`) as HTMLInputElement;
				if (input) input.value = pinInputs[i];
			}

		} catch (error) {
			console.error('Error creating test booking:', error);
			toast.error(`Failed to create test booking: ${error.message}`);
		}
	}

	// Debug existing bookings
	async function debugBookings() {
		if (!$currentUser) {
			toast.error('User not authenticated');
			return;
		}

		try {
			const pb = getPocketBaseClient();
			if (!pb) throw new Error('PocketBase not initialized');

			// Get all bookings for this user
			const userBookings = await pb.collection('bookings').getList(1, 50, {
				filter: `user_id = "${$currentUser.id}"`,
				expand: 'client_id,room_id'
			});

			console.log('User bookings:', userBookings.items);

			// Get all bookings with PIN codes
			const pinBookings = await pb.collection('bookings').getList(1, 50, {
				filter: `pin_code != ""`,
				expand: 'client_id,room_id'
			});

			console.log('All bookings with PINs:', pinBookings.items);

			toast.success(`Found ${userBookings.items.length} user bookings, ${pinBookings.items.length} with PINs. Check console for details.`);

		} catch (error) {
			console.error('Error debugging bookings:', error);
			toast.error('Failed to debug bookings');
		}
	}

	// Format functions
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatTime(timeStr: string) {
		if (!timeStr) return '';
		return timeStr;
	}

	function getClientName(booking: any) {
		const client = booking.expand?.client_id;
		if (!client) return 'Unknown Client';
		
		if (client.nickname) return client.nickname;
		if (client.first_name && client.last_name) {
			return `${client.first_name} ${client.last_name}`;
		}
		if (client.first_name) return client.first_name;
		return client.phone_number || 'Unknown Client';
	}

	onMount(() => {
		// Add global keydown listener for escape key
		window.addEventListener('keydown', handleKeydown);
		
		// Focus first PIN input on mount
		setTimeout(() => {
			const firstInput = document.getElementById('pin-0') as HTMLInputElement;
			firstInput?.focus();
		}, 100);
		
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<!-- Full Screen Page Overlay -->
<div class="fixed inset-0 z-[9999] bg-background">
	<!-- Page Header -->
	<div class="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm">
		<h2 class="text-xl font-bold flex items-center gap-2">
			<Shield class="h-5 w-5" />
			Confirm Booking
		</h2>
		<Button on:click={goBack} variant="ghost" size="icon">
			<X class="h-5 w-5" />
		</Button>
	</div>

	<!-- Page Content -->
	<div class="h-full overflow-y-auto pb-20">
		<div class="container mx-auto max-w-4xl p-6">
			<!-- PIN Entry Step -->
			{#if currentStep === 'pin'}
				<div class="max-w-md mx-auto">
					<div class="text-center mb-8">
						<div class="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
							<Shield class="h-12 w-12 text-primary" />
						</div>
						<h3 class="text-3xl font-bold mb-4">Enter Booking PIN</h3>
						<p class="text-muted-foreground text-lg">
							Please enter the 4-digit PIN provided with your booking confirmation
						</p>
					</div>

					<div class="space-y-8">
						<!-- PIN Input -->
						<div class="flex justify-center gap-4">
							{#each Array(4) as _, i}
								<input
									id="pin-{i}"
									type="text"
									maxlength="1"
									class="w-16 h-16 text-center text-3xl font-bold border-2 border-border rounded-lg bg-background focus:border-primary focus:outline-none transition-colors"
									on:input={(e) => handlePinInput(e, i)}
									on:keydown={(e) => handlePinKeydown(e, i)}
									disabled={isLoading}
								/>
							{/each}
						</div>

						<Button 
							on:click={handlePinSubmit}
							disabled={pinCode.length !== 4 || isLoading}
							class="w-full text-lg py-4"
							size="lg"
						>
							{#if isLoading}
								<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
							{/if}
							Verify PIN
						</Button>

						<div class="text-center">
							<p class="text-sm text-muted-foreground">
								Your PIN was provided when your booking was confirmed.<br>
								Contact your service provider if you need assistance.
							</p>
							
							<!-- Development Test Button -->
							{#if import.meta.env.DEV}
								<div class="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
									<p class="text-xs text-yellow-800 dark:text-yellow-200 mb-2">Development Mode</p>
									<div class="flex gap-2 justify-center">
										<Button 
											on:click={createTestBooking}
											variant="outline"
											size="sm"
											class="text-xs"
										>
											Create Test Booking
										</Button>
										<Button 
											on:click={debugBookings}
											variant="outline"
											size="sm"
											class="text-xs"
										>
											Debug Bookings
										</Button>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<!-- Review Step -->
			{#if currentStep === 'review' && booking}
					<div class="max-w-4xl mx-auto space-y-8">
						<!-- Booking Details -->
						<div class="p-6 bg-accent/10 rounded-xl">
							<h4 class="text-xl font-semibold mb-6 flex items-center gap-2">
								<Calendar class="h-6 w-6" />
								Booking Details
							</h4>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div class="space-y-4">
									<div class="flex items-center gap-3 text-lg">
										<Calendar class="h-5 w-5 text-muted-foreground" />
										<span class="font-medium">Date:</span>
										<span>{formatDate(booking.date)}</span>
									</div>
									<div class="flex items-center gap-3 text-lg">
										<Clock class="h-5 w-5 text-muted-foreground" />
										<span class="font-medium">Time:</span>
										<span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
									</div>
									<div class="flex items-center gap-3 text-lg">
										<User class="h-5 w-5 text-muted-foreground" />
										<span class="font-medium">Client:</span>
										<span>{getClientName(booking)}</span>
									</div>
								</div>
								
								<div class="space-y-4">
									<div class="flex items-center gap-3 text-lg">
										<MapPin class="h-5 w-5 text-muted-foreground" />
										<span class="font-medium">Location:</span>
										<span>{booking.expand?.room_id?.expand?.location_id?.name || 'Unknown'}</span>
									</div>
									<div class="flex items-center gap-3 text-lg">
										<span class="font-medium">Room:</span>
										<span>{booking.expand?.room_id?.name || 'Unknown'}</span>
									</div>
									{#if booking.expand?.service_id}
										<div class="flex items-center gap-3 text-lg">
											<span class="font-medium">Service:</span>
											<span>{booking.expand.service_id.name}</span>
										</div>
									{/if}
								</div>
							</div>
						</div>

						<!-- Review Form -->
						<div class="text-center mb-8">
							<div class="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
								<Star class="h-12 w-12 text-yellow-500" />
							</div>
							<h3 class="text-3xl font-bold mb-4">Share Your Experience</h3>
							<p class="text-muted-foreground text-lg">
								Your feedback helps us maintain the highest quality of service
							</p>
						</div>

						<div class="max-w-2xl mx-auto space-y-6">
							<!-- Star Rating -->
							<div class="text-center">
								<div class="block text-lg font-medium text-foreground mb-6">
									How would you rate your experience?
								</div>
								<div class="flex items-center justify-center gap-3">
									{#each Array(5) as _, i}
										<button
											type="button"
											on:click={() => setRating(i + 1)}
											class="p-2 hover:scale-110 transition-transform"
											aria-label="Rate {i + 1} out of 5 stars"
										>
											<Star 
												class="h-12 w-12 {i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'} transition-colors"
											/>
										</button>
									{/each}
								</div>
								{#if rating > 0}
									<p class="text-lg text-muted-foreground mt-4">
										{rating} out of 5 stars
									</p>
								{/if}
							</div>

							<!-- Review Title -->
							<div>
								<label for="review-title" class="block text-lg font-medium text-foreground mb-3">
									Review Title (Optional)
								</label>
								<input
									id="review-title"
									type="text"
									bind:value={reviewTitle}
									placeholder="Summarize your experience..."
									maxlength="100"
									class="w-full p-4 text-lg border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
								/>
							</div>

							<!-- Review Content -->
							<div>
								<label for="review-content" class="block text-lg font-medium text-foreground mb-3">
									Tell us more about your experience (Optional)
								</label>
								<textarea
									id="review-content"
									bind:value={reviewContent}
									placeholder="Share details about your experience..."
									maxlength="1000"
									rows="4"
									class="w-full p-4 text-lg border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none resize-none"
								></textarea>
								<div class="text-right text-sm text-muted-foreground mt-2">
									{reviewContent.length}/1000 characters
								</div>
							</div>

							<!-- Anonymous Option -->
							<div class="flex items-center space-x-3">
								<input
									id="anonymous"
									type="checkbox"
									bind:checked={isAnonymous}
									class="w-5 h-5 rounded border-border"
								/>
								<label for="anonymous" class="text-lg text-foreground">
									Post this review anonymously
								</label>
							</div>

							<div class="flex gap-4 pt-6">
								<Button on:click={goBack} variant="outline" class="flex-1 text-lg py-4" size="lg">
									Cancel
								</Button>
								<Button 
									on:click={handleReviewSubmit}
									disabled={rating === 0 || isLoading}
									class="flex-1 text-lg py-4"
									size="lg"
								>
									{#if isLoading}
										<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
									{/if}
									<Send class="h-5 w-5 mr-2" />
									Submit Review
								</Button>
							</div>
						</div>
					</div>
			{/if}

			<!-- Success Step -->
			{#if currentStep === 'success'}
					<div class="max-w-md mx-auto text-center py-12">
						<div class="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
							<CheckCircle class="h-12 w-12 text-green-500" />
						</div>
						
						<h3 class="text-3xl font-bold mb-4">Thank You!</h3>
						<p class="text-muted-foreground text-lg mb-8">Your review has been submitted successfully</p>
						
						<div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
							<div class="flex items-center justify-center space-x-3 text-green-700 dark:text-green-300">
								<CheckCircle class="h-6 w-6" />
								<span class="font-medium text-lg">Review submitted with {rating} stars</span>
							</div>
						</div>
						
						<p class="text-muted-foreground mb-8 text-lg">
							Your feedback helps us maintain excellent service quality.
						</p>
						
						<Button on:click={goBack} class="w-full text-lg py-4" size="lg">
							Close
						</Button>
					</div>
			{/if}
		</div>
	</div>
</div>
