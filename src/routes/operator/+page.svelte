<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { 
    Calendar, 
    Users, 
    Clock, 
    TrendingUp, 
    MapPin, 
    Plus,
    RefreshCw,
    Star,
    CheckCircle,
    XCircle,
    Home,
    DollarSign,
    Activity,
    BarChart3,
    AlertCircle
  } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { 
    operatorDashboardStore, 
    operatorDashboardActions, 
    dashboardStats, 
    dashboardLoading, 
    dashboardError,
    startAutoRefresh,
    stopAutoRefresh
  } from '$lib/stores/operator';
  import { goto } from '$app/navigation';

  let selectedDate = new Date().toISOString().split('T')[0];

  onMount(async () => {
    try {
      await operatorDashboardActions.loadDashboardData(selectedDate);
      startAutoRefresh();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    }
  });

  onDestroy(() => {
    stopAutoRefresh();
  });

  function handleDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    selectedDate = target.value;
    operatorDashboardActions.setSelectedDate(selectedDate);
  }

  function handleRefresh() {
    operatorDashboardActions.refreshData();
    toast.success('Dashboard refreshed');
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function formatTime(time: string): string {
    return time ? time.substring(0, 5) : '';
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getOccupancyColor(rate: number): string {
    if (rate >= 80) return 'bg-red-500';
    if (rate >= 60) return 'bg-yellow-500';
    if (rate >= 40) return 'bg-blue-500';
    return 'bg-green-500';
  }

  function navigateToBookings() {
    goto('/operator/bookings');
  }

  function navigateToClients() {
    goto('/admin/clients');
  }

  function navigateToSchedules() {
    goto('/admin/schedules');
  }

  $: stats = $dashboardStats;
  $: loading = $dashboardLoading;
  $: error = $dashboardError;
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 class="text-3xl font-bold flex items-center gap-3">
        <Home class="h-8 w-8 text-primary" />
        Operator Dashboard
      </h1>
      <p class="text-muted-foreground">Overview of your operations and key metrics</p>
    </div>
    
    <div class="flex items-center gap-3">
      <!-- Date Selector -->
      <div class="flex items-center space-x-2">
        <Calendar class="w-4 h-4 text-muted-foreground" />
        <input 
          type="date" 
          class="border border-border rounded-md px-3 py-2 bg-background text-sm"
          value={selectedDate}
          on:change={handleDateChange}
        />
      </div>

      <!-- Refresh Button -->
      <Button 
        variant="outline" 
        size="sm"
        on:click={handleRefresh}
        disabled={loading}
      >
        <RefreshCw class="w-4 h-4 {loading ? 'animate-spin' : ''}" />
      </Button>
    </div>
  </div>

  {#if loading && !stats.todayBookings}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  {:else if error}
    <Card>
      <CardContent class="p-6 text-center">
        <AlertCircle class="w-12 h-12 text-destructive mx-auto mb-4" />
        <p class="text-destructive mb-4">{error}</p>
        <Button on:click={handleRefresh}>
          <RefreshCw class="w-4 h-4 mr-2" />
          Retry
        </Button>
      </CardContent>
    </Card>
  {:else}
    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Today's Bookings -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Today's Bookings</CardTitle>
          <Calendar class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{stats.todayBookings.total}</div>
          <div class="flex items-center gap-4 mt-2 text-sm">
            <div class="flex items-center gap-1">
              <CheckCircle class="h-3 w-3 text-green-500" />
              <span class="text-green-600">{stats.todayBookings.confirmed}</span>
            </div>
            <div class="flex items-center gap-1">
              <Clock class="h-3 w-3 text-yellow-500" />
              <span class="text-yellow-600">{stats.todayBookings.pending}</span>
            </div>
            <div class="flex items-center gap-1">
              <XCircle class="h-3 w-3 text-red-500" />
              <span class="text-red-600">{stats.todayBookings.cancelled}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Weekly Revenue -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Weekly Revenue</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{formatCurrency(stats.weeklyStats.revenue)}</div>
          <p class="text-xs text-muted-foreground mt-1">
            From {stats.weeklyStats.totalBookings} bookings
          </p>
        </CardContent>
      </Card>

      <!-- New Clients -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">New Clients</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{stats.weeklyStats.newClients}</div>
          <p class="text-xs text-muted-foreground mt-1">This week</p>
        </CardContent>
      </Card>

      <!-- Average Rating -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Average Rating</CardTitle>
          <Star class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold flex items-center gap-1">
            {stats.weeklyStats.averageRating}
            <Star class="h-5 w-5 fill-yellow-400 text-yellow-400" />
          </div>
          <p class="text-xs text-muted-foreground mt-1">This week</p>
        </CardContent>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Upcoming Bookings -->
      <div class="lg:col-span-2">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>Upcoming Bookings</CardTitle>
              <Button size="sm" on:click={navigateToBookings}>
                <Plus class="w-4 h-4 mr-2" />
                Add Booking
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {#if stats.upcomingBookings.length === 0}
              <div class="text-center py-8 text-muted-foreground">
                <Calendar class="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming bookings</p>
              </div>
            {:else}
              <div class="space-y-3">
                {#each stats.upcomingBookings as booking}
                  <div class="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50">
                    <div class="flex items-center gap-3">
                      <div class="text-sm">
                        <div class="font-medium">
                          {booking.expand?.client_id?.nickname || booking.expand?.client_id?.first_name || 'Client'}
                        </div>
                        <div class="text-muted-foreground">
                          {booking.expand?.service_id?.name}
                        </div>
                      </div>
                    </div>
                    <div class="text-right text-sm">
                      <div class="font-medium">
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div class="text-muted-foreground">
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </div>
                    </div>
                    <div>
                      <Badge 
                        variant={booking.is_confirmed ? "default" : "secondary"}
                        class="text-xs"
                      >
                        {booking.is_confirmed ? 'Confirmed' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </CardContent>
        </Card>
      </div>

      <!-- Right Sidebar -->
      <div class="space-y-6">
        <!-- Room Occupancy -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Room Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            {#if stats.roomOccupancy.length === 0}
              <div class="text-center py-4 text-muted-foreground">
                <MapPin class="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p class="text-sm">No room data</p>
              </div>
            {:else}
              <div class="space-y-3">
                {#each stats.roomOccupancy as room}
                  <div class="space-y-2">
                    <div class="flex justify-between items-center text-sm">
                      <span class="font-medium">{room.roomName}</span>
                      <span class="text-muted-foreground">{room.occupancyRate}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        class="h-2 rounded-full transition-all duration-300 {getOccupancyColor(room.occupancyRate)}"
                        style="width: {room.occupancyRate}%"
                      ></div>
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {room.bookedSlots}/{room.totalSlots} slots • {room.location}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </CardContent>
        </Card>

        <!-- Active Staff -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Active Staff Today</CardTitle>
          </CardHeader>
          <CardContent>
            {#if stats.activeUsers.length === 0}
              <div class="text-center py-4 text-muted-foreground">
                <Users class="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p class="text-sm">No staff scheduled</p>
              </div>
            {:else}
              <div class="space-y-2">
                {#each stats.activeUsers as user}
                  <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-primary">
                        {(user.name || user.username || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate">
                        {user.name || user.username}
                      </p>
                      <p class="text-xs text-muted-foreground capitalize">
                        {user.role}
                      </p>
                    </div>
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                {/each}
              </div>
            {/if}
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Recent Clients -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Recent Clients</CardTitle>
          <Button variant="outline" size="sm" on:click={navigateToClients}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {#if stats.recentClients.length === 0}
          <div class="text-center py-8 text-muted-foreground">
            <Users class="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent clients</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {#each stats.recentClients as client}
              <div class="border border-border rounded-lg p-4 hover:bg-muted/50">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-primary">
                      {(client.nickname || client.first_name || 'C')[0].toUpperCase()}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm truncate">
                      {client.nickname || client.first_name || 'Unknown'}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {client.phone_number}
                    </p>
                  </div>
                </div>
                <div class="text-xs text-muted-foreground">
                  Joined {new Date(client.created).toLocaleDateString()}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- Quick Actions -->
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button on:click={navigateToBookings} class="h-20 flex flex-col items-center justify-center">
            <Calendar class="w-6 h-6 mb-2" />
            Manage Bookings
          </Button>
          <Button variant="outline" on:click={navigateToClients} class="h-20 flex flex-col items-center justify-center">
            <Users class="w-6 h-6 mb-2" />
            View Clients
          </Button>
          <Button variant="outline" on:click={navigateToSchedules} class="h-20 flex flex-col items-center justify-center">
            <Clock class="w-6 h-6 mb-2" />
            View Schedules
          </Button>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
