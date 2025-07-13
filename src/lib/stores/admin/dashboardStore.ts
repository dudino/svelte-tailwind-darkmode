// Admin Dashboard Store
// Centralized state management for dashboard statistics and data

import { writable, derived } from 'svelte/store';
import { getPocketBaseClient } from '../authStore';

// Types
interface DashboardStats {
  users: number;
  locations: number;
  rooms: number;
  services: number;
  clients: number;
  bookings: number;
  reviews: number;
  schedules: number;
}

interface DashboardState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  recentBookings: any[];
  recentReviews: any[];
  recentUsers: any[];
  todayBookings: any[];
}

// Initial state
const initialState: DashboardState = {
  stats: {
    users: 0,
    locations: 0,
    rooms: 0,
    services: 0,
    clients: 0,
    bookings: 0,
    reviews: 0,
    schedules: 0
  },
  loading: false,
  error: null,
  recentBookings: [],
  recentReviews: [],
  recentUsers: [],
  todayBookings: []
};

// Main store
export const dashboardStore = writable<DashboardState>(initialState);

// Derived stores
export const dashboardStats = derived(dashboardStore, $state => $state.stats);
export const dashboardLoading = derived(dashboardStore, $state => $state.loading);
export const dashboardError = derived(dashboardStore, $state => $state.error);
export const recentBookings = derived(dashboardStore, $state => $state.recentBookings);
export const recentReviews = derived(dashboardStore, $state => $state.recentReviews);
export const recentUsers = derived(dashboardStore, $state => $state.recentUsers);
export const todayBookings = derived(dashboardStore, $state => $state.todayBookings);

// Actions
export const dashboardActions = {
  async loadDashboardStats() {
    dashboardStore.update(state => ({ ...state, loading: true, error: null }));

    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      // Load counts from each collection in parallel
      const [
        usersCount,
        locationsCount,
        roomsCount,
        servicesCount,
        clientsCount,
        bookingsCount,
        reviewsCount,
        schedulesCount
      ] = await Promise.all([
        pb.collection('users').getList(1, 1, { fields: 'id' }).then((result: any) => result.totalItems).catch(() => 0),
        pb.collection('locations').getList(1, 1, { fields: 'id' }).then((result: any) => result.totalItems).catch(() => 0),
        pb.collection('rooms').getList(1, 1, { fields: 'id' }).then((result: any) => result.totalItems).catch(() => 0),
        pb.collection('services').getList(1, 1, { fields: 'id' }).then((result: any) => result.totalItems).catch(() => 0),
        pb.collection('clients').getList(1, 1, { fields: 'id' }).then((result: any) => result.totalItems).catch(() => 0),
        pb.collection('bookings').getList(1, 1, { fields: 'id' }).then((result: any) => result.totalItems).catch(() => 0),
        pb.collection('reviews').getList(1, 1, { fields: 'id' }).then((result: any) => result.totalItems).catch(() => 0),
        pb.collection('schedules').getList(1, 1, { fields: 'id' }).then((result: any) => result.totalItems).catch(() => 0)
      ]);

      const stats: DashboardStats = {
        users: usersCount,
        locations: locationsCount,
        rooms: roomsCount,
        services: servicesCount,
        clients: clientsCount,
        bookings: bookingsCount,
        reviews: reviewsCount,
        schedules: schedulesCount
      };

      dashboardStore.update(state => ({
        ...state,
        stats,
        loading: false
      }));

      // Also load recent activity
      await this.loadRecentActivity();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard stats';
      dashboardStore.update(state => ({
        ...state,
        loading: false,
        error: errorMessage
      }));
    }
  },

  async loadRecentActivity() {
    try {
      const pb = getPocketBaseClient();
      if (!pb) throw new Error('PocketBase client not available');

      // Load recent data in parallel
      const [recentBookings, recentReviews, recentUsers, todayBookings] = await Promise.all([
        // Recent bookings
        pb.collection('bookings').getList(1, 5, {
          sort: '-created',
          expand: 'client_id,service_id,user_id'
        }).then((result: any) => result.items).catch(() => []),

        // Recent reviews
        pb.collection('reviews').getList(1, 5, {
          filter: 'is_published = true',
          sort: '-created',
          expand: 'client_id,user_id'
        }).then((result: any) => result.items).catch(() => []),

        // Recent users
        pb.collection('users').getList(1, 5, {
          sort: '-created',
          fields: 'id,name,email,role,created'
        }).then((result: any) => result.items).catch(() => []),

        // Today's bookings
        pb.collection('bookings').getList(1, 10, {
          filter: `date = "${new Date().toISOString().split('T')[0]}"`,
          sort: 'start_time',
          expand: 'client_id,service_id,user_id'
        }).then((result: any) => result.items).catch(() => [])
      ]);

      dashboardStore.update(state => ({
        ...state,
        recentBookings,
        recentReviews,
        recentUsers,
        todayBookings
      }));

    } catch (error) {
      console.error('Failed to load recent activity:', error);
    }
  },

  async loadFullDashboard() {
    // Load both stats and recent activity
    await Promise.all([
      this.loadDashboardStats(),
      this.loadRecentActivity()
    ]);
  },

  clearError() {
    dashboardStore.update(state => ({ ...state, error: null }));
  },

  reset() {
    dashboardStore.set(initialState);
  }
};

export default dashboardStore;
