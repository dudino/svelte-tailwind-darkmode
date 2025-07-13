/**
 * Sync Store
 * Handles offline synchronization with the server
 */

import { storage } from '$lib/utils/storage';
import { setError, setSyncStatus } from './appStateStore';
import { getPocketBaseClient } from './authStore';
import type { SyncQueueItem } from '$lib/types/user';

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
  if (!navigator.onLine) {
    return { success: false, message: 'Device is offline' };
  }
  
  const pb = getPocketBaseClient();
  if (!pb) {
    return { success: false, message: 'PocketBase not available' };
  }
  
  try {
    setSyncStatus('syncing');
    
    // Process sync queue
    const queue = await getSyncQueue();
    let errors = 0;
    
    for (const item of queue) {
      try {
        if (item.operation === 'create') {
          await pb.collection(item.collection).create(item.data);
        } else if (item.operation === 'update') {
          await pb.collection(item.collection).update(item.recordId, item.data);
        } else if (item.operation === 'delete') {
          await pb.collection(item.collection).delete(item.recordId);
        }
        
        // Remove from queue on success
        await removeSyncQueueItem(item.id);
      } catch (err) {
        console.error('Sync error for item:', item, err);
        errors++;
      }
    }
    
    // Fetch fresh data from server
    try {
      const pb = getPocketBaseClient();
      if (pb && navigator.onLine) {
        const response = await pb.collection('users').getList(1, 200);
        const serverUsers = response.items;
        
        // Save all users locally
        for (const user of serverUsers) {
          await storage.saveUser(user);
        }
      }
    } catch (fetchErr) {
      console.warn('Failed to fetch fresh data after sync (PocketBase may not be running):', fetchErr);
      // Don't treat this as a critical error - the app can work offline
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

// Auto-sync when connection is restored
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Connection restored, syncing data...');
    syncData();
  });
}
