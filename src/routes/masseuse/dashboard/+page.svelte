<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { masseuses, todaysAvailability } from '$lib/stores/masseuse';
	
	let currentMasseuse: any = null;
	let todaysBookings = 3;
	let upcomingAppointments = 5;
	let weeklyEarnings = 2450;
	
	// Mock current masseuse (in real app, this would come from auth)
	onMount(() => {
		masseuses.subscribe(masseuses => {
			if (masseuses.length > 0) {
				currentMasseuse = masseuses[0]; // Use first masseuse as example
			}
		});
	});
	
	$: quickActions = [
		{ 
			title: 'View Schedule', 
			description: 'Manage your availability',
			href: '/masseuse/schedule',
			icon: '📅',
			color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
		},
		{ 
			title: 'Manage Bookings', 
			description: 'View and manage appointments',
			href: '/masseuse/bookings',
			icon: '📋',
			color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
		},
		{ 
			title: 'View Analytics', 
			description: 'Performance overview',
			href: '/masseuse/analytics',
			icon: '📈',
			color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
		},
		{ 
			title: 'Update Profile', 
			description: 'Manage your profile',
			href: '/masseuse/profile',
			icon: '👤',
			color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
		}
	];
</script>

<div class="space-y-6">
	<!-- Welcome Section -->
	<div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
		<h2 class="text-2xl font-bold mb-2">
			Welcome, {currentMasseuse?.name || 'Professional'}! 👋
		</h2>
		<p class="text-blue-100">
			Ready to provide excellent service today
		</p>
	</div>
	
	<!-- Quick Stats -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Today's Bookings</CardTitle>
				<span class="text-2xl">📅</span>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{todaysBookings}</div>
				<p class="text-xs text-muted-foreground">2 confirmed, 1 pending</p>
			</CardContent>
		</Card>
		
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Upcoming Bookings</CardTitle>
				<span class="text-2xl">⏰</span>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{upcomingAppointments}</div>
				<p class="text-xs text-muted-foreground">Next 7 days</p>
			</CardContent>
		</Card>
		
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Weekly Earnings</CardTitle>
				<span class="text-2xl">💰</span>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">€{weeklyEarnings}</div>
				<p class="text-xs text-muted-foreground">+12% from last week</p>
			</CardContent>
		</Card>
		
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Rating</CardTitle>
				<span class="text-2xl">⭐</span>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">4.9</div>
				<p class="text-xs text-muted-foreground">Based on 127 reviews</p>
			</CardContent>
		</Card>
	</div>
	
	<!-- Quick Actions -->
	<div>
		<h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each quickActions as action}
				<Card class="hover:shadow-md transition-shadow cursor-pointer">
					<CardHeader class="pb-3">
						<div class="flex items-center justify-between">
							<div class={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
								<span class="text-lg">{action.icon}</span>
							</div>
							<Button variant="ghost" size="sm" on:click={() => goto(action.href)}>
								→
							</Button>
						</div>
					</CardHeader>
					<CardContent class="pt-0">
						<CardTitle class="text-sm mb-1">{action.title}</CardTitle>
						<CardDescription class="text-xs">{action.description}</CardDescription>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
	
	<!-- Recent Activity -->
	<Card>
		<CardHeader>
			<CardTitle>Recent Activity</CardTitle>
			<CardDescription>Your latest updates and notifications</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="flex items-center space-x-4">
					<div class="w-2 h-2 bg-green-500 rounded-full"></div>
					<div class="flex-1">
						<p class="text-sm font-medium">New booking confirmed</p>
						<p class="text-xs text-muted-foreground">Client: Sarah M. - Today at 3:00 PM</p>
					</div>
					<Badge variant="secondary">New</Badge>
				</div>
				
				<div class="flex items-center space-x-4">
					<div class="w-2 h-2 bg-blue-500 rounded-full"></div>
					<div class="flex-1">
						<p class="text-sm font-medium">Schedule updated</p>
						<p class="text-xs text-muted-foreground">Added availability for tomorrow</p>
					</div>
					<Badge variant="outline">Update</Badge>
				</div>
				
				<div class="flex items-center space-x-4">
					<div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
					<div class="flex-1">
						<p class="text-sm font-medium">Review received</p>
						<p class="text-xs text-muted-foreground">5 stars from Client: Maria K.</p>
					</div>
					<Badge variant="secondary">⭐ 5.0</Badge>
				</div>
			</div>
		</CardContent>
	</Card>
</div>
