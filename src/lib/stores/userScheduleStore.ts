/**
 * User Schedule Store
 * Manages user schedule data, locations, and rooms with optimistic updates
 */

import { writable, derived, get } from 'svelte/store';
import { getPocketBaseClient, currentUser } from './authStore';
import { toast } from 'svelte-sonner';

// Types
interface Schedule {
	id: string;
	user_id: string;
	room_id: string;
	date: string;
	timeslot: string;
	start_time: string;
	end_time: string;
	is_confirmed: boolean;
	is_available: boolean;
	notes?: string;
	created_by: string;
	confirmed_by?: string;
	expand?: {
		room_id?: {
			id: string;
			name: string;
			type: string;
			expand?: {
				location_id?: {
					id: string;
					name: string;
				};
			};
		};
		confirmed_by?: {
			id: string;
			name: string;
		};
	};
}

interface Location {
	id: string;
	name: string;
	is_active: boolean;
}

interface Room {
	id: string;
	name: string;
	type: 'regular' | 'dynamic';
	location_id: string;
	is_active: boolean;
	expand?: {
		location_id?: Location;
	};
}

// Core stores
export const schedules = writable<Schedule[]>([]);
export const locations = writable<Location[]>([]);
export const rooms = writable<Room[]>([]);
export const selectedWeek = writable<Date>(new Date());
export const loading = writable<boolean>(false);
export const refreshing = writable<boolean>(false);

// Derived stores
export const weekStart = derived(selectedWeek, ($selectedWeek) => {
	const d = new Date($selectedWeek);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	const weekStart = new Date(d.setDate(diff));
	return weekStart;
});

export const weekEnd = derived(weekStart, ($weekStart) => {
	return new Date($weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
});

export const weekDays = derived(weekStart, ($weekStart) => {
	const days = [];
	for (let i = 0; i < 7; i++) {
		const day = new Date($weekStart);
		day.setDate($weekStart.getDate() + i);
		days.push(day);
	}
	return days;
});

// Reactive schedule map by date
export const schedulesByDate = derived([schedules, weekDays], ([$schedules, $weekDays]) => {
	const map = new Map<string, Schedule[]>();
	
	// Initialize all week days with empty arrays
	$weekDays.forEach(day => {
		const dateStr = day.toISOString().split('T')[0];
		map.set(dateStr, []);
	});
	
	// Populate with schedules
	$schedules.forEach(schedule => {
		// Handle both date formats: "YYYY-MM-DD" and "YYYY-MM-DD HH:MM:SS.sssZ"
		let scheduleDateStr = schedule.date;
		if (scheduleDateStr.includes('T') || scheduleDateStr.includes(' ')) {
			// If it's a full timestamp, extract just the date part
			scheduleDateStr = new Date(scheduleDateStr).toISOString().split('T')[0];
		}
		
		const existing = map.get(scheduleDateStr) || [];
		map.set(scheduleDateStr, [...existing, schedule]);
	});
	
	return map;
});

// Helper functions
function getWeekDateRange(week: Date) {
	const weekStart = new Date(week);
	const day = weekStart.getDay();
	const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
	weekStart.setDate(diff);
	
	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekStart.getDate() + 6);
	
	return {
		start: weekStart.toISOString().split('T')[0],
		end: weekEnd.toISOString().split('T')[0]
	};
}

// Actions
export async function loadLocationsAndRooms() {
	try {
		const pb = getPocketBaseClient();
		if (!pb) throw new Error('PocketBase not initialized');

		// Load locations
		const locationsResult = await pb.collection('locations').getList(1, 50, {
			filter: 'is_active = true',
			sort: 'name'
		});
		locations.set(locationsResult.items);

		// Load rooms
		const roomsResult = await pb.collection('rooms').getList(1, 50, {
			filter: 'is_active = true',
			expand: 'location_id',
			sort: 'location_id,name'
		});
		rooms.set(roomsResult.items);
	} catch (error) {
		console.error('Error loading locations and rooms:', error);
		toast.error('Failed to load locations and rooms');
		throw error;
	}
}

export async function loadSchedules(week?: Date) {
	const user = get(currentUser);
	if (!user) return;

	const targetWeek = week || get(selectedWeek);
	
	try {
		loading.set(true);
		const pb = getPocketBaseClient();
		if (!pb) throw new Error('PocketBase not initialized');

		const dateRange = getWeekDateRange(targetWeek);

		// Load schedules for the selected week
		const result = await pb.collection('schedules').getList(1, 50, {
			filter: `user_id = "${user.id}" && date >= "${dateRange.start}" && date <= "${dateRange.end}"`,
			expand: 'room_id,room_id.location_id,confirmed_by',
			sort: 'date,start_time'
		});

		schedules.set(result.items);
	} catch (error) {
		console.error('Error loading schedules:', error);
		toast.error('Failed to load schedules');
		throw error;
	} finally {
		loading.set(false);
	}
}

