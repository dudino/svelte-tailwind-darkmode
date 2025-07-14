<!--
  Admin Dashboard
  Main dashboard for administrators with overview and quick actions
  Restricted to administrator role only
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { 
    Users, 
    MapPin, 
    Calendar, 
    FileText, 
    Star, 
    Building, 
    Settings,
    Plus,
    Eye,
    Edit,
    Trash2,
    BarChart3,
    AlertTriangle,
    Shield
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { 
    dashboardStats, 
    dashboardActions,
    dashboardLoading,
    dashboardError,
    recentBookings,
    recentReviews,
    recentUsers,
    todayBookings
  } from '$lib/stores/admin';
  import { currentUser, userRole, isAuthenticated } from '$lib/stores/authStore';

  // Access control
  let hasAccess = false;
  let loading = true;
  let authError = '';

  // Initialize with safe default values to prevent undefined errors
  let localStats = {
    users: 0,
    locations: 0,
    rooms: 0,
    bookings: 0,
    clients: 0,
    reviews: 0,
    services: 0,
    schedules: 0
  };

  // Check authentication and role on mount
  onMount(async () => {
    try {
      // Wait a bit for auth store to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!$isAuthenticated) {
        authError = 'You must be logged in to access the admin dashboard.';
        goto('/login?redirect=/admin');
        return;
      }

      if ($userRole !== 'administrator' && $userRole !== 'operator') {
        authError = 'Access denied. Administrator or operator role required.';
        goto('/');
        return;
      }

      hasAccess = true;
      
      // Load dashboard data
      await dashboardActions.loadDashboardStats();
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      authError = 'Failed to load dashboard data.';
    } finally {
      loading = false;
    }
  });

  // Reactive stats based on dashboard store values with safe defaults
  $: {
    localStats = {
      users: $dashboardStats?.users ?? 0,
      locations: $dashboardStats?.locations ?? 0,
      rooms: $dashboardStats?.rooms ?? 0,
      bookings: $dashboardStats?.bookings ?? 0,
      clients: $dashboardStats?.clients ?? 0,
      reviews: $dashboardStats?.reviews ?? 0,
      services: $dashboardStats?.services ?? 0,
      schedules: $dashboardStats?.schedules ?? 0
    };
  }

  // Loading and error states from dashboard store with safe defaults
  $: dashboardIsLoading = $dashboardLoading ?? false;
  $: error = $dashboardError ?? null;

  // Combine and sort all recent activity by date
  $: allRecentActivity = [
    ...($recentUsers || []).map(user => ({
      type: 'user',
      data: user,
      created: user.created,
      color: 'bg-green-500',
      message: `New user registered: ${user.name || user.email || 'User'}${user.role ? ` (${user.role})` : ''}`
    })),
    ...($recentBookings || []).map(booking => ({
      type: 'booking',
      data: booking,
      created: booking.created,
      color: 'bg-blue-500',
      message: `Booking created: #${booking.booking_number}${booking.expand?.client_id ? ` for ${booking.expand.client_id.nickname || booking.expand.client_id.first_name || 'Client'}` : ''}`
    })),
    ...($recentReviews || []).map(review => ({
      type: 'review',
      data: review,
      created: review.created,
      color: 'bg-yellow-500',
      message: `New review: ${review.rating}/5 stars${review.expand?.client_id ? ` from ${review.expand.client_id.nickname || review.expand.client_id.first_name || 'Client'}` : ''}${review.title ? ` - "${review.title}"` : ''}`
    }))
  ].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()).slice(0, 10);

  // Reactive admin sections that update when stats change
  $: adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'from-blue-500 to-blue-600',
      stat: localStats.users,
      statLabel: 'Total Users'
    },
    {
      title: 'Locations',
      description: 'Manage business locations',
      icon: MapPin,
      href: '/admin/locations',
      color: 'from-green-500 to-green-600',
      stat: localStats.locations,
      statLabel: 'Locations'
    },
    {
      title: 'Rooms',
      description: 'Manage rooms and facilities',
      icon: Building,
      href: '/admin/rooms',
      color: 'from-purple-500 to-purple-600',
      stat: localStats.rooms,
      statLabel: 'Total Rooms'
    },
    {
      title: 'Services',
      description: 'Manage available services',
      icon: Settings,
      href: '/admin/services',
      color: 'from-orange-500 to-orange-600',
      stat: localStats.services,
      statLabel: 'Services'
    },
    {
      title: 'Schedules',
      description: 'View and manage schedules',
      icon: Calendar,
      href: '/admin/schedules',
      color: 'from-indigo-500 to-indigo-600',
      stat: localStats.schedules,
      statLabel: 'Schedules'
    },
    {
      title: 'Bookings',
      description: 'Manage bookings and appointments',
      icon: FileText,
      href: '/admin/bookings',
      color: 'from-red-500 to-red-600',
      stat: localStats.bookings,
      statLabel: 'Bookings'
    },
    {
      title: 'Clients',
      description: 'Manage client information',
      icon: Users,
      href: '/admin/clients',
      color: 'from-teal-500 to-teal-600',
      stat: localStats.clients,
      statLabel: 'Clients'
    },
    {
      title: 'Reviews',
      description: 'Manage reviews and feedback',
      icon: Star,
      href: '/admin/reviews',
      color: 'from-yellow-500 to-yellow-600',
      stat: localStats.reviews,
      statLabel: 'Reviews'
    }
  ];
</script>

<svelte:head>
  <title>Admin Dashboard - TimeIt</title>
</svelte:head>

