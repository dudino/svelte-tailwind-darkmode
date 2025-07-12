/**
 * User Authentication and Management Stores
 * Handles user authentication, CRUD operations, and offline sync with PocketBase
 */

import { writable, derived, get } from 'svelte/store';
import { storage } from '$lib/utils/storage';
import type { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  AuthResponse, 
  UserRole,
  SyncQueueItem
} from '$lib/types/user';
import { COLLECTIONS } from '$lib/types/user';

// Check if we're in browser environment
const browser = typeof window !== 'undefined';

// PocketBase configuration - fallback to default if env var not set
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

// Authentication stores
export const currentUser = writable<User | null>(null);
export const isAuthenticated = derived(currentUser, $user => $user !== null);
export const userRole = derived(currentUser, $user => $user?.role || null);

// User management stores
export const users = writable<User[]>([]);
export const selectedUser = writable<User | null>(null);

// App state stores
export const isLoading = writable<boolean>(false);
export const syncStatus = writable<'online' | 'offline' | 'syncing'>('offline');
export const error = writable<string | null>(null);

// Initialize PocketBase client
let pb: any = null;

/**
 * Initialize PocketBase client
 */
async function initPocketBase() {
  if (!browser) return null;
  
  try {
    const PocketBase = (await import('pocketbase')).default;
    pb = new PocketBase(POCKETBASE_URL);
    
    // Try to restore authentication from stored data
    const authData = await storage.getAuthData('currentUser');
    if (authData && pb.authStore) {
      try {
        pb.authStore.save(authData.token, authData.user);
        
        // Verify the token is still valid
        if (pb.authStore.isValid) {
          await pb.collection(COLLECTIONS.USERS).authRefresh();
          currentUser.set(pb.authStore.model);
          syncStatus.set('online');
          return pb;
        }
      } catch (err) {
        console.warn('Stored auth token invalid, clearing:', err);
        await storage.clearAuthData();
        pb.authStore.clear();
      }
    }
    
    syncStatus.set(navigator.onLine ? 'online' : 'offline');
    return pb;
  } catch (err) {
    console.error('Failed to initialize PocketBase:', err);
    syncStatus.set('offline');
    return null;
  }
}

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
    error.set('Failed to load users from local storage');
  }
}

/**
 * Authenticate user with email and password
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  isLoading.set(true);
  error.set(null);
  
  try {
    if (!pb) {
      pb = await initPocketBase();
    }
    
    // Try online authentication first
    if (navigator.onLine && pb) {
      try {
        const authData = await pb.collection(COLLECTIONS.USERS).authWithPassword(email, password);
        const user = authData.record as User;
        
        // Save authentication data
        await storage.saveAuthData('currentUser', {
          token: pb.authStore.token,
          user: user
        });
        
        // Save user data locally
        await storage.saveUser(user);
        
        // Update stores
        currentUser.set(user);
        syncStatus.set('online');
        
        // Sync data after successful login
        syncData();
        
        return { success: true, user, token: pb.authStore.token };
      } catch (onlineErr) {
        console.warn('Online login failed, trying offline:', onlineErr);
      }
    }
    
    // Fallback to offline authentication
    const storedUser = await storage.getUserByEmail(email);
    if (storedUser && storedUser.isActive) {
      // In a real app, you'd verify the password hash here
      // For now, we'll assume offline login is allowed if user exists
      currentUser.set(storedUser);
      syncStatus.set('offline');
      
      return { 
        success: true, 
        user: storedUser, 
        offline: true,
        message: 'Logged in offline mode'
      };
    }
    
    return { 
      success: false, 
      message: 'Invalid credentials or user not found' 
    };
    
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    error.set(message);
    return { success: false, message };
  } finally {
    isLoading.set(false);
  }
}

/**
 * Register a new user
 */
