/**
 * User Management Store
 * Handles CRUD operations for users (create, read, update, delete)
 */

import { writable, get } from 'svelte/store';
import { storage } from '$lib/utils/storage';
import { setLoading, setError, clearError } from './appStateStore';
import { getPocketBaseClient, getCurrentUser } from './authStore';
import type { User, UpdateUserData, AuthResponse, SyncQueueItem } from '$lib/types/user';
import { COLLECTIONS } from '$lib/types/user';

// Check if we're in browser environment
const browser = typeof window !== 'undefined';

// User management stores
export const users = writable<User[]>([]);
export const selectedUser = writable<User | null>(null);

/**
 * Load users from local storage
 */
export async function loadUsersFromStorage() {
  if (!browser) return;
  
  try {
    const storedUsers = await storage.getAllUsers();
    users.set(storedUsers);
  } catch (err) {
    console.error('Failed to load users from storage:', err);
    setError('Failed to load users from local storage');
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    return await storage.getUser(userId);
  } catch (err) {
    console.error('Failed to get user:', err);
    return null;
  }
}

/**
 * Update user data
 */
export async function updateUser(userId: string, updateData: UpdateUserData): Promise<AuthResponse> {
  setLoading(true);
  clearError();
  
  try {
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...updateData,
      updated: new Date().toISOString()
    };
    
    const pb = getPocketBaseClient();
    
    // Online update
    if (navigator.onLine && pb && !existingUser.syncPending) {
      try {
        const serverUser = await pb.collection(COLLECTIONS.USERS).update(userId, updateData);
        updatedUser.id = serverUser.id;
        updatedUser.updated = serverUser.updated;
      } catch (onlineErr) {
        console.warn('Online update failed, adding to sync queue:', onlineErr);
        updatedUser.syncPending = true;
        
        // Add to sync queue
        const syncItem: SyncQueueItem = {
          id: crypto.randomUUID(),
          collection: COLLECTIONS.USERS,
          operation: 'update',
          data: updateData,
          recordId: userId,
          timestamp: Date.now()
        };
        await storage.addToSyncQueue(syncItem);
      }
    } else {
      // Offline update
      updatedUser.syncPending = true;
      
      const syncItem: SyncQueueItem = {
        id: crypto.randomUUID(),
        collection: COLLECTIONS.USERS,
        operation: 'update',
        data: updateData,
        recordId: userId,
        timestamp: Date.now()
      };
      await storage.addToSyncQueue(syncItem);
    }
    
    // Save updated user locally
    await storage.saveUser(updatedUser);
    
    // Update stores
    users.update(list => 
      list.map(user => user.id === userId ? updatedUser : user)
    );
    
    return { success: true, user: updatedUser };
    
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    setError(message);
    return { success: false, message };
  } finally {
    setLoading(false);
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  setLoading(true);
  clearError();
  
  try {
    const pb = getPocketBaseClient();
    
    // Online delete
    if (navigator.onLine && pb) {
      try {
        await pb.collection(COLLECTIONS.USERS).delete(userId);
      } catch (onlineErr) {
        console.warn('Online delete failed, adding to sync queue:', onlineErr);
        
        // Add to sync queue
        const syncItem: SyncQueueItem = {
          id: crypto.randomUUID(),
          collection: COLLECTIONS.USERS,
          operation: 'delete',
          recordId: userId,
          timestamp: Date.now()
        };
        await storage.addToSyncQueue(syncItem);
      }
    } else {
      // Offline delete - add to sync queue
      const syncItem: SyncQueueItem = {
        id: crypto.randomUUID(),
        collection: COLLECTIONS.USERS,
        operation: 'delete',
        recordId: userId,
        timestamp: Date.now()
      };
      await storage.addToSyncQueue(syncItem);
    }
    
    // Remove from local storage
    await storage.deleteUser(userId);
    
    // Update stores
    users.update(list => list.filter(user => user.id !== userId));
    
    return { success: true };
    
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    setError(message);
    return { success: false, message };
  } finally {
    setLoading(false);
  }
}

/**
 * Fetch users from server
 */
export async function fetchUsersFromServer(): Promise<{ success: boolean; message?: string }> {
  const pb = getPocketBaseClient();
  
  if (!navigator.onLine || !pb) {
    return { success: false, message: 'Offline or PocketBase not available' };
  }
  
  try {
    setLoading(true);
    const response = await pb.collection(COLLECTIONS.USERS).getList(1, 200);
    const serverUsers = response.items as User[];
    
    // Save all users locally
    for (const user of serverUsers) {
      await storage.saveUser(user);
    }
    
    // Update store
    users.set(serverUsers);
    
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch users';
    setError(message);
    return { success: false, message };
  } finally {
    setLoading(false);
  }
}

/**
 * Search users by criteria
 */
export function searchUsers(query: string, field: keyof User = 'email'): User[] {
  const allUsers = get(users);
  const searchTerm = query.toLowerCase();
  
  return allUsers.filter(user => {
    const fieldValue = user[field];
    if (typeof fieldValue === 'string') {
      return fieldValue.toLowerCase().includes(searchTerm);
    }
    return false;
  });
}

/**
 * Filter users by role
 */
export function filterUsersByRole(role: string): User[] {
  const allUsers = get(users);
  return allUsers.filter(user => user.role === role);
}

/**
 * Get users with accommodation
 */
export function getUsersWithAccommodation(): User[] {
  const allUsers = get(users);
  return allUsers.filter(user => user.hasAccommodation);
}

/**
 * Select a user for detailed view/editing
 */
export function selectUser(user: User | null) {
  selectedUser.set(user);
}

/**
 * Get selected user
 */
export function getSelectedUser(): User | null {
  return get(selectedUser);
}

// Initialize on browser load
if (browser) {
  loadUsersFromStorage();
}
