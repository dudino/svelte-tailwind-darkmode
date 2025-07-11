import { writable, derived, type Readable } from 'svelte/store';
import type { User, AuthState, RolePermissions } from '$lib/types/user';

// Create the auth store
function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		isAuthenticated: false,
		isLoading: false,
		error: null
	});

	return {
		subscribe,
		
		// Login function (prototype - will be replaced with real auth)
		login: async (email: string, password: string) => {
			update(state => ({ ...state, isLoading: true, error: null }));
			
			try {
				// Simulate API call delay
				await new Promise(resolve => setTimeout(resolve, 1000));
				
				// Mock user data based on email for prototype
				const mockUser = getMockUser(email);
				
				if (!mockUser) {
					throw new Error('Invalid credentials');
				}
				
				// Store user in localStorage for persistence
				localStorage.setItem('affinity_user', JSON.stringify(mockUser));
				
				update(state => ({
					...state,
					user: mockUser,
					isAuthenticated: true,
					isLoading: false,
					error: null
				}));
				
				return { success: true };
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Login failed';
				update(state => ({
					...state,
					isLoading: false,
					error: errorMessage
				}));
				return { success: false, error: errorMessage };
			}
		},
		
		// Logout function
		logout: () => {
			localStorage.removeItem('affinity_user');
			set({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				error: null
			});
		},
		
		// Initialize auth state from localStorage
		init: () => {
			try {
				const storedUser = localStorage.getItem('affinity_user');
				if (storedUser) {
					const user = JSON.parse(storedUser);
					update(state => ({
						...state,
						user,
						isAuthenticated: true
					}));
				}
			} catch (error) {
				console.error('Failed to initialize auth state:', error);
				localStorage.removeItem('affinity_user');
			}
		},
		
		// Clear error
		clearError: () => {
			update(state => ({ ...state, error: null }));
		}
	};
}

// Mock users for prototype
function getMockUser(email: string): User | null {
	const mockUsers: Record<string, User> = {
		'admin@affinity.com': {
			id: 'admin-1',
			firstName: 'John',
			lastName: 'Administrator',
			email: 'admin@affinity.com',
			phoneNumber: '+1-555-0101',
			role: 'Administrator',
			isActive: true,
			createdAt: new Date('2024-01-01'),
			updatedAt: new Date()
		},
		'operator@affinity.com': {
			id: 'operator-1',
			firstName: 'Sarah',
			lastName: 'Operator',
			email: 'operator@affinity.com',
			phoneNumber: '+1-555-0102',
			role: 'Operator',
			isActive: true,
			createdAt: new Date('2024-01-15'),
			updatedAt: new Date()
		},
		'tiffany@affinity.com': {
			id: 'masseuse-1',
			firstName: 'Tiffany',
			lastName: 'M',
			email: 'tiffany@affinity.com',
			phoneNumber: '+1-555-0103',
			role: 'Masseuse',
			isActive: true,
			createdAt: new Date('2024-07-01'),
			updatedAt: new Date()
		},
		'monika@affinity.com': {
			id: 'masseuse-2',
			firstName: 'Monika',
			lastName: 'S',
			email: 'monika@affinity.com',
			phoneNumber: '+1-555-0104',
			role: 'Masseuse',
			isActive: true,
			createdAt: new Date('2024-06-15'),
			updatedAt: new Date()
		}
	};
	
	return mockUsers[email] || null;
}

// Create the auth store instance
export const authStore = createAuthStore();

// Derived store for current user
export const currentUser: Readable<User | null> = derived(
	authStore,
	($auth) => $auth.user
);

// Derived store for authentication status
export const isAuthenticated: Readable<boolean> = derived(
	authStore,
	($auth) => $auth.isAuthenticated
);

// Derived store for user role
export const userRole: Readable<string | null> = derived(
	currentUser,
	($user) => $user?.role || null
);

// Derived store for role-based permissions
export const permissions: Readable<RolePermissions> = derived(
	userRole,
	($role) => {
		switch ($role) {
			case 'Administrator':
				return {
					canManageUsers: true,
					canManageLocations: true,
					canManageSchedules: true,
					canCreateBookings: true,
					canViewAllBookings: true,
					canViewReports: true,
					canManageClients: true
				};
			case 'Operator':
				return {
					canManageUsers: false,
					canManageLocations: false,
					canManageSchedules: true,
					canCreateBookings: true,
					canViewAllBookings: true,
					canViewReports: false,
					canManageClients: true
				};
			case 'Masseuse':
				return {
					canManageUsers: false,
					canManageLocations: false,
					canManageSchedules: true, // Own schedule only
					canCreateBookings: false,
					canViewAllBookings: false, // Own bookings only
					canViewReports: false,
					canManageClients: false // Limited view only
				};
			default:
				return {
					canManageUsers: false,
					canManageLocations: false,
					canManageSchedules: false,
					canCreateBookings: false,
					canViewAllBookings: false,
					canViewReports: false,
					canManageClients: false
				};
		}
	}
);
