/**
 * PWA utilities for service worker registration and offline functionality
 */

import { browser } from '$app/environment';

export class PWAManager {
	private registration: ServiceWorkerRegistration | null = null;
	private isOnline = true;
	private callbacks: { [key: string]: Function[] } = {};

	constructor() {
		if (browser) {
			this.init();
		}
	}

	private async init() {
		// Register service worker
		await this.registerServiceWorker();
		
		// Set up online/offline detection
		this.setupNetworkDetection();
		
		// Set up periodic sync
		this.setupPeriodicSync();
	}

	/**
	 * Register service worker
	 */
	private async registerServiceWorker() {
		if (!('serviceWorker' in navigator)) {
			console.log('Service workers not supported');
			return;
		}

		try {
			this.registration = await navigator.serviceWorker.register('/sw.js');
			console.log('Service worker registered successfully');

			// Handle updates
			this.registration.addEventListener('updatefound', () => {
				console.log('Service worker update found');
				this.emit('updateAvailable');
			});

		} catch (error) {
			console.error('Service worker registration failed:', error);
		}
	}

	/**
	 * Set up network detection
	 */
	private setupNetworkDetection() {
		this.isOnline = navigator.onLine;

		window.addEventListener('online', () => {
			console.log('App is online');
			this.isOnline = true;
			this.emit('online');
			this.syncWhenOnline();
		});

		window.addEventListener('offline', () => {
			console.log('App is offline');
			this.isOnline = false;
			this.emit('offline');
		});
	}

	/**
	 * Set up periodic background sync
	 */
	private setupPeriodicSync() {
		if (this.registration && 'sync' in window.ServiceWorkerRegistration.prototype) {
			// Register for background sync when data changes
			this.on('dataChanged', () => {
				this.registerBackgroundSync('sync-masseuse-data');
			});
		}
	}

	/**
	 * Register background sync
	 */
	private async registerBackgroundSync(tag: string) {
		if (!this.registration) return;

		try {
			// Check if sync is supported
			if ('sync' in this.registration) {
				await (this.registration as any).sync.register(tag);
				console.log('Background sync registered:', tag);
			}
		} catch (error) {
			console.error('Background sync registration failed:', error);
		}
	}

	/**
	 * Sync data when coming back online
	 */
	private async syncWhenOnline() {
		if (!this.isOnline || !this.registration) return;

		try {
			// Send message to service worker to sync data
			navigator.serviceWorker.controller?.postMessage({
				type: 'SYNC_DATA'
			});
		} catch (error) {
			console.error('Sync failed:', error);
		}
	}

	/**
	 * Check if app is running as PWA
	 */
	public isPWA(): boolean {
		return window.matchMedia('(display-mode: standalone)').matches ||
			   (window.navigator as any).standalone === true;
	}

	/**
	 * Check if app is online
	 */
	public getOnlineStatus(): boolean {
		return this.isOnline;
	}

	/**
	 * Show install prompt
	 */
	public async showInstallPrompt(): Promise<boolean> {
		// This would be triggered by beforeinstallprompt event
		// For now, just show instructions
		const canInstall = !this.isPWA() && 'serviceWorker' in navigator;
		
		if (canInstall) {
			console.log('PWA can be installed');
			this.emit('installAvailable');
		}
		
		return canInstall;
	}

	/**
	 * Update service worker
	 */
	public async updateServiceWorker() {
		if (!this.registration) return;

		try {
			await this.registration.update();
			console.log('Service worker updated');
		} catch (error) {
			console.error('Service worker update failed:', error);
		}
	}

	/**
	 * Skip waiting for service worker update
	 */
	public skipWaiting() {
		if (!this.registration || !this.registration.waiting) return;

		this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
	}

	/**
	 * Request notification permission
	 */
	public async requestNotificationPermission(): Promise<boolean> {
		if (!('Notification' in window)) {
			console.log('Notifications not supported');
			return false;
		}

		if (Notification.permission === 'granted') {
			return true;
		}

		if (Notification.permission !== 'denied') {
			const permission = await Notification.requestPermission();
			return permission === 'granted';
		}

		return false;
	}

	/**
	 * Show local notification
	 */
	public async showNotification(title: string, options: NotificationOptions = {}) {
		const hasPermission = await this.requestNotificationPermission();
		if (!hasPermission) return;

		const defaultOptions: NotificationOptions & { vibrate?: number[] } = {
			icon: '/icon-192.png',
			badge: '/icon-192.png',
			vibrate: [200, 100, 200],
			...options
		};

		if (this.registration) {
			await this.registration.showNotification(title, defaultOptions);
		} else {
			new Notification(title, defaultOptions);
		}
	}

	/**
	 * Event emitter methods
	 */
	public on(event: string, callback: Function) {
		if (!this.callbacks[event]) {
			this.callbacks[event] = [];
		}
		this.callbacks[event].push(callback);
	}

	public off(event: string, callback: Function) {
		if (!this.callbacks[event]) return;
		this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
	}

	private emit(event: string, data?: any) {
		if (!this.callbacks[event]) return;
		this.callbacks[event].forEach(callback => callback(data));
	}

	/**
	 * Trigger data sync
	 */
	public triggerSync() {
		this.emit('dataChanged');
	}

	/**
	 * Clear all caches
	 */
	public async clearCaches() {
		if (!('caches' in window)) return;

		try {
			const cacheNames = await caches.keys();
			await Promise.all(
				cacheNames.map(cacheName => caches.delete(cacheName))
			);
			console.log('All caches cleared');
		} catch (error) {
			console.error('Failed to clear caches:', error);
		}
	}
}

// Export singleton instance
export const pwaManager = new PWAManager();

// Export utility functions
export const pwaUtils = {
	/**
	 * Check if device supports PWA features
	 */
	checkPWASupport() {
		return {
			serviceWorker: 'serviceWorker' in navigator,
			notifications: 'Notification' in window,
			backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
			install: 'onbeforeinstallprompt' in window,
			storage: 'indexedDB' in window
		};
	},

	/**
	 * Get PWA installation status
	 */
	getInstallationStatus() {
		const isPWA = pwaManager.isPWA();
		const canInstall = !isPWA && 'serviceWorker' in navigator;
		
		return {
			isPWA,
			canInstall,
			isStandalone: isPWA
		};
	},

	/**
	 * Show PWA install banner
	 */
	showInstallBanner() {
		const status = this.getInstallationStatus();
		if (status.canInstall) {
			pwaManager.showInstallPrompt();
		}
	}
};
