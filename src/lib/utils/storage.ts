/**
 * IndexedDB Storage Utility for PWA User Management
 * Provides persistent storage for user data and offline functionality
 */

import type { User, SyncQueueItem } from '$lib/types/user';

const DB_NAME = 'UserManagementDB';
const DB_VERSION = 1;

// Store names
export const STORES = {
  USERS: 'users',
  SYNC_QUEUE: 'syncQueue',
  AUTH: 'auth',
  CACHE: 'cache'
} as const;

type StoreNames = typeof STORES[keyof typeof STORES];

class IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private initialized = false;

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    if (this.initialized && this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log(`Creating database schema version ${DB_VERSION}`);
        this.createStores(db);
      };
    });
  }

  /**
   * Create all required object stores
   */
  private createStores(db: IDBDatabase): void {
    // Users store
    if (!db.objectStoreNames.contains(STORES.USERS)) {
      const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' });
      userStore.createIndex('email', 'email', { unique: true });
      userStore.createIndex('userId', 'userId', { unique: true });
      userStore.createIndex('role', 'role', { unique: false });
      userStore.createIndex('isActive', 'isActive', { unique: false });
    }

    // Sync queue store
    if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
      db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
    }

    // Auth store for storing tokens and auth state
    if (!db.objectStoreNames.contains(STORES.AUTH)) {
      db.createObjectStore(STORES.AUTH, { keyPath: 'key' });
    }

    // Cache store for API responses
    if (!db.objectStoreNames.contains(STORES.CACHE)) {
      db.createObjectStore(STORES.CACHE, { keyPath: 'key' });
    }
  }

  /**
   * Generic get method
   */
  async get<T = any>(storeName: StoreNames, key: string): Promise<T | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic put method
   */
  async put<T = any>(storeName: StoreNames, data: T): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic getAll method
   */
  async getAll<T = any>(storeName: StoreNames): Promise<T[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic delete method
   */
  async delete(storeName: StoreNames, key: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data from a store
   */
  async clear(storeName: StoreNames): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Query by index
   */
  async getByIndex<T = any>(storeName: StoreNames, indexName: string, value: any): Promise<T[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // User-specific methods
  async saveUser(user: User): Promise<void> {
    return this.put(STORES.USERS, user);
  }

  /**
   * Save or update user with better error handling
   */
  async saveOrUpdateUser(user: User): Promise<void> {
    try {
      // Try to save the user
      await this.put(STORES.USERS, user);
    } catch (err) {
      // If it's a constraint error, try to update existing user
      if (err instanceof Error && err.name === 'ConstraintError') {
        console.warn(`User with email ${user.email} already exists, updating...`);
        const existingUser = await this.getUserByEmail(user.email);
        if (existingUser) {
          // Merge with existing user, preserving the original ID
          const updatedUser = { ...existingUser, ...user, id: existingUser.id };
          await this.put(STORES.USERS, updatedUser);
        } else {
          throw err; // Re-throw if we can't find the existing user
        }
      } else {
        throw err; // Re-throw other errors
      }
    }
  }

  /**
   * Clear all users (for debugging)
   */
  async clearAllUsers(): Promise<void> {
    return this.clear(STORES.USERS);
  }

  async getUser(id: string): Promise<User | null> {
    return this.get(STORES.USERS, id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.getAll(STORES.USERS);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getByIndex(STORES.USERS, 'email', email);
    return users[0] || null;
  }

  async getUserByUserId(userId: string): Promise<User | null> {
    const users = await this.getByIndex(STORES.USERS, 'userId', userId);
    return users[0] || null;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return this.getByIndex(STORES.USERS, 'role', role);
  }

  async getActiveUsers(): Promise<User[]> {
    return this.getByIndex(STORES.USERS, 'isActive', true);
  }

  async deleteUser(id: string): Promise<void> {
    return this.delete(STORES.USERS, id);
  }

  // Auth methods
  async saveAuthData(key: string, data: any): Promise<void> {
    return this.put(STORES.AUTH, { key, data });
  }

  async getAuthData(key: string): Promise<any> {
    const result = await this.get(STORES.AUTH, key);
    return result?.data || null;
  }

  async clearAuthData(): Promise<void> {
    return this.clear(STORES.AUTH);
  }

  // Sync queue methods
  async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    return this.put(STORES.SYNC_QUEUE, item);
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return this.getAll(STORES.SYNC_QUEUE);
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    return this.delete(STORES.SYNC_QUEUE, id);
  }

  async clearSyncQueue(): Promise<void> {
    return this.clear(STORES.SYNC_QUEUE);
  }

  // Cache methods
  async cacheData(key: string, data: any, ttl: number = 3600000): Promise<void> {
    const cacheItem = {
      key,
      data,
      timestamp: Date.now(),
      ttl
    };
    return this.put(STORES.CACHE, cacheItem);
  }

  async getCachedData<T = any>(key: string): Promise<T | null> {
    const cached = await this.get(STORES.CACHE, key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      await this.delete(STORES.CACHE, key);
      return null;
    }

    return cached.data;
  }
}

// Export singleton instance
export const storage = new IndexedDBStorage();
