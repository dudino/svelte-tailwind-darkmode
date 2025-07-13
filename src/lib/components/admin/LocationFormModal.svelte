<!--
  Location Form Modal
  Modal for creating/editing locations
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Save, MapPin, Building } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import { getPocketBaseClient, getCurrentUser } from '$lib/stores/authStore';
  
  export let show = false;
  export let location: any = null;

  const dispatch = createEventDispatcher();

  // Form data
  let formData = {
    name: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    is_active: true
  };

  let loading = false;
  let error = '';

  // Reactive updates when location prop changes
  $: if (location) {
    formData = {
      name: location.name || '',
      address: location.address || '',
      city: location.city || '',
      postal_code: location.postal_code || '',
      country: location.country || '',
      is_active: location.is_active !== false
    };
  } else {
    // Reset form for new location
    formData = {
      name: '',
      address: '',
      city: '',
      postal_code: '',
      country: '',
      is_active: true
    };
  }

  $: isEditing = !!location?.id;
  $: modalTitle = isEditing ? 'Edit Location' : 'Create New Location';

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
        throw new Error('Location name is required');
      }
      if (!formData.address?.trim()) {
        throw new Error('Address is required');
      }
      if (!formData.city?.trim()) {
        throw new Error('City is required');
      }
      if (!formData.country?.trim()) {
        throw new Error('Country is required');
      }

      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const currentUser = getCurrentUser();
      
      // Prepare location data
      const locationData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postal_code: formData.postal_code?.trim() || '',
        country: formData.country.trim(),
        is_active: formData.is_active,
        created_by: currentUser?.id
      };

      if (isEditing) {
        await pb.collection('locations').update(location.id, locationData);
      } else {
        await pb.collection('locations').create(locationData);
      }

      dispatch('saved');
      handleClose();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error saving location:', err);
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
          <MapPin class="h-5 w-5 text-primary" />
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
          <!-- Location Name -->
          <div>
            <Label for="name">Location Name *</Label>
            <Input 
              id="name"
              bind:value={formData.name}
              placeholder="Main Office, Branch 1, etc."
              required
            />
          </div>

          <!-- Address -->
          <div>
            <Label for="address">Address *</Label>
            <Input 
              id="address"
              bind:value={formData.address}
              placeholder="Street address"
              required
            />
          </div>

          <!-- City and Postal Code -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="city">City *</Label>
              <Input 
                id="city"
                bind:value={formData.city}
                placeholder="City"
                required
              />
            </div>
            <div>
              <Label for="postal_code">Postal Code</Label>
              <Input 
                id="postal_code"
                bind:value={formData.postal_code}
                placeholder="12345"
              />
            </div>
          </div>

          <!-- Country -->
          <div>
            <Label for="country">Country *</Label>
            <Input 
              id="country"
              bind:value={formData.country}
              placeholder="Czech Republic"
              required
            />
          </div>

          <!-- Active Status -->
          <div class="flex items-center space-x-2">
            <input
              id="is_active"
              type="checkbox"
              bind:checked={formData.is_active}
              class="rounded"
            />
            <Label for="is_active">Active Location</Label>
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
