// Admin Services Store
// Centralized state management for service operations

import { writable, derived } from 'svelte/store';
import { getPocketBaseClient } from '../authStore';

// Types
interface Service {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  category?: string;
  is_active: boolean;
  created: string;
  updated: string;
}

interface ServicesState {
  services: Service[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  searchTerm: string;
  categoryFilter: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Initial state
const initialState: ServicesState = {
  services: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalItems: 0,
  totalPages: 0,
  searchTerm: '',
  categoryFilter: 'all',
  statusFilter: 'all',
  sortBy: 'created',
  sortOrder: 'desc'
};

// Main store
export const servicesStore = writable<ServicesState>(initialState);

// Derived stores
export const services = derived(servicesStore, $state => $state.services);
export const servicesLoading = derived(servicesStore, $state => $state.loading);
export const servicesError = derived(servicesStore, $state => $state.error);
export const servicesState = derived(servicesStore, $state => $state);
export const servicesCount = derived(servicesStore, $state => $state.totalItems);

// Filtered services based on current filters
export const filteredServices = derived(servicesStore, $state => {
  if (!$state.searchTerm && $state.statusFilter === 'all') {
    return $state.services;
  }
  
  return $state.services.filter(service => {
    const matchesSearch = !$state.searchTerm || 
      service.name?.toLowerCase().includes($state.searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes($state.searchTerm.toLowerCase());
    
    const matchesStatus = $state.statusFilter === 'all' || 
      ($state.statusFilter === 'active' && service.is_active) ||
      ($state.statusFilter === 'inactive' && !service.is_active);
    
    return matchesSearch && matchesStatus;
  });
});

// Actions
export const servicesActions = {
  async loadServices(page: number = 1, itemsPerPage: number = 10) {
    servicesStore.update(state => ({ ...state, loading: true, error: null }));

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const state = await new Promise<ServicesState>(resolve => {
        servicesStore.subscribe(s => resolve(s))();
      });

      // Build filter conditions
      let filter = '';
      const filterConditions = [];

      if (state.searchTerm) {
        filterConditions.push(`(name ~ "${state.searchTerm}" || description ~ "${state.searchTerm}")`);
      }

      if (state.categoryFilter !== 'all') {
        filterConditions.push(`category = "${state.categoryFilter}"`);
      }

      if (state.statusFilter !== 'all') {
        const isActive = state.statusFilter === 'active';
        filterConditions.push(`is_active = ${isActive}`);
      }

      if (filterConditions.length > 0) {
        filter = filterConditions.join(' && ');
      }

      const sortString = `${state.sortOrder === 'desc' ? '-' : ''}${state.sortBy}`;

      const result = await pb.collection('services').getList(page, itemsPerPage, {
        filter: filter,
        sort: sortString,
        expand: 'bookings_via_service_id(count)'
      });

      servicesStore.update(state => ({
        ...state,
        services: result.items,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: page,
        loading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load services';
      servicesStore.update(state => ({
        ...state,
        loading: false,
        error: errorMessage
      }));
    }
  },

  async createService(serviceData: Partial<Service>) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const newService = await pb.collection('services').create(serviceData);
      await this.loadServices();
      return newService;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service';
      servicesStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  async updateService(id: string, serviceData: Partial<Service>) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const updatedService = await pb.collection('services').update(id, serviceData);
      
      servicesStore.update(state => ({
        ...state,
        services: state.services.map(service => service.id === id ? updatedService : service)
      }));
      
      return updatedService;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update service';
      servicesStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  async deleteService(id: string) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      await pb.collection('services').delete(id);
      
      servicesStore.update(state => ({
        ...state,
        services: state.services.filter(service => service.id !== id),
        totalItems: state.totalItems - 1
      }));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete service';
      servicesStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  // Get all active services for dropdowns
  async getAllActiveServices() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await pb.collection('services').getList(1, 100, {
        filter: 'is_active = true',
        sort: 'name',
        fields: 'id,name,duration_minutes,price'
      });

      return result.items;
    } catch (error) {
      console.error('Failed to load active services:', error);
      return [];
    }
  },

  // Get service categories
  async getServiceCategories() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await pb.collection('services').getList(1, 200, {
        fields: 'category'
      });

      const categories = [...new Set(result.items.map((item: any) => item.category).filter(Boolean))];
      return categories;
    } catch (error) {
      console.error('Failed to load service categories:', error);
      return [];
    }
  },

  // Set filters (for component convenience)
  setFilters(filters: { search?: string; status?: string }) {
    servicesStore.update(state => ({
      ...state,
      searchTerm: filters.search || '',
      statusFilter: filters.status || 'all',
      currentPage: 1
    }));
  },

  setSearchTerm(term: string) {
    servicesStore.update(state => ({ ...state, searchTerm: term, currentPage: 1 }));
  },

  setCategoryFilter(category: string) {
    servicesStore.update(state => ({ ...state, categoryFilter: category, currentPage: 1 }));
  },

  setStatusFilter(status: string) {
    servicesStore.update(state => ({ ...state, statusFilter: status, currentPage: 1 }));
  },

  setSorting(sortBy: string, sortOrder: 'asc' | 'desc') {
    servicesStore.update(state => ({ ...state, sortBy, sortOrder, currentPage: 1 }));
  },

  clearError() {
    servicesStore.update(state => ({ ...state, error: null }));
  },

  reset() {
    servicesStore.set(initialState);
  }
};

export default servicesStore;
