<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Badge } from '$lib/components/ui/badge';
  import { Search, Plus, User, Phone, Mail, Clock } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { operatorBookingsStore, operatorBookingsActions } from '$lib/stores/operator';

  export let selectedRoom: any = null;
  export let selectedTimeSlot: string | null = null;
  export let selectedScheduleUser: any = null;
  export let date = '';

  const dispatch = createEventDispatcher();

  let searchQuery = '';
  let searchResults: any[] = [];
  let selectedClient: any = null;
  let selectedUser: any = null;
  let selectedService: any = null;
  let startTime = selectedTimeSlot || '';
  let endTime = '';
  let duration = 60;
  let specialRequests = '';
  let searching = false;
  let creating = false;
  let searchTimeout: number;
  let hasAutoSelected = false;

  $: open = $operatorBookingsStore.showBookingModal;
  $: users = $operatorBookingsStore.users.filter(u => u.role === 'user' && u.is_active);
  $: services = $operatorBookingsStore.services;
  $: rooms = $operatorBookingsStore.rooms;
  $: clients = $operatorBookingsStore.clients;
  
  // Show all users as service providers for now (simplified approach)
  $: availableServiceProviders = users;
  
  // Alternative: Filter users to only show those with schedules (keep for future)
  // $: availableServiceProviders = users.filter(user => {
  //   if (!date) return true; // If no date selected, show all users
  //   
  //   // Find schedules for this user (schedules are recurring, use day_of_week)
  //   const selectedDate = new Date(date);
  //   const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  //   
  //   const userSchedules = $operatorBookingsStore.schedules.filter(schedule => 
  //     schedule.user_id === user.id && 
  //     schedule.is_available &&
  //     schedule.day_of_week === dayOfWeek
  //   );
  //   
  //   // Debug logging
  //   if (user.id === users[0]?.id) { // Log for first user only to avoid spam
  //     console.log('Debug service provider filtering:', {
  //       date,
  //       dayOfWeek,
  //       totalUsers: users.length,
  //       totalSchedules: $operatorBookingsStore.schedules.length,
  //       userSchedules: userSchedules.length,
  //       sampleSchedule: $operatorBookingsStore.schedules[0]
  //     });
  //   }
  //   
  //   return userSchedules.length > 0;
  // });
  
  // Sort available service providers to prioritize the scheduled user
  $: sortedServiceProviders = availableServiceProviders.sort((a, b) => {
    if (selectedScheduleUser) {
      if (a.id === selectedScheduleUser.id) return -1;
      if (b.id === selectedScheduleUser.id) return 1;
    }
    return 0;
  });

  // Reset form when modal opens
  $: if (open) {
    resetFormData();
  } else {
    // Reset auto-selection flag when modal closes
    hasAutoSelected = false;
  }

  // Auto-select service provider from schedule (separate reactive statement)
  $: if (open && selectedScheduleUser && !selectedUser && !hasAutoSelected) {
    selectedUser = selectedScheduleUser;
    hasAutoSelected = true;
    console.log('Auto-selected service provider from schedule:', selectedUser);
    toast.info(`Auto-selected service provider: ${selectedUser.name || selectedUser.username}`);
  }

  // Update times when service changes or time inputs change
  $: if (selectedService && startTime) {
    updateEndTimeFromService();
  }

  // Auto-calculate end time when start time or duration changes
  $: if (startTime && duration > 0) {
    updateEndTimeFromDuration();
  }

  // Handle duration string changes
  function handleDurationChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (!isNaN(value) && value > 0) {
      duration = value;
    }
  }

  // Auto-calculate duration when start or end time changes
  $: if (startTime && endTime) {
    updateDurationFromTimes();
  }

  // Debounced search
  $: if (searchQuery.trim()) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      handleSearch();
    }, 300);
  } else {
    searchResults = [];
    // Don't clear selections when search query is cleared
  }

  function handleDialogOpenChange(isOpen: boolean) {
    if (!isOpen) {
      handleClose();
    }
  }

  function resetFormData() {
    startTime = selectedTimeSlot || '';
    searchQuery = '';
    searchResults = [];
    selectedClient = null;
    // Don't reset selectedUser if hasAutoSelected is true - this prevents re-triggering auto-selection
    if (!hasAutoSelected) {
      selectedUser = null;
    }
    selectedService = null;
    endTime = '';
    duration = 60;
    specialRequests = '';
    // Don't reset hasAutoSelected here to prevent loops
  }

  function updateEndTimeFromService() {
    if (selectedService && startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + selectedService.duration_minutes;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
      duration = selectedService.duration_minutes;
    }
  }

  function updateEndTimeFromDuration() {
    if (startTime && duration > 0) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + duration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    }
  }

  function updateDurationFromTimes() {
    if (startTime && endTime) {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      const calculatedDuration = endTotalMinutes - startTotalMinutes;
      if (calculatedDuration > 0) {
        duration = calculatedDuration;
      }
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      searchResults = [];
      selectedClient = null;
      selectedUser = null;
      return;
    }

    searching = true;
    try {
      console.log('Searching for clients with query:', searchQuery.trim());
      const results = await operatorBookingsActions.searchClient(searchQuery.trim());
      searchResults = results || [];
      
      console.log('Search results:', results);
      
      if (results && results.length > 0) {
        toast.success(`Found ${results.length} matching client(s)`);
      } else {
        console.log('No clients or users found');
        toast.info('No existing client found. You can create a new one.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search for client');
      searchResults = [];
    }
    searching = false;
  }

  function selectResult(result: any) {
    // Determine if it's a client or user based on properties
    if ('phone_number' in result || 'total_visits' in result) {
      // This is a client selection
      selectedClient = result;
      console.log('Selected client:', selectedClient);
      toast.success(`Selected client: ${result.nickname || result.first_name || result.phone_number}`);
    } else if ('username' in result || 'role' in result) {
      // This is a user selected as a client (user booking)
      selectedClient = result; // Store user as client for user bookings
      console.log('Selected user as client:', selectedClient);
      toast.success(`Selected user: ${result.name || result.username} (user booking)`);
    }
    
    // Clear search results but keep the search query for reference
    searchResults = [];
  }

  function handleCreateNewClient() {
    // Pre-fill client data if search query looks like phone/email
    const clientData: any = {};
    if (searchQuery.includes('@')) {
      clientData.email = searchQuery;
    } else if (/^\+?\d+$/.test(searchQuery)) {
      clientData.phone_number = searchQuery;
    }
    
    operatorBookingsActions.updateNewClientData(clientData);
    operatorBookingsActions.showClientModal();
  }

  async function handleSubmit() {
    if (!selectedUser) {
      toast.error('Please select a service provider');
      return;
    }

    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }

    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }

    if (!startTime || !endTime) {
      toast.error('Please set start and end time');
      return;
    }

    const roomId = selectedRoom?.id;
    if (!roomId) {
      toast.error('Please select a room');
      return;
    }

    creating = true;
    try {
      // Check if this is a user booking (user as client) or regular client booking
      const isUserBooking = selectedClient && ('username' in selectedClient || 'role' in selectedClient);
      const clientId = selectedClient.id;
      const userId = isUserBooking ? selectedClient.id : selectedUser.id;

      console.log('Creating booking with data:', {
        clientId,
        userId,
        roomId,
        serviceId: selectedService.id,
        date,
        startTime,
        endTime,
        duration,
        specialRequests,
        bookingType: isUserBooking ? 'user' : 'client'
      });

      await operatorBookingsActions.createBooking({
        client_id: clientId,
        user_id: userId,
        room_id: roomId,
        service_id: selectedService.id,
        date,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: duration,
        special_requests: specialRequests || undefined
      });

      toast.success('Booking created successfully');
      handleClose();
    } catch (error: any) {
      console.error('Booking creation error:', error);
      toast.error(`Failed to create booking: ${error?.message || error}`);
    }
    creating = false;
  }

  function handleClose() {
    operatorBookingsActions.hideBookingModal();
    resetForm();
  }

  function resetForm() {
    startTime = selectedTimeSlot || '';
    searchQuery = '';
    searchResults = [];
    selectedClient = null;
    selectedUser = null;
    selectedService = null;
    endTime = '';
    duration = 60;
    specialRequests = '';
    hasAutoSelected = false; // Full reset when closing
  }

  // Listen for new client creation
  $: if ($operatorBookingsStore.newClientData && Object.keys($operatorBookingsStore.newClientData).length > 0) {
    // A new client was created, refresh our data
    operatorBookingsActions.loadData();
  }
