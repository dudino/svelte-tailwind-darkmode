# Store Architecture

The application stores have been organized into modular, focused stores for better separation of concerns and maintainability.

## Store Organization

### `index.ts` - Central Export Point
Central export file that re-exports all stores from their respective modules. Always import stores from here:
```typescript
import { login, logout, isAuthenticated, currentUser } from '$lib/stores';
```

## Store Modules

### 1. **authStore.ts** - Authentication Management
Handles user authentication, login, logout, and session management.

**State:**
- `currentUser`: Currently authenticated user
- `isAuthenticated`: Derived store indicating authentication status
- `userRole`: Current user's role

**Functions:**
- `initPocketBase()`: Initialize PocketBase client
- `login(email, password)`: Authenticate user
- `register(userData)`: Register new user
- `logout()`: Clear session and logout user
- `hasPermission(permission)`: Check user permissions
- `hasRole(role)`: Check if user has specific role
- `getCurrentUser()`: Get current user data

### 2. **userManagementStore.ts** - User CRUD Operations
Manages user creation, reading, updating, and deletion operations.

**State:**
- `users`: Array of all users
- `selectedUser`: Currently selected user for editing

**Functions:**
- `loadUsersFromStorage()`: Load users from local storage
- `getUserById(userId)`: Get specific user by ID
- `updateUser(userId, updateData)`: Update user data
- `deleteUser(userId)`: Delete user
- `fetchUsersFromServer()`: Sync users from server
- `searchUsers(query, field)`: Search users by field
- `filterUsersByRole(role)`: Filter users by role
- `selectUser(user)`: Select user for editing

### 3. **appStateStore.ts** - Application State
Manages general application state like loading, errors, and connection status.

**State:**
- `isLoading`: Global loading state indicator
- `error`: Current error message
- `syncStatus`: Synchronization status

**Functions:**
- `setLoading(loading: boolean)`: Set global loading state
- `setError(message: string | null)`: Set error message
- `clearError()`: Clear current error
- `setSyncStatus(status)`: Set synchronization status

### 4. **themeStore.ts** - Theme Management
Manages application theme and UI preferences.

**State:**
- `theme`: Current theme ('light' | 'dark')

**Functions:**
- `toggleTheme()`: Toggle between light and dark theme
- `setTheme(theme)`: Set specific theme
- `initTheme()`: Initialize theme from localStorage

### 5. **syncStore.ts** - Data Synchronization
Handles offline/online data synchronization and sync queue management.

**Functions:**
- `syncData()`: Sync pending operations with server
- `addToSyncQueue(operation)`: Add operation to sync queue
- `hasPendingSyncOperations()`: Check for pending sync operations
- `clearSyncQueue()`: Clear all pending sync operations
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
