// Admin Clients Store
// Centralized state management for client operations

import { writable, derived } from 'svelte/store';
import { getPocketBaseClient } from '../authStore';

// Types
interface Client {
  id: string;
  phone_number: string;
  channel: 'whatsapp' | 'telegram' | 'phone' | 'walk_in';
  nickname?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  date_of_birth?: string;
  preferred_language?: 'cz' | 'en' | 'ru' | 'de' | 'sk';
  description?: string;
  is_blocked?: boolean;
  blocked_reason?: string;
  blocked_at?: string;
  blocked_by?: string;
  last_visit_at?: string;
  total_visits?: number;
  created_by?: string;
  created: string;
  updated: string;
  expand?: any;
}

interface ClientsState {
  clients: Client[];
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
const initialState: ClientsState = {
  clients: [],
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
export const clientsStore = writable<ClientsState>(initialState);

// Derived stores
export const clients = derived(clientsStore, $state => $state.clients);
export const clientsLoading = derived(clientsStore, $state => $state.loading);
export const clientsError = derived(clientsStore, $state => $state.error);
export const clientsState = derived(clientsStore, $state => $state);
export const clientsCount = derived(clientsStore, $state => $state.totalItems);

// Filtered clients based on current filters
export const filteredClients = derived(clientsStore, $state => {
  return $state.clients.filter(client => {
    const matchesSearch = !$state.searchTerm || 
      client.nickname?.toLowerCase().includes($state.searchTerm.toLowerCase()) ||
      client.first_name?.toLowerCase().includes($state.searchTerm.toLowerCase()) ||
      client.last_name?.toLowerCase().includes($state.searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes($state.searchTerm.toLowerCase()) ||
      client.phone_number?.includes($state.searchTerm);
    
    return matchesSearch;
  });
});

// Actions
export const clientsActions = {
  async loadClients(page: number = 1, itemsPerPage: number = 10) {
    clientsStore.update(state => ({ ...state, loading: true, error: null }));

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const state = await new Promise<ClientsState>(resolve => {
        clientsStore.subscribe(s => resolve(s))();
      });

      // Build filter conditions
      let filter = '';
      const filterConditions = [];

      if (state.searchTerm) {
        filterConditions.push(`(nickname ~ "${state.searchTerm}" || first_name ~ "${state.searchTerm}" || last_name ~ "${state.searchTerm}" || email ~ "${state.searchTerm}" || phone_number ~ "${state.searchTerm}")`);
      }

      if (state.statusFilter !== 'all') {
        // Map status filter to is_blocked field
        if (state.statusFilter === 'blocked') {
          filterConditions.push(`is_blocked = true`);
        } else if (state.statusFilter === 'active') {
          filterConditions.push(`is_blocked = false`);
        }
      }

      if (filterConditions.length > 0) {
        filter = filterConditions.join(' && ');
      }

      const sortString = `${state.sortOrder === 'desc' ? '-' : ''}${state.sortBy}`;

      const result = await pb.collection('clients').getList(page, itemsPerPage, {
        filter: filter,
        sort: sortString,
        expand: 'bookings_via_client_id(count)'
      });

      clientsStore.update(state => ({
        ...state,
        clients: result.items,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: page,
        loading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load clients';
      clientsStore.update(state => ({
        ...state,
        loading: false,
        error: errorMessage
      }));
    }
  },

  async createClient(clientData: Partial<Client>) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const newClient = await pb.collection('clients').create(clientData);
      await this.loadClients();
      return newClient;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create client';
      clientsStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  async updateClient(id: string, clientData: Partial<Client>) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const updatedClient = await pb.collection('clients').update(id, clientData);
      
      clientsStore.update(state => ({
        ...state,
        clients: state.clients.map(client => client.id === id ? updatedClient : client)
      }));
      
      return updatedClient;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update client';
      clientsStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  async deleteClient(id: string) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      await pb.collection('clients').delete(id);
      
      clientsStore.update(state => ({
        ...state,
        clients: state.clients.filter(client => client.id !== id),
        totalItems: state.totalItems - 1
      }));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete client';
      clientsStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  // Get all active clients for dropdowns
  async getAllActiveClients() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await pb.collection('clients').getList(1, 100, {
        filter: 'is_blocked = false',
        sort: 'nickname,first_name,last_name',
        fields: 'id,nickname,first_name,last_name,email,phone_number'
      });

      return result.items;
    } catch (error) {
      console.error('Failed to load active clients:', error);
      return [];
    }
  },

  setSearchTerm(term: string) {
    clientsStore.update(state => ({ ...state, searchTerm: term, currentPage: 1 }));
  },

  setStatusFilter(status: string) {
    clientsStore.update(state => ({ ...state, statusFilter: status, currentPage: 1 }));
  },

  setSorting(sortBy: string, sortOrder: 'asc' | 'desc') {
    clientsStore.update(state => ({ ...state, sortBy, sortOrder, currentPage: 1 }));
  },

  clearError() {
    clientsStore.update(state => ({ ...state, error: null }));
  },

  reset() {
    clientsStore.set(initialState);
  }
};

export default clientsStore;
