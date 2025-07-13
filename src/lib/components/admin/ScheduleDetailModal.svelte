<!--
  Schedule Detail Modal
  Modal for viewing detailed schedule information
-->

<script lang="ts">
  import { X, Calendar, Clock, MapPin, User, Settings, Info } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  
  export let show = false;
  export let schedule: any = null;

  function handleClose() {
    show = false;
  }

  function getStatusBadgeClass(isActive: boolean) {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  function formatDate(dateString: string | undefined) {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

  function formatTime(timeString: string | undefined) {
    if (!timeString) return 'Not set';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatDateTime(dateString: string | undefined) {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function calculateDuration(startTime: string | undefined, endTime: string | undefined) {
    if (!startTime || !endTime) return 'Unknown';
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  }
</script>

<!-- Modal Backdrop -->
{#if show && schedule}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={handleClose}>
    <div class="bg-card rounded-lg border shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden" on:click|stopPropagation>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Calendar class="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 class="text-xl font-semibold">{schedule.title || 'Untitled Schedule'}</h2>
            <p class="text-muted-foreground">Schedule Details</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" on:click={handleClose}>
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Basic Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Info class="h-5 w-5 text-primary" />
              Basic Information
            </h3>
            
            <div class="space-y-3 bg-muted/30 rounded-lg p-4">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Schedule ID:</span>
                <span class="font-mono text-sm">{schedule.id}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Status:</span>
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass(schedule.is_active)}">
                  {schedule.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {#if schedule.description}
                <div>
                  <span class="text-muted-foreground">Description:</span>
                  <p class="mt-1 text-sm">{schedule.description}</p>
                </div>
              {/if}
            </div>
          </div>

          <!-- Date & Time Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Clock class="h-5 w-5 text-primary" />
              Date & Time
            </h3>
            
            <div class="space-y-3 bg-muted/30 rounded-lg p-4">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Date:</span>
                <span>{formatDate(schedule.date)}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Start Time:</span>
                <span>{formatTime(schedule.start_time)}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">End Time:</span>
                <span>{formatTime(schedule.end_time)}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Duration:</span>
                <span class="font-medium">{calculateDuration(schedule.start_time, schedule.end_time)}</span>
              </div>
            </div>
          </div>

          <!-- Location Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <MapPin class="h-5 w-5 text-primary" />
              Location
            </h3>
            
            <div class="space-y-3 bg-muted/30 rounded-lg p-4">
              {#if schedule.expand?.location_id}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Name:</span>
                  <span>{schedule.expand.location_id.name}</span>
                </div>
                
                {#if schedule.expand.location_id.address}
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Address:</span>
                    <span class="text-right">{schedule.expand.location_id.address}</span>
                  </div>
                {/if}
                
                {#if schedule.expand.location_id.city}
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">City:</span>
                    <span>{schedule.expand.location_id.city}</span>
                  </div>
                {/if}
              {:else}
                <p class="text-muted-foreground text-sm italic">Location information not available</p>
              {/if}
            </div>
          </div>

          <!-- User Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <User class="h-5 w-5 text-primary" />
              Assigned User
            </h3>
            
            <div class="space-y-3 bg-muted/30 rounded-lg p-4">
              {#if schedule.expand?.user_id}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Name:</span>
                  <span>{schedule.expand.user_id.name || 'No name'}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Email:</span>
                  <span>{schedule.expand.user_id.email}</span>
                </div>
                
                {#if schedule.expand.user_id.role}
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Role:</span>
                    <span class="capitalize">{schedule.expand.user_id.role}</span>
                  </div>
                {/if}
              {:else}
                <p class="text-muted-foreground text-sm italic">User information not available</p>
              {/if}
            </div>
          </div>

          <!-- Service Information -->
          {#if schedule.expand?.service_id}
            <div class="space-y-4 md:col-span-2">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <Settings class="h-5 w-5 text-primary" />
                Associated Service
              </h3>
              
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div class="text-sm text-muted-foreground mb-1">Service Name</div>
                    <div class="font-medium">{schedule.expand.service_id.name}</div>
                  </div>
                  
                  {#if schedule.expand.service_id.category}
                    <div>
                      <div class="text-sm text-muted-foreground mb-1">Category</div>
                      <div class="capitalize">{schedule.expand.service_id.category}</div>
                    </div>
                  {/if}
                  
                  {#if schedule.expand.service_id.duration_minutes}
                    <div>
                      <div class="text-sm text-muted-foreground mb-1">Duration</div>
                      <div>{schedule.expand.service_id.duration_minutes} minutes</div>
                    </div>
                  {/if}
                </div>
                
                {#if schedule.expand.service_id.description}
                  <div class="mt-4">
                    <div class="text-sm text-muted-foreground mb-1">Description</div>
                    <div class="text-sm">{schedule.expand.service_id.description}</div>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Record Information -->
          <div class="space-y-4 md:col-span-2">
            <h3 class="text-lg font-semibold">Record Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Created</div>
                <div class="text-sm">{formatDateTime(schedule.created)}</div>
              </div>
              
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Last Updated</div>
                <div class="text-sm">{formatDateTime(schedule.updated)}</div>
              </div>
              
              {#if schedule.created_by}
                <div class="bg-muted/30 rounded-lg p-4">
                  <div class="text-sm text-muted-foreground mb-1">Created By</div>
                  <div class="text-sm font-mono">{schedule.created_by}</div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t">
        <Button on:click={handleClose}>
          Close
        </Button>
      </div>
    </div>
  </div>
{/if}
