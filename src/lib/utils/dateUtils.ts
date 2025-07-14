/**
 * Date utility functions for form handling and display
 */

/**
 * Converts an ISO date string to HTML5 date input format (yyyy-MM-dd)
 * @param isoDateString - ISO date string from database (e.g., "1975-05-20 00:00:00.000Z")
 * @returns Formatted date string for HTML5 date input (e.g., "1975-05-20") or empty string if invalid
 */
export function formatDateForInput(isoDateString: string | null | undefined): string {
  if (!isoDateString) return '';
  
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Converts a date to a localized string for display
 * @param dateString - Date string to format
 * @param locale - Locale for formatting (defaults to 'en-US')
 * @returns Formatted date string for display
 */
export function formatDateForDisplay(dateString: string | null | undefined, locale: string = 'en-US'): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(locale);
  } catch {
    return '';
  }
}

/**
 * Checks if a date string is valid
 * @param dateString - Date string to validate
 * @returns True if valid date, false otherwise
 */
export function isValidDate(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}
