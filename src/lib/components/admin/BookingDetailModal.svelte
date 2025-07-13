<!--
  Booking Detail Modal
  Modal for viewing booking details with actions
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { 
    X, 
    Edit, 
    Trash2, 
    FileText, 
    User, 
    MapPin, 
    Calendar, 
    Clock, 
    CreditCard,
    Users,
    Building,
    MessageSquare
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { getPocketBaseClient } from '$lib/stores/authStore';
  import { deleteRecord } from '$lib/utils/deleteHandler';
  
  export let show = false;
  export let booking: any = null;

  const dispatch = createEventDispatcher();

  let loading = false;
  let error = '';

  // Helper function to get client display name
  function getClientDisplayName(client: any): string {
    if (!client) return 'N/A';
    return client.nickname || 
           (client.first_name && client.last_name ? `${client.first_name} ${client.last_name}` : '') ||
           client.first_name || 
           client.last_name || 
           client.email || 
           'N/A';
  }

  // Helper function to get location display name
  function getLocationDisplayName(location: any): string {
    if (!location) return 'No location assigned';
    if (!location.name) return 'Location name missing';
    return location.name;
  }

  // Status styling
  function getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }

  function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('cs-CZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  function formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    try {
      // Handle both full datetime and time-only strings
      if (timeString.includes('T')) {
        return new Date(timeString).toLocaleTimeString('cs-CZ', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        // Assume it's already in HH:MM format
        return timeString;
      }
    } catch {
      return timeString;
    }
  }

  function formatPrice(price: number): string {
    if (!price || price === 0) return 'N/A';
    return `${price.toLocaleString('cs-CZ')} CZK`;
  }

  function calculateDuration(): string {
    if (!booking?.start_time || !booking?.end_time) return 'N/A';
    
    try {
      const start = new Date(`2000-01-01T${booking.start_time}`);
      const end = new Date(`2000-01-01T${booking.end_time}`);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 60) {
        return `${diffMins} minutes`;
      } else {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
      }
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
    dispatch('edit', booking);
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    loading = true;
    error = '';

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await deleteRecord('bookings', booking.id);
      
      if (result.success) {
        dispatch('deleted', booking);
        handleClose();
        
        // Show success message - bookings don't have is_active, so will always be hard delete
        console.log('Booking deleted:', result.message);
      } else {
        error = result.message || 'Failed to delete booking';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete booking';
      console.error('Error deleting booking:', err);
    } finally {
      loading = false;
    }
  }
</script>

<!-- Modal Backdrop -->
{#if show && booking}
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
      class="bg-card rounded-lg border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden" 
      role="presentation"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 id="modal-title" class="text-xl font-semibold flex items-center gap-2">
          <FileText class="h-5 w-5 text-primary" />
          Booking Details
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
          <!-- Status and Basic Info -->
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(booking.status)}">
                  {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Unknown'}
                </span>
                <span class="text-sm text-muted-foreground">
                  ID: {booking.id}
                </span>
              </div>
              <p class="text-sm text-muted-foreground">
                Created: {booking.created ? new Date(booking.created).toLocaleString('cs-CZ') : 'N/A'}
              </p>
            </div>
          </div>

          <!-- Client Information -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="font-medium mb-3 flex items-center gap-2">
              <User class="h-4 w-4 text-primary" />
              Client Information
            </h3>
            <div class="space-y-1">
              <p><span class="font-medium">Name:</span> {getClientDisplayName(booking.expand?.client_id)}</p>
              <p><span class="font-medium">Email:</span> {booking.expand?.client_id?.email || 'N/A'}</p>
              {#if booking.expand?.client_id?.phone_number}
                <p><span class="font-medium">Phone:</span> {booking.expand?.client_id?.phone_number}</p>
              {/if}
            </div>
          </div>

          <!-- Service Information -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="font-medium mb-3 flex items-center gap-2">
              <FileText class="h-4 w-4 text-primary" />
              Service Information
            </h3>
            <div class="space-y-1">
              <p><span class="font-medium">Service:</span> {booking.expand?.service_id?.name || 'N/A'}</p>
              {#if booking.expand?.service_id?.description}
                <p><span class="font-medium">Description:</span> {booking.expand?.service_id?.description}</p>
              {/if}
              <p><span class="font-medium">Duration:</span> {calculateDuration()}</p>
            </div>
          </div>

          <!-- Location and Room -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-muted/50 rounded-lg p-4">
              <h3 class="font-medium mb-3 flex items-center gap-2">
                <MapPin class="h-4 w-4 text-primary" />
                Location
              </h3>
              <div class="space-y-1">
                <p><span class="font-medium">Name:</span> 
                  {getLocationDisplayName(booking.expand?.location_id)}
                  {#if booking.expand?.location_id && !booking.expand?.location_id?.is_active}
                    <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded ml-2">Inactive</span>
                  {/if}
                </p>
                {#if booking.expand?.location_id?.address}
                  <p><span class="font-medium">Address:</span> {booking.expand?.location_id?.address}</p>
                {/if}
                {#if booking.expand?.location_id?.city}
                  <p><span class="font-medium">City:</span> {booking.expand?.location_id?.city}</p>
                {/if}
              </div>
            </div>

            {#if booking.expand?.room_id}
              <div class="bg-muted/50 rounded-lg p-4">
                <h3 class="font-medium mb-3 flex items-center gap-2">
                  <Building class="h-4 w-4 text-primary" />
                  Room
                </h3>
                <div class="space-y-1">
                  <p><span class="font-medium">Name:</span> {booking.expand?.room_id?.name}</p>
                  {#if booking.expand?.room_id?.description}
                    <p><span class="font-medium">Description:</span> {booking.expand?.room_id?.description}</p>
                  {/if}
                </div>
              </div>
            {/if}
          </div>

          <!-- Staff Information -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="font-medium mb-3 flex items-center gap-2">
              <Users class="h-4 w-4 text-primary" />
              Assigned Staff
            </h3>
            <div class="space-y-1">
              <p><span class="font-medium">Name:</span> {booking.expand?.user_id?.name || booking.expand?.user_id?.email || 'N/A'}</p>
              {#if booking.expand?.user_id?.email && booking.expand?.user_id?.name}
                <p><span class="font-medium">Email:</span> {booking.expand?.user_id?.email}</p>
              {/if}
            </div>
          </div>

          <!-- Date and Time -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="font-medium mb-3 flex items-center gap-2">
              <Calendar class="h-4 w-4 text-primary" />
              Schedule
            </h3>
            <div class="space-y-1">
              <p><span class="font-medium">Date:</span> {formatDate(booking.date)}</p>
              <p><span class="font-medium">Time:</span> {formatTime(booking.start_time)} - {formatTime(booking.end_time)}</p>
              <p><span class="font-medium">Duration:</span> {calculateDuration()}</p>
            </div>
          </div>

          <!-- Price -->
          {#if booking.price}
            <div class="bg-muted/50 rounded-lg p-4">
              <h3 class="font-medium mb-3 flex items-center gap-2">
                <CreditCard class="h-4 w-4 text-primary" />
                Pricing
              </h3>
              <p class="text-2xl font-bold text-primary">{formatPrice(booking.price)}</p>
            </div>
          {/if}

          <!-- Notes -->
          {#if booking.notes}
            <div class="bg-muted/50 rounded-lg p-4">
              <h3 class="font-medium mb-3 flex items-center gap-2">
                <MessageSquare class="h-4 w-4 text-primary" />
                Notes
              </h3>
              <p class="text-sm whitespace-pre-wrap">{booking.notes}</p>
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