export async function register(userData: CreateUserData): Promise<AuthResponse> {
  isLoading.set(true);
  error.set(null);
  
  try {
    if (!pb) {
      pb = await initPocketBase();
    }
    
    // Online registration
    if (navigator.onLine && pb) {
      try {
        const newUser = await pb.collection(COLLECTIONS.USERS).create({
          ...userData,
          username: userData.email, // Use email as username
          emailVisibility: true,
          verified: false
        });
        
        // Save user locally
        await storage.saveUser(newUser);
        
        // Update users store
        users.update(list => [...list, newUser]);
        
        return { success: true, user: newUser };
      } catch (onlineErr) {
        console.warn('Online registration failed:', onlineErr);
        throw onlineErr;
      }
    }
    
    // Offline registration - add to sync queue
    const tempUser: User = {
      id: crypto.randomUUID(),
      ...userData,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      role: userData.role || 'user',
      isActive: userData.isActive ?? true,
      hasAccommodation: userData.hasAccommodation ?? false,
      languages: userData.languages || [],
      services: userData.services || [],
      syncPending: true
    };
    
    // Save to local storage
    await storage.saveUser(tempUser);
    
    // Add to sync queue
    const syncItem: SyncQueueItem = {
      id: crypto.randomUUID(),
      collection: COLLECTIONS.USERS,
      operation: 'create',
      data: userData,
      timestamp: Date.now()
    };
    await storage.addToSyncQueue(syncItem);
    
    // Update users store
    users.update(list => [...list, tempUser]);
    
    return { 
      success: true, 
      user: tempUser,
      offline: true,
      message: 'User registered offline, will sync when online'
    };
    
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    error.set(message);
    return { success: false, message };
  } finally {
    isLoading.set(false);
  }
}

/**
 * Update user data
 */
export async function updateUser(userId: string, updateData: UpdateUserData): Promise<AuthResponse> {
  isLoading.set(true);
  error.set(null);
  
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
    
    // Update current user if it's the same user
    const current = get(currentUser);
    if (current && current.id === userId) {
      currentUser.set(updatedUser);
    }
    
    return { success: true, user: updatedUser };
    
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    error.set(message);
    return { success: false, message };
  } finally {
    isLoading.set(false);
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  isLoading.set(true);
  error.set(null);
  
  try {
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
    
    // Clear current user if it's the same user
    const current = get(currentUser);
    if (current && current.id === userId) {
      currentUser.set(null);
    }
    
    return { success: true };
    
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    error.set(message);
    return { success: false, message };
  } finally {
    isLoading.set(false);
  }
}

/**
 * Logout current user
 */
export function logout() {
  if (pb) {
    pb.authStore.clear();
  }
  
  currentUser.set(null);
  storage.clearAuthData();
}

/**
 * Fetch users from server
 */
export async function fetchUsersFromServer(): Promise<{ success: boolean; message?: string }> {
  if (!navigator.onLine || !pb) {
    return { success: false, message: 'Offline or PocketBase not available' };
  }
  
  try {
    isLoading.set(true);
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
    error.set(message);
    return { success: false, message };
  } finally {
    isLoading.set(false);
  }
}

/**
 * Synchronize data with server
 */
export async function syncData(): Promise<{ success: boolean; message?: string }> {
  if (!navigator.onLine) {
    return { success: false, message: 'Device is offline' };
  }
  
  if (!pb) {
    pb = await initPocketBase();
    if (!pb) {
      return { success: false, message: 'PocketBase not available' };
    }
  }
  
  try {
    syncStatus.set('syncing');
    
    // Process sync queue
    const queue = await storage.getSyncQueue();
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
        await storage.removeSyncQueueItem(item.id);
      } catch (err) {
        console.error('Sync error for item:', item, err);
        errors++;
      }
    }
    
    // Fetch fresh data from server
    await fetchUsersFromServer();
    
    syncStatus.set('online');
    
    return {
      success: errors === 0,
      message: errors > 0 ? `Sync completed with ${errors} errors` : 'Sync completed successfully'
    };
    
  } catch (err) {
    syncStatus.set('offline');
    const message = err instanceof Error ? err.message : 'Sync failed';
    error.set(message);
    return { success: false, message };
  }
}

/**
 * Check user permissions
 */
export function hasPermission(permission: string): boolean {
  const user = get(currentUser);
  if (!user) return false;
  
  // Import role permissions and check
  // This is a simplified version - you'd implement full permission checking
  return user.role === 'administrator' || user.role === 'operator';
}

// Initialize on browser load
if (browser) {
  // Set up online/offline detection
  window.addEventListener('online', () => {
    console.log('Connection restored, syncing data...');
    syncStatus.set('online');
    syncData();
  });
  
  window.addEventListener('offline', () => {
    console.log('Connection lost');
    syncStatus.set('offline');
  });
  
  // Initialize PocketBase and load initial data
  initPocketBase().then(() => {
    loadUsersFromStorage();
    
    // Sync data if we're online
    if (navigator.onLine) {
      syncData();
    }
  });
}
