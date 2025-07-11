<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Star, Clock, Award, Target, BarChart3, Activity } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { authStore } from '$lib/stores/auth';
	import { masseuseData } from '$lib/stores/masseuse';
	
	const dispatch = createEventDispatcher();
	
	$: currentMasseuse = $masseuseData.find(m => m.email === $authStore.user?.email);
	
	// Mock performance data
	let performanceData = {
		currentMonth: {
			totalBookings: 87,
			completedSessions: 82,
			cancelledSessions: 5,
			totalRevenue: 246000,
			averageRating: 4.8,
			totalHours: 123,
			clientRetention: 92,
			newClients: 15
		},
		previousMonth: {
			totalBookings: 76,
			completedSessions: 71,
			cancelledSessions: 5,
			totalRevenue: 213200,
			averageRating: 4.7,
			totalHours: 106.5,
			clientRetention: 89,
			newClients: 12
		},
		yearToDate: {
			totalBookings: 876,
			completedSessions: 824,
			totalRevenue: 2460000,
			averageRating: 4.8,
			totalHours: 1230,
			topServices: ['Deep Tissue Massage', 'Swedish Massage', 'Sports Massage'],
			clientGrowth: 24
		},
		monthlyTrends: [
			{ month: 'Jan', bookings: 65, revenue: 195000, rating: 4.6 },
			{ month: 'Feb', revenue: 180000, bookings: 60, rating: 4.7 },
			{ month: 'Mar', bookings: 70, revenue: 210000, rating: 4.8 },
			{ month: 'Apr', bookings: 72, revenue: 216000, rating: 4.7 },
			{ month: 'May', bookings: 75, revenue: 225000, rating: 4.8 },
			{ month: 'Jun', bookings: 80, revenue: 240000, rating: 4.9 },
			{ month: 'Jul', bookings: 85, revenue: 255000, rating: 4.8 },
			{ month: 'Aug', bookings: 82, revenue: 246000, rating: 4.8 }
		],
		topClients: [
			{ name: 'Sarah Johnson', visits: 12, totalSpent: 36000, lastVisit: '2024-01-18' },
			{ name: 'Michael Brown', visits: 10, totalSpent: 35000, lastVisit: '2024-01-20' },
			{ name: 'Emma Wilson', visits: 9, totalSpent: 25200, lastVisit: '2024-01-19' },
			{ name: 'John Smith', visits: 8, totalSpent: 24000, lastVisit: '2024-01-17' },
			{ name: 'Lisa Davis', visits: 7, totalSpent: 21000, lastVisit: '2024-01-16' }
		],
		serviceBreakdown: [
			{ service: 'Deep Tissue Massage', count: 28, percentage: 34.1, revenue: 84000 },
			{ service: 'Swedish Massage', count: 22, percentage: 26.8, revenue: 61600 },
			{ service: 'Sports Massage', count: 18, percentage: 22.0, revenue: 63000 },
			{ service: 'Relaxation Massage', count: 14, percentage: 17.1, revenue: 37800 }
		],
		timeSlotPerformance: [
			{ time: '09:00-11:00', bookings: 18, utilization: 90 },
			{ time: '11:00-13:00', bookings: 16, utilization: 80 },
			{ time: '13:00-15:00', bookings: 12, utilization: 60 },
			{ time: '15:00-17:00', bookings: 20, utilization: 100 },
			{ time: '17:00-19:00', bookings: 16, utilization: 80 }
		],
		goals: {
			monthlyRevenue: { target: 250000, current: 246000, percentage: 98.4 },
			clientSatisfaction: { target: 4.9, current: 4.8, percentage: 98.0 },
			bookingUtilization: { target: 85, current: 82, percentage: 96.5 },
			clientRetention: { target: 95, current: 92, percentage: 96.8 }
		}
	};
	
	let selectedPeriod = 'current';
	let showDetailedAnalytics = false;
	
	function calculateGrowth(current: number, previous: number): { value: number; isPositive: boolean } {
		const growth = ((current - previous) / previous) * 100;
		return { value: Math.abs(growth), isPositive: growth >= 0 };
	}
	
	function formatCurrency(amount: number): string {
		return `${amount.toLocaleString()} CZK`;
	}
	
	function formatPercentage(value: number): string {
		return `${value.toFixed(1)}%`;
	}
	
	function getUtilizationColor(percentage: number): string {
		if (percentage >= 90) return 'text-green-600';
		if (percentage >= 70) return 'text-yellow-600';
		return 'text-red-600';
	}
	
	function getGoalProgressColor(percentage: number): string {
		if (percentage >= 95) return 'bg-green-500';
		if (percentage >= 80) return 'bg-yellow-500';
		return 'bg-red-500';
	}
	
	$: revenueGrowth = calculateGrowth(performanceData.currentMonth.totalRevenue, performanceData.previousMonth.totalRevenue);
	$: bookingGrowth = calculateGrowth(performanceData.currentMonth.totalBookings, performanceData.previousMonth.totalBookings);
	$: ratingGrowth = calculateGrowth(performanceData.currentMonth.averageRating, performanceData.previousMonth.averageRating);
	$: retentionGrowth = calculateGrowth(performanceData.currentMonth.clientRetention, performanceData.previousMonth.clientRetention);
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Performance Analytics</h1>
			<p class="text-sm text-muted-foreground">Track your success and identify growth opportunities</p>
		</div>
		
		<div class="flex gap-2">
			<select
				bind:value={selectedPeriod}
				class="p-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
			>
				<option value="current">Current Month</option>
				<option value="previous">Previous Month</option>
				<option value="ytd">Year to Date</option>
			</select>
			<Button
				on:click={() => showDetailedAnalytics = !showDetailedAnalytics}
				variant="outline"
				class="glass-button"
			>
				{showDetailedAnalytics ? 'Basic View' : 'Detailed View'}
			</Button>
		</div>
	</div>
	
	<!-- Key Performance Indicators -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- Total Revenue -->
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-4">
				<div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
					<DollarSign class="h-6 w-6 text-green-600" />
				</div>
				<div class={`flex items-center space-x-1 text-sm ${revenueGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
					<svelte:component this={revenueGrowth.isPositive ? TrendingUp : TrendingDown} class="h-4 w-4" />
					<span>{formatPercentage(revenueGrowth.value)}</span>
				</div>
			</div>
			<div class="text-2xl font-bold text-foreground mb-1">
				{formatCurrency(performanceData.currentMonth.totalRevenue)}
			</div>
			<div class="text-sm text-muted-foreground">Total Revenue</div>
		</div>
		
		<!-- Total Bookings -->
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-4">
				<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
					<Calendar class="h-6 w-6 text-blue-600" />
				</div>
				<div class={`flex items-center space-x-1 text-sm ${bookingGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
					<svelte:component this={bookingGrowth.isPositive ? TrendingUp : TrendingDown} class="h-4 w-4" />
					<span>{formatPercentage(bookingGrowth.value)}</span>
				</div>
			</div>
			<div class="text-2xl font-bold text-foreground mb-1">
				{performanceData.currentMonth.totalBookings}
			</div>
			<div class="text-sm text-muted-foreground">Total Bookings</div>
		</div>
		
		<!-- Average Rating -->
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-4">
				<div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
					<Star class="h-6 w-6 text-yellow-600" />
				</div>
				<div class={`flex items-center space-x-1 text-sm ${ratingGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
					<svelte:component this={ratingGrowth.isPositive ? TrendingUp : TrendingDown} class="h-4 w-4" />
					<span>{formatPercentage(ratingGrowth.value)}</span>
				</div>
			</div>
			<div class="text-2xl font-bold text-foreground mb-1">
				{performanceData.currentMonth.averageRating}/5.0
			</div>
			<div class="text-sm text-muted-foreground">Average Rating</div>
		</div>
		
		<!-- Client Retention -->
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-4">
				<div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
					<Users class="h-6 w-6 text-purple-600" />
				</div>
				<div class={`flex items-center space-x-1 text-sm ${retentionGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
					<svelte:component this={retentionGrowth.isPositive ? TrendingUp : TrendingDown} class="h-4 w-4" />
					<span>{formatPercentage(retentionGrowth.value)}</span>
				</div>
			</div>
			<div class="text-2xl font-bold text-foreground mb-1">
				{performanceData.currentMonth.clientRetention}%
			</div>
			<div class="text-sm text-muted-foreground">Client Retention</div>
		</div>
	</div>
	
	<!-- Goals Progress -->
	<div class="enhanced-card p-6 rounded-xl">
		<h2 class="text-xl font-semibold text-foreground mb-6 flex items-center space-x-2">
			<Target class="h-5 w-5 text-primary" />
			<span>Monthly Goals Progress</span>
		</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each Object.entries(performanceData.goals) as [key, goal]}
				<div class="space-y-3">
					<div class="flex justify-between items-center">
						<span class="text-sm font-medium text-foreground capitalize">
							{key.replace(/([A-Z])/g, ' $1').trim()}
						</span>
						<span class="text-sm text-muted-foreground">
							{formatPercentage(goal.percentage)}
						</span>
					</div>
					<div class="w-full bg-accent/20 rounded-full h-2">
						<div
							class={`h-2 rounded-full transition-all duration-300 ${getGoalProgressColor(goal.percentage)}`}
							style="width: {Math.min(goal.percentage, 100)}%"
						></div>
					</div>
					<div class="flex justify-between items-center text-xs text-muted-foreground">
						<span>Current: {typeof goal.current === 'number' && goal.current > 1000 ? formatCurrency(goal.current) : goal.current}</span>
						<span>Target: {typeof goal.target === 'number' && goal.target > 1000 ? formatCurrency(goal.target) : goal.target}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
	
	<!-- Service Performance -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Service Breakdown -->
		<div class="enhanced-card p-6 rounded-xl">
			<h2 class="text-xl font-semibold text-foreground mb-6 flex items-center space-x-2">
				<BarChart3 class="h-5 w-5 text-primary" />
				<span>Service Performance</span>
			</h2>
			
			<div class="space-y-4">
				{#each performanceData.serviceBreakdown as service}
					<div class="space-y-2">
						<div class="flex justify-between items-center">
							<span class="text-sm font-medium text-foreground">{service.service}</span>
							<div class="text-right">
								<div class="text-sm font-semibold text-foreground">{service.count} sessions</div>
								<div class="text-xs text-muted-foreground">{formatCurrency(service.revenue)}</div>
							</div>
						</div>
						<div class="w-full bg-accent/20 rounded-full h-2">
							<div
								class="h-2 bg-primary rounded-full transition-all duration-300"
								style="width: {service.percentage}%"
							></div>
						</div>
						<div class="text-xs text-muted-foreground text-right">
							{formatPercentage(service.percentage)} of total sessions
						</div>
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Time Slot Performance -->
		<div class="enhanced-card p-6 rounded-xl">
			<h2 class="text-xl font-semibold text-foreground mb-6 flex items-center space-x-2">
				<Clock class="h-5 w-5 text-primary" />
				<span>Time Slot Utilization</span>
			</h2>
			
			<div class="space-y-4">
				{#each performanceData.timeSlotPerformance as slot}
					<div class="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
						<div>
							<div class="text-sm font-medium text-foreground">{slot.time}</div>
							<div class="text-xs text-muted-foreground">{slot.bookings} bookings</div>
						</div>
						<div class="text-right">
							<div class={`text-lg font-bold ${getUtilizationColor(slot.utilization)}`}>
								{slot.utilization}%
							</div>
							<div class="text-xs text-muted-foreground">Utilization</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
	
	<!-- Top Clients -->
	<div class="enhanced-card p-6 rounded-xl">
		<h2 class="text-xl font-semibold text-foreground mb-6 flex items-center space-x-2">
			<Award class="h-5 w-5 text-primary" />
			<span>Top Clients</span>
		</h2>
		
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-border">
						<th class="text-left py-3 px-4 font-medium text-foreground">Client</th>
						<th class="text-center py-3 px-4 font-medium text-foreground">Visits</th>
						<th class="text-center py-3 px-4 font-medium text-foreground">Total Spent</th>
						<th class="text-center py-3 px-4 font-medium text-foreground">Last Visit</th>
					</tr>
				</thead>
				<tbody>
					{#each performanceData.topClients as client, index}
						<tr class="border-b border-border/50">
							<td class="py-3 px-4">
								<div class="flex items-center space-x-3">
									<div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
										{index + 1}
									</div>
									<span class="font-medium text-foreground">{client.name}</span>
								</div>
							</td>
							<td class="text-center py-3 px-4 text-foreground">{client.visits}</td>
							<td class="text-center py-3 px-4 font-semibold text-foreground">{formatCurrency(client.totalSpent)}</td>
							<td class="text-center py-3 px-4 text-muted-foreground">
								{new Date(client.lastVisit).toLocaleDateString()}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	
	{#if showDetailedAnalytics}
		<!-- Monthly Trends Chart (Placeholder) -->
		<div class="enhanced-card p-6 rounded-xl">
			<h2 class="text-xl font-semibold text-foreground mb-6 flex items-center space-x-2">
				<Activity class="h-5 w-5 text-primary" />
				<span>Monthly Trends</span>
			</h2>
			
			<div class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
					<div class="p-4 bg-accent/10 rounded-lg">
						<div class="text-2xl font-bold text-primary mb-1">
							{performanceData.monthlyTrends[performanceData.monthlyTrends.length - 1].bookings}
						</div>
						<div class="text-sm text-muted-foreground">Latest Month Bookings</div>
					</div>
					<div class="p-4 bg-accent/10 rounded-lg">
						<div class="text-2xl font-bold text-green-600 mb-1">
							{formatCurrency(performanceData.monthlyTrends[performanceData.monthlyTrends.length - 1].revenue)}
						</div>
						<div class="text-sm text-muted-foreground">Latest Month Revenue</div>
					</div>
					<div class="p-4 bg-accent/10 rounded-lg">
						<div class="text-2xl font-bold text-yellow-600 mb-1">
							{performanceData.monthlyTrends[performanceData.monthlyTrends.length - 1].rating}
						</div>
						<div class="text-sm text-muted-foreground">Latest Month Rating</div>
					</div>
				</div>
				
				<!-- Simple trend visualization -->
				<div class="space-y-2">
					<h3 class="font-medium text-foreground">Booking Trends (Last 8 Months)</h3>
					<div class="flex items-end space-x-2 h-32">
						{#each performanceData.monthlyTrends as trend}
							<div class="flex-1 flex flex-col items-center">
								<div
									class="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
									style="height: {(trend.bookings / 90) * 100}%"
								></div>
								<div class="text-xs text-muted-foreground mt-2">{trend.month}</div>
								<div class="text-xs font-medium text-foreground">{trend.bookings}</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
		
		<!-- Performance Insights -->
		<div class="enhanced-card p-6 rounded-xl">
			<h2 class="text-xl font-semibold text-foreground mb-6">Performance Insights</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="space-y-4">
					<h3 class="font-medium text-foreground">Strengths</h3>
					<div class="space-y-2">
						<div class="flex items-center space-x-2 text-green-600">
							<TrendingUp class="h-4 w-4" />
							<span class="text-sm">High client retention rate (92%)</span>
						</div>
						<div class="flex items-center space-x-2 text-green-600">
							<Star class="h-4 w-4" />
							<span class="text-sm">Excellent client satisfaction (4.8/5)</span>
						</div>
						<div class="flex items-center space-x-2 text-green-600">
							<TrendingUp class="h-4 w-4" />
							<span class="text-sm">Consistent revenue growth</span>
						</div>
					</div>
				</div>
				
				<div class="space-y-4">
					<h3 class="font-medium text-foreground">Opportunities</h3>
					<div class="space-y-2">
						<div class="flex items-center space-x-2 text-yellow-600">
							<Target class="h-4 w-4" />
							<span class="text-sm">Optimize 13:00-15:00 time slot (60% utilization)</span>
						</div>
						<div class="flex items-center space-x-2 text-blue-600">
							<Users class="h-4 w-4" />
							<span class="text-sm">Focus on acquiring new clients</span>
						</div>
						<div class="flex items-center space-x-2 text-purple-600">
							<Activity class="h-4 w-4" />
							<span class="text-sm">Promote sports massage services</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
