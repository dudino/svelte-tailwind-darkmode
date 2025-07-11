import { writable, derived } from 'svelte/store';
import type { Masseuse, Location, Room, Schedule, Booking, ClientProfile } from '$lib/types/masseuse';
import { persistentStorage } from '$lib/utils/storage';
import { browser } from '$app/environment';

// Masseuse data from the documentation
const initialMasseuseData: Masseuse[] = [
	{
		"name": "Tiffany",
		"status": "New girl!",
		"height_cm": 170,
		"weight_kg": 50,
		"breasts": 3,
		"age": 23,
		"availability": []
	},
	{
		"name": "Adel",
		"status": "New girl!",
		"height_cm": 177,
		"weight_kg": 63,
		"breasts": 2,
		"age": 22,
		"availability": [
			{"date": "2025-07-12", "start_time": "16:00", "end_time": "23:00"}
		]
	},
	{
		"name": "Monika",
		"status": null,
		"height_cm": 164,
		"weight_kg": 58,
		"breasts": 2,
		"age": 23,
		"availability": [
			{"date": "2025-07-11", "start_time": "09:00", "end_time": "20:00"}
		]
	},
	{
		"name": "Melissa",
		"status": null,
		"height_cm": 162,
		"weight_kg": 55,
		"breasts": 2,
		"age": 20,
		"availability": [
			{"date": "2025-07-11", "start_time": "09:00", "end_time": "16:00"}
		]
	},
	{
		"name": "Silvia",
		"status": null,
		"height_cm": 164,
		"weight_kg": 44,
		"breasts": 2,
		"age": 19,
		"availability": [
			{"date": "2025-07-11", "start_time": "16:00", "end_time": "23:00"}
		]
	},
	{
		"name": "Lusy",
		"status": null,
		"height_cm": 154,
		"weight_kg": 52,
		"breasts": 2,
		"age": 25,
		"availability": []
	},
	{
		"name": "Mia",
		"status": null,
		"height_cm": 167,
		"weight_kg": 57,
		"breasts": 2,
		"age": 18,
		"availability": [
			{"date": "2025-07-11", "start_time": "09:00", "end_time": "16:00"}
		]
	},
	{
		"name": "Daniela",
		"status": null,
		"height_cm": 165,
		"weight_kg": 60,
		"breasts": 2,
		"age": 26,
		"availability": []
	},
	{
		"name": "Andrea",
		"status": null,
		"height_cm": 170,
		"weight_kg": 60,
		"breasts": 3,
		"age": 23,
		"availability": []
	},
	{
		"name": "Carol",
		"status": null,
		"height_cm": 168,
		"weight_kg": 55,
		"breasts": 2,
		"age": 21,
		"availability": []
	},
	{
		"name": "Kiki",
		"status": null,
		"height_cm": 160,
		"weight_kg": 52,
		"breasts": 1,
		"age": 19,
		"availability": [
			{"date": "2025-07-11", "start_time": "09:00", "end_time": "15:00"}
		]
	},
	{
		"name": "Natalie",
		"status": null,
		"height_cm": 163,
		"weight_kg": 50,
		"breasts": 1,
		"age": 18,
		"availability": [
			{"date": "2025-07-11", "start_time": "09:00", "end_time": "15:00"}
		]
	},
	{
		"name": "Bianka",
		"status": null,
		"height_cm": 160,
		"weight_kg": 53,
		"breasts": 2,
		"age": 23,
		"availability": []
	},
	{
		"name": "Lea",
		"status": null,
		"height_cm": 175,
		"weight_kg": 62,
		"breasts": 3,
		"age": 27,
		"availability": [
			{"date": "2025-07-11", "start_time": "09:00", "end_time": "16:00"}
		]
	},
	{
		"name": "Rebeca",
		"status": null,
		"height_cm": 155,
		"weight_kg": 49,
		"breasts": 2,
		"age": 23,
		"availability": []
	},
	{
		"name": "Sofia",
		"status": null,
		"height_cm": 170,
		"weight_kg": 60,
		"breasts": 4,
		"age": 26,
		"availability": [
			{"date": "2025-07-12", "start_time": "10:00", "end_time": "23:00"}
		]
	},
	{
		"name": "Sandra",
		"status": null,
		"height_cm": 168,
		"weight_kg": 51,
		"breasts": 2,
		"age": 24,
		"availability": []
	},
	{
		"name": "Emili",
		"status": null,
		"height_cm": 168,
		"weight_kg": 57,
		"breasts": 2,
		"age": 21,
		"availability": [
			{"date": "2025-07-11", "start_time": "12:00", "end_time": "20:00"}
		]
	},
	{
		"name": "Kristyna",
		"status": null,
		"height_cm": 169,
		"weight_kg": 60,
		"breasts": 2,
		"age": 25,
		"availability": [
			{"date": "2025-07-11", "start_time": "16:00", "end_time": "21:00"}
		]
	},
	{
		"name": "Elza",
		"status": null,
		"height_cm": 165,
		"weight_kg": 48,
		"breasts": 3,
		"age": 22,
		"availability": []
	},
	{
		"name": "Stella",
		"status": null,
		"height_cm": 160,
		"weight_kg": 50,
		"breasts": 1,
		"age": 22,
		"availability": []
	},
	{
		"name": "Laura",
		"status": null,
		"height_cm": 169,
		"weight_kg": 48,
		"breasts": 1,
		"age": 20,
		"availability": []
	},
	{
		"name": "Diana",
		"status": null,
		"height_cm": 168,
		"weight_kg": 53,
		"breasts": 2,
		"age": 24,
		"availability": [
			{"date": "2025-07-13", "start_time": "10:00", "end_time": "16:00"}
		]
	},
	{
		"name": "Eli",
		"status": null,
		"height_cm": 168,
		"weight_kg": 59,
		"breasts": 2,
		"age": 21,
		"availability": []
	},
	{
		"name": "Niches",
		"status": null,
		"height_cm": 170,
		"weight_kg": 55,
		"breasts": 2,
		"age": 28,
		"availability": []
	},
	// Add some masseuses with complete profile data for testing
	{
		"name": "Dr. Sarah Chen",
		"status": "Senior Therapist",
		"height_cm": 165,
		"weight_kg": 55,
		"breasts": 2,
		"age": 28,
		"email": "sarah.chen@affinity.cz",
		"phone": "+420 777 123 456",
		"bio": "Certified massage therapist with 8 years of experience specializing in deep tissue and sports massage. Fluent in English, Czech, and Mandarin.",
		"specializations": ["Deep Tissue Massage", "Sports Massage", "Swedish Massage"],
		"languages": ["English", "Czech", "Chinese"],
		"experience": "8 years of professional massage therapy experience, specialized training in sports injury recovery and rehabilitation techniques.",
		"certifications": ["Licensed Massage Therapist", "Sports Massage Certification", "Deep Tissue Certification"],
		"hourlyRate": 1500,
		"location": "Prague Downtown",
		"website": "https://sarahchen-massage.cz",
		"instagram": "@sarahchen_massage",
		"linkedin": "https://linkedin.com/in/sarahchen-massage",
		"availability": [
			{"date": "2025-07-11", "start_time": "09:00", "end_time": "17:00"},
			{"date": "2025-07-12", "start_time": "10:00", "end_time": "18:00"}
		]
	},
	{
		"name": "Jana Novakova",
		"status": "Wellness Expert",
		"height_cm": 170,
		"weight_kg": 60,
		"breasts": 3,
		"age": 25,
		"email": "jana.novakova@affinity.cz",
		"phone": "+420 777 987 654",
		"bio": "Holistic wellness practitioner specializing in relaxation and aromatherapy treatments. Passionate about helping clients achieve physical and mental balance.",
		"specializations": ["Relaxation Massage", "Aromatherapy", "Hot Stone Massage"],
		"languages": ["Czech", "English", "German"],
		"experience": "5 years specializing in holistic wellness and relaxation techniques, certified aromatherapist.",
		"certifications": ["Licensed Massage Therapist", "Aromatherapy Certification", "Hot Stone Therapy"],
		"hourlyRate": 1300,
		"location": "Prague Wellness Center",
		"instagram": "@jana_wellness",
		"availability": [
			{"date": "2025-07-11", "start_time": "14:00", "end_time": "22:00"},
			{"date": "2025-07-12", "start_time": "09:00", "end_time": "16:00"}
		]
	}
];