<!-- Loading State -->
{#if loading}
  <div class="flex items-center justify-center min-h-[400px]">
    <div class="text-center space-y-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p class="text-muted-foreground">Loading admin dashboard...</p>
    </div>
  </div>
{:else if authError}
  <!-- Access Denied -->
  <div class="flex items-center justify-center min-h-[400px]">
    <div class="text-center space-y-4 max-w-md">
      <div class="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
        <Shield class="h-8 w-8 text-destructive" />
      </div>
      <h2 class="text-2xl font-bold text-destructive">Access Denied</h2>
      <p class="text-muted-foreground">{authError}</p>
      <div class="flex gap-4 justify-center">
        <Button href="/login" variant="default">
          Go to Login
        </Button>
        <Button href="/" variant="outline">
          Return Home
        </Button>
      </div>
    </div>
  </div>
{:else if hasAccess}
  <!-- Admin Dashboard Content -->
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="bg-card text-card-foreground rounded-lg p-6 border">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold mb-2">Welcome, {$currentUser?.name || 'Administrator'}</h2>
          <p class="text-muted-foreground text-lg">
            Manage all aspects of your massage parlor business from here.
          </p>
          <div class="flex items-center gap-2 mt-2">
            <span class="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Administrator Access
            </span>
            <span class="text-sm text-muted-foreground">
              Last login: {$currentUser?.last_login_at ? new Date($currentUser.last_login_at).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
        <div class="hidden md:block">
          <BarChart3 class="h-16 w-16 text-primary/20" />
        </div>
      </div>
    </div>

    <!-- Error Display -->
    {#if error}
      <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <div class="flex items-center gap-2">
          <AlertTriangle class="h-5 w-5 text-destructive" />
          <p class="text-destructive font-medium">Error loading dashboard data:</p>
        </div>
        <p class="text-destructive text-sm mt-1">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          class="mt-3"
          on:click={() => dashboardActions.loadDashboardStats()}
        >
          Retry Loading
        </Button>
      </div>
    {/if}

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-card rounded-lg p-4 border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Users</p>
            {#if dashboardIsLoading}
              <div class="h-8 bg-muted animate-pulse rounded"></div>
            {:else}
              <p class="text-2xl font-bold">{localStats.users}</p>
            {/if}
          </div>
          <Users class="h-8 w-8 text-blue-500" />
        </div>
      </div>
      <div class="bg-card rounded-lg p-4 border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Active Bookings</p>
            {#if dashboardIsLoading}
              <div class="h-8 bg-muted animate-pulse rounded"></div>
            {:else}
              <p class="text-2xl font-bold">{localStats.bookings}</p>
            {/if}
          </div>
          <FileText class="h-8 w-8 text-red-500" />
        </div>
      </div>
      <div class="bg-card rounded-lg p-4 border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Clients</p>
            {#if dashboardIsLoading}
              <div class="h-8 bg-muted animate-pulse rounded"></div>
            {:else}
              <p class="text-2xl font-bold">{localStats.clients}</p>
            {/if}
          </div>
          <Users class="h-8 w-8 text-teal-500" />
        </div>
      </div>
      <div class="bg-card rounded-lg p-4 border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Reviews</p>
            {#if dashboardIsLoading}
              <div class="h-8 bg-muted animate-pulse rounded"></div>
            {:else}
              <p class="text-2xl font-bold">{localStats.reviews}</p>
            {/if}
          </div>
          <Star class="h-8 w-8 text-yellow-500" />
        </div>
      </div>
    </div>

  <!-- Management Sections -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {#each adminSections as section}
      <div class="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div class="p-6">
          <!-- Icon and Title -->
          <div class="flex items-center mb-4">
            <div class="p-3 rounded-lg bg-gradient-to-r {section.color} mr-4">
              <svelte:component this={section.icon} class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="font-semibold text-lg">{section.title}</h3>
              <p class="text-sm text-muted-foreground">{section.statLabel}: {section.stat}</p>
            </div>
          </div>

          <!-- Description -->
          <p class="text-muted-foreground mb-4 text-sm">
            {section.description}
          </p>

          <!-- Action Button -->
          <Button 
            href={section.href} 
            class="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
            variant="outline"
          >
            <Eye class="h-4 w-4 mr-2" />
            Manage
          </Button>
        </div>
      </div>
    {/each}
  </div>

  <!-- Recent Activity Section -->
  <div class="bg-card rounded-lg border p-6">
    <h3 class="text-xl font-semibold mb-4 flex items-center">
      <BarChart3 class="h-5 w-5 mr-2 text-primary" />
      Recent Activity
    </h3>
    <div class="space-y-3">
      {#if dashboardIsLoading}
        <!-- Loading skeleton -->
        {#each Array(3) as _}
          <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-pulse">
            <div class="flex items-center">
              <div class="w-2 h-2 bg-muted rounded-full mr-3"></div>
              <div class="h-4 bg-muted rounded w-48"></div>
            </div>
            <div class="h-3 bg-muted rounded w-16"></div>
          </div>
        {/each}
      {:else}
        <!-- Combined recent activity -->
        {#each allRecentActivity as activity}
          <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div class="flex items-center">
              <div class="w-2 h-2 {activity.color} rounded-full mr-3"></div>
              <span class="text-sm">{activity.message}</span>
            </div>
            <span class="text-xs text-muted-foreground">
              {new Date(activity.created).toLocaleDateString()} {new Date(activity.created).toLocaleTimeString()}
            </span>
          </div>
        {/each}

        <!-- Show message if no recent activity -->
        {#if allRecentActivity.length === 0}
          <div class="flex items-center justify-center p-6 text-muted-foreground">
            <div class="text-center">
              <BarChart3 class="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p class="text-sm">No recent activity to display</p>
              <p class="text-xs">Activity will appear here as users register, bookings are created, and reviews are submitted</p>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>
  <!-- End Recent Activity Section -->
  
  </div>
  <!-- End Admin Dashboard Content -->
{/if}
