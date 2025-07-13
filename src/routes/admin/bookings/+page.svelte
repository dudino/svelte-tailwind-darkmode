<!--
  Admin Bookings Management
  CRUD interface for managing bookings (Administrator only)
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    Calendar,
    Eye,
    MapPin,
    Clock,
    User,
    Filter,
    FileText
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import { getPocketBaseClient } from '$lib/stores/authStore';
  import BookingFormModal from '$lib/components/admin/BookingFormModal.svelte';
  import BookingDetailModal from '$lib/components/admin/BookingDetailModal.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

  // Local state
  let bookings: any[] = [];
  let locations: any[] = [];
  let services: any[] = [];
  let users: any[] = [];
  let clients: any[] = [];
  let rooms: any[] = [];
  let filteredBookings: any[] = [];
  let searchTerm = '';
  let filterLocation = '';
  let filterService = '';
  let filterUser = '';
  let filterStatus = '';
  let selectedBookings: string[] = [];
  let showBookingForm = false;
  let showBookingDetail = false;
  let showDeleteConfirm = false;
  let editingBooking: any = null;
  let viewingBooking: any = null;
  let bookingToDelete: any = null;
  let loading = false;
  let error = '';

  // Pagination
  let currentPage = 1;
  let itemsPerPage = 10;

  // Filter options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' }
  ];

  // Reactive filtering
  $: {
    filteredBookings = bookings.filter(booking => {
      const matchesSearch = !searchTerm || 
        booking.expand?.client_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.expand?.service_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.expand?.location_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = !filterLocation || booking.location_id === filterLocation;
      const matchesService = !filterService || booking.service_id === filterService;
      const matchesUser = !filterUser || booking.user_id === filterUser;
      const matchesStatus = !filterStatus || booking.status === filterStatus;
      
      return matchesSearch && matchesLocation && matchesService && matchesUser && matchesStatus;
    });
  }

  // Pagination
  $: totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  $: paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  onMount(() => {
    loadData();
  });

  async function loadData() {
    await Promise.all([
      loadBookings(), 
      loadLocations(), 
      loadServices(), 
      loadUsers(), 
      loadClients(),
      loadRooms()
    ]);
  }

  async function loadBookings() {
    loading = true;
    error = '';
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const records = await pb.collection('bookings').getFullList({
        sort: '-created',
        expand: 'location_id,service_id,user_id,client_id,room_id'
      });
      
      bookings = records;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load bookings';
      console.error('Error loading bookings:', err);
    } finally {
      loading = false;
    }
  }

  async function loadLocations() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const records = await pb.collection('locations').getFullList({
        sort: 'name',
        filter: 'is_active = true'
      });
      
      locations = records;
    } catch (err) {
      console.error('Error loading locations:', err);
    }
  }

  async function loadServices() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const records = await pb.collection('services').getFullList({
        sort: 'name',
        filter: 'is_active = true'
      });
      
      services = records;
    } catch (err) {
      console.error('Error loading services:', err);
    }
  }

  async function loadUsers() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const records = await pb.collection('users').getFullList({
        sort: 'name',
        filter: 'is_active = true'
      });
      
      users = records;
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }

  async function loadClients() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const records = await pb.collection('clients').getFullList({
        sort: 'name'
      });
      
      clients = records;
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  }

  async function loadRooms() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const records = await pb.collection('rooms').getFullList({
        sort: 'name',
        filter: 'is_active = true'
      });
      
      rooms = records;
    } catch (err) {
      console.error('Error loading rooms:', err);
    }
  }

  function handleCreateBooking() {
    editingBooking = null;
    showBookingForm = true;
  }

  function handleEditBooking(booking: any) {
    editingBooking = { ...booking };
    showBookingForm = true;
  }

  function handleViewBooking(booking: any) {
    viewingBooking = booking;
    showBookingDetail = true;
  }

  function handleDeleteBooking(booking: any) {
    bookingToDelete = booking;
    showDeleteConfirm = true;
  }

  async function confirmDeleteBooking() {
    if (!bookingToDelete) return;
    
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      await pb.collection('bookings').delete(bookingToDelete.id);
      
      showDeleteConfirm = false;
      bookingToDelete = null;
      await loadBookings(); // Refresh the list
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete booking';
      console.error('Error deleting booking:', err);
    }
  }

  function toggleBookingSelection(bookingId: string) {
    if (selectedBookings.includes(bookingId)) {
      selectedBookings = selectedBookings.filter(id => id !== bookingId);
    } else {
      selectedBookings = [...selectedBookings, bookingId];
    }
  }

  function selectAllBookings() {
    selectedBookings = paginatedBookings.map(b => b.id);
  }

  function clearSelection() {
    selectedBookings = [];
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatTime(timeString: string) {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }
</script>

<svelte:head>
  <title>Bookings Management - Admin</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
        <FileText class="h-8 w-8 text-primary" />
        Bookings Management
      </h1>
      <p class="text-muted-foreground mt-2">
        Manage customer bookings and appointments.
      </p>
    </div>
    <Button on:click={handleCreateBooking} class="gap-2">
      <Plus class="h-4 w-4" />
      Add Booking
    </Button>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive">{error}</p>
    </div>
  {/if}

  <!-- Filters and Search -->
  <div class="bg-card rounded-lg border p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <!-- Search -->
      <div class="lg:col-span-2">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            bind:value={searchTerm}
            placeholder="Search bookings..."
            class="pl-10"
          />
        </div>
      </div>

      <!-- Location Filter -->
      <div>
        <select 
          bind:value={filterLocation}
          class="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Locations</option>
          {#each locations as location}
            <option value={location.id}>{location.name}</option>
          {/each}
        </select>
      </div>

      <!-- Service Filter -->
      <div>
        <select 
          bind:value={filterService}
          class="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Services</option>
          {#each services as service}
            <option value={service.id}>{service.name}</option>
          {/each}
        </select>
      </div>

      <!-- User Filter -->
      <div>
        <select 
          bind:value={filterUser}
          class="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Users</option>
          {#each users as user}
            <option value={user.id}>{user.name || user.email}</option>
          {/each}
        </select>
      </div>

      <!-- Status Filter -->
      <div>
        <select 
          bind:value={filterStatus}
          class="w-full px-3 py-2 border rounded-md bg-background"
        >
          {#each statusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Selected Actions -->
    {#if selectedBookings.length > 0}
      <div class="flex items-center gap-3 mt-4 p-3 bg-muted rounded-lg">
        <span class="text-sm font-medium">
          {selectedBookings.length} booking(s) selected
        </span>
        <Button variant="outline" size="sm" on:click={clearSelection}>
          Clear Selection
        </Button>
        <!-- Add bulk actions here if needed -->
      </div>
    {/if}
  </div>

  <!-- Bookings Table -->
  <div class="bg-card rounded-lg border">
    {#if loading}
      <div class="flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    {:else if paginatedBookings.length === 0}
      <div class="text-center p-8">
        <FileText class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 class="text-lg font-semibold mb-2">No bookings found</h3>
        <p class="text-muted-foreground mb-4">
          {filteredBookings.length === 0 && bookings.length > 0 
            ? 'No bookings match your current filters.' 
            : 'Get started by creating your first booking.'}
        </p>
        {#if filteredBookings.length === 0 && bookings.length === 0}
          <Button on:click={handleCreateBooking}>
            <Plus class="h-4 w-4 mr-2" />
            Create Booking
          </Button>
        {/if}
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="p-4">
                <input
                  type="checkbox"
                  class="rounded"
                  checked={selectedBookings.length === paginatedBookings.length}
                  on:change={selectedBookings.length === paginatedBookings.length ? clearSelection : selectAllBookings}
                />
              </th>
              <th class="p-4 font-medium">Client & Service</th>
              <th class="p-4 font-medium">Location & Room</th>
              <th class="p-4 font-medium">Staff</th>
              <th class="p-4 font-medium">Date & Time</th>
              <th class="p-4 font-medium">Status</th>
              <th class="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            {#each paginatedBookings as booking}
              <tr class="hover:bg-muted/50">
                <td class="p-4">
                  <input
                    type="checkbox"
                    class="rounded"
                    checked={selectedBookings.includes(booking.id)}
                    on:change={() => toggleBookingSelection(booking.id)}
                  />
                </td>
                <td class="p-4">
                  <div>
                    <p class="font-medium">{booking.expand?.client_id?.name || 'Unknown Client'}</p>
                    <p class="text-sm text-muted-foreground">{booking.expand?.service_id?.name || 'No service'}</p>
                  </div>
                </td>
                <td class="p-4">
                  <div>
                    <div class="flex items-center gap-1 text-sm">
                      <MapPin class="h-3 w-3 text-muted-foreground" />
                      {booking.expand?.location_id?.name || 'Unknown'}
                    </div>
                    {#if booking.expand?.room_id}
                      <p class="text-sm text-muted-foreground">{booking.expand.room_id.name}</p>
                    {/if}
                  </div>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <User class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm">{booking.expand?.user_id?.name || booking.expand?.user_id?.email || 'Unassigned'}</span>
                  </div>
                </td>
                <td class="p-4">
                  <div class="text-sm">
                    <div class="flex items-center gap-1">
                      <Calendar class="h-3 w-3 text-muted-foreground" />
                      {formatDate(booking.date)}
                    </div>
                    <div class="flex items-center gap-1 mt-1">
                      <Clock class="h-3 w-3 text-muted-foreground" />
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass(booking.status)}">
                    {booking.status || 'pending'}
                  </span>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <Button variant="ghost" size="sm" on:click={() => handleViewBooking(booking)}>
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" on:click={() => handleEditBooking(booking)}>
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" on:click={() => handleDeleteBooking(booking)}>
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="flex items-center justify-between p-4 border-t">
          <div class="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
          </div>
          <div class="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              on:click={() => currentPage = Math.max(1, currentPage - 1)}
            >
              Previous
            </Button>
            <span class="text-sm">Page {currentPage} of {totalPages}</span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages}
              on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<!-- Modals -->
<BookingFormModal 
  bind:show={showBookingForm} 
  booking={editingBooking}
  {locations}
  {services}
  {users}
  {clients}
  {rooms}
  on:saved={loadBookings}
/>

<BookingDetailModal 
  bind:show={showBookingDetail} 
  booking={viewingBooking}
/>

<ConfirmDialog
  bind:show={showDeleteConfirm}
  title="Delete Booking"
  message="Are you sure you want to delete this booking? This action cannot be undone."
  confirmText="Delete"
  confirmVariant="destructive"
  on:confirm={confirmDeleteBooking}
/>
