<!--
  Status Footer Component
  Shows connection status and sync controls
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    isAuthenticated,
    syncStatus,
    isLoading,
    syncData,
    getSyncQueue,
    users
  } from '$lib/stores';
  
  let syncQueueCount = 0;
  let syncPendingUsersCount = 0;
  
  // Function to update pending counts
  async function updatePendingCounts() {
    try {
      // Count items in sync queue
      const queue = await getSyncQueue();
      syncQueueCount = queue.length;
      
      // Count users with syncPending flag
      syncPendingUsersCount = $users.filter(user => user.syncPending).length;
    } catch (err) {
      console.warn('Failed to get pending sync counts:', err);
      syncQueueCount = 0;
      syncPendingUsersCount = 0;
    }
  }
  
  // Update counts when component mounts and when users change
  onMount(() => {
    updatePendingCounts();
    
    // Set up periodic updates every 5 seconds
    const interval = setInterval(updatePendingCounts, 5000);
    
    // Cleanup interval on component destroy
    return () => clearInterval(interval);
  });
  
  // Reactive update when users store changes
  $: if ($users) {
    updatePendingCounts();
  }
  
  // Computed total pending changes
  $: totalPendingChanges = syncQueueCount + syncPendingUsersCount;
</script>

{#if $isAuthenticated}
  <footer class="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border shadow-lg z-40">
    <div class="container mx-auto px-4 py-2">
      <div class="flex items-center justify-between gap-4">
        <!-- Connection Status -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-foreground">Status:</span>
          <span class="px-2 py-0.5 rounded-full text-xs font-semibold border shadow-sm transition-all {
            $syncStatus === 'online' 
              ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
              : $syncStatus === 'syncing'
              ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700'
              : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
          }">
            {$syncStatus}
          </span>
        </div>
        
        <!-- Pending Changes Indicator (Centered) -->
        <div class="flex items-center justify-center flex-1">
          {#if totalPendingChanges > 0}
            <div class="flex items-center gap-1">
              {#if syncQueueCount > 0}
                <span class="px-2 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {syncQueueCount} queued
                </span>
              {/if}
              {#if syncPendingUsersCount > 0}
                <span class="px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700 flex items-center gap-1">
                  <svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {syncPendingUsersCount} flagged
                </span>
              {/if}
            </div>
          {:else}
            <div class="flex items-center gap-1">
              <span class="text-xs font-medium text-muted-foreground">No pending changes</span>
              <svg class="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          {/if}
        </div>
        
        <!-- Sync Controls -->
        <div class="flex items-center">
          {#if $syncStatus === 'online'}
            <button 
              onclick={async () => {
                await syncData();
                await updatePendingCounts(); // Refresh counts after syncing
              }} 
              class="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors shadow-sm font-medium flex items-center gap-1"
              disabled={$isLoading}>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync
            </button>
          {/if}
        </div>
      </div>
    </div>
  </footer>
{/if}
