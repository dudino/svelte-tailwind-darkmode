import { writable, derived } from 'svelte/store';
import type { Masseuse, Location, Room, Schedule, Booking, ClientProfile } from '$lib/types/masseuse';

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

// Create the writable stores
export const masseuseData = writable<Masseuse[]>(initialMasseuseData);
export const masseuses = masseuseData; // Alias for compatibility
export const locations = writable<Location[]>(locationData);
export const schedules = writable<Schedule[]>([]);
export const bookings = writable<Booking[]>([]);
export const clientProfiles = writable<ClientProfile[]>([]);

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
