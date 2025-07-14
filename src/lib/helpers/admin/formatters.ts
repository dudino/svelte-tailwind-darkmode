/**
 * Admin Formatting Helpers
 * Common formatting functions used across admin components
 */

/**
 * Format date string to locale format
 */
export function formatDate(dateString: string | undefined, locale: string = 'cs-CZ'): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Format date and time string to locale format
 */
export function formatDateTime(dateString: string | undefined, locale: string = 'cs-CZ'): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString(locale);
  } catch {
    return dateString;
  }
}

/**
 * Format time string to locale format
 */
export function formatTime(timeString: string | undefined, locale: string = 'cs-CZ'): string {
  if (!timeString) return 'N/A';
  try {
    // Handle both full datetime and time-only strings
    if (timeString.includes('T')) {
      return new Date(timeString).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // Assume it's already in HH:MM format
      return timeString;
    }
  } catch {
    return timeString;
  }
}

/**
 * Format price to currency format
 */
export function formatPrice(price: number | null | undefined, currency: string = 'CZK'): string {
  if (!price || price === 0) return 'N/A';
  return `${price.toLocaleString('cs-CZ')} ${currency}`;
}

/**
 * Format duration in minutes to human readable format
 */
export function formatDuration(minutes: number | undefined): string {
  if (!minutes || minutes === 0) return 'N/A';
  
  if (minutes < 60) {
    return `${minutes} minutes`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string | undefined): string {
  if (!birthDate) return 'N/A';
  try {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return `${age} years old`;
  } catch {
    return 'N/A';
  }
}

/**
 * Calculate duration between two times
 */
export function calculateTimeDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return 'N/A';
  
  try {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    return formatDuration(diffMins);
  } catch {
    return 'N/A';
  }
}
