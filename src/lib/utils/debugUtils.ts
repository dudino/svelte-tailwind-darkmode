/**
 * Debug utilities for development and troubleshooting
 */

import { storage } from './storage';

/**
 * Clear all stored data (for debugging)
 */
export async function clearAllData() {
  try {
    await storage.clearAllUsers();
    await storage.clearAuthData();
    await storage.clearSyncQueue();
    console.log('All stored data cleared successfully');
    
    // Reload the page to reinitialize
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  } catch (err) {
    console.error('Failed to clear data:', err);
  }
}

/**
 * Reset database (delete and recreate)
 */
export async function resetDatabase() {
  try {
    // Close any existing connections
    if (typeof window !== 'undefined' && window.indexedDB) {
      // Delete the database
      await new Promise((resolve, reject) => {
        const deleteReq = window.indexedDB.deleteDatabase('UserManagementDB');
        deleteReq.onsuccess = () => resolve(void 0);
        deleteReq.onerror = () => reject(deleteReq.error);
        deleteReq.onblocked = () => {
          console.warn('Database deletion blocked - close all tabs and try again');
          reject(new Error('Database deletion blocked'));
        };
      });
      
      console.log('Database deleted successfully');
      
      // Reload the page to recreate the database
      window.location.reload();
    }
  } catch (err) {
    console.error('Failed to reset database:', err);
  }
}

/**
 * Clear failed sync queue items
 */
export async function clearFailedSyncItems() {
  try {
    const { storage } = await import('$lib/utils/storage');
    const queue = await storage.getSyncQueue();
    
    // Clear items that are likely to keep failing
    let cleared = 0;
    for (const item of queue) {
      // Remove delete operations older than 1 hour
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      if (item.operation === 'delete' && item.timestamp < oneHourAgo) {
        await storage.removeSyncQueueItem(item.id);
        cleared++;
      }
    }
    
    console.log(`Cleared ${cleared} failed sync items`);
    return cleared;
  } catch (error) {
    console.error('Failed to clear sync items:', error);
    return 0;
  }
}

/**
 * Clear only demo users and recreate them
 */
export async function resetDemoUsers() {
  try {
    const { storage } = await import('$lib/utils/storage');
    
    // Clear demo users
    const demoEmails = ['admin@massage.com', 'operator@massage.com', 'user@massage.com'];
    let cleared = 0;
    
    for (const email of demoEmails) {
      const user = await storage.getUserByEmail(email);
      if (user) {
        await storage.delete('users', user.id);
        cleared++;
      }
    }
    
    console.log(`Cleared ${cleared} demo users`);
    console.log('Demo users cleared. Please refresh the page to recreate them.');
    return cleared;
  } catch (error) {
    console.error('Failed to reset demo users:', error);
    return 0;
  }
}

/**
 * Export debug functions to window for console access
 */
if (typeof window !== 'undefined') {
  (window as any).debugUtils = {
    clearAllData,
    resetDatabase,
    clearFailedSyncItems,
    resetDemoUsers
  };
  console.log('Debug utilities available: window.debugUtils.clearAllData(), window.debugUtils.resetDatabase(), window.debugUtils.clearFailedSyncItems(), window.debugUtils.resetDemoUsers()');
}
