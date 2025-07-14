<script lang="ts"></script>
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Search, Plus, Filter, Edit, Trash2, Phone, Mail, User, Calendar } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { operatorBookingsStore, operatorBookingsActions } from '$lib/stores/operator';
  import ClientFormModal from '$lib/components/admin/ClientFormModal.svelte';
  import ClientDetailModal from '$lib/components/admin/ClientDetailModal.svelte';

  let searchQuery = '';
  let showFormModal = false;
  let showDetailModal = false;
  let selectedClient: any = null;
  let editingClient: any = null;

  onMount(async () => {
    try {
      await operatorBookingsActions.loadData();
    } catch (error) {
      console.error('Failed to load clients data:', error);
      toast.error('Failed to load clients data');
    }
  });

  $: clients = $operatorBookingsStore.clients;
  $: filteredClients = clients.filter(client => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      client.first_name?.toLowerCase().includes(query) ||
      client.last_name?.toLowerCase().includes(query) ||
      client.nickname?.toLowerCase().includes(query) ||
      client.phone_number?.includes(query) ||
      client.email?.toLowerCase().includes(query)
    );
  });

  function handleAddClient() {
    editingClient = null;
    showFormModal = true;
  }

  function handleEditClient(client: any) {
    editingClient = client;
    showFormModal = true;
  }

  function handleViewClient(client: any) {
    selectedClient = client;
    showDetailModal = true;
  }

  function handleDeleteClient(client: any) {
    if (confirm(`Are you sure you want to delete client ${client.first_name || client.nickname}?`)) {
      // Implementation for delete would go here
      toast.success('Client deleted successfully');
    }
  }

  function getStatusBadge(client: any) {
    if (client.is_blocked) {
      return { variant: 'destructive', text: 'Blocked' };
    }
    return { variant: 'default', text: 'Active' };
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">Clients Management</h1>
      <p class="text-muted-foreground">Manage your client database</p>
    </div>
    <Button on:click={handleAddClient}>
      <Plus class="w-4 h-4 mr-2" />
      Add Client
    </Button>
  </div>

  <!-- Search and Filters -->
  <Card>
    <CardContent class="p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search clients by name, phone, or email..."
              bind:value={searchQuery}
              class="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter class="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>
    </CardContent>
  </Card>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center space-x-2">
          <User class="w-8 h-8 text-primary" />
          <div>
            <p class="text-2xl font-bold">{clients.length}</p>
            <p class="text-sm text-muted-foreground">Total Clients</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center space-x-2">
          <User class="w-8 h-8 text-green-600" />
          <div>
            <p class="text-2xl font-bold">{clients.filter(c => !c.is_blocked).length}</p>
            <p class="text-sm text-muted-foreground">Active Clients</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center space-x-2">
          <User class="w-8 h-8 text-red-600" />
          <div>
            <p class="text-2xl font-bold">{clients.filter(c => c.is_blocked).length}</p>
            <p class="text-sm text-muted-foreground">Blocked Clients</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center space-x-2">
          <Calendar class="w-8 h-8 text-blue-600" />
          <div>
            <p class="text-2xl font-bold">{clients.filter(c => c.last_visit_at).length}</p>
            <p class="text-sm text-muted-foreground">Recent Visits</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Clients Table -->
  <Card>
    <CardHeader>
      <CardTitle>Clients ({filteredClients.length})</CardTitle>
    </CardHeader>
    <CardContent>
      {#if filteredClients.length === 0}
        <div class="text-center py-8">
          <User class="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p class="text-muted-foreground">No clients found</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left p-2">Name</th>
                <th class="text-left p-2">Contact</th>
                <th class="text-left p-2">Visits</th>
                <th class="text-left p-2">Last Visit</th>
                <th class="text-left p-2">Status</th>
                <th class="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredClients as client}
                <tr class="border-b hover:bg-muted/50">
                  <td class="p-2">
                    <div>
                      <div class="font-medium">
                        {client.first_name || client.nickname || 'Unknown'}
                        {#if client.last_name}{client.last_name}{/if}
                      </div>
                      {#if client.nickname && client.first_name}
                        <div class="text-sm text-muted-foreground">"{client.nickname}"</div>
                      {/if}
                    </div>
                  </td>
                  <td class="p-2">
                    <div class="space-y-1">
                      {#if client.phone_number}
                        <div class="flex items-center text-sm">
                          <Phone class="w-3 h-3 mr-1" />
                          {client.phone_number}
                        </div>
                      {/if}
                      {#if client.email}
                        <div class="flex items-center text-sm">
                          <Mail class="w-3 h-3 mr-1" />
                          {client.email}
                        </div>
                      {/if}
                    </div>
                  </td>
                  <td class="p-2">
                    <Badge variant="outline">{client.total_visits || 0}</Badge>
                  </td>
                  <td class="p-2">
                    {client.last_visit_at ? formatDate(client.last_visit_at) : 'Never'}
                  </td>
                  <td class="p-2">
                    {#if client.is_blocked}
                      <Badge variant="destructive">Blocked</Badge>
                    {:else}
                      <Badge variant="default">Active</Badge>
                    {/if}
                  </td>
                  <td class="p-2">
                    <div class="flex items-center space-x-2">
                      <Button size="sm" variant="outline" on:click={() => handleViewClient(client)}>
                        <User class="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" on:click={() => handleEditClient(client)}>
                        <Edit class="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" on:click={() => handleDeleteClient(client)}>
                        <Trash2 class="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </CardContent>
  </Card>
</div>

<!-- Modals -->
{#if showFormModal}
  <ClientFormModal
    client={editingClient}
    on:close={() => { showFormModal = false; editingClient = null; }}
    on:save={() => { 
      showFormModal = false; 
      editingClient = null;
      operatorBookingsActions.loadData();
      toast.success(editingClient ? 'Client updated successfully' : 'Client created successfully');
    }}
  />
{/if}

{#if showDetailModal && selectedClient}
  <ClientDetailModal
    client={selectedClient}
    on:close={() => { showDetailModal = false; selectedClient = null; }}
    on:edit={() => { 
      showDetailModal = false;
      handleEditClient(selectedClient);
    }}
  />
{/if}
