<!--
  Schedule Form Modal
  Modal for creating/editing schedules
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Save, Calendar, Clock, MapPin, User, Settings } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';
  import { getPocketBaseClient, getCurrentUser } from '$lib/stores/authStore';
  import { formatDateForInput } from '$lib/utils/dateUtils';
  
  export let show = false;
  export let schedule: any = null;
  export let locations: any[] = [];
  export let services: any[] = [];
  export let users: any[] = [];

  const dispatch = createEventDispatcher();

  // Form data with proper typing
  let formData: {
    title: string;
    description: string;
    location_id: string;
    service_id: string;
    user_id: string;
    date: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
  } = {
    title: '',
    description: '',
    location_id: '',
    service_id: '',
    user_id: '',
    date: '',
    start_time: '',
    end_time: '',
    is_active: true
  };

  let loading = false;
  let error = '';

  // Reactive updates when schedule prop changes
  $: if (schedule) {
    formData = {
      title: schedule.title || '',
      description: schedule.description || '',
      location_id: schedule.location_id || '',
      service_id: schedule.service_id || '',
      user_id: schedule.user_id || '',
      date: formatDateForInput(schedule.date),
      start_time: schedule.start_time || '',
      end_time: schedule.end_time || '',
      is_active: schedule.is_active !== false
    };
  } else {
    // Reset form for new schedule
    formData = {
      title: '',
      description: '',
      location_id: '',
      service_id: '',
      user_id: '',
      date: '',
      start_time: '',
      end_time: '',
      is_active: true
    };
  }

  $: isEditing = !!schedule?.id;
  $: modalTitle = isEditing ? 'Edit Schedule' : 'Create New Schedule';

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
      if (!formData.title?.trim()) {
        throw new Error('Schedule title is required');
      }
      if (!formData.location_id) {
        throw new Error('Location is required');
      }
      if (!formData.user_id) {
        throw new Error('User is required');
      }
      if (!formData.date) {
        throw new Error('Date is required');
      }
      if (!formData.start_time) {
        throw new Error('Start time is required');
      }
      if (!formData.end_time) {
        throw new Error('End time is required');
      }

      // Validate time range
      const startTime = new Date(`2000-01-01T${formData.start_time}`);
      const endTime = new Date(`2000-01-01T${formData.end_time}`);
      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }

      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const currentUser = getCurrentUser();
      
      // Prepare schedule data
      const scheduleData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        location_id: formData.location_id,
        service_id: formData.service_id || null,
        user_id: formData.user_id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_active: formData.is_active,
        created_by: currentUser?.id
      };

      if (isEditing) {
        await pb.collection('schedules').update(schedule.id, scheduleData);
      } else {
        await pb.collection('schedules').create(scheduleData);
      }

      dispatch('saved');
      handleClose();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error saving schedule:', err);
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
          <Calendar class="h-5 w-5 text-primary" />
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
          <!-- Title -->
          <div>
            <Label for="title">Schedule Title *</Label>
            <Input 
              id="title"
              bind:value={formData.title}
              placeholder="e.g., Morning Shift, Evening Availability"
              required
            />
          </div>

          <!-- Description -->
          <div>
            <Label for="description">Description</Label>
            <Textarea 
              id="description"
              bind:value={formData.description}
              placeholder="Optional description for this schedule..."
              rows={3}
            />
          </div>

          <!-- Location and User -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="">Select location...</option>
                  {#each locations as location}
                    <option value={location.id}>{location.name}</option>
                  {/each}
                </select>
              </div>
            </div>

            <div>
              <Label for="user_id">User *</Label>
              <div class="relative">
                <User class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

          <!-- Service (Optional) -->
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

          <!-- Date and Time -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label for="date">Date *</Label>
              <Input 
                id="date"
                type="date"
                bind:value={formData.date}
                required
              />
            </div>

            <div>
              <Label for="start_time">Start Time *</Label>
              <div class="relative">
                <Clock class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="start_time"
                  type="time"
                  bind:value={formData.start_time}
                  class="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label for="end_time">End Time *</Label>
              <div class="relative">
                <Clock class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="end_time"
                  type="time"
                  bind:value={formData.end_time}
                  class="pl-10"
                  required
                />
              </div>
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
            <Label for="is_active">Active Schedule</Label>
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
