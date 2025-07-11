<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { Users, MapPin, Calendar, FileText, BarChart3, Star } from 'lucide-svelte';
	
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
		{ label: 'Total Bookings Today', value: '23', change: '+12%', positive: true },
		{ label: 'Active Masseuses', value: '15', change: '+2', positive: true },
		{ label: 'Average Rating', value: '4.8', change: '+0.2', positive: true },
		{ label: 'Revenue This Month', value: '$12,450', change: '+18%', positive: true }
	];
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
					<div>
						<p class="text-sm text-muted-foreground mb-1">{stat.label}</p>
						<p class="text-2xl font-bold text-foreground">{stat.value}</p>
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
	
	<!-- Recent Activity -->
	<div class="enhanced-card p-8 rounded-xl">
		<h2 class="text-2xl font-bold text-foreground mb-6">Recent System Activity</h2>
		<div class="space-y-4">
			<div class="flex items-center space-x-4 p-4 bg-accent/20 rounded-lg">
				<div class="w-2 h-2 bg-green-500 rounded-full"></div>
				<div class="flex-1">
					<p class="font-medium text-foreground">New masseuse added: Tiffany</p>
					<p class="text-sm text-muted-foreground">2 hours ago</p>
				</div>
			</div>
			<div class="flex items-center space-x-4 p-4 bg-accent/20 rounded-lg">
				<div class="w-2 h-2 bg-blue-500 rounded-full"></div>
				<div class="flex-1">
					<p class="font-medium text-foreground">15 new bookings scheduled for tomorrow</p>
					<p class="text-sm text-muted-foreground">4 hours ago</p>
				</div>
			</div>
			<div class="flex items-center space-x-4 p-4 bg-accent/20 rounded-lg">
				<div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
				<div class="flex-1">
					<p class="font-medium text-foreground">Room 3 maintenance scheduled</p>
					<p class="text-sm text-muted-foreground">6 hours ago</p>
				</div>
			</div>
		</div>
	</div>
</div>