// Sample location data
export const locationData: Location[] = [
	{
		id: 'loc-1',
		name: 'Affinity Downtown',
		address: '123 Main Street, Prague',
		rooms: [
			{ id: 'room-1', name: 'Rose Room', capacity: 1, amenities: ['Aromatherapy', 'Hot stones'] },
			{ id: 'room-2', name: 'Lotus Room', capacity: 1, amenities: ['Music therapy', 'Dim lighting'] },
			{ id: 'room-3', name: 'Zen Room', capacity: 1, amenities: ['Essential oils', 'Heated table'] }
		]
	},
	{
		id: 'loc-2',
		name: 'Affinity Wellness Center',
		address: '456 Wellness Ave, Prague',
		rooms: [
			{ id: 'room-4', name: 'Serenity Suite', capacity: 1, amenities: ['Jacuzzi', 'Steam room'] },
			{ id: 'room-5', name: 'Harmony Room', capacity: 1, amenities: ['Sound therapy', 'Color therapy'] }
		]
	}
];

// Create the writable stores with persistent storage
export const masseuseData = writable<Masseuse[]>(initialMasseuseData);
export const masseuses = masseuseData; // Alias for compatibility
export const locations = writable<Location[]>(locationData);
export const schedules = writable<Schedule[]>([]);
export const bookings = writable<Booking[]>([]);
export const clientProfiles = writable<ClientProfile[]>([]);

