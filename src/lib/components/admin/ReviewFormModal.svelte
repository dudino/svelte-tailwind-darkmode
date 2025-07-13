<!--
  Review Form Modal
  Modal for creating/editing reviews
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Save, Star, MessageSquare, User, Settings, MapPin } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';
  import { getPocketBaseClient, getCurrentUser } from '$lib/stores/authStore';
  
  export let show = false;
  export let review: any = null;
  export let clients: any[] = [];
  export let services: any[] = [];
  export let locations: any[] = [];

  const dispatch = createEventDispatcher();

  // Form data with proper typing
  let formData: {
    client_id: string;
    service_id: string;
    location_id: string;
    rating: number;
    comment: string;
    status: string;
  } = {
    client_id: '',
    service_id: '',
    location_id: '',
    rating: 5,
    comment: '',
    status: 'published'
  };

  let loading = false;
  let error = '';

  // Status options
  const statusOptions = [
    { value: 'published', label: 'Published' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'hidden', label: 'Hidden' }
  ];

  // Rating options
  const ratingOptions = [
    { value: 1, label: '1 Star - Poor' },
    { value: 2, label: '2 Stars - Fair' },
    { value: 3, label: '3 Stars - Good' },
    { value: 4, label: '4 Stars - Very Good' },
    { value: 5, label: '5 Stars - Excellent' }
  ];

  // Reactive updates when review prop changes
  $: if (review) {
    formData = {
      client_id: review.client_id || '',
      service_id: review.service_id || '',
      location_id: review.location_id || '',
      rating: review.rating || 5,
      comment: review.comment || '',
      status: review.status || 'published'
    };
  } else {
    // Reset form for new review
    formData = {
      client_id: '',
      service_id: '',
      location_id: '',
      rating: 5,
      comment: '',
      status: 'published'
    };
  }

  $: isEditing = !!review?.id;
  $: modalTitle = isEditing ? 'Edit Review' : 'Create New Review';

  function handleClose() {
    show = false;
    error = '';
  }

  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  function renderStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  async function handleSubmit() {
    loading = true;
    error = '';

    try {
      // Validation
      if (!formData.client_id) {
        throw new Error('Client is required');
      }
      if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
        throw new Error('Rating must be between 1 and 5 stars');
      }
      if (!formData.comment?.trim()) {
        throw new Error('Comment is required');
      }

      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const currentUser = getCurrentUser();
      
      // Prepare review data
      const reviewData = {
        client_id: formData.client_id,
        service_id: formData.service_id || null,
        location_id: formData.location_id || null,
        rating: formData.rating,
        comment: formData.comment.trim(),
        status: formData.status,
        created_by: currentUser?.id
      };

      if (isEditing) {
        await pb.collection('reviews').update(review.id, reviewData);
      } else {
        await pb.collection('reviews').create(reviewData);
      }

      dispatch('saved');
      handleClose();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error saving review:', err);
    } finally {
      loading = false;
    }
  }
</script>

<!-- Modal Backdrop -->
{#if show}
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
          {modalTitle}
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

        <div class="space-y-4">
          <!-- Client Selection -->
          <div>
            <Label for="client_id">Client *</Label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select 
                id="client_id"
                bind:value={formData.client_id}
                class="w-full pl-10 pr-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="">Select client...</option>
                {#each clients as client}
                  <option value={client.id}>{client.nickname || client.first_name || client.email}</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Service and Location (Optional) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="service_id">Service (Optional)</Label>
              <div class="relative">
                <Settings class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select 
                  id="service_id"
                  bind:value={formData.service_id}
                  class="w-full pl-10 pr-3 py-2 border rounded-md bg-background"
                >
                  <option value="">No specific service</option>
                  {#each services as service}
                    <option value={service.id}>{service.name}</option>
                  {/each}
                </select>
              </div>
            </div>

            <div>
              <Label for="location_id">Location (Optional)</Label>
              <div class="relative">
                <MapPin class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select 
                  id="location_id"
                  bind:value={formData.location_id}
                  class="w-full pl-10 pr-3 py-2 border rounded-md bg-background"
                >
                  <option value="">No specific location</option>
                  {#each locations as location}
                    <option value={location.id}>{location.name}</option>
                  {/each}
                </select>
              </div>
            </div>
          </div>

          <!-- Rating -->
          <div>
            <Label for="rating">Rating *</Label>
            <div class="space-y-3">
              <select 
                id="rating"
                bind:value={formData.rating}
                class="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                {#each ratingOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
              
              <!-- Visual Star Display -->
              <div class="flex items-center gap-2">
                <span class="text-sm text-muted-foreground">Preview:</span>
                <span class="text-2xl text-yellow-400">
                  {renderStars(formData.rating)}
                </span>
                <span class="text-sm text-muted-foreground">
                  ({formData.rating}/5)
                </span>
              </div>
            </div>
          </div>

          <!-- Comment -->
          <div>
            <Label for="comment">Review Comment *</Label>
            <div class="relative">
              <MessageSquare class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea 
                id="comment"
                bind:value={formData.comment}
                placeholder="Write the review comment here..."
                class="pl-10"
                rows={4}
                required
              />
            </div>
            <div class="text-xs text-muted-foreground mt-1">
              {formData.comment?.length || 0} characters
            </div>
          </div>

          <!-- Status -->
          <div>
            <Label for="status">Status</Label>
            <select 
              id="status"
              bind:value={formData.status}
              class="w-full px-3 py-2 border rounded-md bg-background"
            >
              {#each statusOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <div class="text-xs text-muted-foreground mt-1">
              {#if formData.status === 'published'}
                This review will be visible to all users.
              {:else if formData.status === 'pending'}
                This review is awaiting approval.
              {:else if formData.status === 'hidden'}
                This review will not be visible to users.
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t">
        <Button variant="outline" on:click={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button on:click={handleSubmit} disabled={loading}>
          {#if loading}
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
          {:else}
            <Save class="h-4 w-4 mr-2" />
          {/if}
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  </div>
{/if}