</script>

{#if open}
<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-background border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Create Booking</h2>
        <button on:click={handleClose} class="text-muted-foreground hover:text-foreground">✕</button>
      </div>

    <div class="space-y-6">
      <!-- Service Provider Selection (moved to top) -->
      <div>
        <Label class="flex items-center gap-2">
          <User class="w-4 h-4" />
          Service Provider
          <Badge variant="outline" class="text-xs">
            {availableServiceProviders.length} staff members available
          </Badge>
        </Label>
        
        <select 
          class="w-full border border-border rounded-md px-3 py-2 bg-background mt-2"
          bind:value={selectedUser}
        >
          <option value={null}>Select a service provider</option>
          {#each sortedServiceProviders as user}
            <option value={user}>
              {user.name || user.username} - {user.role}
              {#if user.id === selectedScheduleUser?.id} (Scheduled){/if}
            </option>
          {/each}
        </select>
      </div>

      <!-- Booking Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Date</Label>
          <Input value={date} disabled />
        </div>
        <div>
          <Label>Room</Label>
          <select 
            class="w-full border border-border rounded-md px-3 py-2 bg-background"
            bind:value={selectedRoom}
          >
            {#if selectedRoom}
              <option value={selectedRoom}>{selectedRoom.name}</option>
            {:else}
              <option value={null}>Select a room</option>
            {/if}
            {#each rooms as room}
              {#if room.id !== selectedRoom?.id}
                <option value={room}>{room.name} - {room.expand?.location_id?.name}</option>
              {/if}
            {/each}
          </select>
        </div>
      </div>

      <!-- Client Search -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <Label>Client Search ({clients.length} clients available)</Label>
          {#if selectedClient}
            <Button 
              size="sm" 
              variant="outline" 
              on:click={() => { 
                selectedClient = null; 
                searchQuery = ''; 
                searchResults = []; 
              }}
              class="text-xs"
            >
              <Search class="w-3 h-3 mr-1" />
              Search Different Client
            </Button>
          {/if}
        </div>
        <div class="flex space-x-2">
          <div class="flex-1">
            <Input
              placeholder="Enter phone number, email, name, or username..."
              bind:value={searchQuery}
            />
          </div>
          {#if searching}
            <div class="flex items-center px-3">
              <div class="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            </div>
          {/if}
          <Button variant="outline" on:click={handleCreateNewClient}>
            <Plus class="w-4 h-4 mr-2" />
            New Client
          </Button>
        </div>

        <!-- Selected Client Display -->
        {#if selectedClient}
          <div class="border border-green-200 rounded-lg p-4 bg-green-50">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-green-800">Selected Client</h4>
              <div class="flex items-center gap-2">
                <Badge variant="default" class="bg-green-600">Client</Badge>
                <button 
                  class="text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-100"
                  on:click={() => { 
                    selectedClient = null; 
                    searchQuery = ''; 
                    searchResults = [];
                  }}
                  title="Clear selection"
                >
                  ✕
                </button>
              </div>
            </div>
            <div class="space-y-1">
              <div class="flex items-center text-sm">
                <User class="w-4 h-4 mr-2 text-green-600" />
                <span class="font-medium text-green-800">
                  {selectedClient?.nickname || selectedClient?.first_name || selectedClient?.phone_number || 'Unknown'}
                </span>
              </div>
              {#if selectedClient?.phone_number}
                <div class="flex items-center text-sm text-green-700">
                  <Phone class="w-4 h-4 mr-2" />
                  {selectedClient.phone_number}
                </div>
              {/if}
              {#if selectedClient?.email}
                <div class="flex items-center text-sm text-green-700">
                  <Mail class="w-4 h-4 mr-2" />
                  {selectedClient.email}
                </div>
              {/if}
              {#if selectedClient && 'total_visits' in selectedClient}
                <div class="text-xs text-green-600">
                  Total visits: {selectedClient.total_visits}
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Search Results (only show when searching and no client is selected) -->
        {#if searchResults.length > 0 && !selectedClient}
          <div class="border border-border rounded-lg p-4 bg-muted/50">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium">Found {searchResults.length} Client(s)</h4>
              <Badge variant="default">Search Results</Badge>
            </div>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              {#each searchResults as result}
                <div class="border border-border rounded-lg p-3 bg-background">
                  <div class="flex items-center justify-between">
                    <div class="space-y-1 flex-1">
                      <div class="flex items-center text-sm">
                        <User class="w-4 h-4 mr-2" />
                        <span class="font-medium">
                          {result.nickname || result.name || result.first_name || result.username || 'Unknown'}
                        </span>
                        <Badge variant="outline" class="ml-2 text-xs">
                          {'phone_number' in result ? 'Client' : 'User'}
                        </Badge>
                      </div>
                      {#if result.phone_number}
                        <div class="flex items-center text-sm text-muted-foreground">
                          <Phone class="w-4 h-4 mr-2" />
                          {result.phone_number}
                        </div>
                      {/if}
                      {#if result.email}
                        <div class="flex items-center text-sm text-muted-foreground">
                          <Mail class="w-4 h-4 mr-2" />
                          {result.email}
                        </div>
                      {/if}
                      {#if 'total_visits' in result}
                        <div class="text-xs text-muted-foreground">
                          Total visits: {result.total_visits}
                        </div>
                      {/if}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      on:click={() => {
                        console.log('Selecting result:', result);
                        selectResult(result);
                      }}
                      class="ml-3"
                    >
                      Select
                    </Button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {:else if searchQuery && !searching && !selectedClient}
          <div class="border border-dashed border-border rounded-lg p-4 text-center">
            <p class="text-sm text-muted-foreground mb-3">No existing client found</p>
            <Button variant="outline" on:click={handleCreateNewClient}>
              <Plus class="w-4 h-4 mr-2" />
              Create New Client
            </Button>
          </div>
        {/if}
      </div>

      <!-- Service Selection -->
      <div>
        <Label>Service</Label>
        <select 
          class="w-full border border-border rounded-md px-3 py-2 bg-background"
          bind:value={selectedService}
        >
          <option value={null}>Select a service</option>
          {#each services as service}
            <option value={service}>{service.name} ({service.duration_minutes} min)</option>
          {/each}
        </select>
      </div>

      <!-- Time Selection -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Start Time</Label>
          <Input type="time" bind:value={startTime} />
        </div>
        <div>
          <Label>End Time</Label>
          <Input type="time" bind:value={endTime} />
        </div>
        <div>
          <Label>Duration (minutes)</Label>
          <input 
            type="number" 
            value={duration}
            on:input={handleDurationChange}
            min="1"
            max="480"
            step="5"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <!-- Special Requests -->
      <div>
        <Label>Special Requests (Optional)</Label>
        <Textarea 
          placeholder="Any special requests or notes..."
          bind:value={specialRequests}
          rows={3}
        />
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-2 pt-4">
        <Button variant="outline" on:click={handleClose}>
          Cancel
        </Button>
        <Button on:click={handleSubmit} disabled={creating}>
          {#if creating}
            <div class="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
          {/if}
          Create Booking
        </Button>
      </div>
      </div>
    </div>
  </div>
</div>
{/if}
