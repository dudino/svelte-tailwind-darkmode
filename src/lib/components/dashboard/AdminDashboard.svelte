<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { Users, MapPin, Calendar, FileText, BarChart3, Star, TrendingUp, Clock, DollarSign } from 'lucide-svelte';
	import { masseuseData, todaysAvailability, availableMasseuses } from '$lib/stores/masseuse';
	import Button from '$lib/components/ui/button/button.svelte';
	
	$: user = $currentUser;
	
	const adminActions = [
		{ title: 'User Management', description: 'Manage administrators, operators, and masseuses', icon: Users, href: '/users', color: 'bg-blue-500' },
		{ title: 'Locations & Rooms', description: 'Configure parlor locations and massage rooms', icon: MapPin, href: '/locations', color: 'bg-green-500' },
		{ title: 'Schedule Overview', description: 'View and manage all masseuse schedules', icon: Calendar, href: '/schedules', color: 'bg-purple-500' },
		{ title: 'All Bookings', description: 'Monitor and manage client bookings', icon: FileText, href: '/bookings', color: 'bg-orange-500' },
		{ title: 'Reports & Analytics', description: 'View business performance and trends', icon: BarChart3, href: '/reports', color: 'bg-red-500' },
		{ title: 'Reviews Management', description: 'Monitor client feedback and ratings', icon: Star, href: '/reviews', color: 'bg-yellow-500' }
	];
	
	const recentStats = [
		{ label: 'Total Bookings Today', value: '23', change: '+12%', positive: true, icon: Calendar },
		{ label: 'Active Masseuses', value: `${$todaysAvailability.length}`, change: '+2', positive: true, icon: Users },
		{ label: 'Average Rating', value: '4.8', change: '+0.2', positive: true, icon: Star },
		{ label: 'Revenue Today', value: '$2,340', change: '+18%', positive: true, icon: DollarSign }
	];
	
	const topMasseuses = [
		{ name: 'Monika', bookings: 12, rating: 4.9, revenue: '$1,240' },
		{ name: 'Melissa', bookings: 10, rating: 4.8, revenue: '$980' },
		{ name: 'Silvia', bookings: 9, rating: 4.7, revenue: '$890' },
		{ name: 'Mia', bookings: 8, rating: 4.9, revenue: '$820' }
	];
	
	const recentActivity = [
		{ type: 'booking', message: 'New booking created by Operator Jane', time: '5 min ago', status: 'success' },
		{ type: 'review', message: 'New 5-star review for Monika', time: '12 min ago', status: 'success' },
		{ type: 'schedule', message: 'Melissa updated her availability', time: '25 min ago', status: 'info' },
		{ type: 'user', message: 'New masseuse Andrea registered', time: '1 hour ago', status: 'info' },
		{ type: 'booking', message: 'Booking cancelled by client', time: '2 hours ago', status: 'warning' }
	];
	
	function getActivityIcon(type: string) {
		switch (type) {
			case 'booking': return Calendar;
			case 'review': return Star;
			case 'schedule': return Clock;
			case 'user': return Users;
			default: return FileText;
		}
	}
	
	function getActivityColor(status: string) {
		switch (status) {
			case 'success': return 'text-green-600';
			case 'warning': return 'text-yellow-600';
			case 'error': return 'text-red-600';
			default: return 'text-blue-600';
		}
	}
</script>

