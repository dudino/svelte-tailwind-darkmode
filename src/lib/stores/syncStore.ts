/**
 * Sync Store
 * Handles offline synchronization with the server
 */

import { storage } from '$lib/utils/storage';
import { setError, setSyncStatus } from './appStateStore';
import { getPocketBaseClient } from './authStore';
import type { SyncQueueItem } from '$lib/types/user';

// Prevent concurrent sync operations
let syncInProgress = false;
let lastSyncTime = 0;
const SYNC_DEBOUNCE_MS = 2000; // Wait 2 seconds between syncs

/**
 * Add item to sync queue
 */
export async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  try {
    await storage.addToSyncQueue(item);
  } catch (err) {
    console.error('Failed to add item to sync queue:', err);
    setError('Failed to queue sync operation');
  }
}

/**
 * Remove item from sync queue
 */
export async function removeSyncQueueItem(itemId: string): Promise<void> {
  try {
    await storage.removeSyncQueueItem(itemId);
  } catch (err) {
    console.error('Failed to remove item from sync queue:', err);
  }
}

/**
 * Get all items in sync queue
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  try {
    return await storage.getSyncQueue();
  } catch (err) {
    console.error('Failed to get sync queue:', err);
    return [];
  }
}

/**
 * Synchronize data with server
 */
export async function syncData(): Promise<{ success: boolean; message?: string }> {
  // Prevent concurrent sync operations
  if (syncInProgress) {
    console.log('Sync already in progress, skipping...');
    return { success: false, message: 'Sync already in progress' };
  }
  
  // Debounce sync calls
  const now = Date.now();
  if (now - lastSyncTime < SYNC_DEBOUNCE_MS) {
    console.log('Sync called too recently, debouncing...');
    return { success: false, message: 'Sync debounced' };
  }
  
  if (!navigator.onLine) {
    return { success: false, message: 'Device is offline' };
  }
  
  const pb = getPocketBaseClient();
  if (!pb) {
    return { success: false, message: 'PocketBase not available' };
  }
  
  try {
    syncInProgress = true;
    lastSyncTime = now;
    setSyncStatus('syncing');
    
    // Process sync queue
    const queue = await getSyncQueue();
    let errors = 0;
    const processedUserIds = new Set<string>();
    
    for (const item of queue) {
      try {
        if (item.operation === 'create') {
          await pb.collection(item.collection).create(item.data);
        } else if (item.operation === 'update') {
          await pb.collection(item.collection).update(item.recordId, item.data);
          // Track user IDs that were successfully synced
          if (item.collection === 'users' && item.recordId) {
            processedUserIds.add(item.recordId);
          }
        } else if (item.operation === 'delete') {
          await pb.collection(item.collection).delete(item.recordId);
        }
        
        // Remove from queue on success
        await removeSyncQueueItem(item.id);
      } catch (err: any) {
        console.error('Sync error for item:', item, err);
        errors++;
        
        // Remove failed delete operations for non-existent records
        if (item.operation === 'delete' && (err.status === 404 || err.message?.includes('not found'))) {
          console.warn('Removing delete operation for non-existent record:', item.recordId);
          await removeSyncQueueItem(item.id);
        }
        
        // Remove operations that violate relation constraints after multiple failures
        if (err.status === 400 && err.message?.includes('relation reference')) {
          console.warn('Removing operation that violates relation constraints:', item.recordId);
          await removeSyncQueueItem(item.id);
        }
      }
    }
    
    // Clear syncPending flag for successfully synced users
    if (processedUserIds.size > 0) {
      for (const userId of processedUserIds) {
        try {
          const user = await storage.getUser(userId);
          if (user && user.syncPending) {
            const updatedUser = { ...user };
            delete updatedUser.syncPending; // Remove the syncPending flag
            await storage.saveOrUpdateUser(updatedUser);
          }
        } catch (userUpdateErr) {
          console.warn(`Failed to clear syncPending for user ${userId}:`, userUpdateErr);
        }
      }
      
      // Refresh the users store to reflect changes
      const { loadUsersFromStorage } = await import('./userManagementStore');
      loadUsersFromStorage();
    }
    
    // Only fetch fresh data if we processed items or if there are no items in queue
    if (processedUserIds.size > 0 || queue.length === 0) {
      try {
        const pb = getPocketBaseClient();
        if (pb && navigator.onLine) {
          console.log('Fetching fresh data from server...');
          const response = await pb.collection('users').getList(1, 200);
          const serverUsers = response.items;
          
          // Save all users locally, handling duplicates properly
          for (const user of serverUsers) {
            try {
              // Clear syncPending flag for server users since they're now in sync
              const cleanUser = { ...user };
              delete cleanUser.syncPending;
              // Use the improved save method that handles constraints
              await storage.saveOrUpdateUser(cleanUser);
            } catch (userSaveErr) {
              console.warn(`Failed to save user ${user.email}:`, userSaveErr);
            }
          }
          
          // Refresh the users store after fetching fresh data
          const { loadUsersFromStorage } = await import('./userManagementStore');
          loadUsersFromStorage();
          console.log('Fresh data fetched and stored successfully');
        }
      } catch (fetchErr: any) {
        // Handle auto-cancellation gracefully
        if (fetchErr.name === 'AbortError' || fetchErr.message?.includes('autocancelled')) {
          console.log('Fetch request was cancelled (likely due to concurrent request)');
        } else {
          console.warn('Failed to fetch fresh data after sync (PocketBase may not be running):', fetchErr);
        }
        // Don't treat this as a critical error - the app can work offline
      }
    }
    
    setSyncStatus('online');
    
    return {
      success: errors === 0,
      message: errors > 0 ? `Sync completed with ${errors} errors` : 'Sync completed successfully'
    };
    
  } catch (err) {
    setSyncStatus('offline');
    const message = err instanceof Error ? err.message : 'Sync failed';
    setError(message);
    return { success: false, message };
  } finally {
    syncInProgress = false;
  }
}

/**
 * Check if there are pending sync operations
 */
export async function hasPendingSyncOperations(): Promise<boolean> {
  const queue = await getSyncQueue();
  return queue.length > 0;
}

/**
 * Clear all sync queue items (use with caution)
 */
export async function clearSyncQueue(): Promise<void> {
  try {
    const queue = await getSyncQueue();
    for (const item of queue) {
      await removeSyncQueueItem(item.id);
    }
  } catch (err) {
    console.error('Failed to clear sync queue:', err);
    setError('Failed to clear sync queue');
  }
}

/**
 * Clear syncPending flags for all users (useful for fixing stuck sync states)
 */
export async function clearAllSyncPendingFlags(): Promise<void> {
  try {
    // Get all users and clear their syncPending flags
    const { users } = await import('./userManagementStore');
    const { get } = await import('svelte/store');
    const currentUsers = get(users);
    
    for (const user of currentUsers) {
      if (user.syncPending) {
        const updatedUser = { ...user };
        delete updatedUser.syncPending;
        await storage.saveOrUpdateUser(updatedUser);
      }
    }
    
    // Refresh the users store
    const { loadUsersFromStorage } = await import('./userManagementStore');
    loadUsersFromStorage();
    
    console.log('Cleared all syncPending flags');
  } catch (err) {
    console.error('Failed to clear syncPending flags:', err);
    setError('Failed to clear sync pending flags');
  }
}

// Auto-sync when connection is restored
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Connection restored, syncing data...');
    syncData();
  });
}
