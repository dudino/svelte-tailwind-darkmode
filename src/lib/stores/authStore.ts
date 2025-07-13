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
        
        return { success: true, user, token: pb.authStore.token };
      } catch (onlineErr) {
        console.warn('Online login failed, trying offline:', onlineErr);
      }
    }
    
    // Fallback to offline authentication with demo users
    const storedUser = await storage.getUserByEmail(email);
    if (storedUser && storedUser.is_active) {
      // For demo purposes, accept "password" for known demo users
      const demoEmails = ['admin@massage.com', 'operator@massage.com', 'user@massage.com'];
      if (demoEmails.includes(email) && password === 'password') {
        // Update last_login_at timestamp for offline login
        const userWithTimestamp = {
          ...storedUser,
          last_login_at: new Date().toISOString()
        };
        
        // Save the updated user data
        await storage.saveOrUpdateUser(userWithTimestamp);
        
        currentUser.set(userWithTimestamp);
        setSyncStatus('offline');
        
        return { 
          success: true, 
          user: userWithTimestamp, 
          offline: true,
          message: `Logged in as ${userWithTimestamp.name} (offline mode)`
        };
      }
      
      // For other users, check if we have valid stored credentials
      // In a real app, you'd verify the password hash here
      if (password.length >= 6) { // Basic password validation
        // Update last_login_at timestamp for offline login
        const userWithTimestamp = {
          ...storedUser,
          last_login_at: new Date().toISOString()
        };
        
        // Save the updated user data
        await storage.saveOrUpdateUser(userWithTimestamp);
        
        currentUser.set(userWithTimestamp);
        setSyncStatus('offline');
        
        return { 
          success: true, 
          user: userWithTimestamp, 
          offline: true,
          message: 'Logged in offline mode'
        };
      }
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

/**
 * Initialize demo users for testing (offline mode)
 */
async function initDemoUsers() {
  try {
    console.log('Checking demo users...');
    
    // Check if all demo users already exist
    const emails = ['admin@massage.com', 'operator@massage.com', 'user@massage.com'];
    const existingUsers = await Promise.all(
      emails.map(email => storage.getUserByEmail(email))
    );
    
    const allExist = existingUsers.every(user => user !== null);
    if (allExist) {
      console.log('All demo users already exist, skipping initialization');
      console.log('Available login credentials:');
      console.log('- Admin: admin@massage.com / password');
      console.log('- Operator: operator@massage.com / password');
      console.log('- User: user@massage.com / password');
      return;
    }

    console.log('Creating missing demo users for testing...');
    
    const demoUsers: User[] = [
      {
        id: 'demo-admin-1',
        email: 'admin@massage.com',
        username: 'admin@massage.com',
        name: 'Demo Administrator',
        role: 'administrator',
        phone: '+420 123 456 789',
        is_active: true,
        has_accommodation: false,
        languages: ['en', 'cz'],
        services: [],
        contact_details: {
          streetName: 'Demo Street',
          houseNumber: '123',
          postalCode: '12000',
          city: 'Prague',
          country: 'Czech Republic'
        },
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        verified: true,
        emailVisibility: true
      },
      {
        id: 'demo-operator-1',
        email: 'operator@massage.com',
        username: 'operator@massage.com',
        name: 'Demo Operator',
        role: 'operator',
        phone: '+420 987 654 321',
        is_active: true,
        has_accommodation: false,
        languages: ['en', 'cz'],
        services: [],
        contact_details: {
          streetName: 'Operator Street',
          houseNumber: '456',
          postalCode: '12000',
          city: 'Prague',
          country: 'Czech Republic'
        },
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        verified: true,
        emailVisibility: true
      },
      {
        id: 'demo-user-1',
        email: 'user@massage.com',
        username: 'user@massage.com',
        name: 'Demo User',
        role: 'user',
        phone: '+420 555 666 777',
        is_active: true,
        has_accommodation: true,
        languages: ['en'],
        services: [],
        contact_details: {
          streetName: 'User Street',
          houseNumber: '789',
          postalCode: '12000',
          city: 'Prague',
          country: 'Czech Republic'
        },
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        verified: true,
        emailVisibility: true
      }
    ];

    // Save demo users to storage - check each one individually to prevent duplicates
    for (const user of demoUsers) {
      try {
        const existing = await storage.getUserByEmail(user.email);
        if (!existing) {
          await storage.saveOrUpdateUser(user);
          console.log(`Created demo user: ${user.email}`);
        } else {
          console.log(`Demo user already exists: ${user.email}, updating...`);
          // Update existing user to ensure it has the latest demo data
          const updatedUser = { ...existing, ...user, id: existing.id };
          await storage.saveOrUpdateUser(updatedUser);
          console.log(`Updated demo user: ${user.email}`);
        }
      } catch (userErr: any) {
        console.warn(`Failed to create/update user ${user.email}:`, userErr);
        // If it's a constraint error, try to remove and recreate
        if (userErr.name === 'ConstraintError') {
          try {
            console.log(`Attempting to fix constraint error for ${user.email}`);
            await storage.saveOrUpdateUser(user);
            console.log(`Fixed and created demo user: ${user.email}`);
          } catch (retryErr) {
            console.error(`Final attempt failed for ${user.email}:`, retryErr);
          }
        }
      }
    }

    console.log('Demo user initialization complete');
    console.log('Available login credentials:');
    console.log('- Admin: admin@massage.com / password');
    console.log('- Operator: operator@massage.com / password');
    console.log('- User: user@massage.com / password');
    
  } catch (err) {
    console.error('Failed to initialize demo users:', err);
  }
}

// Initialize on browser load
if (browser) {
  initPocketBase().then(async () => {
    // Initialize demo users for offline testing
    await initDemoUsers();
    
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