// Initialize persistent storage when in browser
if (browser) {
	// Helper function to handle database errors
	const handleStorageError = async (error: any, operation: string) => {
		console.error(`Storage error during ${operation}:`, error);
		if (error.name === 'NotFoundError') {
			console.log('Attempting to recreate database...');
			try {
				await persistentStorage.recreateDatabase();
				console.log('Database recreated successfully');
				return true; // Indicate retry is possible
			} catch (recreateError) {
				console.error('Failed to recreate database:', recreateError);
				return false;
			}
		}
		return false;
	};

	// Load masseuses from IndexedDB
	persistentStorage.getMasseuses().then(savedMasseuses => {
		if (savedMasseuses.length > 0) {
			masseuseData.set(savedMasseuses);
		} else {
			// Save initial data to IndexedDB if none exists
			persistentStorage.saveMasseuses(initialMasseuseData);
		}
	}).catch(async (error) => {
		const shouldRetry = await handleStorageError(error, 'loading masseuses');
		if (shouldRetry) {
			// Retry loading after database recreation
			try {
				await persistentStorage.saveMasseuses(initialMasseuseData);
			} catch (retryError) {
				console.error('Retry failed:', retryError);
			}
		}
	});

	// Load locations from IndexedDB
	persistentStorage.getLocations().then(savedLocations => {
		if (savedLocations.length > 0) {
			locations.set(savedLocations);
		} else {
			// Save initial location data to IndexedDB if none exists
			persistentStorage.saveLocations(locationData);
		}
	}).catch(async (error) => {
		const shouldRetry = await handleStorageError(error, 'loading locations');
		if (shouldRetry) {
			try {
				await persistentStorage.saveLocations(locationData);
			} catch (retryError) {
				console.error('Retry failed:', retryError);
			}
		}
	});

	// Load schedules from IndexedDB
	persistentStorage.getSchedules().then(savedSchedules => {
		if (savedSchedules.length > 0) {
			schedules.set(savedSchedules);
		}
	}).catch(async (error) => {
		await handleStorageError(error, 'loading schedules');
	});

	// Load bookings from IndexedDB
	persistentStorage.getBookings().then(savedBookings => {
		if (savedBookings.length > 0) {
			bookings.set(savedBookings);
		}
	}).catch(async (error) => {
		await handleStorageError(error, 'loading bookings');
	});

	// Load client profiles from IndexedDB
	persistentStorage.getClientProfiles().then(savedProfiles => {
		if (savedProfiles.length > 0) {
			clientProfiles.set(savedProfiles);
		}
	}).catch(async (error) => {
		await handleStorageError(error, 'loading client profiles');
	});

	// Subscribe to changes and persist them automatically
	masseuseData.subscribe(masseuses => {
		if (masseuses.length > 0) {
			persistentStorage.saveMasseuses(masseuses).catch(console.error);
		}
	});

	locations.subscribe(locationsList => {
		if (locationsList.length > 0) {
			persistentStorage.saveLocations(locationsList).catch(console.error);
		}
	});

	schedules.subscribe(schedulesList => {
		if (schedulesList.length > 0) {
			persistentStorage.saveSchedules(schedulesList).catch(console.error);
		}
	});

	bookings.subscribe(bookingsList => {
		if (bookingsList.length > 0) {
			persistentStorage.saveBookings(bookingsList).catch(console.error);
		}
	});

	clientProfiles.subscribe(profilesList => {
		if (profilesList.length > 0) {
			persistentStorage.saveClientProfiles(profilesList).catch(console.error);
		}
	});
}

