/**
 * IndexedDB Storage Utility for PWA
 * Provides persistent storage for application data
 */

const DB_NAME = 'AffinityDB';
const DB_VERSION = 2; // Incremented to trigger database upgrade

// Store names
export const STORES = {
	MASSEUSES: 'masseuses',
	BOOKINGS: 'bookings',
	SCHEDULES: 'schedules',
	CLIENTS: 'clients',
	LOCATIONS: 'locations',
	SETTINGS: 'settings',
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
				
				// Verify all stores exist
				this.verifyStores();
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				const oldVersion = event.oldVersion;
				
				console.log(`Upgrading database from version ${oldVersion} to ${DB_VERSION}`);
				
				// Create object stores
				this.createStores(db);
			};
		});
	}

	/**
	 * Verify all required stores exist
	 */
	private verifyStores(): void {
		if (!this.db) return;
		
		const requiredStores = Object.values(STORES);
		const existingStores = Array.from(this.db.objectStoreNames);
		
		console.log('Required stores:', requiredStores);
		console.log('Existing stores:', existingStores);
		
		const missingStores = requiredStores.filter(store => !existingStores.includes(store));
		if (missingStores.length > 0) {
			console.warn('Missing stores detected:', missingStores);
			console.warn('Database may need to be recreated');
		}
	}

	/**
	 * Force database recreation
	 */
	async recreateDatabase(): Promise<void> {
		if (this.db) {
			this.db.close();
			this.db = null;
		}
		this.initialized = false;
		
		// Delete the database
		return new Promise((resolve, reject) => {
			const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
			deleteRequest.onsuccess = async () => {
				console.log('Database deleted, recreating...');
				try {
					await this.init();
					resolve();
				} catch (error) {
					reject(error);
				}
			};
			deleteRequest.onerror = () => reject(deleteRequest.error);
		});
	}

	/**
	 * Create object stores during database upgrade
	 */
	private createStores(db: IDBDatabase): void {
		console.log('Creating/updating object stores...');
		
		// Masseuses store
		if (!db.objectStoreNames.contains(STORES.MASSEUSES)) {
			console.log('Creating masseuses store');
			const masseuseStore = db.createObjectStore(STORES.MASSEUSES, { keyPath: 'name' });
			masseuseStore.createIndex('status', 'status', { unique: false });
			masseuseStore.createIndex('availability', 'availability', { unique: false });
		}

		// Bookings store
		if (!db.objectStoreNames.contains(STORES.BOOKINGS)) {
			console.log('Creating bookings store');
			const bookingStore = db.createObjectStore(STORES.BOOKINGS, { keyPath: 'id', autoIncrement: true });
			bookingStore.createIndex('masseuseName', 'masseuseName', { unique: false });
			bookingStore.createIndex('date', 'date', { unique: false });
			bookingStore.createIndex('status', 'status', { unique: false });
		}

		// Schedules store
		if (!db.objectStoreNames.contains(STORES.SCHEDULES)) {
			console.log('Creating schedules store');
			const scheduleStore = db.createObjectStore(STORES.SCHEDULES, { keyPath: 'id', autoIncrement: true });
			scheduleStore.createIndex('masseuseName', 'masseuseName', { unique: false });
			scheduleStore.createIndex('date', 'date', { unique: false });
		}

		// Clients store
		if (!db.objectStoreNames.contains(STORES.CLIENTS)) {
			console.log('Creating clients store');
			const clientStore = db.createObjectStore(STORES.CLIENTS, { keyPath: 'id', autoIncrement: true });
			clientStore.createIndex('email', 'email', { unique: true });
			clientStore.createIndex('phone', 'phone', { unique: false });
		}

		// Locations store
		if (!db.objectStoreNames.contains(STORES.LOCATIONS)) {
			console.log('Creating locations store');
			const locationStore = db.createObjectStore(STORES.LOCATIONS, { keyPath: 'id' });
			locationStore.createIndex('name', 'name', { unique: false });
		}

		// Settings store
		if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
			console.log('Creating settings store');
			db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
		}

		// Cache store for API responses
		if (!db.objectStoreNames.contains(STORES.CACHE)) {
			console.log('Creating cache store');
			const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'key' });
			cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
		}
		
		console.log('All object stores created/verified');
	}

	/**
	 * Get data from a store
	 */
	async get<T = any>(storeName: StoreNames, key: string | number): Promise<T | null> {
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
	 * Get all data from a store
	 */
	async getAll<T = any>(storeName: StoreNames): Promise<T[]> {
		await this.init();
		if (!this.db) throw new Error('Database not initialized');

		// Check if store exists
		if (!this.db.objectStoreNames.contains(storeName)) {
			console.warn(`Store ${storeName} does not exist, returning empty array`);
			return [];
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([storeName], 'readonly');
			const store = transaction.objectStore(storeName);
			const request = store.getAll();

			request.onsuccess = () => resolve(request.result || []);
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * Store data in a store
	 */
	async set<T = any>(storeName: StoreNames, data: T): Promise<void> {
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
	 * Store multiple items
	 */
	async setMany<T = any>(storeName: StoreNames, items: T[]): Promise<void> {
		await this.init();
		if (!this.db) throw new Error('Database not initialized');

		// Check if store exists
		if (!this.db.objectStoreNames.contains(storeName)) {
			console.warn(`Store ${storeName} does not exist, skipping setMany operation`);
			return;
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([storeName], 'readwrite');
			const store = transaction.objectStore(storeName);
			
			let completed = 0;
			const total = items.length;

			if (total === 0) {
				resolve();
				return;
			}

			items.forEach(item => {
				const request = store.put(item);
				request.onsuccess = () => {
					completed++;
					if (completed === total) resolve();
				};
				request.onerror = () => reject(request.error);
			});
		});
	}

	/**
	 * Delete data from a store
	 */
	async delete(storeName: StoreNames, key: string | number): Promise<void> {
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

		// Check if store exists
		if (!this.db.objectStoreNames.contains(storeName)) {
			console.warn(`Store ${storeName} does not exist, skipping clear operation`);
			return;
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([storeName], 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.clear();

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * Query data by index
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

	/**
	 * Cache API response with timestamp
	 */
	async cacheData(key: string, data: any, ttl: number = 3600000): Promise<void> {
		const cacheItem = {
			key,
			data,
			timestamp: Date.now(),
			ttl
		};
		await this.set(STORES.CACHE, cacheItem);
	}

	/**
	 * Get cached data if not expired
	 */
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

// Helper functions for common operations
export const persistentStorage = {
	// Masseuse operations
	async saveMasseuses(masseuses: any[]) {
		await storage.clear(STORES.MASSEUSES);
		await storage.setMany(STORES.MASSEUSES, masseuses);
	},

	async getMasseuses() {
		return await storage.getAll(STORES.MASSEUSES);
	},

	async getMasseuseByName(name: string) {
		return await storage.get(STORES.MASSEUSES, name);
	},

	// Location operations
	async saveLocations(locations: any[]) {
		await storage.clear(STORES.LOCATIONS);
		await storage.setMany(STORES.LOCATIONS, locations);
	},

	async getLocations() {
		return await storage.getAll(STORES.LOCATIONS);
	},

	// Schedule operations
	async saveSchedules(schedules: any[]) {
		await storage.clear(STORES.SCHEDULES);
		await storage.setMany(STORES.SCHEDULES, schedules);
	},

	async getSchedules() {
		return await storage.getAll(STORES.SCHEDULES);
	},

	async getSchedulesByMasseuse(masseuseName: string) {
		return await storage.getByIndex(STORES.SCHEDULES, 'masseuseName', masseuseName);
	},

	// Booking operations
	async saveBooking(booking: any) {
		await storage.set(STORES.BOOKINGS, booking);
	},

	async saveBookings(bookings: any[]) {
		await storage.clear(STORES.BOOKINGS);
		await storage.setMany(STORES.BOOKINGS, bookings);
	},

	async getBookings() {
		return await storage.getAll(STORES.BOOKINGS);
	},

	async getBookingsByMasseuse(masseuseName: string) {
		return await storage.getByIndex(STORES.BOOKINGS, 'masseuseName', masseuseName);
	},

	// Client Profile operations
	async saveClientProfiles(profiles: any[]) {
		await storage.clear(STORES.CLIENTS);
		await storage.setMany(STORES.CLIENTS, profiles);
	},

	async getClientProfiles() {
		return await storage.getAll(STORES.CLIENTS);
	},

	async getClientByEmail(email: string) {
		const clients = await storage.getByIndex(STORES.CLIENTS, 'email', email);
		return clients[0] || null;
	},

	// Settings operations
	async saveSetting(key: string, value: any) {
		await storage.set(STORES.SETTINGS, { key, value });
	},

	async getSetting(key: string) {
		const setting = await storage.get(STORES.SETTINGS, key);
		return setting?.value || null;
	},

	// Cache operations
	async cacheApiResponse(endpoint: string, data: any, ttl?: number) {
		await storage.cacheData(`api:${endpoint}`, data, ttl);
	},

	async getCachedApiResponse(endpoint: string) {
		return await storage.getCachedData(`api:${endpoint}`);
	},

	// Utility operations
	async clearAllData() {
		await storage.clear(STORES.MASSEUSES);
		await storage.clear(STORES.BOOKINGS);
		await storage.clear(STORES.SCHEDULES);
		await storage.clear(STORES.CLIENTS);
		await storage.clear(STORES.LOCATIONS);
		await storage.clear(STORES.SETTINGS);
		await storage.clear(STORES.CACHE);
	},

	async recreateDatabase() {
		console.log('Recreating database due to errors...');
		await storage.recreateDatabase();
	},

	async exportAllData() {
		try {
			const [masseuses, bookings, schedules, clients, locations, settings] = await Promise.all([
				this.getMasseuses(),
				this.getBookings(),
				this.getSchedules(),
				this.getClientProfiles(),
				this.getLocations(),
				storage.getAll(STORES.SETTINGS)
			]);

			return {
				masseuses,
				bookings,
				schedules,
				clients,
				locations,
				settings,
				exportDate: new Date().toISOString()
			};
		} catch (error) {
			console.error('Export failed:', error);
			throw error;
		}
	},

	async importAllData(data: any) {
		if (data.masseuses) await this.saveMasseuses(data.masseuses);
		if (data.bookings) await this.saveBookings(data.bookings);
		if (data.schedules) await this.saveSchedules(data.schedules);
		if (data.clients) await this.saveClientProfiles(data.clients);
		if (data.locations) await this.saveLocations(data.locations);
		if (data.settings) {
			for (const setting of data.settings) {
				await this.saveSetting(setting.key, setting.value);
			}
		}
	}
};
