<!--
  Admin Locations Management
  CRUD interface for managing locations (Administrator only)
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    MapPin,
    Building,
    Eye,
    Filter
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import { getPocketBaseClient } from '$lib/stores/authStore';
  import LocationFormModal from '$lib/components/admin/LocationFormModal.svelte';
  import LocationDetailModal from '$lib/components/admin/LocationDetailModal.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

  // Local state
  let locations: any[] = [];
  let filteredLocations: any[] = [];
  let searchTerm = '';
  let filterStatus = '';
  let selectedLocations: string[] = [];
  let showLocationForm = false;
  let showLocationDetail = false;
  let showDeleteConfirm = false;
  let editingLocation: any = null;
  let viewingLocation: any = null;
  let locationToDelete: any = null;
  let loading = false;
  let error = '';

  // Pagination
  let currentPage = 1;
  let itemsPerPage = 10;

  // Status options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  // Reactive filtering
  $: {
    filteredLocations = locations.filter(location => {
      const matchesSearch = !searchTerm || 
        location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filterStatus || String(location.is_active) === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  // Pagination
  $: totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  $: paginatedLocations = filteredLocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  onMount(() => {
    loadLocations();
  });

  async function loadLocations() {
    loading = true;
    error = '';
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const records = await pb.collection('locations').getFullList({
        sort: '-created'
      });
      
      locations = records;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load locations';
      console.error('Error loading locations:', err);
    } finally {
      loading = false;
    }
  }

  function handleCreateLocation() {
    editingLocation = null;
    showLocationForm = true;
  }

  function handleEditLocation(location: any) {
    editingLocation = { ...location };
    showLocationForm = true;
  }

  function handleViewLocation(location: any) {
    viewingLocation = location;
    showLocationDetail = true;
  }

  function handleDeleteLocation(location: any) {
    locationToDelete = location;
    showDeleteConfirm = true;
  }

  async function confirmDeleteLocation() {
    if (!locationToDelete) return;
    
    loading = true;
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      await pb.collection('locations').delete(locationToDelete.id);
      
      showDeleteConfirm = false;
      locationToDelete = null;
      await loadLocations(); // Refresh the list
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete location';
      console.error('Error deleting location:', err);
    } finally {
      loading = false;
    }
  }

  function toggleLocationSelection(locationId: string) {
    if (selectedLocations.includes(locationId)) {
      selectedLocations = selectedLocations.filter(id => id !== locationId);
    } else {
      selectedLocations = [...selectedLocations, locationId];
    }
  }

  function toggleSelectAll() {
    if (selectedLocations.length === paginatedLocations.length) {
      selectedLocations = [];
    } else {
      selectedLocations = paginatedLocations.map(location => location.id);
    }
  }

  function getStatusBadgeClass(isActive: boolean) {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  function formatDate(dateString: string | undefined) {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  }
</script>

<svelte:head>
  <title>Location Management - Admin - Affinity</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">Location Management</h1>
      <p class="text-muted-foreground mt-1">Manage business locations and addresses</p>
    </div>
    <Button on:click={handleCreateLocation} class="flex items-center gap-2">
      <Plus class="h-4 w-4" />
      Add Location
    </Button>
  </div>

  <!-- Filters and Search -->
  <div class="bg-card rounded-lg border p-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          bind:value={searchTerm}
          placeholder="Search locations..."
          class="pl-10"
        />
      </div>

      <!-- Status Filter -->
      <select bind:value={filterStatus} class="px-3 py-2 border rounded-md bg-background">
        {#each statusOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>

      <!-- Results count -->
      <div class="flex items-center text-sm text-muted-foreground">
        Showing {filteredLocations.length} of {locations.length} locations
      </div>
    </div>
  </div>

  <!-- Error Display -->
  {#if error}
    <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive font-medium">Error: {error}</p>
    </div>
  {/if}

  <!-- Locations Grid -->
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
    {:else if paginatedLocations.length === 0}
      <div class="col-span-full text-center py-12">
        <MapPin class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p class="text-muted-foreground">No locations found</p>
        <Button on:click={handleCreateLocation} class="mt-4">
          <Plus class="h-4 w-4 mr-2" />
          Add First Location
        </Button>
      </div>
    {:else}
      {#each paginatedLocations as location}
        <div class="bg-card rounded-lg border p-6 hover:shadow-lg transition-all duration-300 group">
          <!-- Location Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <MapPin class="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 class="font-semibold text-lg">{location.name}</h3>
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass(location.is_active)}">
                  {location.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={selectedLocations.includes(location.id)}
              on:change={() => toggleLocationSelection(location.id)}
              class="rounded"
            />
          </div>

          <!-- Location Details -->
          <div class="space-y-2 mb-4">
            <p class="text-sm text-muted-foreground flex items-center gap-2">
              <Building class="h-4 w-4" />
              {location.address}
            </p>
            <p class="text-sm text-muted-foreground">
              {location.city}{location.postal_code ? `, ${location.postal_code}` : ''}
            </p>
            <p class="text-sm text-muted-foreground">
              {location.country}
            </p>
          </div>

          <!-- Room Count (if available) -->
          {#if location.expand?.rooms}
            <div class="mb-4">
              <span class="text-sm text-muted-foreground">
                {location.expand.rooms.length} room{location.expand.rooms.length !== 1 ? 's' : ''}
              </span>
            </div>
          {/if}

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t">
            <span class="text-xs text-muted-foreground">
              Created {formatDate(location.created)}
            </span>
            <div class="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                on:click={() => handleViewLocation(location)}
                class="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Eye class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                on:click={() => handleEditLocation(location)}
                class="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                on:click={() => handleDeleteLocation(location)}
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
        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLocations.length)} of {filteredLocations.length} locations
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

<!-- Location Form Modal -->
<LocationFormModal 
  bind:show={showLocationForm}
  bind:location={editingLocation}
  on:saved={loadLocations}
/>

<!-- Location Detail Modal -->
<LocationDetailModal 
  bind:show={showLocationDetail}
  bind:location={viewingLocation}
/>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  bind:show={showDeleteConfirm}
  title="Delete Location"
  description="Are you sure you want to delete {locationToDelete?.name}? This action cannot be undone and will also delete all associated rooms."
  confirmText="Delete"
  confirmVariant="destructive"
  on:confirm={confirmDeleteLocation}
  loading={loading}
/>
