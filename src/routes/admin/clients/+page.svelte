<!--
  Clients Management Page
  Admin interface for managing client records
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { 
    Plus, 
    Search, 
    Users, 
    Eye, 
    Edit, 
    Trash2,
    Mail,
    Phone,
    FileText
  } from 'lucide-svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import ClientFormModal from '$lib/components/admin/ClientFormModal.svelte';
  import ClientDetailModal from '$lib/components/admin/ClientDetailModal.svelte';
  import { getPocketBaseClient } from '$lib/stores/authStore';
  import { deleteRecord } from '$lib/utils/deleteHandler';

  // Data
  let clients: any[] = [];
  let filteredClients: any[] = [];
  let loading = true;
  let error = '';

  // Modals
  let showFormModal = false;
  let showDetailModal = false;
  let selectedClient: any = null;

  // Filters and search
  let searchTerm = '';
  let statusFilter = 'all';
  let sortBy = 'created';
  let sortOrder = 'desc';

  // Pagination
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalItems = 0;
  let totalPages = 0;

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Clients' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'created', label: 'Date Created' },
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'updated', label: 'Last Updated' }
  ];

  onMount(() => {
    loadClients();
  });

  // Reactive filters
  $: {
    applyFilters();
  }

  $: {
    totalPages = Math.ceil(totalItems / itemsPerPage);
  }

  async function loadClients() {
    loading = true;
    error = '';

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      // Build filter conditions
      let filter = '';
      const filterConditions = [];

      if (searchTerm) {
        filterConditions.push(`(nickname ~ "${searchTerm}" || first_name ~ "${searchTerm}" || last_name ~ "${searchTerm}" || email ~ "${searchTerm}" || phone_number ~ "${searchTerm}")`);
      }

      if (statusFilter !== 'all') {
        filterConditions.push(`is_blocked = ${statusFilter === 'active' ? 'false' : 'true'}`);
      }

      if (filterConditions.length > 0) {
        filter = filterConditions.join(' && ');
      }

      // Build sort string
      const sortString = `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;

      const result = await pb.collection('clients').getList(currentPage, itemsPerPage, {
        filter: filter,
        sort: sortString
      });

      // Get booking counts for all clients in a single query
      const clientIds = result.items.map((client: any) => client.id);
      let bookingCounts: { [key: string]: number } = {};

      if (clientIds.length > 0) {
        try {
          // Get all bookings for these clients using proper OR syntax
          const filterConditions = clientIds.map(id => `client_id = "${id}"`);
          const allBookings = await pb.collection('bookings').getFullList({
            filter: filterConditions.join(' || '),
            fields: 'client_id'
          });

          // Count bookings per client
          bookingCounts = allBookings.reduce((acc: { [key: string]: number }, booking: any) => {
            acc[booking.client_id] = (acc[booking.client_id] || 0) + 1;
            return acc;
          }, {});
        } catch (err) {
          console.warn('Failed to get booking counts:', err);
        }
      }

      // Add booking counts to clients
      const clientsWithCounts = result.items.map((client: any) => ({
        ...client,
        booking_count: bookingCounts[client.id] || 0
      }));

      clients = clientsWithCounts;
      totalItems = result.totalItems;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load clients';
      console.error('Error loading clients:', err);
    } finally {
      loading = false;
    }
  }

  function applyFilters() {
    // This will trigger loadClients through reactive statements
    if (!loading) {
      currentPage = 1; // Reset to first page when filtering
      loadClients();
    }
  }

  function handleSearch() {
    applyFilters();
  }

  function handleSortChange() {
    applyFilters();
  }

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      loadClients();
    }
  }

  function handleCreateClient() {
    selectedClient = null;
    showFormModal = true;
  }

  function handleEditClient(client: any) {
    selectedClient = client;
    showFormModal = true;
  }

  function handleViewClient(client: any) {
    selectedClient = client;
    showDetailModal = true;
  }

  async function handleDeleteClient(client: any) {
    if (!confirm(`Are you sure you want to delete client "${client.nickname || client.first_name || client.email}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await deleteRecord('clients', client.id);
      
      if (result.success) {
        await loadClients(); // Reload the list
        
        // Show success message - clients don't have is_active, so will always be hard delete
        console.log('Client deleted:', result.message);
      } else {
        error = result.message || 'Failed to delete client';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete client';
      console.error('Error deleting client:', err);
    }
  }

  function handleFormSaved() {
    loadClients();
  }

  function handleClientDeleted() {
    loadClients();
  }

  function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('cs-CZ');
    } catch {
      return 'N/A';
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  }
</script>

