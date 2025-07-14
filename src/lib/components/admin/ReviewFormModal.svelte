<!--
  Review Form Modal
  Modal for creating/editing reviews
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Star, MessageSquare, User, Settings, MapPin } from 'lucide-svelte';
  import BaseFormModal from '$lib/components/BaseFormModal.svelte';
  import StarRating from '$lib/components/StarRating.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import { getPocketBaseClient, getCurrentUser } from '$lib/stores/authStore';
  
  export let show = false;
  export let review: any = null;
  export let clients: any[] = [];
  export let bookings: any[] = []; // Changed from services/locations to bookings
  export let users: any[] = [];

  const dispatch = createEventDispatcher();

  // Form data with proper typing matching DB schema
  let formData: {
    booking_id: string;
    client_id: string;
    user_id: string;
    rating: number;
    title: string;
    content: string;
    is_anonymous: boolean;
    is_published: boolean;
  } = {
    booking_id: '',
    client_id: '',
    user_id: '',
    rating: 5,
    title: '',
    content: '',
    is_anonymous: false,
    is_published: true
  };

  let loading = false;
  let error = '';

  // Publication status options
  const publicationOptions = [
    { value: true, label: 'Published' },
    { value: false, label: 'Draft' }
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
      booking_id: review.booking_id || '',
      client_id: review.client_id || '',
      user_id: review.user_id || '',
      rating: review.rating || 5,
      title: review.title || '',
      content: review.content || '',
      is_anonymous: review.is_anonymous || false,
      is_published: review.is_published !== undefined ? review.is_published : true
    };
  } else {
    // Reset form for new review
    const currentUser = getCurrentUser();
    formData = {
      booking_id: '',
      client_id: '',
      user_id: currentUser?.id || '',
      rating: 5,
      title: '',
      content: '',
      is_anonymous: false,
      is_published: true
    };
  }

  $: isEditing = !!review?.id;

  function handleClose() {
    show = false;
    error = '';
  }

  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  async function handleSubmit() {
    loading = true;
    error = '';

    try {
      // Validation
      if (!formData.booking_id) {
        throw new Error('Booking is required');
      }
      if (!formData.client_id) {
        throw new Error('Client is required');
      }
      if (!formData.user_id) {
        throw new Error('User is required');
      }
      if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
        throw new Error('Rating must be between 1 and 5 stars');
      }
      if (!formData.content || typeof formData.content !== 'string' || !formData.content.trim()) {
        throw new Error('Review content is required');
      }

      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');
      
      // Prepare review data matching the database schema
      const reviewData = {
        booking_id: formData.booking_id,
        client_id: formData.client_id,
        user_id: formData.user_id,
        rating: formData.rating,
        title: formData.title.trim() || null,
        content: formData.content.trim(),
        is_anonymous: formData.is_anonymous,
        is_published: formData.is_published
      };

      console.log('Attempting to save review data:', reviewData);

      if (isEditing) {
        await pb.collection('reviews').update(review.id, reviewData);
      } else {
        await pb.collection('reviews').create(reviewData);
      }

      dispatch('saved');
      handleClose();
    } catch (err) {
      console.error('Full error details:', err);
      if (err?.data) {
        console.error('PocketBase error data:', err.data);
      }
      
      // Extract more specific error message
      let errorMessage = 'An error occurred';
      if (err?.data?.data) {
        // PocketBase validation errors
        const validationErrors = Object.entries(err.data.data).map(([field, error]) => `${field}: ${error.message}`);
        errorMessage = validationErrors.join(', ');
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      error = errorMessage;
    } finally {
      loading = false;
    }
  }
</script>

{#if show}
<!-- Modal Backdrop -->
<BaseFormModal 
  bind:show 
  title={isEditing ? 'Edit Review' : 'Create New Review'}
  {isEditing}
  {loading}
  {error}
  icon={Star}
  on:close={handleClose}
  on:submit={handleSubmit}
>
  <div class="space-y-4">
    <!-- Booking Selection -->
    <div>
      <Label for="booking_id">Booking *</Label>
      <div class="relative">
        <User class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <select 
          id="booking_id"
          bind:value={formData.booking_id}
          class="w-full pl-10 pr-3 py-2 border rounded-md bg-background"
          required
        >
          <option value="">Select booking...</option>
          {#each bookings as booking}
            <option value={booking.id}>{booking.booking_number} - {booking.expand?.client?.nickname || booking.expand?.client?.first_name || 'Unknown Client'}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Client and User Selection -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div>
        <Label for="user_id">Reviewer (User) *</Label>
        <div class="relative">
          <Settings class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select 
            id="user_id"
            bind:value={formData.user_id}
            class="w-full pl-10 pr-3 py-2 border rounded-md bg-background"
            required
          >
            <option value="">Select user...</option>
            {#each users as user}
              <option value={user.id}>{user.name || user.email}</option>
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
          <StarRating rating={formData.rating} size="lg" />
        </div>
      </div>
    </div>

    <!-- Title (Optional) -->
    <div>
      <Label for="title">Review Title (Optional)</Label>
      <input
        id="title"
        type="text"
        bind:value={formData.title}
        placeholder="Optional title for the review..."
        class="w-full px-3 py-2 border rounded-md bg-background"
        maxlength="100"
      />
      <div class="text-xs text-muted-foreground mt-1">
        {formData.title?.length || 0}/100 characters
      </div>
    </div>

    <!-- Content -->
    <div>
      <Label for="content">Review Content *</Label>
      <div class="relative">
        <MessageSquare class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <textarea
          id="content"
          bind:value={formData.content}
          placeholder="Write the review content here..."
          class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
          rows={4}
          required
          maxlength="1000"
        ></textarea>
      </div>
      <div class="text-xs text-muted-foreground mt-1">
        {formData.content?.length || 0}/1000 characters
      </div>
    </div>

    <!-- Publication and Anonymity Settings -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label for="is_published">Publication Status</Label>
        <select 
          id="is_published"
          bind:value={formData.is_published}
          class="w-full px-3 py-2 border rounded-md bg-background"
        >
          {#each publicationOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        <div class="text-xs text-muted-foreground mt-1">
          {formData.is_published ? 'This review will be visible to users.' : 'This review will be saved as a draft.'}
        </div>
      </div>

      <div>
        <Label for="is_anonymous">Anonymity</Label>
        <div class="flex items-center space-x-2 pt-2">
          <input
            id="is_anonymous"
            type="checkbox"
            bind:checked={formData.is_anonymous}
            class="rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          <span class="text-sm">Publish as anonymous review</span>
        </div>
        <div class="text-xs text-muted-foreground mt-1">
          {formData.is_anonymous ? 'Reviewer information will be hidden.' : 'Reviewer information will be shown.'}
        </div>
      </div>
    </div>
  </div>
</BaseFormModal>
{/if}
