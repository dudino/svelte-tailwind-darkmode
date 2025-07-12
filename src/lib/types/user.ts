/**
 * User types and interfaces for the PWA application
 * Compatible with PocketBase schema
 */

export type UserRole = 'user' | 'operator' | 'administrator';

export interface ContactDetails {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  idNumber?: string;
  streetName?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

export interface User {
  id: string;
  created?: string;
  updated?: string;
  
  // Required fields (marked with * in your spec)
  userId: string;
  email: string;
  nickname: string;
  phone: string;
  
  // User management fields
  role: UserRole;
  isActive: boolean;
  hasAccommodation: boolean;
  
  // Optional arrays
  languages: string[];
  services: string[];
  
  // Contact details object
  contactDetails?: ContactDetails;
  
  // Authentication fields (for PocketBase)
  username?: string;
  emailVisibility?: boolean;
  verified?: boolean;
  
  // Additional profile fields
  avatar?: string;
  
  // PWA sync fields
  lastSyncAt?: string;
  syncPending?: boolean;
}

// For user creation/registration
export interface CreateUserData {
  userId: string;
  email: string;
  nickname: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  role?: UserRole;
  isActive?: boolean;
  hasAccommodation?: boolean;
  languages?: string[];
  services?: string[];
  contactDetails?: ContactDetails;
}

// For user updates
export interface UpdateUserData {
  nickname?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  hasAccommodation?: boolean;
  languages?: string[];
  services?: string[];
  contactDetails?: ContactDetails;
  avatar?: string;
}

// Authentication responses
export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  offline?: boolean;
}

// PocketBase collection names
export const COLLECTIONS = {
  USERS: 'users',
  CLIENTS: 'clients',
  BOOKINGS: 'bookings',
  SCHEDULES: 'schedules',
  LOCATIONS: 'locations',
  ROOMS: 'rooms',
  SERVICES: 'services',
  REVIEWS: 'reviews',
  NOTES: 'notes'
} as const;

// Available languages for the system
export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'cs', name: 'Czech' },
  { code: 'ru', name: 'Russian' }
] as const;

// Available services (you can expand this based on your needs)
export const AVAILABLE_SERVICES = [
  'olejove',
  'aromaterapia', 
  'sportova',
  'relaxacni',
  'klasicka',
  'terapeuticka'
] as const;

// User role permissions
export const ROLE_PERMISSIONS = {
  user: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canViewOwnSchedule: true,
    canManageOwnBookings: true
  },
  operator: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canViewOwnSchedule: true,
    canManageOwnBookings: true,
    canViewAllSchedules: true,
    canManageBookings: true,
    canViewClients: true,
    canManageClients: true,
    canGeneratePinCodes: true,
    canConfirmBookings: true,
    canViewReviews: true
  },
  administrator: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canViewOwnSchedule: true,
    canManageOwnBookings: true,
    canViewAllSchedules: true,
    canManageBookings: true,
    canViewClients: true,
    canManageClients: true,
    canGeneratePinCodes: true,
    canConfirmBookings: true,
    canViewReviews: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canListUsers: true,
    canSearchUsers: true,
    canViewUserDetails: true,
    canAssignRoles: true,
    canChangeUserStatus: true
  }
} as const;

// Sync queue item for offline operations
export interface SyncQueueItem {
  id: string;
  collection: string;
  operation: 'create' | 'update' | 'delete';
  data?: any;
  recordId?: string;
  timestamp: number;
  attempts?: number;
  lastAttempt?: number;
}
