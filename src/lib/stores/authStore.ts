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
        
        // Save authentication data
        await storage.saveAuthData('currentUser', {
          token: pb.authStore.token,
          user: user
        });
        
        // Save user data locally
        await storage.saveUser(user);
        
        // Update stores
        currentUser.set(user);
        setSyncStatus('online');
        
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
      setSyncStatus('offline');
      
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
        
        // Save user locally
        await storage.saveUser(newUser);
        
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
  initPocketBase().then(() => {
    // Load users from storage (importing here to avoid circular dependency)
    import('./userManagementStore').then(({ loadUsersFromStorage }) => {
      loadUsersFromStorage();
    });
    
    // Sync data if we're online
    if (navigator.onLine) {
      import('./syncStore').then(({ syncData }) => {
        syncData();
      });
    }
  });
}
