<!--
  Service Form Modal
  Modal for creating/editing services
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Save, Settings, Clock, DollarSign } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';
  import { getPocketBaseClient, getCurrentUser } from '$lib/stores/authStore';
  
  export let show = false;
  export let service: any = null;

  const dispatch = createEventDispatcher();

  // Form data
  let formData = {
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    category: '',
    is_active: true
  };

  let loading = false;
  let error = '';

  // Category options
  const categoryOptions = [
    { value: '', label: 'Select category...' },
    { value: 'massage', label: 'Massage' },
    { value: 'therapy', label: 'Therapy' },
    { value: 'relaxation', label: 'Relaxation' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'special', label: 'Special' }
  ];

  // Reactive updates when service prop changes
  $: if (service) {
    formData = {
      name: service.name || '',
      description: service.description || '',
      duration_minutes: service.duration_minutes || 60,
      price: service.price || 0,
      category: service.category || '',
      is_active: service.is_active !== false
    };
  } else {
    // Reset form for new service
    formData = {
      name: '',
      description: '',
      duration_minutes: 60,
      price: 0,
      category: '',
      is_active: true
    };
  }

  $: isEditing = !!service?.id;
  $: modalTitle = isEditing ? 'Edit Service' : 'Create New Service';

  function handleClose() {
    show = false;
    error = '';
  }

  async function handleSubmit() {
    loading = true;
    error = '';

    try {
      // Validation
      if (!formData.name?.trim()) {
        throw new Error('Service name is required');
      }
      if (!formData.duration_minutes || formData.duration_minutes < 15) {
        throw new Error('Duration must be at least 15 minutes');
      }
      if (formData.price < 0) {
        throw new Error('Price cannot be negative');
      }

      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const currentUser = getCurrentUser();
      
      // Prepare service data
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        duration_minutes: formData.duration_minutes,
        price: formData.price,
        category: formData.category || null,
        is_active: formData.is_active,
        created_by: currentUser?.id
      };

      if (isEditing) {
        await pb.collection('services').update(service.id, serviceData);
      } else {
        await pb.collection('services').create(serviceData);
      }

      dispatch('saved');
      handleClose();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error saving service:', err);
    } finally {
      loading = false;
    }
  }
</script>

<!-- Modal Backdrop -->
{#if show}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={handleClose}>
    <div class="bg-card rounded-lg border shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden" on:click|stopPropagation>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          <Settings class="h-5 w-5 text-primary" />
          {modalTitle}
        </h2>
        <Button variant="ghost" size="sm" on:click={handleClose}>
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        {#if error}
          <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
            <p class="text-destructive text-sm">{error}</p>
          </div>
        {/if}

        <div class="space-y-4">
          <!-- Service Name -->
          <div>
            <Label for="name">Service Name *</Label>
            <Input 
              id="name"
              bind:value={formData.name}
              placeholder="e.g., Swedish Massage, Aromatherapy"
              required
            />
          </div>

          <!-- Description -->
          <div>
            <Label for="description">Description</Label>
            <Textarea 
              id="description"
              bind:value={formData.description}
              placeholder="Detailed description of the service..."
              rows="3"
            />
          </div>

          <!-- Duration and Price -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="duration_minutes">Duration (minutes) *</Label>
              <div class="relative">
                <Clock class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="duration_minutes"
                  type="number"
                  bind:value={formData.duration_minutes}
                  min="15"
                  max="480"
                  step="15"
                  class="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label for="price">Price (CZK)</Label>
              <div class="relative">
                <DollarSign class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="price"
                  type="number"
                  bind:value={formData.price}
                  min="0"
                  step="50"
                  class="pl-10"
                />
              </div>
            </div>
          </div>

          <!-- Category -->
          <div>
            <Label for="category">Category</Label>
            <select 
              id="category"
              bind:value={formData.category}
              class="w-full px-3 py-2 border rounded-md bg-background"
            >
              {#each categoryOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>

          <!-- Active Status -->
          <div class="flex items-center space-x-2">
            <input
              id="is_active"
              type="checkbox"
              bind:checked={formData.is_active}
              class="rounded"
            />
            <Label for="is_active">Active Service</Label>
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
