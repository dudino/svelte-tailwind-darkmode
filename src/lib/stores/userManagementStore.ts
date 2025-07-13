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
import { deleteRecord } from '$lib/utils/deleteHandler';

// Check if we're in browser environment
const browser = typeof window !== 'undefined';

// Prevent concurrent fetch operations
let fetchInProgress = false;
let lastFetchTime = 0;
const FETCH_DEBOUNCE_MS = 1000; // Wait 1 second between fetches

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
    
    // Save updated user locally using the constraint-aware method
    await storage.saveOrUpdateUser(updatedUser);
    
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
        const result = await deleteRecord(COLLECTIONS.USERS, userId);
        
        if (result.success) {
          // Remove from local storage only if hard delete was successful
          if (result.method === 'hard') {
            await storage.deleteUser(userId);
            users.update(list => list.filter(user => user.id !== userId));
          } else if (result.method === 'soft') {
            // For soft delete, update the user's is_active status locally
            users.update(list => 
              list.map(user => 
                user.id === userId ? { ...user, is_active: false } : user
              )
            );
            // Also update in local storage
            const localUser = await storage.getUser(userId);
            if (localUser) {
              await storage.saveUser({ ...localUser, is_active: false });
            }
          }
          
          return { 
            success: true, 
            message: result.message 
          };
        } else {
          setError(result.message || 'Failed to delete user');
          return { 
            success: false, 
            message: result.message || 'Failed to delete user' 
          };
        }
      } catch (onlineErr: any) {
        console.warn('Online delete failed, adding to sync queue:', onlineErr);
        
        // Check if record doesn't exist
        if (onlineErr.status === 404) {
          console.info('User already deleted on server, removing locally');
          await storage.deleteUser(userId);
          users.update(list => list.filter(user => user.id !== userId));
          return { success: true, message: 'User deleted successfully' };
        }
        
        // For other errors, add to sync queue for later retry
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
    
    // Remove from local storage for offline case
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
  // Prevent concurrent fetch operations
  if (fetchInProgress) {
    console.log('Fetch already in progress, skipping...');
    return { success: false, message: 'Fetch already in progress' };
  }
  
  // Debounce fetch calls
  const now = Date.now();
  if (now - lastFetchTime < FETCH_DEBOUNCE_MS) {
    console.log('Fetch called too recently, debouncing...');
    return { success: false, message: 'Fetch debounced' };
  }
  
  const pb = getPocketBaseClient();
  
  if (!navigator.onLine || !pb) {
    return { success: false, message: 'Offline or PocketBase not available' };
  }
  
  try {
    fetchInProgress = true;
    lastFetchTime = now;
    setLoading(true);
    
    console.log('Fetching users from server...');
    const response = await pb.collection(COLLECTIONS.USERS).getList(1, 200);
    const serverUsers = response.items as User[];
    
    // Save all users locally using the constraint-aware method
    for (const user of serverUsers) {
      await storage.saveOrUpdateUser(user);
    }
    
    // Update store
    users.set(serverUsers);
    console.log(`Successfully fetched ${serverUsers.length} users from server`);
    
    return { success: true };
  } catch (err: any) {
    // Handle auto-cancellation gracefully
    if (err.name === 'AbortError' || err.message?.includes('autocancelled')) {
      console.log('Fetch request was cancelled (likely due to concurrent request)');
      return { success: false, message: 'Request cancelled' };
    }
    
    const message = err instanceof Error ? err.message : 'Failed to fetch users';
    setError(message);
    return { success: false, message };
  } finally {
    setLoading(false);
    fetchInProgress = false;
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

/**
 * Create a new user (admin only)
 */
export async function createUser(userData: any): Promise<AuthResponse> {
  setLoading(true);
  clearError();
  
  try {
    const pb = getPocketBaseClient();
    if (!pb) {
      throw new Error('PocketBase client not available');
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'administrator') {
      throw new Error('Only administrators can create users');
    }

    // Validate required fields
    if (!userData.email) {
      throw new Error('Email is required');
    }
    if (!userData.password) {
      throw new Error('Password is required');
    }
    if (!userData.role) {
      throw new Error('Role is required');
    }

    // Online creation
    if (navigator.onLine && pb) {
      try {
        const newUser = await pb.collection(COLLECTIONS.USERS).create({
          ...userData,
          username: userData.email, // Use email as username
          emailVisibility: true,
          verified: false,
          created_by: currentUser.id
        });
        
        // Save user locally using the constraint-aware method
        await storage.saveOrUpdateUser(newUser);
        
        // Update users store
        users.update(list => [newUser, ...list]);
        
        return { success: true, user: newUser };
      } catch (onlineErr) {
        console.error('Online user creation failed:', onlineErr);
        throw onlineErr;
      }
    }
    
    throw new Error('User creation requires internet connection');
    
  } catch (err) {
    const message = err instanceof Error ? err.message : 'User creation failed';
    setError(message);
    return { success: false, message };
  } finally {
    setLoading(false);
  }
}

// Initialize on browser load
if (browser) {
  loadUsersFromStorage();
}
