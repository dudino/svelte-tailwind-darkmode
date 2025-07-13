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
    Clock
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { getPocketBaseClient } from '$lib/stores/authStore';
  
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

      await pb.collection('clients').delete(client.id);
      
      dispatch('deleted', client);
      handleClose();
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
                  <span class="px-2 py-1 rounded-full text-xs font-medium {getStatusColor(client.status || 'active')}">
                    {client.status ? client.status.charAt(0).toUpperCase() + client.status.slice(1) : 'Active'}
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
              </div>
              {#if client.address}
                <div>
                  <div class="flex items-start gap-2">
                    <MapPin class="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span class="text-sm">{client.address}</span>
                  </div>
                </div>
              {/if}
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
                {#if client.gender}
                  <div>
                    <span class="font-medium">Gender:</span>
                    <p class="text-sm text-muted-foreground mt-1">{client.gender.charAt(0).toUpperCase() + client.gender.slice(1)}</p>
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <!-- Emergency Contact -->
          {#if client.emergency_contact_name || client.emergency_contact_phone}
            <div class="bg-muted/50 rounded-lg p-4">
              <h3 class="font-medium mb-3 flex items-center gap-2">
                <Heart class="h-4 w-4 text-primary" />
                Emergency Contact
              </h3>
              <div class="space-y-2">
                {#if client.emergency_contact_name}
                  <div>
                    <span class="font-medium">Name:</span>
                    <p class="text-sm text-muted-foreground">{client.emergency_contact_name}</p>
                  </div>
                {/if}
                {#if client.emergency_contact_phone}
                  <div>
                    <span class="font-medium">Phone:</span>
                    <div class="flex items-center gap-2 mt-1">
                      <Phone class="h-4 w-4 text-muted-foreground" />
                      <span class="text-sm">{client.emergency_contact_phone}</span>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Medical Notes -->
          {#if client.medical_notes}
            <div class="bg-muted/50 rounded-lg p-4">
              <h3 class="font-medium mb-3 flex items-center gap-2">
                <Heart class="h-4 w-4 text-primary" />
                Medical Notes
              </h3>
              <p class="text-sm whitespace-pre-wrap">{client.medical_notes}</p>
            </div>
          {/if}

          <!-- Preferences -->
          {#if client.preferences}
            <div class="bg-muted/50 rounded-lg p-4">
              <h3 class="font-medium mb-3 flex items-center gap-2">
                <Settings class="h-4 w-4 text-primary" />
                Preferences
              </h3>
              <p class="text-sm whitespace-pre-wrap">{client.preferences}</p>
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
