/**
 * Admin Helper Functions Index
 * Central export point for all admin helper functions
 */

// Formatting helpers
export {
  formatDate,
  formatDateTime,
  formatTime,
  formatPrice,
  formatDuration,
  calculateAge,
  calculateTimeDuration
} from './formatters';

// Display helpers
export {
  getClientDisplayName,
  getLocationDisplayName,
  getUserDisplayName,
  getServiceDisplayName,
  getRoomDisplayName
} from './display';

// Status and styling helpers
export {
  getStatusBadgeClass,
  getStatusColor,
  getBookingStatusColor,
  getRoleBadgeClass,
  getPriorityBadgeClass
} from './status';
