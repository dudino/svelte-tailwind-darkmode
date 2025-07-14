<!--
  Booking Form Modal
  Modal for creating/editing bookings
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Save, FileText, MapPin, User, Calendar, Clock, Users } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';
  import { getPocketBaseClient, getCurrentUser } from '$lib/stores/authStore';
  import { formatDateForInput } from '$lib/utils/dateUtils';
  
  export let show = false;
  export let booking: any = null;
  export let locations: any[] = [];
  export let services: any[] = [];
  export let users: any[] = [];
  export let clients: any[] = [];
  export let rooms: any[] = [];

  const dispatch = createEventDispatcher();

  // Form data with proper typing
  let formData: {
    booking_number: string;
    client_id: string;
    service_id: string;
    location_id: string;
    room_id: string;
    user_id: string;
    date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    is_confirmed: boolean;
    pin_code: string;
    special_requests: string;
    price: string;
  } = {
    booking_number: '',
    client_id: '',
    service_id: '',
    location_id: '',
    room_id: '',
    user_id: '',
    date: '',
    start_time: '',
    end_time: '',
    duration_minutes: 0,
    is_confirmed: false,
    pin_code: '',
    special_requests: '',
    price: '0'
  };

  let loading = false;
  let error = '';

  // Filter rooms by selected location
  let filteredRooms: any[] = [];
  $: {
    if (formData.location_id) {
      filteredRooms = rooms.filter(room => room.location_id === formData.location_id);
    } else {
      filteredRooms = rooms;
    }
  }

  // Update location when room is selected, but only if no location is set
  // or when explicitly clearing the room selection
  $: {
    if (formData.room_id && !formData.location_id) {
      const selectedRoom = rooms.find(room => room.id === formData.room_id);
      if (selectedRoom) {
        formData.location_id = selectedRoom.location_id;
      }
    }
  }

  // Clear room selection when location changes to ensure rooms match location
  $: {
    if (formData.location_id && formData.room_id) {
      const selectedRoom = rooms.find(room => room.id === formData.room_id);
      if (selectedRoom && selectedRoom.location_id !== formData.location_id) {
        formData.room_id = '';
      }
    }
  }

  // Auto-calculate duration when times change
  $: {
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      const diffMs = end.getTime() - start.getTime();
      formData.duration_minutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    }
  }

  // Generate booking number for new bookings
  function generateBookingNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BK${year}${month}${day}${random}`;
  }

  // Reactive updates when booking prop changes
  $: if (booking) {
    // Get location from room relationship
    const roomLocation = booking.expand?.room_id?.location_id || '';
    formData = {
      booking_number: booking.booking_number || '',
      client_id: booking.client_id || '',
      service_id: booking.service_id || '',
      location_id: roomLocation,
      room_id: booking.room_id || '',
      user_id: booking.user_id || '',
      date: formatDateForInput(booking.date),
      start_time: booking.start_time || '',
      end_time: booking.end_time || '',
      duration_minutes: booking.duration_minutes || 0,
      is_confirmed: booking.is_confirmed || false,
      pin_code: booking.pin_code || '',
      special_requests: booking.special_requests || '',
      price: booking.price?.toString() || '0'
    };
  } else {
    // Reset form for new booking
    formData = {
      booking_number: generateBookingNumber(),
      client_id: '',
      service_id: '',
      location_id: '',
      room_id: '',
      user_id: '',
      date: '',
      start_time: '',
      end_time: '',
      duration_minutes: 0,
      is_confirmed: false,
      pin_code: '',
      special_requests: '',
      price: '0'
    };
  }

  $: isEditing = !!booking?.id;
  $: modalTitle = isEditing ? 'Edit Booking' : 'Create New Booking';

  function handleClose() {
    show = false;
    error = '';
  }

  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  // Auto-populate end time based on service duration
  function updateEndTime() {
    if (formData.start_time && formData.service_id) {
      const selectedService = services.find(s => s.id === formData.service_id);
      if (selectedService?.duration_minutes) {
        const startTime = new Date(`2000-01-01T${formData.start_time}`);
        const endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000);
        formData.end_time = endTime.toTimeString().slice(0, 5);
      }
    }
  }

  // Auto-populate price based on service
  function updatePrice() {
    if (formData.service_id) {
      const selectedService = services.find(s => s.id === formData.service_id);
      if (selectedService?.price) {
        formData.price = selectedService.price.toString();
      }
    }
  }

  async function handleSubmit() {
    loading = true;
    error = '';

    try {
      // Validation
      if (!formData.booking_number?.trim()) {
        throw new Error('Booking number is required');
      }
      if (!formData.client_id) {
        throw new Error('Client is required');
      }
      if (!formData.service_id) {
        throw new Error('Service is required');
      }
      if (!formData.room_id) {
        throw new Error('Room is required');
      }
      if (!formData.user_id) {
        throw new Error('Staff member is required');
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
      if (formData.duration_minutes <= 0) {
        throw new Error('Duration must be greater than 0 minutes');
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
      
      // Prepare booking data according to PocketBase schema
      const bookingData = {
        booking_number: formData.booking_number,
        client_id: formData.client_id,
        service_id: formData.service_id,
        room_id: formData.room_id,
        user_id: formData.user_id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        duration_minutes: formData.duration_minutes,
        is_confirmed: formData.is_confirmed,
        pin_code: formData.pin_code?.trim() || null,
        special_requests: formData.special_requests?.trim() || null,
        price: formData.price ? parseFloat(formData.price) : null,
        created_by: currentUser?.id
      };

      if (isEditing) {
        await pb.collection('bookings').update(booking.id, bookingData);
      } else {
        await pb.collection('bookings').create(bookingData);
      }

      dispatch('saved');
      handleClose();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error saving booking:', err);
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
      class="bg-card rounded-lg border shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden" 
      role="presentation"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 id="modal-title" class="text-xl font-semibold flex items-center gap-2">
          <FileText class="h-5 w-5 text-primary" />
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
          <!-- Booking Number -->
          <div>
            <Label for="booking_number">Booking Number *</Label>
            <Input 
              id="booking_number"
              bind:value={formData.booking_number}
              placeholder="Auto-generated booking number"
              readonly={!isEditing}
              required
            />
          </div>

          <!-- Client and Service -->
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
              <Label for="service_id">Service *</Label>
              <select 
                id="service_id"
                bind:value={formData.service_id}
                class="w-full px-3 py-2 border rounded-md bg-background"
                on:change={updateEndTime}
                on:change={updatePrice}
                required
              >
                <option value="">Select service...</option>
                {#each services as service}
                  <option value={service.id}>{service.name} ({service.duration_minutes}min)</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Location and Room -->
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
              <Label for="room_id">Room *</Label>
              <select 
                id="room_id"
                bind:value={formData.room_id}
                class="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="">Select room...</option>
                {#each filteredRooms as room}
                  <option value={room.id}>{room.name}</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Staff and Confirmation -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="user_id">Staff Member *</Label>
              <div class="relative">
                <Users class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select 
                  id="user_id"
                  bind:value={formData.user_id}
                  class="w-full pl-10 pr-3 py-2 border rounded-md bg-background"
                  required
                >
                  <option value="">Select staff member...</option>
                  {#each users as user}
                    <option value={user.id}>{user.name || user.email}</option>
                  {/each}
                </select>
              </div>
            </div>

            <div class="flex items-center space-x-2 pt-6">
              <input
                id="is_confirmed"
                type="checkbox"
                bind:checked={formData.is_confirmed}
                class="rounded border-input"
              />
              <Label for="is_confirmed">Confirmed Booking</Label>
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
                  on:change={updateEndTime}
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

          <!-- Price and PIN Code -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="price">Price (CZK)</Label>
              <input
                id="price"
                type="number"
                bind:value={formData.price}
                min="0"
                step="10"
                placeholder="Service price will be auto-filled"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <Label for="pin_code">PIN Code</Label>
              <Input 
                id="pin_code"
                bind:value={formData.pin_code}
                placeholder="Optional booking PIN code"
                maxlength="10"
              />
            </div>
          </div>

          <!-- Special Requests -->
          <div>
            <Label for="special_requests">Special Requests</Label>
            <Textarea 
              id="special_requests"
              bind:value={formData.special_requests}
              placeholder="Any special requests or notes for this booking..."
              rows={3}
            />
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
