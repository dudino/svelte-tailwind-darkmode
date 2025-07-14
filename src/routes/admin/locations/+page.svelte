<!--
  Admin Locations Management
  CRUD interface for managing locations (Administrator only)
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { getPocketBaseClient } from '$lib/stores/authStore';
  import { 
    locations,
    locationsActions,
    locationsState,
    filteredLocations
  } from '$lib/stores/admin';
  import { formatDate, getStatusBadgeClass } from '$lib/helpers/admin';
  import { 
    PageHeader, 
    SearchAndFilters, 
    EmptyState 
  } from '$lib/components';
  import LocationFormModal from '$lib/components/admin/LocationFormModal.svelte';
  import LocationDetailModal from '$lib/components/admin/LocationDetailModal.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Plus, MapPin, Eye, Edit, Trash2, Building } from 'lucide-svelte';

  // Local state for UI
  let searchTerm = '';
  let filterStatus = '';
  let selectedLocations: string[] = [];
  let showLocationForm = false;
  let showLocationDetail = false;
  let showDeleteConfirm = false;
  let editingLocation: any = null;
  let viewingLocation: any = null;
  let locationToDelete: any = null;

  // State from store
  $: loading = $locationsState.loading;
  $: error = $locationsState.error;

  // Set up filters in the store
  $: {
    locationsActions.setFilters({
      search: searchTerm,
      status: filterStatus
    });
  }

  // Pagination
  let currentPage = 1;
  let itemsPerPage = 10;

  $: totalPages = Math.ceil($filteredLocations.length / itemsPerPage);
  $: paginatedLocations = $filteredLocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filter configuration for SearchAndFilters component
  $: filterConfig = [
    {
      label: 'Status',
      value: filterStatus,
      options: [
        { value: '', label: 'All Status' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    }
  ];

  onMount(() => {
    // Load locations using the locations store
    locationsActions.loadLocations();
  });

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
    
    try {
      await locationsActions.deleteLocation(locationToDelete.id);
      showDeleteConfirm = false;
      locationToDelete = null;
    } catch (err) {
      console.error('Error deleting location:', err);
    }
  }

  function toggleLocationSelection(locationId: string) {
    if (selectedLocations.includes(locationId)) {
      selectedLocations = selectedLocations.filter(id => id !== locationId);
    } else {
      selectedLocations = [...selectedLocations, locationId];
    }
  }

  function handleSearch(event: CustomEvent) {
    searchTerm = event.detail.searchTerm;
  }

  function handleFilterChange(event: CustomEvent) {
    const { filterIndex, value } = event.detail;
    if (filterIndex === 0) { // Status filter
      filterStatus = value;
    }
  }

  function handlePageChange(event: CustomEvent) {
    currentPage = event.detail;
  }
</script>

<svelte:head>
  <title>Location Management - Admin - TimeIt</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <PageHeader 
    title="Location Management"
    description="Manage business locations and addresses"
    icon={MapPin}
  >
    <svelte:fragment slot="actions">
      <Button on:click={handleCreateLocation}>
        <Plus class="h-4 w-4 mr-2" />
        Add Location
      </Button>
    </svelte:fragment>
  </PageHeader>

  <!-- Filters and Search -->
  <SearchAndFilters
    bind:searchValue={searchTerm}
    placeholder="Search locations..."
    on:search={handleSearch}
  />

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
              {(location as any).city}{(location as any).postal_code ? `, ${(location as any).postal_code}` : ''}
            </p>
            <p class="text-sm text-muted-foreground">
              {(location as any).country}
            </p>
          </div>

          <!-- Room Count (if available) -->
          {#if (location as any).expand?.rooms}
            <div class="mb-4">
              <span class="text-sm text-muted-foreground">
                {(location as any).expand.rooms.length} room{(location as any).expand.rooms.length !== 1 ? 's' : ''}
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
        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, $filteredLocations.length)} of {$filteredLocations.length} locations
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
  on:saved={() => locationsActions.loadLocations()}
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
