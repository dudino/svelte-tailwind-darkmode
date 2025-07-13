<!--
  Service Detail Modal
  Modal for viewing detailed service information
-->

<script lang="ts">
  import { X, Settings, Clock, DollarSign, Calendar, User } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  
  export let show = false;
  export let service: any = null;

  function handleClose() {
    show = false;
  }

  function getCategoryBadgeClass(category: string) {
    const colors: Record<string, string> = {
      'massage': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'therapy': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'relaxation': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'beauty': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'wellness': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'special': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

  function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
    }
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(price);
  }
</script>

<!-- Modal Backdrop -->
{#if show && service}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={handleClose}>
    <div class="bg-card rounded-lg border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden" on:click|stopPropagation>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <Settings class="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 class="text-xl font-semibold">{service.name}</h2>
            <div class="flex gap-2 mt-1">
              {#if service.category}
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getCategoryBadgeClass(service.category)}">
                  {service.category}
                </span>
              {/if}
              <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass(service.is_active)}">
                {service.is_active ? 'Active' : 'Inactive'}
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
          <!-- Service Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Settings class="h-5 w-5 text-primary" />
              Service Information
            </h3>
            
            <div class="space-y-3 bg-muted/30 rounded-lg p-4">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Service ID:</span>
                <span class="font-mono text-sm">{service.id}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Name:</span>
                <span class="font-medium">{service.name}</span>
              </div>
              
              {#if service.description}
                <div class="space-y-1">
                  <span class="text-muted-foreground block">Description:</span>
                  <p class="text-sm leading-relaxed">{service.description}</p>
                </div>
              {/if}
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Category:</span>
                <span>
                  {#if service.category}
                    <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getCategoryBadgeClass(service.category)}">
                      {service.category}
                    </span>
                  {:else}
                    <span class="text-muted-foreground text-sm">Not categorized</span>
                  {/if}
                </span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-muted-foreground">Status:</span>
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass(service.is_active)}">
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <!-- Pricing & Duration -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <DollarSign class="h-5 w-5 text-primary" />
              Pricing & Duration
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <Clock class="h-4 w-4 text-primary" />
                  <span class="text-sm font-medium">Duration</span>
                </div>
                <div class="text-lg font-semibold">{formatDuration(service.duration_minutes)}</div>
                <div class="text-xs text-muted-foreground">{service.duration_minutes} minutes</div>
              </div>
              
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <DollarSign class="h-4 w-4 text-primary" />
                  <span class="text-sm font-medium">Price</span>
                </div>
                <div class="text-lg font-semibold">
                  {#if service.price}
                    {formatPrice(service.price)}
                  {:else}
                    <span class="text-muted-foreground">Not set</span>
                  {/if}
                </div>
                {#if service.price}
                  <div class="text-xs text-muted-foreground">
                    {formatPrice(service.price / service.duration_minutes * 60)}/hour
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <!-- Record Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Calendar class="h-5 w-5 text-primary" />
              Record Information
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Created</div>
                <div class="text-sm">{formatDate(service.created)}</div>
              </div>
              
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Last Updated</div>
                <div class="text-sm">{formatDate(service.updated)}</div>
              </div>
            </div>

            {#if service.created_by}
              <div class="bg-muted/30 rounded-lg p-4">
                <div class="text-sm text-muted-foreground mb-1">Created By</div>
                <div class="text-sm font-mono">{service.created_by}</div>
              </div>
            {/if}
          </div>

          <!-- Usage Statistics (placeholder) -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <User class="h-5 w-5 text-primary" />
              Usage Statistics
            </h3>
            
            <div class="bg-muted/30 rounded-lg p-4 text-center">
              <p class="text-muted-foreground text-sm italic">
                Service usage statistics will be available once bookings are implemented.
              </p>
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
