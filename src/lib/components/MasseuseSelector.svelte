<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { masseuseData, getBraSize, isAvailableToday } from '$lib/stores/masseuse';
	import { Clock, Star, User, Badge, Search, Filter } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { Masseuse } from '$lib/types/masseuse';
	
	const dispatch = createEventDispatcher();
	
	export let selectedMasseuse: Masseuse | null = null;
	export let showAvailableOnly = true;
	
	let searchQuery = '';
	let sortBy: 'name' | 'age' | 'availability' = 'name';
	let filterBy: 'all' | 'available' | 'new' = 'available';
	
	$: filteredMasseuses = masseuseData
		.filter(masseuse => {
			// Search filter
			if (searchQuery && !masseuse.name.toLowerCase().includes(searchQuery.toLowerCase())) {
				return false;
			}
			
			// Availability filter
			if (filterBy === 'available' && !isAvailableToday(masseuse)) {
				return false;
			}
			
			// New girls filter
			if (filterBy === 'new' && !masseuse.status) {
				return false;
			}
			
			return true;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case 'age':
					return a.age - b.age;
				case 'availability':
					return isAvailableToday(b) ? 1 : -1;
				default:
					return a.name.localeCompare(b.name);
			}
		});
	
	function selectMasseuse(masseuse: Masseuse) {
		selectedMasseuse = masseuse;
		dispatch('select', masseuse);
	}
	
	function getAvailabilityText(masseuse: Masseuse): string {
		const today = new Date().toISOString().split('T')[0];
		const todayAvailability = masseuse.availability.find(a => a.date === today);
		
		if (!todayAvailability) return 'Not available today';
		
		return `${todayAvailability.start_time} - ${todayAvailability.end_time}`;
	}
	
	function getStatusBadgeColor(status: string | null): string {
		if (status === 'New girl!') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
		return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
	}
</script>

<div class="space-y-6">
	<!-- Header & Controls -->
	<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold text-foreground">Select Masseuse</h2>
			<p class="text-sm text-muted-foreground">Choose from our available therapists</p>
		</div>
		
		<div class="flex flex-wrap gap-2">
			<div class="relative">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<input
					type="text"
					placeholder="Search masseuses..."
					bind:value={searchQuery}
					class="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
				/>
			</div>
			
			<select
				bind:value={filterBy}
				class="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
			>
				<option value="all">All</option>
				<option value="available">Available Today</option>
				<option value="new">New Girls</option>
			</select>
			
			<select
				bind:value={sortBy}
				class="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
			>
				<option value="name">Sort by Name</option>
				<option value="age">Sort by Age</option>
				<option value="availability">Sort by Availability</option>
			</select>
		</div>
	</div>
	
	<!-- Masseuse Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each filteredMasseuses as masseuse}
			<div 
				class={`enhanced-card p-6 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
					selectedMasseuse?.name === masseuse.name ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
				}`}
				on:click={() => selectMasseuse(masseuse)}
				on:keydown={(e) => e.key === 'Enter' && selectMasseuse(masseuse)}
				role="button"
				tabindex="0"
			>
				<!-- Masseuse Avatar & Status -->
				<div class="text-center mb-4">
					<div class="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
						<User class="h-10 w-10 text-primary" />
					</div>
					
					<h3 class="text-lg font-semibold text-foreground">{masseuse.name}</h3>
					
					{#if masseuse.status}
						<span class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusBadgeColor(masseuse.status)}`}>
							<Badge class="h-3 w-3 mr-1" />
							{masseuse.status}
						</span>
					{/if}
				</div>
				
				<!-- Masseuse Details -->
				<div class="space-y-3">
					<div class="grid grid-cols-2 gap-3 text-sm">
						<div class="text-muted-foreground">Age:</div>
						<div class="font-medium text-foreground">{masseuse.age}</div>
						
						<div class="text-muted-foreground">Height:</div>
						<div class="font-medium text-foreground">{masseuse.height_cm} cm</div>
						
						<div class="text-muted-foreground">Size:</div>
						<div class="font-medium text-foreground">{getBraSize(masseuse.breasts)} cup</div>
					</div>
					
					<!-- Availability Status -->
					<div class="pt-3 border-t border-border/50">
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground">Today:</span>
							<div class="text-right">
								{#if isAvailableToday(masseuse)}
									<div class="flex items-center text-green-600 text-sm font-medium">
										<Clock class="h-3 w-3 mr-1" />
										Available
									</div>
									<div class="text-xs text-muted-foreground mt-1">
										{getAvailabilityText(masseuse)}
									</div>
								{:else}
									<div class="text-sm text-muted-foreground">Not available</div>
								{/if}
							</div>
						</div>
					</div>
					
					<!-- Mock Rating -->
					<div class="flex items-center justify-between pt-2">
						<div class="flex items-center space-x-1">
							{#each Array(5) as _, i}
								<Star class={`h-3 w-3 ${i < 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
							{/each}
						</div>
						<span class="text-xs text-muted-foreground">4.8 (23 reviews)</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
	
	<!-- No Results -->
	{#if filteredMasseuses.length === 0}
		<div class="text-center py-12">
			<User class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
			<h3 class="text-lg font-semibold text-foreground mb-2">No masseuses found</h3>
			<p class="text-muted-foreground">Try adjusting your search or filter criteria</p>
		</div>
	{/if}
	
	<!-- Selected Masseuse Summary -->
	{#if selectedMasseuse}
		<div class="enhanced-card p-6 rounded-xl bg-primary/5 border border-primary/20">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-4">
					<div class="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
						<User class="h-6 w-6 text-primary" />
					</div>
					<div>
						<h4 class="font-semibold text-foreground">Selected: {selectedMasseuse.name}</h4>
						<p class="text-sm text-muted-foreground">
							{isAvailableToday(selectedMasseuse) ? 'Available today' : 'Not available today'}
						</p>
					</div>
				</div>
				
				<Button on:click={() => dispatch('continue')} class="glass-button">
					Continue with {selectedMasseuse.name}
				</Button>
			</div>
		</div>
	{/if}
</div>
