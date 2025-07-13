// Admin Bookings Store
// Centralized state management for booking operations

import { writable, derived } from 'svelte/store';
import { getPocketBaseClient } from '../authStore';
import { deleteRecord } from '$lib/utils/deleteHandler';

// Types
interface Booking {
  id: string;
  client_id: string;
  service_id: string;
  location_id: string;
  room_id?: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  price?: number;
  created: string;
  updated: string;
  expand?: any;
}

interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Initial state
const initialState: BookingsState = {
  bookings: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalItems: 0,
  totalPages: 0,
  searchTerm: '',
  statusFilter: 'all',
  dateFilter: 'all',
  sortBy: 'created',
  sortOrder: 'desc'
};

// Main store
export const bookingsStore = writable<BookingsState>(initialState);

// Derived stores
export const bookings = derived(bookingsStore, $state => $state.bookings);
export const bookingsLoading = derived(bookingsStore, $state => $state.loading);
export const bookingsError = derived(bookingsStore, $state => $state.error);
export const bookingsState = derived(bookingsStore, $state => $state);
export const bookingsCount = derived(bookingsStore, $state => $state.totalItems);

// Filtered bookings based on current filters
export const filteredBookings = derived(bookingsStore, $state => {
  return $state.bookings.filter(booking => {
    const matchesSearch = !$state.searchTerm || 
      booking.client_id?.toLowerCase().includes($state.searchTerm.toLowerCase()) ||
      booking.service_id?.toLowerCase().includes($state.searchTerm.toLowerCase()) ||
      booking.notes?.toLowerCase().includes($state.searchTerm.toLowerCase());
    
    const matchesStatus = $state.statusFilter === 'all' || booking.status === $state.statusFilter;
    
    return matchesSearch && matchesStatus;
  });
});

// Actions
export const bookingsActions = {
  async loadBookings(page: number = 1, itemsPerPage: number = 10) {
    bookingsStore.update(state => ({ ...state, loading: true, error: null }));

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const state = await new Promise<BookingsState>(resolve => {
        bookingsStore.subscribe(s => resolve(s))();
      });

      // Build filter conditions
      let filter = '';
      const filterConditions = [];

      if (state.searchTerm) {
        filterConditions.push(`(notes ~ "${state.searchTerm}")`);
      }

      if (state.statusFilter !== 'all') {
        filterConditions.push(`status = "${state.statusFilter}"`);
      }

      if (state.dateFilter !== 'all') {
        const today = new Date().toISOString().split('T')[0];
        switch (state.dateFilter) {
          case 'today':
            filterConditions.push(`date = "${today}"`);
            break;
          case 'upcoming':
            filterConditions.push(`date >= "${today}"`);
            break;
          case 'past':
            filterConditions.push(`date < "${today}"`);
            break;
        }
      }

      if (filterConditions.length > 0) {
        filter = filterConditions.join(' && ');
      }

      const sortString = `${state.sortOrder === 'desc' ? '-' : ''}${state.sortBy}`;

      const result = await pb.collection('bookings').getList(page, itemsPerPage, {
        filter: filter,
        sort: sortString,
        expand: 'client_id,service_id,location_id,room_id,user_id'
      });

      bookingsStore.update(state => ({
        ...state,
        bookings: result.items,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: page,
        loading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bookings';
      bookingsStore.update(state => ({
        ...state,
        loading: false,
        error: errorMessage
      }));
    }
  },

  async createBooking(bookingData: Partial<Booking>) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const newBooking = await pb.collection('bookings').create(bookingData);
      await this.loadBookings();
      return newBooking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      bookingsStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  async updateBooking(id: string, bookingData: Partial<Booking>) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const updatedBooking = await pb.collection('bookings').update(id, bookingData);
      
      bookingsStore.update(state => ({
        ...state,
        bookings: state.bookings.map(booking => booking.id === id ? updatedBooking : booking)
      }));
      
      return updatedBooking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking';
      bookingsStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  async deleteBooking(id: string) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const result = await deleteRecord('bookings', id);
      
      if (result.success) {
        // Bookings don't have is_active field, so this will always be hard delete
        bookingsStore.update(state => ({
          ...state,
          bookings: state.bookings.filter(booking => booking.id !== id),
          totalItems: state.totalItems - 1
        }));
        
        return { success: true, message: result.message };
      } else {
        const errorMessage = result.message || 'Failed to delete booking';
        bookingsStore.update(state => ({ ...state, error: errorMessage }));
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete booking';
      bookingsStore.update(state => ({ ...state, error: errorMessage }));
      throw error;
    }
  },

  // Get bookings for today
  async getTodayBookings() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const today = new Date().toISOString().split('T')[0];
      
      const result = await pb.collection('bookings').getList(1, 50, {
        filter: `date = "${today}"`,
        sort: 'start_time',
        expand: 'client_id,service_id,location_id,user_id'
      });

      return result.items;
    } catch (error) {
      console.error('Failed to load today bookings:', error);
      return [];
    }
  },

  // Get upcoming bookings
  async getUpcomingBookings(limit: number = 10) {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      const today = new Date().toISOString().split('T')[0];
      
      const result = await pb.collection('bookings').getList(1, limit, {
        filter: `date >= "${today}" && status != "cancelled"`,
        sort: 'date,start_time',
        expand: 'client_id,service_id,location_id'
      });

      return result.items;
    } catch (error) {
      console.error('Failed to load upcoming bookings:', error);
      return [];
    }
  },

  setSearchTerm(term: string) {
    bookingsStore.update(state => ({ ...state, searchTerm: term, currentPage: 1 }));
  },

  setStatusFilter(status: string) {
    bookingsStore.update(state => ({ ...state, statusFilter: status, currentPage: 1 }));
  },

  setDateFilter(dateFilter: string) {
    bookingsStore.update(state => ({ ...state, dateFilter, currentPage: 1 }));
  },

  setSorting(sortBy: string, sortOrder: 'asc' | 'desc') {
    bookingsStore.update(state => ({ ...state, sortBy, sortOrder, currentPage: 1 }));
  },

  clearError() {
    bookingsStore.update(state => ({ ...state, error: null }));
  },

  reset() {
    bookingsStore.set(initialState);
  }
};

export default bookingsStore;
