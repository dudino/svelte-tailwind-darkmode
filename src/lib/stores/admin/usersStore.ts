// Admin Users Store
// Centralized state management for admin user operations

import { writable, derived } from 'svelte/store';
import { getPocketBaseClient } from '../authStore';
import { deleteRecord } from '$lib/utils/deleteHandler';

// Types
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatar?: string;
  verified: boolean;
  created: string;
  updated: string;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  searchTerm: string;
  roleFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Initial state
const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalItems: 0,
  totalPages: 0,
  searchTerm: '',
  roleFilter: 'all',
  sortBy: 'created',
  sortOrder: 'desc'
};

// Main store
export const usersStore = writable<UsersState>(initialState);

// Derived stores for easy access
export const users = derived(usersStore, $state => $state.users);
export const usersLoading = derived(usersStore, $state => $state.loading);
export const usersError = derived(usersStore, $state => $state.error);
export const usersState = derived(usersStore, $state => $state);
export const usersCount = derived(usersStore, $state => $state.totalItems);

// Filtered users based on current filters
export const filteredUsers = derived(usersStore, $state => {
  if (!$state.searchTerm && $state.roleFilter === 'all') {
    return $state.users;
  }
  
  return $state.users.filter(user => {
    const matchesSearch = !$state.searchTerm || 
      user.name?.toLowerCase().includes($state.searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes($state.searchTerm.toLowerCase());
    
    const matchesRole = $state.roleFilter === 'all' || user.role === $state.roleFilter;
    
    return matchesSearch && matchesRole;
  });
});

// Actions
export const usersActions = {
  // Load users with filters and pagination
  async loadUsers(page: number = 1, itemsPerPage: number = 10) {
    usersStore.update(state => ({ ...state, loading: true, error: null }));

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const state = await new Promise<UsersState>(resolve => {
        usersStore.subscribe(s => resolve(s))();
      });

      // Build filter conditions
      let filter = '';
      const filterConditions = [];

      if (state.searchTerm) {
        filterConditions.push(`(email ~ "${state.searchTerm}" || name ~ "${state.searchTerm}")`);
      }

      if (state.roleFilter !== 'all') {
        filterConditions.push(`role = "${state.roleFilter}"`);
      }

      if (filterConditions.length > 0) {
        filter = filterConditions.join(' && ');
      }

      // Build sort string
      const sortString = `${state.sortOrder === 'desc' ? '-' : ''}${state.sortBy}`;

      const result = await pb.collection('users').getList(page, itemsPerPage, {
        filter: filter,
        sort: sortString
      });

      usersStore.update(state => ({
        ...state,
        users: result.items,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: page,
        loading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load users';
      usersStore.update(state => ({
        ...state,
        loading: false,
        error: errorMessage
      }));
    }
  },

  // Create new user
  async createUser(userData: Partial<User>) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const newUser = await pb.collection('users').create(userData);
      
      // Reload users to get updated list
      await this.loadUsers();
      
      return newUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      usersStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  // Update user
  async updateUser(id: string, userData: Partial<User>) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const updatedUser = await pb.collection('users').update(id, userData);
      
      // Update the user in the store
      usersStore.update(state => ({
        ...state,
        users: state.users.map(user => user.id === id ? updatedUser : user)
      }));
      
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      usersStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  // Delete user
  async deleteUser(id: string) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await deleteRecord('users', id);
      
      if (result.success) {
        if (result.method === 'hard') {
          // Remove user from store completely
          usersStore.update(state => ({
            ...state,
            users: state.users.filter(user => user.id !== id),
            totalItems: state.totalItems - 1
          }));
        } else if (result.method === 'soft') {
          // Update user's is_active status in store
          usersStore.update(state => ({
            ...state,
            users: state.users.map(user => 
              user.id === id ? { ...user, is_active: false } : user
            )
          }));
        }
        
        return { success: true, message: result.message };
      } else {
        const errorMessage = result.message || 'Failed to delete user';
        usersStore.update(state => ({ ...state, error: errorMessage }));
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      usersStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  // Set filters (for component convenience)
  setFilters(filters: { search?: string; role?: string; status?: string }) {
    usersStore.update(state => ({
      ...state,
      searchTerm: filters.search || '',
      roleFilter: filters.role || 'all',
      currentPage: 1
    }));
  },

  // Set search term
  setSearchTerm(term: string) {
    usersStore.update(state => ({ ...state, searchTerm: term, currentPage: 1 }));
  },

  // Set role filter
  setRoleFilter(role: string) {
    usersStore.update(state => ({ ...state, roleFilter: role, currentPage: 1 }));
  },

  // Set sorting
  setSorting(sortBy: string, sortOrder: 'asc' | 'desc') {
    usersStore.update(state => ({ ...state, sortBy, sortOrder, currentPage: 1 }));
  },

  // Clear error
  clearError() {
    usersStore.update(state => ({ ...state, error: null }));
  },

  // Reset store
  reset() {
    usersStore.set(initialState);
  }
};

export default usersStore;
