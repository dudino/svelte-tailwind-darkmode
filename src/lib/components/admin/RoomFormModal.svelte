<!--
  Room Form Modal
  Modal for creating/editing rooms
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Save, Building, MapPin, Users, DollarSign } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import { getPocketBaseClient, getCurrentUser } from '$lib/stores/authStore';
  
  export let show = false;
  export let room: any = null;
  export let locations: any[] = [];

  const dispatch = createEventDispatcher();

  // Form data
  let formData = {
    location_id: '',
    name: '',
    type: 'regular',
    capacity: 1,
    amenities: [],
    hourly_rate: 0,
    is_active: true
  };

  let loading = false;
  let error = '';

  // Available amenities
  const availableAmenities = [
    'shower',
    'sauna',
    'jacuzzi',
    'private_bathroom',
    'air_conditioning',
    'heating',
    'music_system',
    'tv',
    'mini_bar',
    'wifi'
  ];

  // Type options
  const typeOptions = [
    { value: 'regular', label: 'Regular' },
    { value: 'dynamic', label: 'Dynamic' }
  ];

  // Reactive updates when room prop changes
  $: if (room) {
    formData = {
      location_id: room.location_id || '',
      name: room.name || '',
      type: room.type || 'regular',
      capacity: room.capacity || 1,
      amenities: room.amenities || [],
      hourly_rate: room.hourly_rate || 0,
      is_active: room.is_active !== false
    };
  } else {
    // Reset form for new room
    formData = {
      location_id: '',
      name: '',
      type: 'regular',
      capacity: 1,
      amenities: [],
      hourly_rate: 0,
      is_active: true
    };
  }

  $: isEditing = !!room?.id;
  $: modalTitle = isEditing ? 'Edit Room' : 'Create New Room';

  function handleClose() {
    show = false;
    error = '';
  }

  function toggleAmenity(amenity: string) {
    const index = formData.amenities.indexOf(amenity);
    if (index > -1) {
      formData.amenities = formData.amenities.filter(a => a !== amenity);
    } else {
      formData.amenities = [...formData.amenities, amenity];
    }
  }

  async function handleSubmit() {
    loading = true;
    error = '';

    try {
      // Validation
      if (!formData.location_id) {
        throw new Error('Location is required');
      }
      if (!formData.name?.trim()) {
        throw new Error('Room name is required');
      }
      if (!formData.type) {
        throw new Error('Room type is required');
      }
      if (formData.capacity < 1) {
        throw new Error('Capacity must be at least 1');
      }

      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const currentUser = getCurrentUser();
      
      // Prepare room data
      const roomData = {
        location_id: formData.location_id,
        name: formData.name.trim(),
        type: formData.type,
        capacity: formData.capacity,
        amenities: formData.amenities,
        hourly_rate: formData.hourly_rate || null,
        is_active: formData.is_active,
        created_by: currentUser?.id
      };

      if (isEditing) {
        await pb.collection('rooms').update(room.id, roomData);
      } else {
        await pb.collection('rooms').create(roomData);
      }

      dispatch('saved');
      handleClose();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error saving room:', err);
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
          <Building class="h-5 w-5 text-primary" />
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
          <!-- Location -->
          <div>
            <Label for="location_id">Location *</Label>
            <div class="relative">
              <MapPin class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select 
                id="location_id"
                bind:value={formData.location_id}
                class="w-full pl-10 pr-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="">Select a location...</option>
                {#each locations as location}
                  <option value={location.id}>{location.name}</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Room Name -->
          <div>
            <Label for="name">Room Name *</Label>
            <Input 
              id="name"
              bind:value={formData.name}
              placeholder="e.g., Room 101, VIP Suite, Therapy Room A"
              required
            />
          </div>

          <!-- Type and Capacity -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="type">Type *</Label>
              <select 
                id="type"
                bind:value={formData.type}
                class="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                {#each typeOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </div>
            <div>
              <Label for="capacity">Capacity *</Label>
              <div class="relative">
                <Users class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="capacity"
                  type="number"
                  bind:value={formData.capacity}
                  min="1"
                  max="10"
                  class="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Hourly Rate -->
          <div>
            <Label for="hourly_rate">Hourly Rate (CZK)</Label>
            <div class="relative">
              <DollarSign class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="hourly_rate"
                type="number"
                bind:value={formData.hourly_rate}
                min="0"
                step="50"
                class="pl-10"
                placeholder="0 = no rate set"
              />
            </div>
          </div>

          <!-- Amenities -->
          <div>
            <Label>Amenities</Label>
            <div class="grid grid-cols-2 gap-2 mt-2">
              {#each availableAmenities as amenity}
                <button
                  type="button"
                  class="flex items-center space-x-2 px-3 py-2 text-sm rounded-md border transition-colors {
                    formData.amenities.includes(amenity)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted border-border'
                  }"
                  on:click={() => toggleAmenity(amenity)}
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    class="rounded"
                    readonly
                  />
                  <span>{amenity.replace('_', ' ')}</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Active Status -->
          <div class="flex items-center space-x-2">
            <input
              id="is_active"
              type="checkbox"
              bind:checked={formData.is_active}
              class="rounded"
            />
            <Label for="is_active">Active Room</Label>
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
