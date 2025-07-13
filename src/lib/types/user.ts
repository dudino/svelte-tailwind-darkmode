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
  
  // PocketBase auth collection fields
  email: string;
  username?: string;
  emailVisibility?: boolean;
  verified?: boolean;
  
  // Custom fields from schema
  name?: string; // corresponds to 'name' field in schema
  role: UserRole; // corresponds to 'role' field in schema (required)
  languages?: string[]; // corresponds to 'languages' field (multi-select)
  phone?: string; // corresponds to 'phone' field
  contact_details?: ContactDetails; // corresponds to 'contact_details' json field
  services?: string[]; // corresponds to 'services' relation field (array of service IDs)
  is_active?: boolean; // corresponds to 'is_active' bool field
  has_accommodation?: boolean; // corresponds to 'has_accommodation' bool field
  avatar?: string | File; // corresponds to 'avatar' file field (string URL or File object)
  last_login_at?: string; // corresponds to 'last_login_at' date field
  created_by?: string; // corresponds to 'created_by' relation field
  
  // Backwards compatibility fields (deprecated - will be mapped to schema fields)
  userId?: string; // will map to 'name' or generate from email
  nickname?: string; // will map to 'name'
  isActive?: boolean; // will map to 'is_active'
  hasAccommodation?: boolean; // will map to 'has_accommodation'
  
  // PWA sync fields
  lastSyncAt?: string;
  syncPending?: boolean;
}

// For user creation/registration (PocketBase schema based)
export interface CreateUserData {
  email: string;
  password: string;
  passwordConfirm: string;
  name?: string; // corresponds to 'name' field
  role?: UserRole; // corresponds to 'role' field
  languages?: string[]; // corresponds to 'languages' field
  phone?: string; // corresponds to 'phone' field
  contact_details?: ContactDetails; // corresponds to 'contact_details' field
  services?: string[]; // corresponds to 'services' field (array of service IDs)
  is_active?: boolean; // corresponds to 'is_active' field
  has_accommodation?: boolean; // corresponds to 'has_accommodation' field
  avatar?: string | File; // corresponds to 'avatar' field (string URL or File for upload)
  
  // Backwards compatibility (will be mapped to schema fields)
  userId?: string; // will map to 'name'
  nickname?: string; // will map to 'name'
  isActive?: boolean; // will map to 'is_active'
  hasAccommodation?: boolean; // will map to 'has_accommodation'
  contactDetails?: ContactDetails; // will map to 'contact_details'
}

// For user updates (PocketBase schema based)
export interface UpdateUserData {
  name?: string; // corresponds to 'name' field
  role?: UserRole; // corresponds to 'role' field
  languages?: string[]; // corresponds to 'languages' field
  phone?: string; // corresponds to 'phone' field
  contact_details?: ContactDetails; // corresponds to 'contact_details' field
  services?: string[]; // corresponds to 'services' field (array of service IDs)
  is_active?: boolean; // corresponds to 'is_active' field
  has_accommodation?: boolean; // corresponds to 'has_accommodation' field
  avatar?: string | File; // corresponds to 'avatar' field (string URL or File for upload)
  
  // Backwards compatibility (will be mapped to schema fields)
  nickname?: string; // will map to 'name'
  isActive?: boolean; // will map to 'is_active'
  hasAccommodation?: boolean; // will map to 'has_accommodation'
  contactDetails?: ContactDetails; // will map to 'contact_details'
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

// Available languages for the system (from PocketBase schema)
export const AVAILABLE_LANGUAGES = [
  { code: 'cz', name: 'Czech' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Russian' },
  { code: 'de', name: 'German' },
  { code: 'sk', name: 'Slovak' }
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