<svelte:head>
  <title>Client Management - Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold flex items-center gap-3">
        <Users class="h-8 w-8 text-primary" />
        Client Management
      </h1>
      <p class="text-muted-foreground mt-1">
        Manage your clients and their information
      </p>
    </div>
    <Button on:click={handleCreateClient} class="gap-2">
      <Plus class="h-4 w-4" />
      Add Client
    </Button>
  </div>

  <!-- Filters and Search -->
  <div class="bg-card rounded-lg border p-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Search -->
      <div class="md:col-span-2">
        <Label for="search">Search Clients</Label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search by name, email, or phone..."
            bind:value={searchTerm}
            on:input={handleSearch}
            class="pl-10"
          />
        </div>
      </div>

      <!-- Status Filter -->
      <div>
        <Label for="status-filter">Status</Label>
        <select 
          id="status-filter"
          bind:value={statusFilter}
          on:change={applyFilters}
          class="w-full px-3 py-2 border rounded-md bg-background"
        >
          {#each statusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>

      <!-- Sort -->
      <div>
        <Label for="sort">Sort By</Label>
        <div class="flex gap-2">
          <select 
            id="sort"
            bind:value={sortBy}
            on:change={handleSortChange}
            class="flex-1 px-3 py-2 border rounded-md bg-background"
          >
            {#each sortOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          <Button 
            variant="outline" 
            size="sm"
            on:click={() => { sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; handleSortChange(); }}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>
    </div>
  </div>

  <!-- Results Summary -->
  <div class="flex items-center justify-between text-sm text-muted-foreground">
    <span>
      Showing {clients.length} of {totalItems} clients
    </span>
    <span>
      Page {currentPage} of {totalPages}
    </span>
  </div>

  <!-- Error Display -->
  {#if error}
    <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive">{error}</p>
    </div>
  {/if}

  <!-- Loading State -->
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  {:else if clients.length === 0}
    <!-- Empty State -->
    <div class="text-center py-12">
      <Users class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">No clients found</h3>
      <p class="text-muted-foreground mb-4">
        {searchTerm ? 'Try adjusting your search criteria.' : 'Start by adding your first client.'}
      </p>
      <Button on:click={handleCreateClient}>
        <Plus class="h-4 w-4 mr-2" />
        Add Client
      </Button>
    </div>
  {:else}
    <!-- Clients Table -->
    <div class="bg-card rounded-lg border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b bg-muted/50">
            <tr>
              <th class="text-left p-4 font-medium">Client</th>
              <th class="text-left p-4 font-medium">Contact</th>
              <th class="text-left p-4 font-medium">Status</th>
              <th class="text-left p-4 font-medium">Bookings</th>
              <th class="text-left p-4 font-medium">Created</th>
              <th class="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            {#each clients as client}
              <tr class="hover:bg-muted/50 transition-colors">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users class="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div class="font-medium">{client.nickname || client.first_name || 'No name'}</div>
                      <div class="text-sm text-muted-foreground">{client.email}</div>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <div class="space-y-1">
                    {#if client.email}
                      <div class="flex items-center gap-2 text-sm">
                        <Mail class="h-3 w-3 text-muted-foreground" />
                        {client.email}
                      </div>
                    {/if}
                    {#if client.phone_number}
                      <div class="flex items-center gap-2 text-sm">
                        <Phone class="h-3 w-3 text-muted-foreground" />
                        {client.phone_number}
                      </div>
                    {/if}
                  </div>
                </td>
                <td class="p-4">
                  <span class="px-2 py-1 rounded-full text-xs font-medium {getStatusColor(client.is_blocked ? 'blocked' : 'active')}">
                    {client.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1 text-sm">
                      <FileText class="h-3 w-3 text-muted-foreground" />
                      <span class="font-medium">{client.booking_count || 0}</span>
                      <span class="text-muted-foreground">
                        {(client.booking_count || 0) === 1 ? 'booking' : 'bookings'}
                      </span>
                    </div>
                    {#if (client.booking_count || 0) > 0}
                      <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        Active
                      </span>
                    {/if}
                  </div>
                </td>
                <td class="p-4">
                  <div class="text-sm text-muted-foreground">
                    {formatDate(client.created)}
                  </div>
                </td>
                <td class="p-4">
                  <div class="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      on:click={() => handleViewClient(client)}
                    >
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      on:click={() => handleEditClient(client)}
                    >
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      on:click={() => handleDeleteClient(client)}
                      class="text-destructive hover:text-destructive"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="flex items-center justify-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          disabled={currentPage === 1}
          on:click={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </Button>
        
        {#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const start = Math.max(1, currentPage - 2);
          return start + i;
        }).filter(page => page <= totalPages) as page}
          <Button 
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            on:click={() => handlePageChange(page)}
          >
            {page}
          </Button>
        {/each}
        
        <Button 
          variant="outline" 
          size="sm"
          disabled={currentPage === totalPages}
          on:click={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    {/if}
  {/if}
</div>

<!-- Modals -->
<ClientFormModal 
  bind:show={showFormModal}
  client={selectedClient}
  on:saved={handleFormSaved}
/>

<ClientDetailModal 
  bind:show={showDetailModal}
  client={selectedClient}
  on:edit={handleEditClient}
  on:deleted={handleClientDeleted}
/>
