<!--
  Room Detail Modal
  Modal for viewing detailed room information
-->

<script lang="ts">
  import { X, Building, MapPin, Users, DollarSign, Calendar } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  
  export let show = false;
  export let room: any = null;

  function handleClose() {
    show = false;
  }

  function getTypeBadgeClass(type: string) {
    return type === 'regular'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
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

  function formatPrice(price: number | null | undefined) {
    if (!price) return 'Not set';
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(price);
  }

  function formatAmenity(amenity: string) {
    return amenity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
</script>

<!-- Modal Backdrop -->
{#if show && room}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={handleClose}>
    <div class="bg-card rounded-lg border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden" on:click|stopPropagation>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <Building class="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 class="text-xl font-semibold">{room.name}</h2>
            <div class="flex gap-2 mt-1">
              <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getTypeBadgeClass(room.type)}">
                {room.type}
              </span>
              <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass(room.is_active)}">
                {room.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" on:click={handleClose}>
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        <div class="space-y-6">
          <!-- Room Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Building class="h-5 w-5 text-primary" />
              Room Information
            </h3>
            
            <div class="space-y-3 bg-muted/30 rounded-lg p-4">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Room ID:</span>
                <span class="font-mono text-sm">{room.id}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Name:</span>
                <span class="font-medium">{room.name}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Type:</span>
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getTypeBadgeClass(room.type)}">
                  {room.type}
                </span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Location:</span>
                <span>
                  {#if room.expand?.location_id}
                    {room.expand.location_id.name}
                  {:else}
                    <span class="text-muted-foreground text-sm">Not specified</span>
                  {/if}
                </span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Status:</span>
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass(room.is_active)}">
                  {room.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <!-- Capacity & Pricing -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Users class="h-5 w-5 text-primary" />
              Capacity & Pricing
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <Users class="h-4 w-4 text-primary" />
                  <span class="text-sm font-medium">Capacity</span>
                </div>
                <div class="text-lg font-semibold">
                  {room.capacity || 'Not set'} {room.capacity === 1 ? 'person' : 'people'}
                </div>
              </div>
              
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <DollarSign class="h-4 w-4 text-primary" />
                  <span class="text-sm font-medium">Hourly Rate</span>
                </div>
                <div class="text-lg font-semibold">
                  {formatPrice(room.hourly_rate)}
                </div>
              </div>
            </div>
          </div>

          <!-- Amenities -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Building class="h-5 w-5 text-primary" />
              Amenities
            </h3>
            
            <div class="bg-muted/30 rounded-lg p-4">
              {#if room.amenities && room.amenities.length > 0}
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {#each room.amenities as amenity}
                    <div class="flex items-center gap-2 px-3 py-2 bg-background rounded-md">
                      <div class="w-2 h-2 bg-primary rounded-full"></div>
                      <span class="text-sm">{formatAmenity(amenity)}</span>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-muted-foreground text-sm italic">No amenities specified</p>
              {/if}
            </div>
          </div>

          <!-- Location Details -->
          {#if room.expand?.location_id}
            <div class="space-y-4">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <MapPin class="h-5 w-5 text-primary" />
                Location Details
              </h3>
              
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="space-y-2">
                  <div class="font-medium">{room.expand.location_id.name}</div>
                  <div class="text-sm text-muted-foreground">{room.expand.location_id.address}</div>
                  <div class="text-sm text-muted-foreground">
                    {room.expand.location_id.city}{room.expand.location_id.postal_code ? `, ${room.expand.location_id.postal_code}` : ''}
                  </div>
                  <div class="text-sm text-muted-foreground">{room.expand.location_id.country}</div>
                </div>
              </div>
            </div>
          {/if}

          <!-- Record Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Calendar class="h-5 w-5 text-primary" />
              Record Information
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Created</div>
                <div class="text-sm">{formatDate(room.created)}</div>
              </div>
              
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Last Updated</div>
                <div class="text-sm">{formatDate(room.updated)}</div>
              </div>
            </div>

            {#if room.created_by}
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Created By</div>
                <div class="text-sm font-mono">{room.created_by}</div>
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
