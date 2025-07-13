<!--
  Reviews Management Page
  Admin interface for managing customer reviews
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Plus, 
    Search, 
    Filter, 
    Star, 
    Eye, 
    Edit, 
    Trash2,
    MessageSquare,
    Calendar,
    User,
    ThumbsUp,
    ThumbsDown
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import ReviewFormModal from '$lib/components/admin/ReviewFormModal.svelte';
  import ReviewDetailModal from '$lib/components/admin/ReviewDetailModal.svelte';
  import { getPocketBaseClient } from '$lib/stores/authStore';

  // Data
  let reviews: any[] = [];
  let loading = true;
  let error = '';

  // Related data
  let clients: any[] = [];
  let services: any[] = [];
  let locations: any[] = [];

  // Modals
  let showFormModal = false;
  let showDetailModal = false;
  let selectedReview: any = null;

  // Filters and search
  let searchTerm = '';
  let ratingFilter = 'all';
  let statusFilter = 'all';
  let sortBy = 'created';
  let sortOrder = 'desc';

  // Pagination
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalItems = 0;
  let totalPages = 0;

  // Filter options
  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Reviews' },
    { value: 'published', label: 'Published' },
    { value: 'pending', label: 'Pending' },
    { value: 'hidden', label: 'Hidden' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'created', label: 'Date Created' },
    { value: 'rating', label: 'Rating' },
    { value: 'updated', label: 'Last Updated' }
  ];

  onMount(() => {
    loadRelatedData();
    loadReviews();
  });

  // Reactive filters
  $: {
    applyFilters();
  }

  $: {
    totalPages = Math.ceil(totalItems / itemsPerPage);
  }

  async function loadRelatedData() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) return;

      const [clientsResult, servicesResult, locationsResult] = await Promise.all([
        pb.collection('clients').getList(1, 100, { fields: 'id,name,email' }),
        pb.collection('services').getList(1, 100, { fields: 'id,name' }),
        pb.collection('locations').getList(1, 100, { fields: 'id,name' })
      ]);

      clients = clientsResult.items;
      services = servicesResult.items;
      locations = locationsResult.items;
    } catch (err) {
      console.error('Error loading related data:', err);
    }
  }

  async function loadReviews() {
    loading = true;
    error = '';

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      // Build filter conditions
      let filter = '';
      const filterConditions = [];

      if (searchTerm) {
        filterConditions.push(`(comment ~ "${searchTerm}")`);
      }

      if (ratingFilter !== 'all') {
        filterConditions.push(`rating = ${ratingFilter}`);
      }

      if (statusFilter !== 'all') {
        filterConditions.push(`status = "${statusFilter}"`);
      }

      if (filterConditions.length > 0) {
        filter = filterConditions.join(' && ');
      }

      // Build sort string
      const sortString = `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;

      const result = await pb.collection('reviews').getList(currentPage, itemsPerPage, {
        filter: filter,
        sort: sortString,
        expand: 'client_id,service_id,location_id'
      });

      reviews = result.items;
      totalItems = result.totalItems;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load reviews';
      console.error('Error loading reviews:', err);
    } finally {
      loading = false;
    }
  }

  function applyFilters() {
    // This will trigger loadReviews through reactive statements
    if (!loading) {
      currentPage = 1; // Reset to first page when filtering
      loadReviews();
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
      loadReviews();
    }
  }

  function handleCreateReview() {
    selectedReview = null;
    showFormModal = true;
  }

  function handleEditReview(review: any) {
    selectedReview = review;
    showFormModal = true;
  }

  function handleViewReview(review: any) {
    selectedReview = review;
    showDetailModal = true;
  }

  async function handleDeleteReview(review: any) {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      await pb.collection('reviews').delete(review.id);
      await loadReviews(); // Reload the list
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete review';
      console.error('Error deleting review:', err);
    }
  }

  function handleFormSaved() {
    loadReviews();
  }

  function handleReviewDeleted() {
    loadReviews();
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

  function renderStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
</script>

<svelte:head>
  <title>Review Management - Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold flex items-center gap-3">
        <Star class="h-8 w-8 text-primary" />
        Review Management
      </h1>
      <p class="text-muted-foreground mt-1">
        Manage customer reviews and feedback
      </p>
    </div>
    <Button on:click={handleCreateReview} class="gap-2">
      <Plus class="h-4 w-4" />
      Add Review
    </Button>
  </div>

  <!-- Filters and Search -->
  <div class="bg-card rounded-lg border p-6">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <!-- Search -->
      <div class="md:col-span-2">
        <Label for="search">Search Reviews</Label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search by comment content..."
            bind:value={searchTerm}
            on:input={handleSearch}
            class="pl-10"
          />
        </div>
      </div>

      <!-- Rating Filter -->
      <div>
        <Label for="rating-filter">Rating</Label>
        <select 
          id="rating-filter"
          bind:value={ratingFilter}
          on:change={applyFilters}
          class="w-full px-3 py-2 border rounded-md bg-background"
        >
          {#each ratingOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
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
      Showing {reviews.length} of {totalItems} reviews
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
  {:else if reviews.length === 0}
    <!-- Empty State -->
    <div class="text-center py-12">
      <Star class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">No reviews found</h3>
      <p class="text-muted-foreground mb-4">
        {searchTerm ? 'Try adjusting your search criteria.' : 'Start by adding your first review.'}
      </p>
      <Button on:click={handleCreateReview}>
        <Plus class="h-4 w-4 mr-2" />
        Add Review
      </Button>
    </div>
  {:else}
    <!-- Reviews Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each reviews as review}
        <div class="bg-card rounded-lg border p-6 hover:shadow-lg transition-all duration-300">
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User class="h-5 w-5 text-primary" />
              </div>
              <div>
                <div class="font-medium">{review.expand?.client_id?.name || review.expand?.client_id?.email || 'Anonymous'}</div>
                <div class="text-sm text-muted-foreground">{formatDate(review.created)}</div>
              </div>
            </div>
            <span class="px-2 py-1 rounded-full text-xs font-medium {getStatusColor(review.status || 'published')}">
              {review.status ? review.status.charAt(0).toUpperCase() + review.status.slice(1) : 'Published'}
            </span>
          </div>

          <!-- Rating -->
          <div class="mb-3">
            <div class="text-2xl text-yellow-400 mb-1">
              {renderStars(review.rating || 0)}
            </div>
            <div class="text-sm text-muted-foreground">
              {review.rating || 0}/5 stars
            </div>
          </div>

          <!-- Service and Location -->
          {#if review.expand?.service_id || review.expand?.location_id}
            <div class="mb-3 space-y-1">
              {#if review.expand?.service_id}
                <div class="text-sm text-muted-foreground">
                  Service: {review.expand.service_id.name}
                </div>
              {/if}
              {#if review.expand?.location_id}
                <div class="text-sm text-muted-foreground">
                  Location: {review.expand.location_id.name}
                </div>
              {/if}
            </div>
          {/if}

          <!-- Comment Preview -->
          {#if review.comment}
            <div class="mb-4">
              <p class="text-sm text-muted-foreground line-clamp-3">
                {review.comment}
              </p>
            </div>
          {/if}

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2 pt-4 border-t">
            <Button 
              variant="ghost" 
              size="sm"
              on:click={() => handleViewReview(review)}
            >
              <Eye class="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              on:click={() => handleEditReview(review)}
            >
              <Edit class="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              on:click={() => handleDeleteReview(review)}
              class="text-destructive hover:text-destructive"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>
      {/each}
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
<ReviewFormModal 
  bind:show={showFormModal}
  review={selectedReview}
  {clients}
  {services}
  {locations}
  on:saved={handleFormSaved}
/>

<ReviewDetailModal 
  bind:show={showDetailModal}
  review={selectedReview}
  on:edit={handleEditReview}
  on:deleted={handleReviewDeleted}
/>
