<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { BarChart3, TrendingUp, Users, Calendar, Download, Filter, DollarSign, Star, Clock } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { masseuseData } from '$lib/stores/masseuse';
	
	const dispatch = createEventDispatcher();
	
	// Mock analytics data
	let reportsData = {
		revenue: {
			daily: [
				{ date: '2024-01-15', amount: 15600, bookings: 8 },
				{ date: '2024-01-16', amount: 18900, bookings: 10 },
				{ date: '2024-01-17', amount: 22400, bookings: 12 },
				{ date: '2024-01-18', amount: 19600, bookings: 9 },
				{ date: '2024-01-19', amount: 25200, bookings: 14 },
				{ date: '2024-01-20', amount: 21000, bookings: 11 },
				{ date: '2024-01-21', amount: 17800, bookings: 8 }
			],
			monthly: {
				current: 234500,
				previous: 198200,
				growth: 18.3
			}
		},
		bookings: {
			total: 156,
			completed: 142,
			cancelled: 14,
			pending: 23,
			confirmed: 47
		},
		masseuses: {
			topPerformers: [
				{ id: 'masseuse-1', name: 'Elena Svoboda', revenue: 45600, bookings: 32, rating: 4.9 },
				{ id: 'masseuse-2', name: 'Petra Novak', revenue: 38400, bookings: 28, rating: 4.8 },
				{ id: 'masseuse-3', name: 'Martina Krejci', revenue: 42100, bookings: 30, rating: 4.7 }
			]
		},
		services: {
			popular: [
				{ name: 'Swedish Massage', count: 45, revenue: 126000 },
				{ name: 'Deep Tissue Massage', count: 38, revenue: 114000 },
				{ name: 'Hot Stone Massage', count: 32, revenue: 121600 },
				{ name: 'Relaxation Massage', count: 28, revenue: 89600 },
				{ name: 'Sports Massage', count: 22, revenue: 77000 }
			]
		},
		clients: {
			total: 89,
			new: 12,
			returning: 77,
			satisfaction: 4.6
		}
	};
	
	let selectedPeriod = 'week';
	let selectedReport = 'overview';
	let isLoading = false;
	
	const periodOptions = [
		{ value: 'day', label: 'Today' },
		{ value: 'week', label: 'This Week' },
		{ value: 'month', label: 'This Month' },
		{ value: 'quarter', label: 'This Quarter' },
		{ value: 'year', label: 'This Year' }
	];
	
	const reportOptions = [
		{ value: 'overview', label: 'Overview' },
		{ value: 'revenue', label: 'Revenue' },
		{ value: 'bookings', label: 'Bookings' },
		{ value: 'masseuses', label: 'Masseuses' },
		{ value: 'clients', label: 'Clients' }
	];
	
	function formatPrice(price: number) {
		return `${price.toLocaleString()} CZK`;
	}
	
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}
	
	function getGrowthColor(growth: number) {
		return growth >= 0 ? 'text-green-600' : 'text-red-600';
	}
	
	async function generateReport() {
		isLoading = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 2000));
			// In real app, this would generate and download a PDF/Excel report
			console.log(`Generating ${selectedReport} report for ${selectedPeriod}`);
		} catch (error) {
			console.error('Failed to generate report:', error);
		} finally {
			isLoading = false;
		}
	}
	
	$: totalRevenue = reportsData.revenue.daily.reduce((sum, day) => sum + day.amount, 0);
	$: totalBookings = reportsData.revenue.daily.reduce((sum, day) => sum + day.bookings, 0);
	$: averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
</script>

