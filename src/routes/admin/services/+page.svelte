<!--
  Admin Services Management
  CRUD interface for managing services (Administrator only)
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    Settings,
    Eye,
    Clock,
    DollarSign
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import { getPocketBaseClient } from '$lib/stores/authStore';
  import ServiceFormModal from '$lib/components/admin/ServiceFormModal.svelte';
  import ServiceDetailModal from '$lib/components/admin/ServiceDetailModal.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
  import { deleteRecord } from '$lib/utils/deleteHandler';

  // Local state
  let services: any[] = [];
  let filteredServices: any[] = [];
  let searchTerm = '';
  let filterCategory = '';
  let filterStatus = '';
  let selectedServices: string[] = [];
  let showServiceForm = false;
  let showServiceDetail = false;
  let showDeleteConfirm = false;
  let editingService: any = null;
  let viewingService: any = null;
  let serviceToDelete: any = null;
  let loading = false;
  let error = '';

  // Pagination
  let currentPage = 1;
  let itemsPerPage = 12;

  // Filter options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'massage', label: 'Massage' },
    { value: 'therapy', label: 'Therapy' },
    { value: 'relaxation', label: 'Relaxation' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'special', label: 'Special' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  // Reactive filtering
  $: {
    filteredServices = services.filter(service => {
      const matchesSearch = !searchTerm || 
        service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filterCategory || service.category === filterCategory;
      const matchesStatus = !filterStatus || String(service.is_active) === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  // Pagination
  $: totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  $: paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  onMount(() => {
    loadServices();
  });

  async function loadServices() {
    loading = true;
    error = '';
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const records = await pb.collection('services').getFullList({
        sort: '-created'
      });
      
      services = records;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load services';
      console.error('Error loading services:', err);
    } finally {
      loading = false;
    }
  }

  function handleCreateService() {
    editingService = null;
    showServiceForm = true;
  }

  function handleEditService(service: any) {
    editingService = { ...service };
    showServiceForm = true;
  }

  function handleViewService(service: any) {
    viewingService = service;
    showServiceDetail = true;
  }

  function handleDeleteService(service: any) {
    serviceToDelete = service;
    showDeleteConfirm = true;
  }

  async function confirmDeleteService() {
    if (!serviceToDelete) return;
    
    loading = true;
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await deleteRecord('services', serviceToDelete.id);
      
      if (result.success) {
        showDeleteConfirm = false;
        serviceToDelete = null;
        await loadServices(); // Refresh the list
        
        // Show success message based on delete method
        if (result.method === 'soft') {
          console.log('Service deactivated:', result.message);
        } else {
          console.log('Service deleted:', result.message);
        }
      } else {
        error = result.message || 'Failed to delete service';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete service';
      console.error('Error deleting service:', err);
    } finally {
      loading = false;
    }
  }

  function getCategoryBadgeClass(category: string) {
    const colors: Record<string, string> = {
      'massage': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'therapy': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'relaxation': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'beauty': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'wellness': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'special': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }

  function getStatusBadgeClass(isActive: boolean) {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(price);
  }
</script>

<svelte:head>
  <title>Service Management - Admin - Affinity</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">Service Management</h1>
      <p class="text-muted-foreground mt-1">Manage available services and pricing</p>
    </div>
    <Button on:click={handleCreateService} class="flex items-center gap-2">
      <Plus class="h-4 w-4" />
      Add Service
    </Button>
  </div>

  <!-- Filters and Search -->
  <div class="bg-card rounded-lg border p-4">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          bind:value={searchTerm}
          placeholder="Search services..."
          class="pl-10"
        />
      </div>

      <!-- Category Filter -->
      <select bind:value={filterCategory} class="px-3 py-2 border rounded-md bg-background">
        {#each categoryOptions as option}
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
        Showing {filteredServices.length} of {services.length} services
      </div>
    </div>
  </div>

  <!-- Error Display -->
  {#if error}
    <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive font-medium">Error: {error}</p>
    </div>
  {/if}

  <!-- Services Grid -->
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
    {:else if paginatedServices.length === 0}
      <div class="col-span-full text-center py-12">
        <Settings class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p class="text-muted-foreground">No services found</p>
        <Button on:click={handleCreateService} class="mt-4">
          <Plus class="h-4 w-4 mr-2" />
          Add First Service
        </Button>
      </div>
    {:else}
      {#each paginatedServices as service}
        <div class="bg-card rounded-lg border p-6 hover:shadow-lg transition-all duration-300 group">
          <!-- Service Header -->
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-lg mb-1">{service.name}</h3>
              <div class="flex gap-2 mb-2">
                {#if service.category}
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getCategoryBadgeClass(service.category)}">
                    {service.category}
                  </span>
                {/if}
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass(service.is_active)}">
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <!-- Service Details -->
          <div class="space-y-2 mb-4">
            {#if service.description}
              <p class="text-sm text-muted-foreground line-clamp-2">
                {service.description}
              </p>
            {/if}
            
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-1">
                <Clock class="h-4 w-4 text-muted-foreground" />
                <span>{formatDuration(service.duration_minutes)}</span>
              </div>
              
              {#if service.price}
                <div class="flex items-center gap-1">
                  <DollarSign class="h-4 w-4 text-muted-foreground" />
                  <span class="font-medium">{formatPrice(service.price)}</span>
                </div>
              {/if}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t">
            <span class="text-xs text-muted-foreground">
              Created {new Date(service.created).toLocaleDateString()}
            </span>
            <div class="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                on:click={() => handleViewService(service)}
                class="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Eye class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                on:click={() => handleEditService(service)}
                class="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                on:click={() => handleDeleteService(service)}
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
        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length} services
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

<!-- Service Form Modal -->
<ServiceFormModal 
  bind:show={showServiceForm}
  bind:service={editingService}
  on:saved={loadServices}
/>

<!-- Service Detail Modal -->
<ServiceDetailModal 
  bind:show={showServiceDetail}
  bind:service={viewingService}
/>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
  bind:show={showDeleteConfirm}
  title="Delete Service"
  description="Are you sure you want to delete {serviceToDelete?.name}? This action cannot be undone."
  confirmText="Delete"
  confirmVariant="destructive"
  on:confirm={confirmDeleteService}
  loading={loading}
/>
