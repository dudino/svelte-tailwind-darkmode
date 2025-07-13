<!--
  Sync Pending Overlay Component
  Shows pending sync changes in the middle of the screen
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
  let showOverlay = false;
  
  // Function to update pending counts
  async function updatePendingCounts() {
    try {
      // Count items in sync queue
      const queue = await getSyncQueue();
      syncQueueCount = queue.length;
      
      // Count users with syncPending flag
      syncPendingUsersCount = $users.filter(user => user.syncPending).length;
      
      // Show overlay only if there are pending changes
      showOverlay = (syncQueueCount + syncPendingUsersCount) > 0;
    } catch (err) {
      console.warn('Failed to get pending sync counts:', err);
      syncQueueCount = 0;
      syncPendingUsersCount = 0;
      showOverlay = false;
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

  // Handle sync action
  async function handleSync() {
    await syncData();
    await updatePendingCounts(); // Refresh counts after syncing
  }
</script>

{#if $isAuthenticated && showOverlay && totalPendingChanges > 0}
  <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
    <div class="bg-background/95 backdrop-blur-md border-2 border-border rounded-xl shadow-2xl pointer-events-auto p-4 max-w-sm">
      <div class="text-center">
        <h3 class="text-lg font-semibold text-foreground mb-3 flex items-center justify-center gap-2">
          <svg class="w-5 h-5 text-orange-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pending Changes
        </h3>
        
        <div class="space-y-2 mb-4">
          {#if syncQueueCount > 0}
            <div class="flex items-center justify-center gap-2">
              <span class="px-3 py-1 rounded-md text-sm font-medium bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {syncQueueCount} queued operation{syncQueueCount !== 1 ? 's' : ''}
              </span>
            </div>
          {/if}
          
          {#if syncPendingUsersCount > 0}
            <div class="flex items-center justify-center gap-2">
              <span class="px-3 py-1 rounded-md text-sm font-medium bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700 flex items-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {syncPendingUsersCount} user{syncPendingUsersCount !== 1 ? 's' : ''} flagged
              </span>
            </div>
          {/if}
        </div>
        
        {#if $syncStatus === 'online'}
          <button 
            onclick={handleSync} 
            class="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
            disabled={$isLoading}>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {$isLoading ? 'Syncing...' : 'Sync Now'}
          </button>
        {:else}
          <div class="text-sm text-muted-foreground">
            {#if $syncStatus === 'syncing'}
              <div class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Syncing in progress...
              </div>
            {:else}
              <div class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Cannot sync while offline
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