<div class="space-y-6">
	<!-- Header & Controls -->
	<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Reports & Analytics</h1>
			<p class="text-sm text-muted-foreground">Business insights and performance metrics</p>
		</div>
		
		<div class="flex gap-3">
			<Button on:click={generateReport} disabled={isLoading} class="glass-button">
				{#if isLoading}
					<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
				{:else}
					<Download class="h-4 w-4 mr-2" />
				{/if}
				Export Report
			</Button>
		</div>
	</div>
	
	<!-- Filters -->
	<div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
		<div class="flex gap-3">
			<select
				bind:value={selectedPeriod}
				class="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
			>
				{#each periodOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			
			<select
				bind:value={selectedReport}
				class="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none"
			>
				{#each reportOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>
	
	<!-- Key Metrics Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-4">
				<div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
					<DollarSign class="h-6 w-6 text-green-600" />
				</div>
				<div class={`text-sm font-medium ${getGrowthColor(reportsData.revenue.monthly.growth)}`}>
					+{reportsData.revenue.monthly.growth}%
				</div>
			</div>
			<div class="text-2xl font-bold text-foreground mb-1">{formatPrice(totalRevenue)}</div>
			<div class="text-sm text-muted-foreground">Weekly Revenue</div>
		</div>
		
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-4">
				<div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
					<Calendar class="h-6 w-6 text-blue-600" />
				</div>
				<div class="text-sm font-medium text-green-600">+12%</div>
			</div>
			<div class="text-2xl font-bold text-foreground mb-1">{totalBookings}</div>
			<div class="text-sm text-muted-foreground">Total Bookings</div>
		</div>
		
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-4">
				<div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
					<Users class="h-6 w-6 text-purple-600" />
				</div>
				<div class="text-sm font-medium text-green-600">+8%</div>
			</div>
			<div class="text-2xl font-bold text-foreground mb-1">{reportsData.clients.total}</div>
			<div class="text-sm text-muted-foreground">Active Clients</div>
		</div>
		
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-4">
				<div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
					<Star class="h-6 w-6 text-yellow-600" />
				</div>
				<div class="text-sm font-medium text-green-600">+0.3</div>
			</div>
			<div class="text-2xl font-bold text-foreground mb-1">{reportsData.clients.satisfaction}</div>
			<div class="text-sm text-muted-foreground">Avg Rating</div>
		</div>
	</div>
	
	<!-- Charts Section -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Revenue Chart -->
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-lg font-semibold text-foreground">Daily Revenue</h3>
				<BarChart3 class="h-5 w-5 text-muted-foreground" />
			</div>
			
			<div class="space-y-4">
				{#each reportsData.revenue.daily as day}
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-3">
							<div class="text-sm text-muted-foreground w-16">{formatDate(day.date)}</div>
							<div class="flex-1 bg-accent/20 rounded-full h-2 max-w-[200px]">
								<div 
									class="bg-primary h-2 rounded-full transition-all duration-500"
									style="width: {(day.amount / Math.max(...reportsData.revenue.daily.map(d => d.amount))) * 100}%"
								></div>
							</div>
						</div>
						<div class="text-right">
							<div class="text-sm font-medium text-foreground">{formatPrice(day.amount)}</div>
							<div class="text-xs text-muted-foreground">{day.bookings} bookings</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Booking Status -->
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-lg font-semibold text-foreground">Booking Status</h3>
				<Calendar class="h-5 w-5 text-muted-foreground" />
			</div>
			
			<div class="space-y-4">
				<div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
					<div class="flex items-center space-x-3">
						<div class="w-3 h-3 bg-green-500 rounded-full"></div>
						<span class="text-sm font-medium text-green-700">Completed</span>
					</div>
					<span class="text-sm font-bold text-green-700">{reportsData.bookings.completed}</span>
				</div>
				
				<div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
					<div class="flex items-center space-x-3">
						<div class="w-3 h-3 bg-blue-500 rounded-full"></div>
						<span class="text-sm font-medium text-blue-700">Confirmed</span>
					</div>
					<span class="text-sm font-bold text-blue-700">{reportsData.bookings.confirmed}</span>
				</div>
				
				<div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
					<div class="flex items-center space-x-3">
						<div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
						<span class="text-sm font-medium text-yellow-700">Pending</span>
					</div>
					<span class="text-sm font-bold text-yellow-700">{reportsData.bookings.pending}</span>
				</div>
				
				<div class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
					<div class="flex items-center space-x-3">
						<div class="w-3 h-3 bg-red-500 rounded-full"></div>
						<span class="text-sm font-medium text-red-700">Cancelled</span>
					</div>
					<span class="text-sm font-bold text-red-700">{reportsData.bookings.cancelled}</span>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Detailed Tables -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Top Performing Masseuses -->
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-lg font-semibold text-foreground">Top Performers</h3>
				<TrendingUp class="h-5 w-5 text-muted-foreground" />
			</div>
			
			<div class="space-y-4">
				{#each reportsData.masseuses.topPerformers as masseuse, index}
					<div class="flex items-center justify-between p-3 rounded-lg border border-border">
						<div class="flex items-center space-x-3">
							<div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
								<span class="text-sm font-bold text-primary">#{index + 1}</span>
							</div>
							<div>
								<div class="font-medium text-foreground">{masseuse.name}</div>
								<div class="text-xs text-muted-foreground">
									{masseuse.bookings} bookings • {masseuse.rating}★
								</div>
							</div>
						</div>
						<div class="text-right">
							<div class="font-semibold text-foreground">{formatPrice(masseuse.revenue)}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Popular Services -->
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-lg font-semibold text-foreground">Popular Services</h3>
				<BarChart3 class="h-5 w-5 text-muted-foreground" />
			</div>
			
			<div class="space-y-4">
				{#each reportsData.services.popular as service}
					<div class="flex items-center justify-between">
						<div class="flex-1">
							<div class="flex items-center justify-between mb-1">
								<span class="text-sm font-medium text-foreground">{service.name}</span>
								<span class="text-sm text-muted-foreground">{service.count} bookings</span>
							</div>
							<div class="flex items-center justify-between">
								<div class="flex-1 bg-accent/20 rounded-full h-2 mr-3">
									<div 
										class="bg-primary h-2 rounded-full transition-all duration-500"
										style="width: {(service.count / Math.max(...reportsData.services.popular.map(s => s.count))) * 100}%"
									></div>
								</div>
								<span class="text-sm font-semibold text-foreground">{formatPrice(service.revenue)}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
	
	<!-- Additional Metrics -->
	<div class="enhanced-card p-6 rounded-xl">
		<h3 class="text-lg font-semibold text-foreground mb-6">Additional Insights</h3>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div class="text-center">
				<div class="text-2xl font-bold text-primary mb-2">{formatPrice(averageBookingValue)}</div>
				<div class="text-sm text-muted-foreground">Average Booking Value</div>
			</div>
			
			<div class="text-center">
				<div class="text-2xl font-bold text-green-600 mb-2">{reportsData.clients.new}</div>
				<div class="text-sm text-muted-foreground">New Clients This Period</div>
			</div>
			
			<div class="text-center">
				<div class="text-2xl font-bold text-blue-600 mb-2">{Math.round((reportsData.clients.returning / reportsData.clients.total) * 100)}%</div>
				<div class="text-sm text-muted-foreground">Client Retention Rate</div>
			</div>
		</div>
	</div>
</div>
