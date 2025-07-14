<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Calendar, Grid, Plus, MapPin, Clock, User, Phone, Filter, Search } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { operatorBookingsStore, operatorBookingsActions, filteredRooms, todayBookings } from '$lib/stores/operator';
  import BookingModal from '$lib/components/operator/BookingModal.svelte';
  import ClientModal from '$lib/components/operator/ClientModal.svelte';

  let selectedTimeSlot: string | null = null;
  let selectedRoom: any = null;
  let selectedScheduleUser: any = null;

  onMount(async () => {
    try {
      await operatorBookingsActions.loadData();
    } catch (error) {
      console.error('Failed to load operator data:', error);
      toast.error('Failed to load booking data');
    }
  });

  function handleLocationChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    operatorBookingsActions.setSelectedLocation(target.value);
  }

  function handleDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    operatorBookingsActions.setSelectedDate(target.value);
  }

  function handleViewModeChange(mode: 'calendar' | 'grid') {
    operatorBookingsActions.setViewMode(mode);
  }

  function handleAddBooking(room: any = null, timeSlot: string | null = null) {
    selectedRoom = room;
    selectedTimeSlot = timeSlot;
    
    // If we have room and timeSlot, find the schedule and get the user
    if (room && timeSlot) {
      const schedule = getScheduleForRoomAndTime(room.id, timeSlot);
      selectedScheduleUser = schedule?.expand?.user_id || null;
      console.log('Selected schedule user:', selectedScheduleUser);
    } else {
      selectedScheduleUser = null;
    }
    
    operatorBookingsActions.showBookingModal();
  }

  function formatTime(time: string) {
    return time ? time.substring(0, 5) : '';
  }

  function generateTimeSlots() {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  }

  function getScheduleForRoomAndTime(roomId: string, time: string): any {
    return $operatorBookingsStore.schedules.find(schedule => 
      schedule.room_id === roomId && 
      schedule.start_time <= time && 
      schedule.end_time > time &&
      schedule.is_available
    );
  }

  function convertTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper function to get booking for specific room and time
  function getBookingForRoomAndTime(roomId: string, timeSlot: string): any {
    const timeInMinutes = convertTimeToMinutes(timeSlot);
    return $todayBookings.find(booking => {
      if (booking.room_id !== roomId) return false;
      
      const bookingStart = convertTimeToMinutes(booking.start_time.split(' ')[1] || booking.start_time);
      const bookingEnd = convertTimeToMinutes(booking.end_time.split(' ')[1] || booking.end_time);
      
      return timeInMinutes >= bookingStart && timeInMinutes < bookingEnd;
    });
  }

  $: timeSlots = generateTimeSlots();
  $: locations = $operatorBookingsStore.locations;
  $: selectedLocation = $operatorBookingsStore.selectedLocation;
  $: selectedDate = $operatorBookingsStore.selectedDate;
  $: viewMode = $operatorBookingsStore.viewMode;
  $: loading = $operatorBookingsStore.loading;
  $: error = $operatorBookingsStore.error;
  $: allRooms = $operatorBookingsStore.rooms;
  $: displayRooms = selectedLocation 
    ? allRooms.filter(room => room.location_id === selectedLocation)
    : allRooms;
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 class="text-3xl font-bold">Bookings</h1>
      <p class="text-muted-foreground">Manage schedules and bookings</p>
    </div>
    
    <Button on:click={() => handleAddBooking()}>
      <Plus class="w-4 h-4 mr-2" />
      Add Booking
    </Button>
  </div>

  <!-- Filters and Controls -->
  <Card>
    <CardContent class="p-4">
      <div class="flex flex-col lg:flex-row gap-4 items-center">
        <!-- Location Filter -->
        <div class="flex items-center space-x-2">
          <MapPin class="w-4 h-4 text-muted-foreground" />
          <select 
            class="border border-border rounded-md px-3 py-2 bg-background"
            value={selectedLocation || ''}
            on:change={handleLocationChange}
          >
            <option value="">All Locations</option>
            {#each locations as location}
              <option value={location.id}>{location.name}</option>
            {/each}
          </select>
        </div>

        <!-- Date Filter -->
        <div class="flex items-center space-x-2">
          <Clock class="w-4 h-4 text-muted-foreground" />
          <input 
            type="date" 
            class="border border-border rounded-md px-3 py-2 bg-background"
            value={selectedDate}
            on:change={handleDateChange}
          />
        </div>

        <!-- View Mode Toggle -->
        <div class="flex items-center space-x-2 ml-auto">
          <Button 
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            on:click={() => handleViewModeChange('calendar')}
          >
            <Calendar class="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            on:click={() => handleViewModeChange('grid')}
          >
            <Grid class="w-4 h-4 mr-2" />
            Grid
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>

  {#if loading}
    <div class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  {:else if error}
    <Card>
      <CardContent class="p-6 text-center">
        <p class="text-destructive">{error}</p>
        <Button class="mt-4" on:click={() => operatorBookingsActions.loadData()}>
          Retry
        </Button>
      </CardContent>
    </Card>
  {:else if !displayRooms.length}
    <Card>
      <CardContent class="p-6 text-center">
        <p class="text-muted-foreground">No rooms available for the selected location</p>
      </CardContent>
    </Card>
  {:else}
    <!-- Calendar/Grid View -->
    {#if viewMode === 'calendar'}
      <Card>
        <CardHeader>
          <CardTitle>
            Schedule - {selectedDate}
            {#if selectedLocation}
              <span class="text-sm font-normal text-muted-foreground ml-2">
                ({locations.find(l => l.id === selectedLocation)?.name || 'Unknown Location'})
              </span>
            {:else}
              <span class="text-sm font-normal text-muted-foreground ml-2">(All Locations)</span>
            {/if}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <div class="min-w-max">
              <!-- Header with time slots -->
              <div class="flex border-b border-border">
                <div class="w-48 p-3 font-medium border-r border-border bg-muted/50">
                  Room / Time
                </div>
                {#each timeSlots as timeSlot}
                  <div class="w-24 p-2 text-center text-sm font-medium border-r border-border bg-muted/50">
                    {timeSlot}
                  </div>
                {/each}
              </div>
              
              <!-- Room rows -->
              {#each displayRooms as room}
                {@const roomSchedules = $operatorBookingsStore.schedules.filter(s => s.room_id === room.id && s.is_available)}
                <div class="flex border-b border-border hover:bg-muted/25">
                  <!-- Room info -->
                  <div class="w-48 p-3 border-r border-border">
                    <div class="font-medium">{room.name}</div>
                    <div class="text-xs text-muted-foreground">
                      {room.expand?.location_id?.name || 'Unknown Location'} • Cap: {room.capacity}
                    </div>
                  </div>
                  
                  <!-- Time slots -->
                  {#each timeSlots as timeSlot}
                    {@const schedule = getScheduleForRoomAndTime(room.id, timeSlot)}
                    {@const booking = getBookingForRoomAndTime(room.id, timeSlot)}
                    <div class="w-24 h-16 border-r border-border relative">
                      {#if schedule}
                        <!-- Schedule available (light green) -->
                        <div class="absolute inset-0 bg-green-100 border border-green-200 flex flex-col justify-center items-center p-1">
                          <div class="text-xs font-medium text-green-800 text-center leading-tight">
                            {schedule.expand?.user_id?.name || schedule.expand?.user_id?.username || 'Available'}
                          </div>
                        </div>
                        
                        {#if booking}
                          <!-- Booking overlay -->
                          <div class="absolute inset-0 bg-primary/20 border border-primary/40 flex flex-col justify-center items-center p-1">
                            <div class="text-xs font-medium text-primary text-center leading-tight">
                              {booking.expand?.client_id?.nickname || booking.expand?.client_id?.first_name || 'Booked'}
                            </div>
                            <div class="text-xs text-primary/70">
                              {booking.expand?.service_id?.name}
                            </div>
                            {#if booking.is_confirmed}
                              <div class="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>
                            {:else}
                              <div class="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"></div>
                            {/if}
                          </div>
                        {:else}
                          <!-- Add booking button for available schedule -->
                          <button 
                            class="absolute inset-0 w-full h-full hover:bg-green-200 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                            on:click={() => handleAddBooking(room, timeSlot)}
                          >
                            <Plus class="w-4 h-4 text-green-700" />
                          </button>
                        {/if}
                      {:else}
                        <!-- No schedule (unavailable) -->
                        <div class="absolute inset-0 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center">
                          <span class="text-gray-400 text-xs">—</span>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/each}
            </div>
          </div>
        </CardContent>
      </Card>
    {:else}
      <!-- Grid View -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {#each displayRooms as room}
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center justify-between">
                <div>
                  <div>{room.name}</div>
                  <div class="text-sm font-normal text-muted-foreground">
                    {room.expand?.location_id?.name || 'Unknown Location'}
                  </div>
                </div>
                <Button size="sm" variant="outline" on:click={() => handleAddBooking(room)}>
                  <Plus class="w-4 h-4" />
                </Button>
              </CardTitle>
              <p class="text-sm text-muted-foreground">Capacity: {room.capacity}</p>
            </CardHeader>
            <CardContent>
              {@const roomSchedules = $operatorBookingsStore.schedules.filter(s => s.room_id === room.id && s.is_available)}
              {@const roomBookings = $todayBookings.filter(b => b.room_id === room.id)}
              
              {#if roomSchedules.length === 0}
                <p class="text-sm text-muted-foreground">No schedules today</p>
              {:else}
                <div class="space-y-2 mb-4">
                  <h4 class="text-sm font-medium text-green-700">Available Schedules:</h4>
                  {#each roomSchedules as schedule}
                    <div class="bg-green-50 border border-green-200 rounded p-2">
                      <div class="flex items-center justify-between text-sm mb-2">
                        <span class="font-medium text-green-800">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </span>
                      </div>
                      <div class="text-xs text-green-600 mb-2">
                        {schedule.expand?.user_id?.name || schedule.expand?.user_id?.username || 'Available'}
                      </div>
                      <!-- Time slot cells for this schedule -->
                      <div class="flex flex-wrap gap-1">
                        {#each timeSlots as timeSlot}
                          {@const scheduleStart = convertTimeToMinutes(schedule.start_time)}
                          {@const scheduleEnd = convertTimeToMinutes(schedule.end_time)}
                          {@const slotTime = convertTimeToMinutes(timeSlot)}
                          {#if slotTime >= scheduleStart && slotTime < scheduleEnd}
                            {@const booking = getBookingForRoomAndTime(room.id, timeSlot)}
                            <button 
                              class="w-12 h-8 text-xs border rounded flex items-center justify-center transition-colors
                                     {booking 
                                       ? 'bg-primary/20 border-primary/40 text-primary cursor-default' 
                                       : 'bg-white border-green-300 text-green-700 hover:bg-green-100'}"
                              on:click={() => !booking && handleAddBooking(room, timeSlot)}
                              disabled={!!booking}
                              title={booking ? `Booked: ${booking.expand?.client_id?.nickname || 'Client'}` : `Book at ${timeSlot}`}
                            >
                              {timeSlot.substring(0, 5)}
                            </button>
                          {/if}
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
              
              {#if roomBookings.length === 0}
                <p class="text-sm text-muted-foreground">No bookings today</p>
              {:else}
                <div class="space-y-2">
                  <h4 class="text-sm font-medium">Bookings:</h4>
                  {#each roomBookings as booking}
                    <div class="border border-border rounded-lg p-3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-medium text-sm">
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </span>
                        {#if booking.is_confirmed}
                          <Badge variant="default" class="text-xs">Confirmed</Badge>
                        {:else}
                          <Badge variant="secondary" class="text-xs">Pending</Badge>
                        {/if}
                      </div>
                      <div class="space-y-1">
                        <div class="flex items-center text-sm text-muted-foreground">
                          <User class="w-3 h-3 mr-2" />
                          {booking.expand?.client_id?.nickname || booking.expand?.client_id?.first_name || 'Client'}
                        </div>
                        {#if booking.expand?.client_id?.phone_number}
                          <div class="flex items-center text-sm text-muted-foreground">
                            <Phone class="w-3 h-3 mr-2" />
                            {booking.expand.client_id.phone_number}
                          </div>
                        {/if}
                        <div class="text-sm font-medium">
                          {booking.expand?.service_id?.name}
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </CardContent>
          </Card>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<!-- Modals -->
<BookingModal 
  {selectedRoom} 
  {selectedTimeSlot}
  {selectedScheduleUser}
  date={selectedDate}
/>
<ClientModal />
