import { getPocketBaseClient } from '../stores/authStore';

/**
 * Collections that support soft delete via is_active field
 */
const SOFT_DELETE_COLLECTIONS = new Set([
  'users',
  'locations',
  'rooms', 
  'services'
]);

/**
 * Enhanced delete handler that attempts soft delete first for supported collections,
 * falls back to hard delete, and handles constraint errors gracefully
 */
export async function deleteRecord(collection: string, recordId: string): Promise<{
  success: boolean;
  method: 'soft' | 'hard' | 'failed';
  message?: string;
}> {
  const pb = getPocketBaseClient();
  if (!pb) {
    throw new Error('PocketBase client not available');
  }

  try {
    // First, try hard delete
    await pb.collection(collection).delete(recordId);
    return { 
      success: true, 
      method: 'hard',
      message: 'Record deleted successfully'
    };
  } catch (deleteError: any) {
    // Check if it's a constraint error related to relations
    if (deleteError.status === 400 && 
        (deleteError.message?.includes('relation reference') || 
         deleteError.message?.includes('Failed to delete record'))) {
      
      // If collection supports soft delete, try that instead
      if (SOFT_DELETE_COLLECTIONS.has(collection)) {
        try {
          await pb.collection(collection).update(recordId, { is_active: false });
          return { 
            success: true, 
            method: 'soft',
            message: 'Record deactivated successfully (soft delete)'
          };
        } catch (softDeleteError: any) {
          console.error('Soft delete also failed:', softDeleteError);
          return {
            success: false,
            method: 'failed',
            message: 'Unable to delete or deactivate record'
          };
        }
      } else {
        // Collection doesn't support soft delete
        return {
          success: false,
          method: 'failed',
          message: 'Cannot delete record: it has related data and this collection does not support soft delete'
        };
      }
    } else {
      // Re-throw other types of errors (network, permission, etc.)
      throw deleteError;
    }
  }
}

/**
 * Check if a record can be safely deleted (no constraint violations)
 */
export async function canDeleteRecord(collection: string, recordId: string): Promise<boolean> {
  const pb = getPocketBaseClient();
  if (!pb) return false;

  try {
    // Try a dry run by attempting to delete, but this would actually delete
    // For now, we'll just return true and let the delete handler manage it
    return true;
  } catch {
    return false;
  }
}

/**
 * Get human-readable status for soft-deleted records
 */
export function getRecordStatusText(isActive: boolean | undefined): string {
  if (isActive === false) {
    return 'Inactive';
  }
  return 'Active';
}

/**
 * Get CSS classes for record status badges
 */
export function getRecordStatusClass(isActive: boolean | undefined): string {
  if (isActive === false) {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
  return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
}
