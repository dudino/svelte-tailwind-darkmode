import { writable, derived } from 'svelte/store';
import { get } from 'svelte/store';
import { getPocketBaseClient, currentUser } from '$lib/stores/authStore';
import type { RecordModel } from 'pocketbase';

interface DashboardStats {
  todayBookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  weeklyStats: {
    totalBookings: number;
    revenue: number;
    newClients: number;
    averageRating: number;
  };
  upcomingBookings: RecordModel[];
  recentClients: RecordModel[];
  roomOccupancy: {
    roomId: string;
    roomName: string;
    location: string;
    occupancyRate: number;
    totalSlots: number;
    bookedSlots: number;
  }[];
  activeUsers: RecordModel[];
  notifications: {
    id: string;
    type: 'booking' | 'client' | 'review' | 'system';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    priority: 'low' | 'medium' | 'high';
  }[];
}

interface OperatorDashboardState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  selectedDate: string;
  lastUpdated: Date | null;
  refreshInterval: number;
}

const initialStats: DashboardStats = {
  todayBookings: {
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  },
  weeklyStats: {
    totalBookings: 0,
    revenue: 0,
    newClients: 0,
    averageRating: 0,
  },
  upcomingBookings: [],
  recentClients: [],
  roomOccupancy: [],
  activeUsers: [],
  notifications: []
};

const initialState: OperatorDashboardState = {
  stats: initialStats,
  loading: false,
  error: null,
  selectedDate: new Date().toISOString().split('T')[0],
  lastUpdated: null,
  refreshInterval: 5
};

// Store
export const operatorDashboardStore = writable<OperatorDashboardState>(initialState);

// Derived stores
export const dashboardStats = derived(
  operatorDashboardStore,
  $store => $store.stats
);

export const dashboardLoading = derived(
  operatorDashboardStore,
  $store => $store.loading
);

export const dashboardError = derived(
  operatorDashboardStore,
  $store => $store.error
);

export const dashboardNotifications = derived(
  operatorDashboardStore,
  $store => $store.stats.notifications
);

export const unreadNotificationsCount = derived(
  operatorDashboardStore,
  $store => $store.stats.notifications.filter(n => !n.read).length
);

// Track loading state to prevent concurrent requests
let isCurrentlyLoading = false;

// Actions
export const operatorDashboardActions = {
  async loadDashboardData(date?: string) {
    if (isCurrentlyLoading) {
      console.log('Dashboard request already in progress, skipping...');
      return;
    }

    isCurrentlyLoading = true;
    const targetDate = date || get(operatorDashboardStore).selectedDate;
    
    operatorDashboardStore.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    try {
      const pb = getPocketBaseClient();
      const user = get(currentUser);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Loading dashboard data for date:', targetDate);

      // Fetch today's bookings with basic data
      const todayBookingsData = await pb.collection('bookings').getList(1, 100, {
        filter: `date = "${targetDate}"`,
        expand: 'client_id,service_id',
        sort: '-created'
      });

      // Calculate basic stats
      const todayBookings = {
        total: todayBookingsData.totalItems,
        confirmed: todayBookingsData.items.filter(b => b.status === 'confirmed').length,
        pending: todayBookingsData.items.filter(b => b.status === 'pending').length,
        cancelled: todayBookingsData.items.filter(b => b.status === 'cancelled').length,
      };

      // Get upcoming bookings (simpler request)
      const upcomingBookingsData = await pb.collection('bookings').getList(1, 10, {
        filter: `date > "${targetDate}"`,
        expand: 'client_id,service_id',
        sort: 'date,start_time'
      });

      // Create simple stats object
      const stats: DashboardStats = {
        todayBookings,
        weeklyStats: {
          totalBookings: todayBookings.total,
          revenue: 0,
          newClients: 0,
          averageRating: 4.5
        },
        upcomingBookings: upcomingBookingsData.items,
        recentClients: [],
        roomOccupancy: [],
        activeUsers: [],
        notifications: [
          {
            id: '1',
            type: 'booking',
            title: 'Dashboard Update',
            message: `Dashboard loaded successfully for ${targetDate}`,
            timestamp: new Date(),
            read: false,
            priority: 'low'
          }
        ]
      };

      operatorDashboardStore.update(state => ({
        ...state,
        stats,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        selectedDate: targetDate
      }));

      console.log('Dashboard data loaded successfully');
      
    } catch (error: any) {
      console.error('Dashboard data loading failed:', error);
      
      // Handle auto-cancellation gracefully
      if (error.message?.includes('autocancelled') || error.message?.includes('auto-cancellation')) {
        console.log('Request was auto-cancelled - this is normal');
        operatorDashboardStore.update(state => ({
          ...state,
          loading: false,
          error: null
        }));
      } else {
        operatorDashboardStore.update(state => ({
          ...state,
          loading: false,
          error: error.message || 'Failed to load dashboard data'
        }));
      }
    } finally {
      isCurrentlyLoading = false;
    }
  },

  async refreshData() {
    const currentDate = get(operatorDashboardStore).selectedDate;
    await this.loadDashboardData(currentDate);
  },

  setSelectedDate(date: string) {
    operatorDashboardStore.update(state => ({
      ...state,
      selectedDate: date
    }));
    this.loadDashboardData(date);
  },

  markNotificationAsRead(notificationId: string) {
    operatorDashboardStore.update(state => ({
      ...state,
      stats: {
        ...state.stats,
        notifications: state.stats.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      }
    }));
  }
};

// Auto-refresh functionality
let refreshTimer: any = null;

export function startAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  
  // Use longer interval to prevent auto-cancellation
  refreshTimer = setInterval(() => {
    console.log('Auto-refreshing dashboard data...');
    operatorDashboardActions.refreshData();
  }, 10 * 60 * 1000); // 10 minutes
}

export function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}
