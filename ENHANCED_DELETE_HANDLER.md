# Enhanced Delete Handler

This document describes the enhanced delete functionality that handles PocketBase relation constraint errors gracefully.

## Overview

The enhanced delete handler automatically attempts soft delete (setting `is_active` to `false`) when hard delete fails due to relation constraints. This prevents the error message "Failed to delete record. Make sure that the record is not part of a required relation reference."

## How It Works

1. **First Attempt**: Try hard delete (actual record deletion)
2. **On Constraint Error**: If the error is related to relation constraints:
   - For collections with `is_active` field: Set `is_active` to `false` (soft delete)
   - For collections without `is_active` field: Return meaningful error message
3. **Other Errors**: Re-throw other types of errors (network, permission, etc.)

## Supported Collections

### Collections with Soft Delete Support (have `is_active` field):
- `users` - Set `is_active` to `false` instead of deleting
- `locations` - Set `is_active` to `false` instead of deleting  
- `rooms` - Set `is_active` to `false` instead of deleting
- `services` - Set `is_active` to `false` instead of deleting

### Collections with Hard Delete Only (no `is_active` field):
- `clients` - Will show error if has related data
- `bookings` - Will show error if has related data
- `reviews` - Will show error if has related data
- `notes` - Will show error if has related data
- `schedules` - Will show error if has related data

## Implementation

### Core Function

```typescript
import { deleteRecord } from '$lib/utils/deleteHandler';

const result = await deleteRecord('users', userId);
// Returns: { success: boolean, method: 'soft' | 'hard' | 'failed', message?: string }
```

### Updated Stores

All admin stores have been updated to use the new delete handler:
- `usersStore.ts` 
- `clientsStore.ts`
- `servicesStore.ts`
- `locationsStore.ts`
- `reviewsStore.ts`
- `bookingsStore.ts`

The main `userManagementStore.ts` has also been updated with enhanced offline sync support.

### Status Display

Utility functions are provided for displaying record status:

```typescript
import { getRecordStatusText, getRecordStatusClass } from '$lib/utils/deleteHandler';

// Get human-readable status
const statusText = getRecordStatusText(user.is_active); // "Active" or "Inactive"

// Get CSS classes for badges
const statusClass = getRecordStatusClass(user.is_active);
```

## Error Messages

- **Soft Delete Success**: "Record deactivated successfully (soft delete)"
- **Hard Delete Success**: "Record deleted successfully"
- **Constraint Error (no soft delete)**: "Cannot delete record: it has related data and this collection does not support soft delete"
- **General Failure**: "Unable to delete or deactivate record"

## Benefits

1. **No More Constraint Errors**: Users no longer see confusing relation constraint error messages
2. **Data Preservation**: Important records are preserved but marked as inactive
3. **Consistent UX**: Unified delete behavior across all collections
4. **Clear Feedback**: Users get clear messages about what happened
5. **Backward Compatible**: Existing code continues to work with enhanced error handling

## Usage in Components

The enhanced delete functions return detailed result information:

```typescript
try {
  const result = await usersStore.deleteUser(userId);
  if (result.success) {
    // Show success message: result.message
    toast.success(result.message);
  }
} catch (error) {
  // Handle unexpected errors
  toast.error(error.message);
}
```
