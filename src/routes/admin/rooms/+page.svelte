<!--
  Admin Rooms Management
  CRUD interface for managing rooms (Administrator only)
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    Building,
    Eye,
    MapPin,
    Users,
    DollarSign
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import { getPocketBaseClient } from '$lib/stores/authStore';
  import RoomFormModal from '$lib/components/admin/RoomFormModal.svelte';
  import RoomDetailModal from '$lib/components/admin/RoomDetailModal.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

  // Local state
  let rooms: any[] = [];
  let locations: any[] = [];
  let filteredRooms: any[] = [];
  let searchTerm = '';
  let filterLocation = '';
  let filterType = '';
  let filterStatus = '';
  let selectedRooms: string[] = [];
  let showRoomForm = false;
  let showRoomDetail = false;
  let showDeleteConfirm = false;
  let editingRoom: any = null;
  let viewingRoom: any = null;
  let roomToDelete: any = null;
  let loading = false;
  let error = '';

  // Pagination
  let currentPage = 1;
  let itemsPerPage = 12;

  // Filter options
  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'regular', label: 'Regular' },
    { value: 'dynamic', label: 'Dynamic' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  // Reactive filtering
  $: {
    filteredRooms = rooms.filter(room => {
      const matchesSearch = !searchTerm || 
        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.expand?.location_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = !filterLocation || room.location_id === filterLocation;
      const matchesType = !filterType || room.type === filterType;
      const matchesStatus = !filterStatus || String(room.is_active) === filterStatus;
      
      return matchesSearch && matchesLocation && matchesType && matchesStatus;
    });
  }

  // Pagination
  $: totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  $: paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  onMount(() => {
    loadData();
  });

  async function loadData() {
    await Promise.all([loadRooms(), loadLocations()]);
  }

  async function loadRooms() {
    loading = true;
    error = '';
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const records = await pb.collection('rooms').getFullList({
        sort: '-created',
        expand: 'location_id'
      });
      
      rooms = records;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load rooms';
      console.error('Error loading rooms:', err);
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

  function handleCreateRoom() {
    editingRoom = null;
    showRoomForm = true;
  }

  function handleEditRoom(room: any) {
    editingRoom = { ...room };
    showRoomForm = true;
  }

  function handleViewRoom(room: any) {
    viewingRoom = room;
    showRoomDetail = true;
  }

  function handleDeleteRoom(room: any) {
    roomToDelete = room;
    showDeleteConfirm = true;
  }

  async function confirmDeleteRoom() {
    if (!roomToDelete) return;
    
    loading = true;
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      await pb.collection('rooms').delete(roomToDelete.id);
      
      showDeleteConfirm = false;
      roomToDelete = null;
      await loadRooms(); // Refresh the list
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete room';
      console.error('Error deleting room:', err);
    } finally {
      loading = false;
    }
  }

  function getTypeBadgeClass(type: string) {
    return type === 'regular'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  }

  function getStatusBadgeClass(isActive: boolean) {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  function formatPrice(price: number | null | undefined) {
    if (!price) return 'Not set';
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(price);
  }
</script>

<svelte:head>
  <title>Room Management - Admin - Affinity</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">Room Management</h1>
      <p class="text-muted-foreground mt-1">Manage rooms and their amenities</p>
    </div>
    <Button on:click={handleCreateRoom} class="flex items-center gap-2">
      <Plus class="h-4 w-4" />
      Add Room
    </Button>
  </div>

  <!-- Filters and Search -->
  <div class="bg-card rounded-lg border p-4">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          bind:value={searchTerm}
          placeholder="Search rooms..."
          class="pl-10"
        />
      </div>

      <!-- Location Filter -->
      <select bind:value={filterLocation} class="px-3 py-2 border rounded-md bg-background">
        <option value="">All Locations</option>
        {#each locations as location}
          <option value={location.id}>{location.name}</option>
        {/each}
      </select>

      <!-- Type Filter -->
      <select bind:value={filterType} class="px-3 py-2 border rounded-md bg-background">
        {#each typeOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>

      <!-- Status Filter -->
      <select bind:value={filterStatus} class="px-3 py-2 border rounded-md bg-background">
        {#each statusOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>

      <!-- Results count -->
      <div class="flex items-center text-sm text-muted-foreground">
        Showing {filteredRooms.length} of {rooms.length} rooms
      </div>
    </div>
  </div>

  <!-- Error Display -->
  {#if error}
    <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive font-medium">Error: {error}</p>
    </div>
  {/if}

  <!-- Rooms Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#if loading}
      {#each Array(6) as _}
        <div class="bg-card rounded-lg border p-6 animate-pulse">
          <div class="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-muted rounded w-full mb-1"></div>
          <div class="h-3 bg-muted rounded w-2/3 mb-4"></div>
          <div class="flex gap-2">
            <div class="h-8 bg-muted rounded w-16"></div>
            <div class="h-8 bg-muted rounded w-16"></div>
          </div>
        </div>
      {/each}
    {:else if paginatedRooms.length === 0}
      <div class="col-span-full text-center py-12">
        <Building class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p class="text-muted-foreground">No rooms found</p>
        <Button on:click={handleCreateRoom} class="mt-4">
          <Plus class="h-4 w-4 mr-2" />
          Add First Room
        </Button>
      </div>
    {:else}
      {#each paginatedRooms as room}
        <div class="bg-card rounded-lg border p-6 hover:shadow-lg transition-all duration-300 group">
          <!-- Room Header -->
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-lg mb-1">{room.name}</h3>
              <div class="flex gap-2 mb-2">
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getTypeBadgeClass(room.type)}">
                  {room.type}
                </span>
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass(room.is_active)}">
                  {room.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <!-- Room Details -->
          <div class="space-y-2 mb-4">
            {#if room.expand?.location_id}
              <p class="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin class="h-4 w-4" />
                {room.expand.location_id.name}
              </p>
            {/if}
            
            <div class="flex items-center gap-4 text-sm">
              {#if room.capacity}
                <div class="flex items-center gap-1">
                  <Users class="h-4 w-4 text-muted-foreground" />
                  <span>{room.capacity} people</span>
                </div>
              {/if}
              
              {#if room.hourly_rate}
                <div class="flex items-center gap-1">
                  <DollarSign class="h-4 w-4 text-muted-foreground" />
                  <span>{formatPrice(room.hourly_rate)}/hr</span>
                </div>
              {/if}
            </div>

            <!-- Amenities -->
            {#if room.amenities && room.amenities.length > 0}
              <div class="flex flex-wrap gap-1 mt-2">
                {#each room.amenities.slice(0, 3) as amenity}
                  <span class="text-xs px-2 py-1 bg-accent/50 rounded-full">{amenity}</span>
                {/each}
                {#if room.amenities.length > 3}
                  <span class="text-xs text-muted-foreground">+{room.amenities.length - 3} more</span>
                {/if}
              </div>
            {/if}
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t">
            <span class="text-xs text-muted-foreground">
              Created {new Date(room.created).toLocaleDateString()}
            </span>
            <div class="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                on:click={() => handleViewRoom(room)}
                class="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Eye class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                on:click={() => handleEditRoom(room)}
                class="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                on:click={() => handleDeleteRoom(room)}
                class="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Pagination -->
  {#if totalPages > 1}
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRooms.length)} of {filteredRooms.length} rooms
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          on:click={() => currentPage--}
        >
          Previous
        </Button>
        {#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
          {#if page === currentPage || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
            <Button
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              on:click={() => currentPage = page}
            >
              {page}
            </Button>
          {:else if page === currentPage - 2 || page === currentPage + 2}
            <span class="px-2">...</span>
          {/if}
        {/each}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          on:click={() => currentPage++}
        >
          Next
        </Button>
      </div>
    </div>
  {/if}
</div>

<!-- Room Form Modal -->
<RoomFormModal 
  bind:show={showRoomForm}
  bind:room={editingRoom}
  {locations}
  on:saved={loadRooms}
/>

<!-- Room Detail Modal -->
<RoomDetailModal 
  bind:show={showRoomDetail}
  bind:room={viewingRoom}
/>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  bind:show={showDeleteConfirm}
  title="Delete Room"
  description="Are you sure you want to delete {roomToDelete?.name}? This action cannot be undone."
  confirmText="Delete"
  confirmVariant="destructive"
  on:confirm={confirmDeleteRoom}
  loading={loading}
/>
