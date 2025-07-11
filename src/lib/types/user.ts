export type UserRole = 'Administrator' | 'Operator' | 'Masseuse';

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	role: UserRole;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface Masseuse extends User {
	specializations: string[];
	bio?: string;
	profileImageUrl?: string;
	availability: Record<string, { start: string; end: string }>;
	height: number;
	weight: number;
	breasts: number;
	age: number;
	statusNotes?: string;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

export interface RolePermissions {
	canManageUsers: boolean;
	canManageLocations: boolean;
	canManageSchedules: boolean;
	canCreateBookings: boolean;
	canViewAllBookings: boolean;
	canViewReports: boolean;
	canManageClients: boolean;
}