<div class="space-y-8">
	<!-- Welcome Header -->
	<div class="text-center py-8">
		<h1 class="text-4xl md:text-5xl font-bold mb-4">
			<span class="gradient-text">Administrator Dashboard</span>
		</h1>
		<p class="text-xl text-muted-foreground">
			Welcome back, {user?.firstName}! Here's your system overview.
		</p>
	</div>
	
	<!-- Stats Overview -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each recentStats as stat}
			<div class="enhanced-card p-6 rounded-xl">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<div class="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
							<svelte:component this={stat.icon} class="h-6 w-6 text-primary" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground mb-1">{stat.label}</p>
							<p class="text-2xl font-bold text-foreground">{stat.value}</p>
						</div>
					</div>
					<div class={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
						{stat.change}
					</div>
				</div>
			</div>
		{/each}
	</div>
	
	<!-- Quick Actions -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each adminActions as action}
			<a href={action.href} class="enhanced-card p-6 rounded-xl hover:scale-105 transition-all duration-300 group">
				<div class="flex items-start space-x-4">
					<div class={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
						<svelte:component this={action.icon} class="h-6 w-6" />
					</div>
					<div class="flex-1">
						<h3 class="text-lg font-semibold text-foreground mb-2">{action.title}</h3>
						<p class="text-sm text-muted-foreground">{action.description}</p>
					</div>
				</div>
			</a>
		{/each}
	</div>
	
	<!-- Main Analytics Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Top Performing Masseuses -->
		<div class="enhanced-card p-6 rounded-xl">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-bold text-foreground">Top Performers Today</h2>
				<Button href="/reports/masseuses" variant="outline" class="glass-button">
					<TrendingUp class="h-4 w-4 mr-2" />
					View All
				</Button>
			</div>
			<div class="space-y-4">
				{#each topMasseuses as masseuse, index}
					<div class="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
						<div class="flex items-center space-x-3">
							<div class="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
								<span class="text-primary-foreground font-bold text-sm">#{index + 1}</span>
							</div>
							<div>
								<p class="font-medium text-foreground">{masseuse.name}</p>
								<div class="flex items-center space-x-2 text-sm text-muted-foreground">
									<span>{masseuse.bookings} bookings</span>
									<span>•</span>
									<div class="flex items-center">
										<Star class="h-3 w-3 text-yellow-500 fill-current mr-1" />
										{masseuse.rating}
									</div>
								</div>
							</div>
						</div>
						<div class="text-right">
							<div class="font-bold text-green-600">{masseuse.revenue}</div>
							<div class="text-xs text-muted-foreground">Revenue</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Recent Activity Feed -->
		<div class="enhanced-card p-6 rounded-xl">
			<h2 class="text-xl font-bold text-foreground mb-6">Recent Activity</h2>
			<div class="space-y-4">
				{#each recentActivity as activity}
					<div class="flex items-start space-x-3 p-3 bg-accent/20 rounded-lg">
						<div class={`w-8 h-8 rounded-full flex items-center justify-center ${
							activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
							activity.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
							activity.status === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
							'bg-blue-100 dark:bg-blue-900/30'
						}`}>
							<svelte:component this={getActivityIcon(activity.type)} class={`h-4 w-4 ${getActivityColor(activity.status)}`} />
						</div>
						<div class="flex-1">
							<p class="text-sm text-foreground">{activity.message}</p>
							<p class="text-xs text-muted-foreground mt-1">{activity.time}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
	
	<!-- System Overview -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="enhanced-card p-6 rounded-xl">
			<h3 class="text-lg font-semibold text-foreground mb-4">Masseuse Overview</h3>
			<div class="space-y-3">
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Total Masseuses:</span>
					<span class="font-bold text-foreground">{masseuseData.length}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Available Today:</span>
					<span class="font-bold text-green-600">{$todaysAvailability.length}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">New Girls:</span>
					<span class="font-bold text-blue-600">{masseuseData.filter(m => m.status === 'New girl!').length}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Currently Available:</span>
					<span class="font-bold text-primary">{$availableMasseuses.length}</span>
				</div>
			</div>
		</div>
		
		<div class="enhanced-card p-6 rounded-xl">
			<h3 class="text-lg font-semibold text-foreground mb-4">Today's Summary</h3>
			<div class="space-y-3">
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Bookings Created:</span>
					<span class="font-bold text-foreground">23</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Completed Sessions:</span>
					<span class="font-bold text-green-600">18</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Reviews Received:</span>
					<span class="font-bold text-yellow-600">15</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Avg. Session Rating:</span>
					<span class="font-bold text-primary">4.8 ⭐</span>
				</div>
			</div>
		</div>
		
		<div class="enhanced-card p-6 rounded-xl">
			<h3 class="text-lg font-semibold text-foreground mb-4">System Health</h3>
			<div class="space-y-3">
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Active Users:</span>
					<span class="font-bold text-green-600">●  Online</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Database:</span>
					<span class="font-bold text-green-600">●  Healthy</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">API Status:</span>
					<span class="font-bold text-green-600">●  Running</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-muted-foreground">Last Backup:</span>
					<span class="font-bold text-foreground">2 hours ago</span>
				</div>
			</div>
		</div>
	</div>
</div>
