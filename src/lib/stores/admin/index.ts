// Admin Stores Index
// Central export file for all admin stores

// Individual stores
export { default as usersStore, usersActions, users, usersLoading, usersError, usersState, filteredUsers, usersCount } from './usersStore';
export { default as locationsStore, locationsActions, locations, locationsLoading, locationsError, locationsState, filteredLocations, locationsCount } from './locationsStore';
export { default as servicesStore, servicesActions, services, servicesLoading, servicesError, servicesState, filteredServices, servicesCount } from './servicesStore';
export { default as clientsStore, clientsActions, clients, clientsLoading, clientsError, clientsState, filteredClients, clientsCount } from './clientsStore';
export { default as bookingsStore, bookingsActions, bookings, bookingsLoading, bookingsError, bookingsState, filteredBookings, bookingsCount } from './bookingsStore';
export { default as reviewsStore, reviewsActions, reviews, reviewsLoading, reviewsError, reviewsState, filteredReviews, reviewsCount } from './reviewsStore';
export { default as dashboardStore, dashboardActions, dashboardStats, dashboardLoading, dashboardError } from './dashboardStore';

// Import actions for easier access
import { usersActions, users } from './usersStore';
import { locationsActions } from './locationsStore';
import { servicesActions } from './servicesStore';
import { clientsActions } from './clientsStore';
import { bookingsActions } from './bookingsStore';
import { reviewsActions } from './reviewsStore';
import { dashboardActions } from './dashboardStore';

// Common data loading utility
export const loadAllAdminData = async () => {
  try {
    await Promise.all([
      dashboardActions.loadFullDashboard(),
      usersActions.loadUsers(),
      locationsActions.loadLocations(),
      servicesActions.loadServices(),
      clientsActions.loadClients(),
      bookingsActions.loadBookings(),
      reviewsActions.loadReviews()
    ]);
  } catch (error) {
    console.error('Failed to load admin data:', error);
  }
};

// Helper function to get dropdown data for forms
export const getFormDropdownData = async () => {
  try {
    const [activeLocations, activeServices, activeClients, allUsers] = await Promise.all([
      locationsActions.getAllActiveLocations(),
      servicesActions.getAllActiveServices(),
      clientsActions.getAllActiveClients(),
      // Get all users for staff selection
      new Promise(resolve => {
        usersActions.loadUsers().then(() => {
          users.subscribe(usersList => resolve(usersList))();
        });
      })
    ]);

    return {
      locations: activeLocations,
      services: activeServices,
      clients: activeClients,
      users: allUsers
    };
  } catch (error) {
    console.error('Failed to load dropdown data:', error);
    return {
      locations: [],
      services: [],
      clients: [],
      users: []
    };
  }
};
