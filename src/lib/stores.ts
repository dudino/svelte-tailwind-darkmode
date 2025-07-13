import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, UserRole } from '$lib/types/user';

// Remove local User interface since we're importing it from types

// Authentication store
function createAuthStore() {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		login: () => {
			set(true);
			if (browser) {
				localStorage.setItem('auth', 'true');
			}
		},
		logout: () => {
			set(false);
			if (browser) {
				localStorage.removeItem('auth');
			}
		},
		init: () => {
			if (browser) {
				const auth = localStorage.getItem('auth');
				set(auth === 'true');
			}
		}
	};
}

export const isAuthenticated = createAuthStore();

// Initialize auth state when in browser
if (browser) {
	isAuthenticated.init();
}

// User stores
export const user = writable<User | null>(null);
export const currentUser = writable<User | null>(null);
// User stores with localStorage sync
function createUsersStore() {
	const { subscribe, set, update } = writable<User[]>([]);

	return {
		subscribe,
		set: (users: User[]) => {
			set(users);
			if (browser) {
				localStorage.setItem('users', JSON.stringify(users));
			}
		},
		update: (fn: (users: User[]) => User[]) => {
			update((users) => {
				const newUsers = fn(users);
				if (browser) {
					localStorage.setItem('users', JSON.stringify(newUsers));
				}
				return newUsers;
			});
		}
	};
}

export const users = createUsersStore();
export const selectedUser = writable<User | null>(null);

// Loading and error states
export const isLoading = writable(false);
export const error = writable('');
export const syncStatus = writable('idle');

// Theme store (if not already handled by mode-watcher)
export const theme = writable('light');

// Auth functions that might be needed
export const login = async (email: string, password: string): Promise<boolean> => {
	// TODO: Implement actual PocketBase authentication
	isLoading.set(true);
	error.set('');
	
	try {
		// Simulate API call
		if (email === 'admin@massage.com' && password === 'admin123456') {
			isAuthenticated.login();
			currentUser.set({
				id: '1',
				email: 'admin@massage.com',
				name: 'Admin',
				phone: '+420123456789',
				role: 'administrator',
				is_active: true,
				has_accommodation: false,
				languages: ['en', 'cz'],
				services: []
			});
			return true;
		} else {
			throw new Error('Invalid credentials');
		}
	} catch (err) {
		error.set(err instanceof Error ? err.message : 'Login failed');
		return false;
	} finally {
		isLoading.set(false);
	}
};

export const logout = () => {
	isAuthenticated.logout();
	currentUser.set(null);
	user.set(null);
};

export const createUser = async (userData: Partial<User>) => {
	// TODO: Implement actual user creation
	isLoading.set(true);
	error.set('');
	
	try {
		// Simulate API call
		const newUser: User = { 
			...userData, 
			id: Date.now().toString(),
			email: userData.email || '',
			name: userData.name || userData.nickname || '',
			phone: userData.phone || '',
			role: userData.role || 'user',
			is_active: userData.is_active ?? userData.isActive ?? true,
			has_accommodation: userData.has_accommodation ?? userData.hasAccommodation ?? false,
			languages: userData.languages || [],
			services: userData.services || []
		};
		users.update(list => [...list, newUser]);
		return newUser;
	} catch (err) {
		error.set(err instanceof Error ? err.message : 'Failed to create user');
		throw err;
	} finally {
		isLoading.set(false);
	}
};

export const updateUser = async (id: string, userData: Partial<User>) => {
	// TODO: Implement actual user update
	isLoading.set(true);
	error.set('');
	
	try {
		// Simulate API call
		users.update(list => list.map(user => 
			user.id === id ? { ...user, ...userData } : user
		));
		return userData;
	} catch (err) {
		error.set(err instanceof Error ? err.message : 'Failed to update user');
		throw err;
	} finally {
		isLoading.set(false);
	}
};

export const deleteUser = async (id: string) => {
	// TODO: Implement actual user deletion
	isLoading.set(true);
	error.set('');
	
	try {
		// Simulate API call
		users.update(list => list.filter(user => user.id !== id));
		return true;
	} catch (err) {
		error.set(err instanceof Error ? err.message : 'Failed to delete user');
		throw err;
	} finally {
		isLoading.set(false);
	}
};

export const fetchUsers = async () => {
	// TODO: Implement actual user fetching
	isLoading.set(true);
	error.set('');
	
	try {
		// Simulate API call - for now return demo data
		const demoUsers: User[] = [
			{
				id: '1',
				email: 'admin@massage.com',
				name: 'Admin',
				phone: '+420123456789',
				role: 'administrator',
				is_active: true,
				has_accommodation: false,
				languages: ['en', 'cz'],
				services: []
			},
			{
				id: '2',
				email: 'operator@massage.com',
				name: 'Operator',
				phone: '+420987654321',
				role: 'operator',
				is_active: true,
				has_accommodation: false,
				languages: ['en', 'cz', 'ru'],
				services: []
			},
			{
				id: '3',
				email: 'massage1@massage.com',
				name: 'Therapist1',
				phone: '+420555666777',
				role: 'user',
				is_active: true,
				has_accommodation: true,
				languages: ['en', 'cz'],
				services: ['olejove', 'relaxacni', 'klasicka']
			}
		];
		users.set(demoUsers);
		return demoUsers;
	} catch (err) {
		error.set(err instanceof Error ? err.message : 'Failed to fetch users');
		throw err;
	} finally {
		isLoading.set(false);
	}
};

// Additional functions needed by UserManagement
export const register = async (userData: Partial<User>) => {
	// Alias for createUser
	return createUser(userData);
};

export const fetchUsersFromServer = async () => {
	// Alias for fetchUsers to match component expectations
	return fetchUsers();
};

export const syncData = async () => {
	// TODO: Implement actual data synchronization
	syncStatus.set('syncing');
	
	try {
		// Simulate sync operation
		await fetchUsers();
		syncStatus.set('synced');
		return true;
	} catch (err) {
		syncStatus.set('error');
		error.set(err instanceof Error ? err.message : 'Sync failed');
		throw err;
	}
};

export const loadUsersFromStorage = async () => {
	// TODO: Implement loading from local storage
	if (browser) {
		try {
			const stored = localStorage.getItem('users');
			if (stored) {
				const storedUsers = JSON.parse(stored);
				users.set(storedUsers);
				return storedUsers;
			}
		} catch (err) {
			console.warn('Failed to load users from storage:', err);
		}
	}
	// Fallback to server fetch
	return fetchUsers();
};

export const selectUser = (user: User | null) => {
	selectedUser.set(user);
};
