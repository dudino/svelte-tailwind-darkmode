<!--
  Admin Dashboard
  Main dashboard for administrators with overview and quick actions
-->

<script lang="ts">
  import { onMount } from 'svelte';
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
    BarChart3
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { 
    dashboardStats, 
    dashboardActions,
    dashboardLoading,
    dashboardError,
    usersCount,
    locationsCount,
    servicesCount,
    clientsCount,
    bookingsCount,
    reviewsCount
  } from '$lib/stores/admin';

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

  // Reactive stats based on store values with safe defaults and null checks
  $: {
    localStats = {
      users: $usersCount ?? 0,
      locations: $locationsCount ?? 0,
      rooms: $dashboardStats?.rooms ?? 0,
      bookings: $bookingsCount ?? 0,
      clients: $clientsCount ?? 0,
      reviews: $reviewsCount ?? 0,
      services: $servicesCount ?? 0,
      schedules: $dashboardStats?.schedules ?? 0
    };
  }

  // Loading and error states from dashboard store with safe defaults
  $: loading = $dashboardLoading ?? false;
  $: error = $dashboardError ?? null;

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

  onMount(async () => {
    // Load dashboard stats using the dashboard store
    try {
      await dashboardActions.loadDashboardStats();
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  });
</script>

<svelte:head>
  <title>Admin Dashboard - Affinity</title>
</svelte:head>

<div class="space-y-6">
  <!-- Welcome Section -->
  <div class="bg-card text-card-foreground rounded-lg p-6 border">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h2>
        <p class="text-muted-foreground text-lg">
          Manage all aspects of your massage parlor business from here.
        </p>
      </div>
      <div class="hidden md:block">
        <BarChart3 class="h-16 w-16 text-primary/20" />
      </div>
    </div>
  </div>

  <!-- Error Display -->
  {#if error}
    <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive font-medium">Error loading dashboard data:</p>
      <p class="text-destructive text-sm">{error}</p>
    </div>
  {/if}

  <!-- Quick Stats -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="bg-card rounded-lg p-4 border">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted-foreground">Total Users</p>
          {#if loading}
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
          {#if loading}
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
          {#if loading}
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
          {#if loading}
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
      <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div class="flex items-center">
          <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
          <span class="text-sm">New user registered: Maria Novakova</span>
        </div>
        <span class="text-xs text-muted-foreground">2 hours ago</span>
      </div>
      <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div class="flex items-center">
          <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          <span class="text-sm">Booking confirmed: #BK-2025-001</span>
        </div>
        <span class="text-xs text-muted-foreground">4 hours ago</span>
      </div>
      <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div class="flex items-center">
          <div class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
          <span class="text-sm">New review received: 5 stars</span>
        </div>
        <span class="text-xs text-muted-foreground">6 hours ago</span>
      </div>
    </div>
  </div>
</div>
