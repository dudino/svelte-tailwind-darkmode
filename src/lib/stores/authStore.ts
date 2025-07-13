/**
 * Authentication Store
 * Handles user authentication, login, logout, and session management
 */

import { writable, derived, get } from 'svelte/store';
import { storage } from '$lib/utils/storage';
import { setLoading, setError, clearError, setSyncStatus } from './appStateStore';
import type { User, CreateUserData, AuthResponse } from '$lib/types/user';
import { COLLECTIONS } from '$lib/types/user';

// Check if we're in browser environment
const browser = typeof window !== 'undefined';

// PocketBase configuration
const POCKETBASE_URL = (import.meta as any).env?.VITE_POCKETBASE_URL || 'http://localhost:8090';

// Authentication stores
export const currentUser = writable<User | null>(null);
export const isAuthenticated = derived(currentUser, $user => $user !== null);
export const userRole = derived(currentUser, $user => $user?.role || null);

// PocketBase client instance
let pb: any = null;

/**
 * Initialize PocketBase client
 */
export async function initPocketBase() {
  if (!browser) return null;
  
  try {
    const PocketBase = (await import('pocketbase')).default;
    pb = new PocketBase(POCKETBASE_URL);
    
    // Try to restore authentication from stored data
    const authData = await storage.getAuthData('currentUser');
    if (authData && pb.authStore) {
      try {
        pb.authStore.save(authData.token, authData.user);
        
        // Verify the token is still valid (only if online)
        if (pb.authStore.isValid && navigator.onLine) {
          try {
            await pb.collection(COLLECTIONS.USERS).authRefresh();
            currentUser.set(pb.authStore.model);
            setSyncStatus('online');
            
            // Automatically fetch users from server when restoring session
            try {
              const { fetchUsersFromServer } = await import('./userManagementStore');
              await fetchUsersFromServer();
            } catch (fetchErr) {
              console.warn('Failed to fetch users during session restore:', fetchErr);
            }
            
            return pb;
          } catch (refreshErr) {
            console.warn('Token refresh failed, clearing auth:', refreshErr);
            await storage.clearAuthData();
            pb.authStore.clear();
          }
        } else if (pb.authStore.isValid) {
          // Offline but token exists - trust it for now
          currentUser.set(authData.user);
          setSyncStatus('offline');
          return pb;
        }
      } catch (err) {
        console.warn('Stored auth token invalid, clearing:', err);
        await storage.clearAuthData();
        pb.authStore.clear();
      }
    }
    
    setSyncStatus(navigator.onLine ? 'online' : 'offline');
    return pb;
  } catch (err) {
    console.error('Failed to initialize PocketBase:', err);
    setSyncStatus('offline');
    return null;
  }
}

/**
 * Get PocketBase client instance
 */
export function getPocketBaseClient() {
  return pb;
}

/**
 * Authenticate user with email and password
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  setLoading(true);
  clearError();
  
  try {
    if (!pb) {
      pb = await initPocketBase();
    }
    
    // Try online authentication first
    if (navigator.onLine && pb) {
      try {
        const authData = await pb.collection(COLLECTIONS.USERS).authWithPassword(email, password);
        const user = authData.record as User;
        
        // Update last_login_at timestamp
        try {
          const updatedUser = await pb.collection(COLLECTIONS.USERS).update(user.id, {
            last_login_at: new Date().toISOString()
          });
          // Merge the updated timestamp into our user object
          user.last_login_at = updatedUser.last_login_at;
        } catch (updateErr) {
          console.warn('Failed to update last_login_at:', updateErr);
          // Continue with login even if timestamp update fails
          user.last_login_at = new Date().toISOString();
        }
        
        // Save authentication data
        await storage.saveAuthData('currentUser', {
          token: pb.authStore.token,
          user: user
        });
        
        // Save user data locally using the constraint-aware method
        await storage.saveOrUpdateUser(user);
        
        // Update stores
        currentUser.set(user);
        setSyncStatus('online');
        
        // Automatically fetch users from server after successful login
        try {
          const { fetchUsersFromServer } = await import('./userManagementStore');
          await fetchUsersFromServer();
        } catch (fetchErr) {
          console.warn('Failed to fetch users after login:', fetchErr);
          // Don't fail login if user fetch fails
        }
        
        return { success: true, user, token: pb.authStore.token };
      } catch (onlineErr) {
        console.warn('Online login failed:', onlineErr);
        // Only try server authentication - no offline fallback
        const message = onlineErr instanceof Error ? onlineErr.message : 'Login failed - server connection required';
        setError(message);
        return { success: false, message };
      }
    }
    
    // No fallback - require server connection
    return { 
      success: false, 
      message: 'Server connection required for authentication' 
    };
    
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    setError(message);
    return { success: false, message };
  } finally {
    setLoading(false);
  }
}

/**
 * Register a new user
 */
export async function register(userData: CreateUserData): Promise<AuthResponse> {
  setLoading(true);
  clearError();
  
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
        
        // Save user locally using the constraint-aware method
        await storage.saveOrUpdateUser(newUser);
        
        return { success: true, user: newUser };
      } catch (onlineErr) {
        console.warn('Online registration failed:', onlineErr);
        throw onlineErr;
      }
    }
    
    throw new Error('Registration requires internet connection');
    
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    setError(message);
    return { success: false, message };
  } finally {
    setLoading(false);
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
 * Check user permissions
 */
export function hasPermission(permission: string): boolean {
  const user = get(currentUser);
  if (!user) return false;
  
  // This is a simplified version - you'd implement full permission checking
  return user.role === 'administrator' || user.role === 'operator';
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string): boolean {
  const user = get(currentUser);
  return user?.role === role;
}

/**
 * Get current user data
 */
export function getCurrentUser(): User | null {
  return get(currentUser);
}

// Initialize on browser load
if (browser) {
  initPocketBase().then(async () => {
    // Load users from storage first for immediate display
    const { loadUsersFromStorage } = await import('./userManagementStore');
    await loadUsersFromStorage();
    
    // If user is authenticated and online, fetch fresh data from server
    const currentUserValue = get(currentUser);
    if (navigator.onLine && currentUserValue) {
      try {
        const { fetchUsersFromServer } = await import('./userManagementStore');
        await fetchUsersFromServer();
      } catch (fetchErr) {
        console.warn('Failed to fetch fresh user data on startup:', fetchErr);
      }
    }
    
    // Sync data if we're online
    if (navigator.onLine) {
      import('./syncStore').then(({ syncData }) => {
        syncData();
      });
    }
  });
}
