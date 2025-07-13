<!--
  Admin Schedules Management
  CRUD interface for managing schedules (Administrator only)
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    Calendar,
    Eye,
    MapPin,
    Clock,
    User,
    Filter
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import { getPocketBaseClient } from '$lib/stores/authStore';
  import ScheduleFormModal from '$lib/components/admin/ScheduleFormModal.svelte';
  import ScheduleDetailModal from '$lib/components/admin/ScheduleDetailModal.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
  import { deleteRecord } from '$lib/utils/deleteHandler';

  // Local state
  let schedules: any[] = [];
  let locations: any[] = [];
  let services: any[] = [];
  let users: any[] = [];
  let filteredSchedules: any[] = [];
  let searchTerm = '';
  let filterLocation = '';
  let filterService = '';
  let filterUser = '';
  let filterStatus = '';
  let selectedSchedules: string[] = [];
  let showScheduleForm = false;
  let showScheduleDetail = false;
  let showDeleteConfirm = false;
  let editingSchedule: any = null;
  let viewingSchedule: any = null;
  let scheduleToDelete: any = null;
  let loading = false;
  let error = '';

  // Pagination
  let currentPage = 1;
  let itemsPerPage = 10;

  // Filter options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  // Reactive filtering
  $: {
    filteredSchedules = schedules.filter(schedule => {
      const matchesSearch = !searchTerm || 
        schedule.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.expand?.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.expand?.location_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = !filterLocation || schedule.location_id === filterLocation;
      const matchesService = !filterService || schedule.service_id === filterService;
      const matchesUser = !filterUser || schedule.user_id === filterUser;
      const matchesStatus = !filterStatus || String(schedule.is_active) === filterStatus;
      
      return matchesSearch && matchesLocation && matchesService && matchesUser && matchesStatus;
    });
  }

  // Pagination
  $: totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  $: paginatedSchedules = filteredSchedules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  onMount(() => {
    loadData();
  });

  async function loadData() {
    await Promise.all([loadSchedules(), loadLocations(), loadServices(), loadUsers()]);
  }

  async function loadSchedules() {
    loading = true;
    error = '';
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const records = await pb.collection('schedules').getFullList({
        sort: '-created',
        expand: 'location_id,service_id,user_id'
      });
      
      schedules = records;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load schedules';
      console.error('Error loading schedules:', err);
    } finally {
      loading = false;
    }
  }

  async function loadLocations() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const records = await pb.collection('locations').getFullList({
        sort: 'name',
        filter: 'is_active = true'
      });
      
      locations = records;
    } catch (err) {
      console.error('Error loading locations:', err);
    }
  }

  async function loadServices() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const records = await pb.collection('services').getFullList({
        sort: 'name',
        filter: 'is_active = true'
      });
      
      services = records;
    } catch (err) {
      console.error('Error loading services:', err);
    }
  }

  async function loadUsers() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const records = await pb.collection('users').getFullList({
        sort: 'name',
        filter: 'is_active = true'
      });
      
      users = records;
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }

  function handleCreateSchedule() {
    editingSchedule = null;
    showScheduleForm = true;
  }

  function handleEditSchedule(schedule: any) {
    editingSchedule = { ...schedule };
    showScheduleForm = true;
  }

  function handleViewSchedule(schedule: any) {
    viewingSchedule = schedule;
    showScheduleDetail = true;
  }

  function handleDeleteSchedule(schedule: any) {
    scheduleToDelete = schedule;
    showDeleteConfirm = true;
  }

  async function confirmDeleteSchedule() {
    if (!scheduleToDelete) return;
    
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await deleteRecord('schedules', scheduleToDelete.id);
      
      if (result.success) {
        showDeleteConfirm = false;
        scheduleToDelete = null;
        await loadSchedules(); // Refresh the list
        
        // Show success message - schedules don't have is_active, so will always be hard delete
        console.log('Schedule deleted:', result.message);
      } else {
        error = result.message || 'Failed to delete schedule';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete schedule';
      console.error('Error deleting schedule:', err);
    }
  }

  function toggleScheduleSelection(scheduleId: string) {
    if (selectedSchedules.includes(scheduleId)) {
      selectedSchedules = selectedSchedules.filter(id => id !== scheduleId);
    } else {
      selectedSchedules = [...selectedSchedules, scheduleId];
    }
  }

  function selectAllSchedules() {
    selectedSchedules = paginatedSchedules.map(s => s.id);
  }

  function clearSelection() {
    selectedSchedules = [];
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatTime(timeString: string) {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<svelte:head>
  <title>Schedules Management - Admin</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
        <Calendar class="h-8 w-8 text-primary" />
        Schedules Management
      </h1>
      <p class="text-muted-foreground mt-2">
        Manage work schedules and availability for staff members.
      </p>
    </div>
    <Button on:click={handleCreateSchedule} class="gap-2">
      <Plus class="h-4 w-4" />
      Add Schedule
    </Button>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p class="text-destructive">{error}</p>
    </div>
  {/if}

  <!-- Filters and Search -->
  <div class="bg-card rounded-lg border p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <!-- Search -->
      <div class="lg:col-span-2">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            bind:value={searchTerm}
            placeholder="Search schedules..."
            class="pl-10"
          />
        </div>
      </div>

      <!-- Location Filter -->
      <div>
        <select 
          bind:value={filterLocation}
          class="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Locations</option>
          {#each locations as location}
            <option value={location.id}>{location.name}</option>
          {/each}
        </select>
      </div>

      <!-- Service Filter -->
      <div>
        <select 
          bind:value={filterService}
          class="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Services</option>
          {#each services as service}
            <option value={service.id}>{service.name}</option>
          {/each}
        </select>
      </div>

      <!-- User Filter -->
      <div>
        <select 
          bind:value={filterUser}
          class="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Users</option>
          {#each users as user}
            <option value={user.id}>{user.name || user.email}</option>
          {/each}
        </select>
      </div>

      <!-- Status Filter -->
      <div>
        <select 
          bind:value={filterStatus}
          class="w-full px-3 py-2 border rounded-md bg-background"
        >
          {#each statusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Selected Actions -->
    {#if selectedSchedules.length > 0}
      <div class="flex items-center gap-3 mt-4 p-3 bg-muted rounded-lg">
        <span class="text-sm font-medium">
          {selectedSchedules.length} schedule(s) selected
        </span>
        <Button variant="outline" size="sm" on:click={clearSelection}>
          Clear Selection
        </Button>
        <!-- Add bulk actions here if needed -->
      </div>
    {/if}
  </div>

  <!-- Schedules Table -->
  <div class="bg-card rounded-lg border">
    {#if loading}
      <div class="flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    {:else if paginatedSchedules.length === 0}
      <div class="text-center p-8">
        <Calendar class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 class="text-lg font-semibold mb-2">No schedules found</h3>
        <p class="text-muted-foreground mb-4">
          {filteredSchedules.length === 0 && schedules.length > 0 
            ? 'No schedules match your current filters.' 
            : 'Get started by creating your first schedule.'}
        </p>
        {#if filteredSchedules.length === 0 && schedules.length === 0}
          <Button on:click={handleCreateSchedule}>
            <Plus class="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        {/if}
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="p-4">
                <input
                  type="checkbox"
                  class="rounded"
                  checked={selectedSchedules.length === paginatedSchedules.length}
                  on:change={selectedSchedules.length === paginatedSchedules.length ? clearSelection : selectAllSchedules}
                />
              </th>
              <th class="p-4 font-medium">Schedule</th>
              <th class="p-4 font-medium">Location</th>
              <th class="p-4 font-medium">User</th>
              <th class="p-4 font-medium">Service</th>
              <th class="p-4 font-medium">Date & Time</th>
              <th class="p-4 font-medium">Status</th>
              <th class="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            {#each paginatedSchedules as schedule}
              <tr class="hover:bg-muted/50">
                <td class="p-4">
                  <input
                    type="checkbox"
                    class="rounded"
                    checked={selectedSchedules.includes(schedule.id)}
                    on:change={() => toggleScheduleSelection(schedule.id)}
                  />
                </td>
                <td class="p-4">
                  <div>
                    <p class="font-medium">{schedule.title || 'Untitled Schedule'}</p>
                    {#if schedule.description}
                      <p class="text-sm text-muted-foreground">{schedule.description}</p>
                    {/if}
                  </div>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <MapPin class="h-4 w-4 text-muted-foreground" />
                    <span>{schedule.expand?.location_id?.name || 'Unknown'}</span>
                  </div>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <User class="h-4 w-4 text-muted-foreground" />
                    <span>{schedule.expand?.user_id?.name || schedule.expand?.user_id?.email || 'Unknown'}</span>
                  </div>
                </td>
                <td class="p-4">
                  {#if schedule.expand?.service_id}
                    <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {schedule.expand.service_id.name}
                    </span>
                  {:else}
                    <span class="text-muted-foreground">No service</span>
                  {/if}
                </td>
                <td class="p-4">
                  <div class="text-sm">
                    <div class="flex items-center gap-1">
                      <Calendar class="h-3 w-3 text-muted-foreground" />
                      {formatDate(schedule.date)}
                    </div>
                    <div class="flex items-center gap-1 mt-1">
                      <Clock class="h-3 w-3 text-muted-foreground" />
                      {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {
                    schedule.is_active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }">
                    {schedule.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <Button variant="ghost" size="sm" on:click={() => handleViewSchedule(schedule)}>
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" on:click={() => handleEditSchedule(schedule)}>
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" on:click={() => handleDeleteSchedule(schedule)}>
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="flex items-center justify-between p-4 border-t">
          <div class="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSchedules.length)} of {filteredSchedules.length} schedules
          </div>
          <div class="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              on:click={() => currentPage = Math.max(1, currentPage - 1)}
            >
              Previous
            </Button>
            <span class="text-sm">Page {currentPage} of {totalPages}</span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages}
              on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<!-- Modals -->
<ScheduleFormModal 
  bind:show={showScheduleForm} 
  schedule={editingSchedule}
  {locations}
  {services}
  {users}
  on:saved={loadSchedules}
/>

<ScheduleDetailModal 
  bind:show={showScheduleDetail} 
  schedule={viewingSchedule}
/>

<ConfirmDialog
  bind:show={showDeleteConfirm}
  title="Delete Schedule"
  message="Are you sure you want to delete this schedule? This action cannot be undone."
  confirmText="Delete"
  confirmVariant="destructive"
  on:confirm={confirmDeleteSchedule}
/>
