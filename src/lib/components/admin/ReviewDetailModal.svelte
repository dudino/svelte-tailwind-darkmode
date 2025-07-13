<!--
  Review Detail Modal
  Modal for viewing review details with actions
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { 
    X, 
    Edit, 
    Trash2, 
    Star, 
    MessageSquare, 
    User,
    Calendar,
    Settings,
    MapPin,
    Clock
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { getPocketBaseClient } from '$lib/stores/authStore';
  import { deleteRecord } from '$lib/utils/deleteHandler';
  
  export let show = false;
  export let review: any = null;

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

  // Status styling
  function getStatusColor(status: string): string {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hidden':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
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

  function formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('cs-CZ');
    } catch {
      return dateString;
    }
  }

  function renderStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  function getRatingDescription(rating: number): string {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Unknown';
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
    dispatch('edit', review);
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    loading = true;
    error = '';

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await deleteRecord('reviews', review.id);
      
      if (result.success) {
        dispatch('deleted', review);
        handleClose();
        
        // Show success message - reviews don't have is_active, so will always be hard delete
        console.log('Review deleted:', result.message);
      } else {
        error = result.message || 'Failed to delete review';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete review';
      console.error('Error deleting review:', err);
    } finally {
      loading = false;
    }
  }

  async function toggleStatus() {
    if (!review) return;

    loading = true;
    error = '';

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const newStatus = review.status === 'published' ? 'hidden' : 'published';
      
      await pb.collection('reviews').update(review.id, {
        status: newStatus
      });

      // Update local data
      review.status = newStatus;
      review = { ...review }; // Trigger reactivity

    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update review status';
      console.error('Error updating review status:', err);
    } finally {
      loading = false;
    }
  }
</script>

<!-- Modal Backdrop -->
{#if show && review}
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
          <Star class="h-5 w-5 text-primary" />
          Review Details
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
          <!-- Review Header -->
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(review.status || 'published')}">
                  {review.status?.charAt(0).toUpperCase() + review.status?.slice(1) || 'Published'}
                </span>
                <span class="text-sm text-muted-foreground">
                  ID: {review.id}
                </span>
              </div>
              <p class="text-sm text-muted-foreground">
                Created: {formatDateTime(review.created)}
              </p>
              {#if review.updated !== review.created}
                <p class="text-sm text-muted-foreground">
                  Updated: {formatDateTime(review.updated)}
                </p>
              {/if}
            </div>
          </div>

          <!-- Rating -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="font-medium mb-3 flex items-center gap-2">
              <Star class="h-4 w-4 text-primary" />
              Rating
            </h3>
            <div class="flex items-center gap-4">
              <div class="text-4xl text-yellow-400">
                {renderStars(review.rating || 0)}
              </div>
              <div>
                <div class="text-2xl font-bold">{review.rating || 0}/5</div>
                <div class="text-sm text-muted-foreground">{getRatingDescription(review.rating || 0)}</div>
              </div>
            </div>
          </div>

          <!-- Client Information -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="font-medium mb-3 flex items-center gap-2">
              <User class="h-4 w-4 text-primary" />
              Client Information
            </h3>
            <div class="space-y-1">
              <p><span class="font-medium">Name:</span> {getClientDisplayName(review.expand?.client_id)}</p>
              <p><span class="font-medium">Email:</span> {review.expand?.client_id?.email || 'N/A'}</p>
              {#if review.expand?.client_id?.phone_number}
                <p><span class="font-medium">Phone:</span> {review.expand?.client_id?.phone_number}</p>
              {/if}
            </div>
          </div>

          <!-- Service and Location -->
          {#if review.expand?.service_id || review.expand?.location_id}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#if review.expand?.service_id}
                <div class="bg-muted/50 rounded-lg p-4">
                  <h3 class="font-medium mb-3 flex items-center gap-2">
                    <Settings class="h-4 w-4 text-primary" />
                    Service
                  </h3>
                  <div class="space-y-1">
                    <p><span class="font-medium">Name:</span> {review.expand.service_id.name}</p>
                    {#if review.expand.service_id.description}
                      <p><span class="font-medium">Description:</span> {review.expand.service_id.description}</p>
                    {/if}
                  </div>
                </div>
              {/if}

              {#if review.expand?.location_id}
                <div class="bg-muted/50 rounded-lg p-4">
                  <h3 class="font-medium mb-3 flex items-center gap-2">
                    <MapPin class="h-4 w-4 text-primary" />
                    Location
                  </h3>
                  <div class="space-y-1">
                    <p><span class="font-medium">Name:</span> {review.expand.location_id.name}</p>
                    {#if review.expand.location_id.address}
                      <p><span class="font-medium">Address:</span> {review.expand.location_id.address}</p>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {/if}

          <!-- Review Comment -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="font-medium mb-3 flex items-center gap-2">
              <MessageSquare class="h-4 w-4 text-primary" />
              Review Comment
            </h3>
            <div class="bg-background rounded p-4 border">
              <p class="text-sm whitespace-pre-wrap leading-relaxed">
                {review.comment || 'No comment provided'}
              </p>
            </div>
            <div class="text-xs text-muted-foreground mt-2">
              {review.comment?.length || 0} characters
            </div>
          </div>

          <!-- Meta Information -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="font-medium mb-3 flex items-center gap-2">
              <Clock class="h-4 w-4 text-primary" />
              Meta Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span class="font-medium">Created:</span>
                <p class="text-sm text-muted-foreground">{formatDateTime(review.created)}</p>
              </div>
              <div>
                <span class="font-medium">Last Updated:</span>
                <p class="text-sm text-muted-foreground">{formatDateTime(review.updated)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between p-6 border-t">
        <div class="flex items-center gap-3">
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

          <Button 
            variant="outline"
            on:click={toggleStatus}
            disabled={loading}
          >
            {review.status === 'published' ? 'Hide' : 'Publish'}
          </Button>
        </div>
        
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
