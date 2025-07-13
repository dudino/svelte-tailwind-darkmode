// Admin Locations Store
// Centralized state management for location operations

import { writable, derived } from 'svelte/store';
import { getPocketBaseClient } from '../authStore';
import { deleteRecord } from '$lib/utils/deleteHandler';

// Types
interface Location {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  opening_hours?: any;
  description?: string;
  is_active: boolean;
  created: string;
  updated: string;
}

interface LocationsState {
  locations: Location[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Initial state
const initialState: LocationsState = {
  locations: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalItems: 0,
  totalPages: 0,
  searchTerm: '',
  statusFilter: 'all',
  sortBy: 'created',
  sortOrder: 'desc'
};

// Main store
export const locationsStore = writable<LocationsState>(initialState);

// Derived stores
export const locations = derived(locationsStore, $state => $state.locations);
export const locationsLoading = derived(locationsStore, $state => $state.loading);
export const locationsError = derived(locationsStore, $state => $state.error);
export const locationsState = derived(locationsStore, $state => $state);
export const locationsCount = derived(locationsStore, $state => $state.totalItems);

// Filtered locations based on current filters
export const filteredLocations = derived(locationsStore, $state => {
  if (!$state.searchTerm && $state.statusFilter === 'all') {
    return $state.locations;
  }
  
  return $state.locations.filter(location => {
    const matchesSearch = !$state.searchTerm || 
      location.name?.toLowerCase().includes($state.searchTerm.toLowerCase()) ||
      location.address?.toLowerCase().includes($state.searchTerm.toLowerCase());
    
    const matchesStatus = $state.statusFilter === 'all' || 
      ($state.statusFilter === 'active' && location.is_active) ||
      ($state.statusFilter === 'inactive' && !location.is_active);
    
    return matchesSearch && matchesStatus;
  });
});

// Actions
export const locationsActions = {
  async loadLocations(page: number = 1, itemsPerPage: number = 10) {
    locationsStore.update(state => ({ ...state, loading: true, error: null }));

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const state = await new Promise<LocationsState>(resolve => {
        locationsStore.subscribe(s => resolve(s))();
      });

      // Build filter conditions
      let filter = '';
      const filterConditions = [];

      if (state.searchTerm) {
        filterConditions.push(`(name ~ "${state.searchTerm}" || address ~ "${state.searchTerm}")`);
      }

      if (state.statusFilter !== 'all') {
        const isActive = state.statusFilter === 'active';
        filterConditions.push(`is_active = ${isActive}`);
      }

      if (filterConditions.length > 0) {
        filter = filterConditions.join(' && ');
      }

      const sortString = `${state.sortOrder === 'desc' ? '-' : ''}${state.sortBy}`;

      const result = await pb.collection('locations').getList(page, itemsPerPage, {
        filter: filter,
        sort: sortString,
        expand: 'rooms_via_location_id(count)'
      });

      locationsStore.update(state => ({
        ...state,
        locations: result.items,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: page,
        loading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load locations';
      locationsStore.update(state => ({
        ...state,
        loading: false,
        error: errorMessage
      }));
    }
  },

  async createLocation(locationData: Partial<Location>) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const newLocation = await pb.collection('locations').create(locationData);
      await this.loadLocations();
      return newLocation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create location';
      locationsStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  async updateLocation(id: string, locationData: Partial<Location>) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const updatedLocation = await pb.collection('locations').update(id, locationData);
      
      locationsStore.update(state => ({
        ...state,
        locations: state.locations.map(location => location.id === id ? updatedLocation : location)
      }));
      
      return updatedLocation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update location';
      locationsStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  async deleteLocation(id: string) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await deleteRecord('locations', id);
      
      if (result.success) {
        if (result.method === 'hard') {
          // Remove location from store completely
          locationsStore.update(state => ({
            ...state,
            locations: state.locations.filter(location => location.id !== id),
            totalItems: state.totalItems - 1
          }));
        } else if (result.method === 'soft') {
          // Update location's is_active status in store
          locationsStore.update(state => ({
            ...state,
            locations: state.locations.map(location => 
              location.id === id ? { ...location, is_active: false } : location
            )
          }));
        }
        
        return { success: true, message: result.message };
      } else {
        const errorMessage = result.message || 'Failed to delete location';
        locationsStore.update(state => ({ ...state, error: errorMessage }));
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete location';
      locationsStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  // Get all active locations for dropdowns
  async getAllActiveLocations() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await pb.collection('locations').getList(1, 100, {
        filter: 'is_active = true',
        sort: 'name',
        fields: 'id,name'
      });

      return result.items;
    } catch (error) {
      console.error('Failed to load active locations:', error);
      return [];
    }
  },

  // Set filters (for component convenience)
  setFilters(filters: { search?: string; status?: string }) {
    locationsStore.update(state => ({
      ...state,
      searchTerm: filters.search || '',
      statusFilter: filters.status || 'all',
      currentPage: 1
    }));
  },

  setSearchTerm(term: string) {
    locationsStore.update(state => ({ ...state, searchTerm: term, currentPage: 1 }));
  },

  setStatusFilter(status: string) {
    locationsStore.update(state => ({ ...state, statusFilter: status, currentPage: 1 }));
  },

  setSorting(sortBy: string, sortOrder: 'asc' | 'desc') {
    locationsStore.update(state => ({ ...state, sortBy, sortOrder, currentPage: 1 }));
  },

  clearError() {
    locationsStore.update(state => ({ ...state, error: null }));
  },

  reset() {
    locationsStore.set(initialState);
  }
};

export default locationsStore;
