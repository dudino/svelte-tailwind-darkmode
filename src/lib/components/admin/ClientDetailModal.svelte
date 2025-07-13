<!--
  Client Detail Modal
  Modal for viewing client details with actions
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { 
    X, 
    Edit, 
    Trash2, 
    Users, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar,
    User,
    Heart,
    Settings,
    FileText,
    Clock,
    AlertTriangle
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { getPocketBaseClient } from '$lib/stores/authStore';
  import { deleteRecord } from '$lib/utils/deleteHandler';
  
  export let show = false;
  export let client: any = null;

  const dispatch = createEventDispatcher();

  let loading = false;
  let error = '';

  // Status styling
  function getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  }

  function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('cs-CZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  function formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('cs-CZ');
    } catch {
      return dateString;
    }
  }

  function calculateAge(birthDate: string): string {
    if (!birthDate) return 'N/A';
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return `${age} years old`;
    } catch {
      return 'N/A';
    }
  }

  function handleClose() {
    show = false;
    error = '';
  }

  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  function handleEdit() {
    dispatch('edit', client);
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    loading = true;
    error = '';

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await deleteRecord('clients', client.id);
      
      if (result.success) {
        dispatch('deleted', client);
        handleClose();
        
        // Show success message - clients don't have is_active, so will always be hard delete
        console.log('Client deleted:', result.message);
      } else {
        error = result.message || 'Failed to delete client';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete client';
      console.error('Error deleting client:', err);
    } finally {
      loading = false;
    }
  }
</script>

<!-- Modal Backdrop -->
{#if show && client}
  <div 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="modal-title"
    tabindex="-1"
    on:click={handleClose}
    on:keydown={handleBackdropKeydown}
  >
    <div 
      class="bg-card rounded-lg border shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden" 
      role="presentation"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 id="modal-title" class="text-xl font-semibold flex items-center gap-2">
          <Users class="h-5 w-5 text-primary" />
          Client Details
        </h2>
        <Button variant="ghost" size="sm" on:click={handleClose}>
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        {#if error}
          <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
            <p class="text-destructive text-sm">{error}</p>
          </div>
        {/if}

        <div class="space-y-6">
          <!-- Client Header -->
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User class="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 class="text-2xl font-bold">{client.nickname || client.first_name || 'No name provided'}</h3>
                <p class="text-muted-foreground">{client.email}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="px-2 py-1 rounded-full text-xs font-medium {getStatusColor(client.is_blocked ? 'blocked' : 'active')}">
                    {client.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                  <span class="text-sm text-muted-foreground">
                    ID: {client.id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="font-medium mb-3 flex items-center gap-2">
              <Mail class="h-4 w-4 text-primary" />
              Contact Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <Mail class="h-4 w-4 text-muted-foreground" />
                  <span class="text-sm">{client.email || 'N/A'}</span>
                </div>
                {#if client.phone_number}
                  <div class="flex items-center gap-2">
                    <Phone class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm">{client.phone_number}</span>
                  </div>
                {/if}
                {#if client.channel}
                  <div class="flex items-center gap-2">
                    <Settings class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm">Channel: {client.channel.charAt(0).toUpperCase() + client.channel.slice(1).replace('_', ' ')}</span>
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <!-- Personal Information -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="font-medium mb-3 flex items-center gap-2">
              <User class="h-4 w-4 text-primary" />
              Personal Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                {#if client.date_of_birth}
                  <div>
                    <span class="font-medium">Date of Birth:</span>
                    <div class="flex items-center gap-2 mt-1">
                      <Calendar class="h-4 w-4 text-muted-foreground" />
                      <span class="text-sm">{formatDate(client.date_of_birth)} ({calculateAge(client.date_of_birth)})</span>
                    </div>
                  </div>
                {/if}
                {#if client.preferred_language}
                  <div>
                    <span class="font-medium">Preferred Language:</span>
                    <p class="text-sm text-muted-foreground mt-1">{client.preferred_language.toUpperCase()}</p>
                  </div>
                {/if}
                {#if client.total_visits}
                  <div>
                    <span class="font-medium">Total Visits:</span>
                    <p class="text-sm text-muted-foreground mt-1">{client.total_visits}</p>
                  </div>
                {/if}
                {#if client.last_visit_at}
                  <div>
                    <span class="font-medium">Last Visit:</span>
                    <p class="text-sm text-muted-foreground mt-1">{formatDate(client.last_visit_at)}</p>
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <!-- Description/Notes -->
          {#if client.description}
            <div class="bg-muted/50 rounded-lg p-4">
              <h3 class="font-medium mb-3 flex items-center gap-2">
                <FileText class="h-4 w-4 text-primary" />
                Description
              </h3>
              <p class="text-sm whitespace-pre-wrap">{client.description}</p>
            </div>
          {/if}

          <!-- Blocked Information -->
          {#if client.is_blocked}
            <div class="bg-destructive/10 rounded-lg p-4 border border-destructive/20">
              <h3 class="font-medium mb-3 flex items-center gap-2 text-destructive">
                <AlertTriangle class="h-4 w-4" />
                Account Blocked
              </h3>
              <div class="space-y-2">
                {#if client.blocked_reason}
                  <div>
                    <span class="font-medium">Reason:</span>
                    <p class="text-sm text-muted-foreground">{client.blocked_reason}</p>
                  </div>
                {/if}
                {#if client.blocked_at}
                  <div>
                    <span class="font-medium">Blocked At:</span>
                    <p class="text-sm text-muted-foreground">{formatDateTime(client.blocked_at)}</p>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Account Information -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="font-medium mb-3 flex items-center gap-2">
              <Clock class="h-4 w-4 text-primary" />
              Account Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span class="font-medium">Created:</span>
                <p class="text-sm text-muted-foreground">{formatDateTime(client.created)}</p>
              </div>
              <div>
                <span class="font-medium">Last Updated:</span>
                <p class="text-sm text-muted-foreground">{formatDateTime(client.updated)}</p>
              </div>
            </div>
          </div>

          <!-- Booking Statistics -->
          {#if client.expand?.['bookings_via_client_id(count)'] !== undefined}
            <div class="bg-muted/50 rounded-lg p-4">
              <h3 class="font-medium mb-3 flex items-center gap-2">
                <FileText class="h-4 w-4 text-primary" />
                Booking History
              </h3>
              <div class="text-center py-4">
                <div class="text-3xl font-bold text-primary">{client.expand['bookings_via_client_id(count)'] || 0}</div>
                <p class="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between p-6 border-t">
        <Button 
          variant="destructive" 
          on:click={handleDelete}
          disabled={loading}
        >
          {#if loading}
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
          {:else}
            <Trash2 class="h-4 w-4 mr-2" />
          {/if}
          Delete
        </Button>
        
        <div class="flex items-center gap-3">
          <Button variant="outline" on:click={handleClose}>
            Close
          </Button>
          <Button on:click={handleEdit}>
            <Edit class="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}
