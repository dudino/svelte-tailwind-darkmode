/**
 * Store Exports
 * Central export point for all stores
 */

// App State Store
export {
  isLoading,
  syncStatus,
  error,
  setLoading,
  setError,
  clearError,
  setSyncStatus
} from './appStateStore';

// Authentication Store
export {
  currentUser,
  isAuthenticated,
  userRole,
  initPocketBase,
  getPocketBaseClient,
  login,
  register,
  logout,
  hasPermission,
  hasRole,
  getCurrentUser
} from './authStore';

// User Management Store
export {
  users,
  selectedUser,
  loadUsersFromStorage,
  getUserById,
  updateUser,
  deleteUser,
  fetchUsersFromServer,
  searchUsers,
  filterUsersByRole,
  getUsersWithAccommodation,
  selectUser,
  getSelectedUser
} from './userManagementStore';

// Theme Store
export {
  theme,
  initTheme,
  toggleTheme,
  setTheme
} from './themeStore';

// Sync Store
export {
  addToSyncQueue,
  removeSyncQueueItem,
  getSyncQueue,
  syncData,
  hasPendingSyncOperations,
  clearSyncQueue,
  clearAllSyncPendingFlags
} from './syncStore';

// User Schedule Store
export {
  schedules,
  locations,
  rooms,
  selectedWeek,
  loading as scheduleLoading,
  refreshing as scheduleRefreshing,
  weekStart,
  weekEnd,
  weekDays,
  schedulesByDate,
  loadLocationsAndRooms,
  loadSchedules,
  createSchedule,
  addScheduleOptimistically,
  refreshSchedulesWithExpanded,
  navigateWeek,
  goToCurrentWeek,
  getSchedulesForDate,
  getLocationName,
  getRoomName,
  getScheduleStatus,
  initializeUserSchedule
} from './userScheduleStore';