// Derived stores
export const availableMasseuses = derived(masseuseData, ($masseuses) => 
	$masseuses.filter(m => m.availability.length > 0)
);

export const todaysAvailability = derived(masseuseData, ($masseuses) => {
	const today = new Date().toISOString().split('T')[0];
	return $masseuses.filter(m => 
		m.availability.some(a => a.date === today)
	);
});

// Helper functions
export function getMasseuseByName(name: string): Masseuse | undefined {
	let currentData: Masseuse[] = [];
	masseuseData.subscribe(data => currentData = data)();
	return currentData.find((m: Masseuse) => m.name === name);
}

export function isAvailableToday(masseuse: Masseuse): boolean {
	const today = new Date().toISOString().split('T')[0];
	return masseuse.availability.some(a => a.date === today);
}

export function getBraSize(breasts: number): string {
	const sizes = ['A', 'B', 'C', 'D', 'DD'];
	return sizes[breasts - 1] || 'D+';
}

// Persistent operations
export const masseuseOperations = {
	// Add a new masseuse
	async addMasseuse(masseuse: Masseuse) {
		masseuseData.update(masseuses => {
			const updated = [...masseuses, masseuse];
			if (browser) {
				persistentStorage.saveMasseuses(updated);
			}
			return updated;
		});
	},

	// Update a masseuse
	async updateMasseuse(updatedMasseuse: Masseuse) {
		masseuseData.update(masseuses => {
			const updated = masseuses.map(m => 
				m.name === updatedMasseuse.name ? updatedMasseuse : m
			);
			if (browser) {
				persistentStorage.saveMasseuses(updated);
			}
			return updated;
		});
	},

	// Remove a masseuse
	async removeMasseuse(name: string) {
		masseuseData.update(masseuses => {
			const updated = masseuses.filter(m => m.name !== name);
			if (browser) {
				persistentStorage.saveMasseuses(updated);
			}
			return updated;
		});
	},

	// Location operations
	async addLocation(location: Location) {
		locations.update(locationsList => {
			const updated = [...locationsList, location];
			if (browser) {
				persistentStorage.saveLocations(updated);
			}
			return updated;
		});
	},

	async updateLocation(updatedLocation: Location) {
		locations.update(locationsList => {
			const updated = locationsList.map(l => 
				l.id === updatedLocation.id ? updatedLocation : l
			);
			if (browser) {
				persistentStorage.saveLocations(updated);
			}
			return updated;
		});
	},

	async removeLocation(locationId: string) {
		locations.update(locationsList => {
			const updated = locationsList.filter(l => l.id !== locationId);
			if (browser) {
				persistentStorage.saveLocations(updated);
			}
			return updated;
		});
	},

	// Schedule operations
	async addSchedule(schedule: Schedule) {
		schedules.update(schedulesList => {
			const updated = [...schedulesList, schedule];
			if (browser) {
				persistentStorage.saveSchedules(updated);
			}
			return updated;
		});
	},

	async updateSchedule(updatedSchedule: Schedule) {
		schedules.update(schedulesList => {
			const updated = schedulesList.map(s => 
				s.id === updatedSchedule.id ? updatedSchedule : s
			);
			if (browser) {
				persistentStorage.saveSchedules(updated);
			}
			return updated;
		});
	},

	async removeSchedule(scheduleId: string) {
		schedules.update(schedulesList => {
			const updated = schedulesList.filter(s => s.id !== scheduleId);
			if (browser) {
				persistentStorage.saveSchedules(updated);
			}
			return updated;
		});
	},

	// Booking operations
	async addBooking(booking: Booking) {
		bookings.update(bookingsList => {
			const updated = [...bookingsList, booking];
			if (browser) {
				persistentStorage.saveBookings(updated);
			}
			return updated;
		});
	},

	async updateBooking(updatedBooking: Booking) {
		bookings.update(bookingsList => {
			const updated = bookingsList.map(b => 
				b.id === updatedBooking.id ? updatedBooking : b
			);
			if (browser) {
				persistentStorage.saveBookings(updated);
			}
			return updated;
		});
	},

	async removeBooking(bookingId: string) {
		bookings.update(bookingsList => {
			const updated = bookingsList.filter(b => b.id !== bookingId);
			if (browser) {
				persistentStorage.saveBookings(updated);
			}
			return updated;
		});
	},

	// Client profile operations
	async addClientProfile(profile: ClientProfile) {
		clientProfiles.update(profilesList => {
			const updated = [...profilesList, profile];
			if (browser) {
				persistentStorage.saveClientProfiles(updated);
			}
			return updated;
		});
	},

	async updateClientProfile(updatedProfile: ClientProfile) {
		clientProfiles.update(profilesList => {
			const updated = profilesList.map(p => 
				p.id === updatedProfile.id ? updatedProfile : p
			);
			if (browser) {
				persistentStorage.saveClientProfiles(updated);
			}
			return updated;
		});
	},

	async removeClientProfile(profileId: string) {
		clientProfiles.update(profilesList => {
			const updated = profilesList.filter(p => p.id !== profileId);
			if (browser) {
				persistentStorage.saveClientProfiles(updated);
			}
			return updated;
		});
	},

	// Sync with server (when online)
	async syncWithServer() {
		if (!browser || !navigator.onLine) return;

		try {
			// Get local data
			const localData = await persistentStorage.exportAllData();

			// Here you would implement your server sync logic
			console.log('Syncing with server...', localData);
			
			// Example: POST to server and update local storage with server response
			// const serverData = await fetch('/api/sync', { method: 'POST', body: JSON.stringify(localData) });
			
		} catch (error) {
			console.error('Sync failed:', error);
		}
	},

	// Clear all local data
	async clearLocalData() {
		if (browser) {
			await persistentStorage.clearAllData();
			masseuseData.set(initialMasseuseData);
			locations.set(locationData);
			schedules.set([]);
			bookings.set([]);
			clientProfiles.set([]);
		}
	},

	// Export all data
	async exportData() {
		if (browser) {
			return await persistentStorage.exportAllData();
		}
		return null;
	},

	// Import data
	async importData(data: any) {
		if (browser) {
			await persistentStorage.importAllData(data);
			// Refresh all stores with imported data
			const [masseuses, locations_data, schedules_data, bookings_data, profiles] = await Promise.all([
				persistentStorage.getMasseuses(),
				persistentStorage.getLocations(),
				persistentStorage.getSchedules(),
				persistentStorage.getBookings(),
				persistentStorage.getClientProfiles()
			]);
			
			masseuseData.set(masseuses);
			locations.set(locations_data);
			schedules.set(schedules_data);
			bookings.set(bookings_data);
			clientProfiles.set(profiles);
		}
	}
};
