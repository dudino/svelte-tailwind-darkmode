/**
 * Application State Store
 * Manages general app state like loading, errors, and connection status
 */

import { writable } from 'svelte/store';

// App state stores
export const isLoading = writable<boolean>(false);
export const syncStatus = writable<'online' | 'offline' | 'syncing'>('offline');
export const error = writable<string | null>(null);

/**
 * Set loading state
 */
export function setLoading(loading: boolean) {
  isLoading.set(loading);
}

/**
 * Set error message
 */
export function setError(message: string | null) {
  error.set(message);
}

/**
 * Clear error
 */
export function clearError() {
  error.set(null);
}

/**
 * Set sync status
 */
export function setSyncStatus(status: 'online' | 'offline' | 'syncing') {
  syncStatus.set(status);
}

// Initialize connection status
if (typeof window !== 'undefined') {
  // Set up online/offline detection
  window.addEventListener('online', () => {
    console.log('Connection restored');
    setSyncStatus('online');
  });
  
  window.addEventListener('offline', () => {
    console.log('Connection lost');
    setSyncStatus('offline');
  });
  
  // Set initial status
  setSyncStatus(navigator.onLine ? 'online' : 'offline');
}
