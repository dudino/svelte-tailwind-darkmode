<!--
  Location Detail Modal
  Modal for viewing detailed location information
-->

<script lang="ts">
  import { X, MapPin, Building, Calendar, User } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  
  export let show = false;
  export let location: any = null;

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
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<!-- Modal Backdrop -->
{#if show && location}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={handleClose}>
    <div class="bg-card rounded-lg border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden" on:click|stopPropagation>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <MapPin class="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 class="text-xl font-semibold">{location.name}</h2>
            <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass(location.is_active)}">
              {location.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" on:click={handleClose}>
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        <div class="space-y-6">
          <!-- Address Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Building class="h-5 w-5 text-primary" />
              Address Information
            </h3>
            
            <div class="space-y-3 bg-muted/30 rounded-lg p-4">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Location ID:</span>
                <span class="font-mono text-sm">{location.id}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Full Address:</span>
                <span class="text-right">{location.address}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">City:</span>
                <span>{location.city}</span>
              </div>
              
              {#if location.postal_code}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Postal Code:</span>
                  <span>{location.postal_code}</span>
                </div>
              {/if}
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Country:</span>
                <span>{location.country}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Status:</span>
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass(location.is_active)}">
                  {location.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <!-- Rooms Information -->
          {#if location.expand?.rooms}
            <div class="space-y-4">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <Building class="h-5 w-5 text-primary" />
                Rooms ({location.expand.rooms.length})
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                {#each location.expand.rooms as room}
                  <div class="bg-muted/30 rounded-lg p-3">
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-medium">{room.name}</h4>
                      <span class="text-xs px-2 py-1 rounded-full {
                        room.type === 'regular' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }">
                        {room.type}
                      </span>
                    </div>
                    {#if room.capacity}
                      <p class="text-sm text-muted-foreground">Capacity: {room.capacity}</p>
                    {/if}
                    {#if room.hourly_rate}
                      <p class="text-sm text-muted-foreground">Rate: ${room.hourly_rate}/hour</p>
                    {/if}
                    {#if room.amenities && room.amenities.length > 0}
                      <div class="flex flex-wrap gap-1 mt-2">
                        {#each room.amenities.slice(0, 3) as amenity}
                          <span class="text-xs px-1 py-0.5 bg-accent/50 rounded">{amenity}</span>
                        {/each}
                        {#if room.amenities.length > 3}
                          <span class="text-xs text-muted-foreground">+{room.amenities.length - 3} more</span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {:else}
            <div class="space-y-4">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <Building class="h-5 w-5 text-primary" />
                Rooms
              </h3>
              
              <div class="bg-muted/30 rounded-lg p-4 text-center">
                <p class="text-muted-foreground text-sm italic">No rooms associated with this location</p>
              </div>
            </div>
          {/if}

          <!-- Account Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Calendar class="h-5 w-5 text-primary" />
              Record Information
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Created</div>
                <div class="text-sm">{formatDate(location.created)}</div>
              </div>
              
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Last Updated</div>
                <div class="text-sm">{formatDate(location.updated)}</div>
              </div>
            </div>

            {#if location.created_by}
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Created By</div>
                <div class="text-sm font-mono">{location.created_by}</div>
              </div>
            {/if}
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
