<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Star, Clock, Send, CheckCircle } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	
	const dispatch = createEventDispatcher();
	
	let pinCode = '';
	let rating = 0;
	let comment = '';
	let currentStep: 'pin' | 'confirm-end' | 'review' | 'success' = 'pin';
	let isLoading = false;
	let endTime = '';
	
	// Mock booking data - in real app this would come from the PIN lookup
	let currentBooking = {
		clientName: 'John S.',
		masseuseName: 'Monika',
		startTime: '10:30',
		duration: '60 min'
	};
	
	function handlePinSubmit() {
		if (pinCode.length === 4) {
			isLoading = true;
			// Simulate API call
			setTimeout(() => {
				isLoading = false;
				if (pinCode === '5678') { // Mock validation
					currentStep = 'confirm-end';
					endTime = new Date().toLocaleTimeString('en-US', { 
						hour: '2-digit', 
						minute: '2-digit',
						hour12: false 
					});
				} else {
					alert('Invalid PIN code. Please try again.');
					pinCode = '';
				}
			}, 1000);
		}
	}
	
	function confirmEndTime() {
		currentStep = 'review';
	}
	
	function submitReview() {
		if (rating > 0) {
			isLoading = true;
			// Simulate API call
			setTimeout(() => {
				isLoading = false;
				currentStep = 'success';
				// Auto-reset after 5 seconds
				setTimeout(() => {
					resetForm();
				}, 5000);
			}, 1000);
		}
	}
	
	function resetForm() {
		pinCode = '';
		rating = 0;
		comment = '';
		currentStep = 'pin';
		endTime = '';
	}
	
	function setRating(stars: number) {
		rating = stars;
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<!-- PIN Entry Step -->
		{#if currentStep === 'pin'}
			<div class="enhanced-card p-8 rounded-2xl text-center">
				<div class="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
					<Clock class="h-10 w-10 text-primary" />
				</div>
				
				<h1 class="text-3xl font-bold text-foreground mb-2">Welcome!</h1>
				<p class="text-muted-foreground mb-8">Please enter your 4-digit PIN code to confirm your session</p>
				
				<div class="space-y-6">
					<div class="flex justify-center space-x-3">
						{#each Array(4) as _, i}
							<input
								type="text"
								maxlength="1"
								class="w-12 h-12 text-center text-2xl font-bold border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-colors"
								bind:value={pinCode[i]}
								on:input={(e) => {
									const value = e.target.value;
									if (value && i < 3) {
										// Auto-focus next input
										const nextInput = e.target.parentElement?.children[i + 1];
										if (nextInput) nextInput.focus();
									}
									if (pinCode.length === 4) {
										handlePinSubmit();
									}
								}}
								on:keydown={(e) => {
									if (e.key === 'Backspace' && !e.target.value && i > 0) {
										// Auto-focus previous input on backspace
										const prevInput = e.target.parentElement?.children[i - 1];
										if (prevInput) prevInput.focus();
									}
								}}
							/>
						{/each}
					</div>
					
					<Button 
						on:click={handlePinSubmit}
						disabled={pinCode.length !== 4 || isLoading}
						class="w-full glass-button"
					>
						{#if isLoading}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
						{/if}
						Continue
					</Button>
				</div>
			</div>
		{/if}
		
		<!-- Confirm End Time Step -->
		{#if currentStep === 'confirm-end'}
			<div class="enhanced-card p-8 rounded-2xl text-center">
				<div class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
					<CheckCircle class="h-10 w-10 text-green-500" />
				</div>
				
				<h1 class="text-3xl font-bold text-foreground mb-2">Session Complete!</h1>
				<p class="text-muted-foreground mb-6">Thank you for visiting Affinity</p>
				
				<div class="bg-accent/20 rounded-lg p-6 mb-6 space-y-3">
					<div class="text-sm text-muted-foreground">Session Details</div>
					<div class="space-y-2">
						<div class="flex justify-between">
							<span class="text-foreground">Client:</span>
							<span class="font-medium">{currentBooking.clientName}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-foreground">Masseuse:</span>
							<span class="font-medium">{currentBooking.masseuseName}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-foreground">Duration:</span>
							<span class="font-medium">{currentBooking.duration}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-foreground">End Time:</span>
							<span class="font-medium text-primary">{endTime}</span>
						</div>
					</div>
				</div>
				
				<Button on:click={confirmEndTime} class="w-full glass-button">
					Confirm & Continue to Review
				</Button>
			</div>
		{/if}
		
		<!-- Review Step -->
		{#if currentStep === 'review'}
			<div class="enhanced-card p-8 rounded-2xl">
				<div class="text-center mb-8">
					<div class="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
						<Star class="h-10 w-10 text-yellow-500" />
					</div>
					<h1 class="text-3xl font-bold text-foreground mb-2">Rate Your Experience</h1>
					<p class="text-muted-foreground">Your feedback helps us improve our service</p>
				</div>
				
				<div class="space-y-6">
					<!-- Star Rating -->
					<div class="text-center">
						<div class="text-lg font-semibold text-foreground mb-4">How was your massage?</div>
						<div class="flex justify-center space-x-2 mb-2">
							{#each Array(5) as _, i}
								<button
									on:click={() => setRating(i + 1)}
									class="transition-all duration-200 hover:scale-110"
								>
									<Star 
										class={`h-8 w-8 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300 hover:text-yellow-400'}`}
									/>
								</button>
							{/each}
						</div>
						{#if rating > 0}
							<div class="text-sm text-muted-foreground">
								{rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
							</div>
						{/if}
					</div>
					
					<!-- Comment -->
					<div>
						<label for="comment-textarea" class="block text-sm font-medium text-foreground mb-2">
							Share your thoughts (optional)
						</label>
						<textarea
							id="comment-textarea"
							bind:value={comment}
							placeholder="Tell us about your experience..."
							class="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none resize-none"
							rows="4"
						></textarea>
					</div>
					
					<Button 
						on:click={submitReview}
						disabled={rating === 0 || isLoading}
						class="w-full glass-button"
					>
						{#if isLoading}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
						{/if}
						<Send class="h-4 w-4 mr-2" />
						Submit Review
					</Button>
				</div>
			</div>
		{/if}
		
		<!-- Success Step -->
		{#if currentStep === 'success'}
			<div class="enhanced-card p-8 rounded-2xl text-center">
				<div class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
					<CheckCircle class="h-10 w-10 text-green-500" />
				</div>
				
				<h1 class="text-3xl font-bold text-foreground mb-2">Thank You!</h1>
				<p class="text-muted-foreground mb-6">Your review has been submitted successfully</p>
				
				<div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
					<div class="flex items-center justify-center space-x-2 text-green-700 dark:text-green-300">
						<CheckCircle class="h-5 w-5" />
						<span class="font-medium">Review submitted with {rating} stars</span>
					</div>
				</div>
				
				<p class="text-sm text-muted-foreground">
					We appreciate your feedback and look forward to seeing you again!
				</p>
				
				<div class="mt-6">
					<Button on:click={resetForm} variant="outline" class="glass-button">
						Start New Session
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
