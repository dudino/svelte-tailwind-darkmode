/**
 * Admin Display Helpers
 * Functions for displaying and formatting user-facing content
 */

/**
 * Get client display name from client object
 */
export function getClientDisplayName(client: any): string {
  if (!client) return 'N/A';
  return client.nickname || 
         (client.first_name && client.last_name ? `${client.first_name} ${client.last_name}` : '') ||
         client.first_name || 
         client.last_name || 
         client.email || 
         'N/A';
}

/**
 * Get location display name from location object
 */
export function getLocationDisplayName(location: any): string {
  if (!location) return 'No location assigned';
  if (!location.name) return 'Location name missing';
  return location.name;
}

/**
 * Get user display name from user object
 */
export function getUserDisplayName(user: any): string {
  if (!user) return 'N/A';
  return user.name || user.email || 'Unknown User';
}

/**
 * Get service display name from service object
 */
export function getServiceDisplayName(service: any): string {
  if (!service) return 'No service selected';
  return service.name || 'Unnamed Service';
}

/**
 * Get room display name from room object
 */
export function getRoomDisplayName(room: any): string {
  if (!room) return 'No room assigned';
  return room.name || 'Unnamed Room';
}