export async function createSchedule(scheduleData: Partial<Schedule>): Promise<Schedule> {
	const user = get(currentUser);
	if (!user) throw new Error('User not authenticated');

	const pb = getPocketBaseClient();
	if (!pb) throw new Error('PocketBase not initialized');

	try {
		const fullScheduleData = {
			...scheduleData,
			user_id: user.id,
			is_confirmed: false,
			is_available: true,
			created_by: user.id
		};

		console.log('Creating schedule:', fullScheduleData);
		const result = await pb.collection('schedules').create(fullScheduleData);
		
		console.log('Schedule created:', result);
		toast.success('Schedule created successfully');
		
		return result;
	} catch (error) {
		console.error('Error creating schedule:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		toast.error('Failed to create schedule: ' + errorMessage);
		throw error;
	}
}

export async function addScheduleOptimistically(newSchedule: Schedule) {
	// Add immediately to the current schedules
	schedules.update(current => {
		const updated = [...current, newSchedule];
		return updated;
	});
}

export async function refreshSchedulesWithExpanded(newScheduleId: string) {
	try {
		refreshing.set(true);
		const pb = getPocketBaseClient();
		if (!pb) return;

		// Fetch the new schedule with expanded data
		const expandedSchedule = await pb.collection('schedules').getOne(newScheduleId, {
			expand: 'room_id,room_id.location_id,confirmed_by'
		});

		// Update the schedule in the list
		schedules.update(current => {
			const index = current.findIndex(s => s.id === newScheduleId);
			if (index !== -1) {
				current[index] = expandedSchedule;
				return [...current];
			}
			return current;
		});

		// Also do a full refresh to ensure consistency
		setTimeout(async () => {
			await loadSchedules();
		}, 100);

	} catch (error) {
		console.error('Error refreshing with expanded data:', error);
	} finally {
		refreshing.set(false);
	}
}

export function navigateWeek(direction: number) {
	selectedWeek.update(current => {
		const newWeek = new Date(current);
		newWeek.setDate(current.getDate() + (direction * 7));
		return newWeek;
	});
	
	// Load schedules for the new week
	loadSchedules();
}

export function goToCurrentWeek() {
	selectedWeek.set(new Date());
	loadSchedules();
}

export function getSchedulesForDate(date: Date): Schedule[] {
	const dateStr = date.toISOString().split('T')[0];
	const currentSchedules = get(schedules);
	
	return currentSchedules.filter(schedule => {
		// Handle both date formats: "YYYY-MM-DD" and "YYYY-MM-DD HH:MM:SS.sssZ"
		let scheduleDateStr = schedule.date;
		
		// Direct comparison first
		if (scheduleDateStr === dateStr) {
			return true;
		}
		
		// Try to normalize the date in case there are format differences
		try {
			if (scheduleDateStr.includes('T') || scheduleDateStr.includes(' ')) {
				// If it's a full timestamp, extract just the date part
				scheduleDateStr = new Date(scheduleDateStr).toISOString().split('T')[0];
			}
			
			if (scheduleDateStr === dateStr) {
				return true;
			}
		} catch (e) {
			console.error('Date parsing error:', e);
			return false;
		}
		
		return false;
	});
}

export function getLocationName(schedule: Schedule): string {
	return schedule.expand?.room_id?.expand?.location_id?.name || 'Unknown Location';
}

export function getRoomName(schedule: Schedule): string {
	return schedule.expand?.room_id?.name || 'Unknown Room';
}

export function getScheduleStatus(schedule: Schedule) {
	if (!schedule.is_available && schedule.confirmed_by) {
		return {
			color: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300',
			status: 'Cancelled'
		};
	}
	if (schedule.confirmed_by) {
		return {
			color: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300',
			status: 'Confirmed'
		};
	}
	return {
		color: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300',
		status: 'Pending'
	};
}

// Initialize function
export async function initializeUserSchedule() {
	try {
		console.log('🚀 Initializing user schedule store...');
		await loadLocationsAndRooms();
		await loadSchedules();
		console.log('✅ User schedule store initialized');
	} catch (error) {
		console.error('❌ Error initializing user schedule store:', error);
	}
}
