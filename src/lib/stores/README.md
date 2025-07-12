# Store Architecture

The user management system has been refactored into modular stores for better separation of concerns and maintainability.

## Store Structure

### 1. **appStateStore.ts**
Manages general application state:
- `isLoading`: Boolean indicating if any operation is in progress
- `syncStatus`: Connection status ('online' | 'offline' | 'syncing')
- `error`: Current error message (if any)

**Functions:**
- `setLoading(loading: boolean)`
- `setError(message: string | null)`
- `clearError()`
- `setSyncStatus(status)`

### 2. **authStore.ts**
Handles authentication and session management:
- `currentUser`: Currently logged-in user
- `isAuthenticated`: Derived store indicating if user is logged in
- `userRole`: Current user's role

**Functions:**
- `initPocketBase()`: Initialize PocketBase client
- `login(email, password)`: Authenticate user
- `register(userData)`: Register new user
- `logout()`: Clear session
- `hasPermission(permission)`: Check user permissions
- `hasRole(role)`: Check if user has specific role

### 3. **userManagementStore.ts**
Manages user CRUD operations:
- `users`: Array of all users
- `selectedUser`: Currently selected user for editing

**Functions:**
- `loadUsersFromStorage()`: Load users from local storage
- `getUserById(userId)`: Get specific user
- `updateUser(userId, updateData)`: Update user data
- `deleteUser(userId)`: Delete user
- `fetchUsersFromServer()`: Sync users from server
- `searchUsers(query, field)`: Search users
- `filterUsersByRole(role)`: Filter by role
- `selectUser(user)`: Select user for editing

### 4. **syncStore.ts**
Handles offline synchronization:
- Manages sync queue for offline operations
- Syncs data when connection is restored

**Functions:**
- `addToSyncQueue(item)`: Add operation to sync queue
- `syncData()`: Synchronize with server
- `hasPendingSyncOperations()`: Check for pending syncs
- `clearSyncQueue()`: Clear all pending operations

## Usage Examples

### Authentication
```typescript
import { login, logout, isAuthenticated, currentUser } from '$lib/stores';

// Login
const result = await login('user@example.com', 'password');
if (result.success) {
  console.log('Logged in!');
}

// Check auth status
$: if ($isAuthenticated) {
  console.log('User is logged in:', $currentUser);
}

// Logout
logout();
```

### User Management
```typescript
import { users, updateUser, deleteUser, selectUser } from '$lib/stores';

// Get all users
$: allUsers = $users;

// Update user
const result = await updateUser(userId, { name: 'New Name' });

// Delete user
await deleteUser(userId);

// Select user for editing
selectUser(user);
```

### Sync Operations
```typescript
import { syncData, hasPendingSyncOperations } from '$lib/stores';

// Check for pending operations
const hasPending = await hasPendingSyncOperations();

// Sync data
const result = await syncData();
if (result.success) {
  console.log('Sync completed');
}
```

### App State
```typescript
import { isLoading, error, syncStatus } from '$lib/stores';

// Show loading spinner
$: if ($isLoading) {
  // Show loading UI
}

// Display errors
$: if ($error) {
  console.error('Error:', $error);
}

// Show connection status
$: connectionStatus = $syncStatus; // 'online' | 'offline' | 'syncing'
```

## Migration from userStore.ts

The old monolithic `userStore.ts` has been split into these focused modules. All imports should now use:

```typescript
// Old way:
import { login, users, isLoading } from '$lib/stores/userStore';

// New way:
import { login, users, isLoading } from '$lib/stores';
```

## Benefits

1. **Separation of Concerns**: Each store has a specific responsibility
2. **Better Testing**: Easier to test individual functionalities
3. **Reduced Complexity**: Smaller, more focused modules
4. **Reusability**: Stores can be used independently
5. **Maintainability**: Easier to maintain and extend
6. **Performance**: Better tree-shaking and code splitting opportunities
